import {
  Component,
  NO_ERRORS_SCHEMA,
  Inject,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { CommonModule, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslocoModule } from "@ngneat/transloco";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { SharedService } from "app/shared/shared.service";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ChangeDetectorRef } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { createWorker, Worker as TesseractWorker } from 'tesseract.js';

interface OCRWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
}

// Configure PDF.js worker
try {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `./assets/pdf.worker.js`;
} catch (e) {
  console.warn('Failed to set PDF.js worker:', e);
}

@Component({
  selector: "app-image-preview-folder-dailog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    TranslocoModule,
    PdfViewerModule,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: "./image-preview-folder-dailog.component.html",
  styleUrl: "./image-preview-folder-dailog.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ImagePreviewFolderDailogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pdfViewer', { static: false }) pdfViewer: any;
  
  public safeUrl: SafeResourceUrl;
  public fileType: string;
  public finalUrl: string;
  public fileName: string;

  // PDF viewer properties
  pdfSrc: string | ArrayBuffer | Uint8Array | Blob = '';
  searchText: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  pageLoaded: boolean = false;
  
  // PDF.js document for custom search
  pdfDoc: any = null;
  searchMatches: any[] = [];
  currentMatchIndex: number = -1;
  isSearching: boolean = false;
  textExtractionMessage: string = '';

  // OCR helpers
  private ocrEnabled = true;
  private ocrWorker: TesseractWorker | null = null;
  private ocrCache = new Map<number, OCRWord[]>();
  ocrInProgressPages = new Set<number>();
  ocrLanguage = 'eng';

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImagePreviewFolderDailogComponent>,
    private cdr: ChangeDetectorRef
  ) {
    const file = this.data;
    
    // Check if data is a base64-encoded object
    if (file.type === "base64" && file.base64_content && file.mime_type === "application/pdf") {
      this.fileName = file.file_name || "document.pdf";
      this.fileType = "pdf";
      // Create blob URL for "Open in new tab" link
      const blob = this.base64ToBlob(file.base64_content, file.mime_type);
      this.finalUrl = URL.createObjectURL(blob);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.finalUrl);
      // Load PDF from base64
      this.loadPdfFromBase64(file.base64_content);
      // Initialize PDF for search after a short delay
      setTimeout(() => {
        this.initializePdfForSearch();
      }, 500);
      return;
    }
    
    // Handle regular file from folder tree
    this.fileName = file.name;
    const extension = this.getExtension(file.name);
    this.finalUrl = decodeURIComponent(file.path);

    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const audioTypes = ["mp3", "wav", "ogg","mpeg"];
    const videoTypes = ["mp4", "webm","mpeg"];
    const pdfTypes = ["pdf"];
    const downloadTypes = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

    if (imageTypes.includes(extension)) {
      this.fileType = "image";
    } else if (audioTypes.includes(extension)) {
      this.fileType = "audio";
    } else if (videoTypes.includes(extension)) {
      this.fileType = "video";
    } else if (pdfTypes.includes(extension)) {
      this.fileType = "pdf";
    } else if (downloadTypes.includes(extension)) {
      this.downloadFile(this.finalUrl);
      this.dialogRef.close();
      return;
    } else {
      console.warn("Unsupported file type:", extension);
      this.downloadFile(this.finalUrl);
      this.dialogRef.close();
      return;
    }
    
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.finalUrl);
    
    // Load PDF for pdf-viewer if it's a PDF
    if (this.fileType === "pdf") {
      this.loadPdfFromUrl(this.finalUrl);
    }
  }

  ngAfterViewInit(): void {
    // View initialization - PDF rendering will happen after data is loaded
    // Wait a bit and check if pdfViewer is available
    setTimeout(() => {
      if (this.pdfViewer) {
        console.log('PDF Viewer in ngAfterViewInit:', this.pdfViewer);
        console.log('EventBus available:', !!this.pdfViewer.eventBus);
        console.log('PDF Viewer properties:', Object.keys(this.pdfViewer));
      }
    }, 500);
  }

  async loadPdfFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const arrayBufferCopy = arrayBuffer.slice(0); // Create copy to avoid detached ArrayBuffer
      this.pdfSrc = arrayBufferCopy;
      
      // Also load PDF document for custom search
      const bytes = new Uint8Array(arrayBufferCopy);
      await this.loadPdfDocForSearch(bytes);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  }

  async loadPdfFromBase64(base64: string): Promise<void> {
    try {
      // Decode base64 string to binary string
      const binaryString = atob(base64);
      // Convert binary string to Uint8Array
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Convert Uint8Array to ArrayBuffer
      this.pdfSrc = bytes.buffer;
      
      // Also load PDF document for custom search
      await this.loadPdfDocForSearch(bytes);
    } catch (error) {
      console.error("Error loading PDF from base64:", error);
    }
  }

  async loadPdfDocForSearch(bytes: Uint8Array): Promise<void> {
    try {
      console.log("Loading PDF document for search, size:", bytes.length);
      // Create a copy to avoid detached ArrayBuffer issues
      const bytesCopy = new Uint8Array(bytes.length);
      bytesCopy.set(bytes);
      const loadingTask = pdfjsLib.getDocument({ 
        data: bytesCopy,
        verbosity: 0
      });
      this.pdfDoc = await loadingTask.promise;
      console.log("PDF document loaded for search successfully, pages:", this.pdfDoc.numPages);
      
      // Update totalPages if not set
      if (!this.totalPages && this.pdfDoc.numPages) {
        this.totalPages = this.pdfDoc.numPages;
      }
    } catch (error) {
      console.error("Error loading PDF document for search:", error);
      this.pdfDoc = null;
    }
  }

  afterLoadComplete(pdf: any): void {
    console.log('PDF loaded in viewer:', pdf);
    this.totalPages = pdf?.numPages || 0;
    this.pageLoaded = true;
    
    // Ensure PDF document is loaded for search immediately
    if (!this.pdfDoc && this.pdfSrc) {
      // Load immediately without delay
      this.loadPdfForSearchFromSrc();
    } else if (!this.pdfDoc && this.finalUrl) {
      // If pdfSrc is not ready but we have finalUrl, try to load from finalUrl
      this.initializePdfForSearch();
    }
  }
  
  async initializePdfForSearch(): Promise<void> {
    if (this.pdfDoc) {
      console.log('PDF already loaded for search');
      return;
    }
    try {
      let loadingTask: any;
      
      if (typeof this.pdfSrc === 'string') {
        if (this.pdfSrc.startsWith('blob:') || this.pdfSrc.startsWith('http')) {
          console.log('Loading PDF from URL:', this.pdfSrc.substring(0, 50));
          const response = await fetch(this.pdfSrc);
          const arrayBuffer = await response.arrayBuffer();
          const arrayBufferCopy = arrayBuffer.slice(0);
          loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy });
        } else {
          loadingTask = pdfjsLib.getDocument(this.pdfSrc);
        }
      } else if (this.pdfSrc instanceof ArrayBuffer) {
        try {
          const length = this.pdfSrc.byteLength;
          const arrayBufferCopy = this.pdfSrc.slice(0);
          loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy });
        } catch (e) {
          console.error('ArrayBuffer is detached, cannot load PDF for search');
          throw new Error('ArrayBuffer is detached');
        }
      } else if (this.pdfSrc instanceof Uint8Array) {
        try {
          const buffer = this.pdfSrc.buffer;
          if (buffer.byteLength === 0 && this.pdfSrc.length > 0) {
            const uint8ArrayCopy = new Uint8Array(this.pdfSrc.length);
            uint8ArrayCopy.set(this.pdfSrc);
            loadingTask = pdfjsLib.getDocument({ data: uint8ArrayCopy });
          } else {
            const uint8ArrayCopy = new Uint8Array(this.pdfSrc);
            loadingTask = pdfjsLib.getDocument({ data: uint8ArrayCopy });
          }
        } catch (e) {
          console.error('Error processing Uint8Array for PDF.js:', e);
          throw new Error('Failed to process Uint8Array');
        }
      } else if (this.pdfSrc instanceof Blob) {
        const arrayBuffer = await this.pdfSrc.arrayBuffer();
        const arrayBufferCopy = arrayBuffer.slice(0);
        loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy });
      } else if (this.finalUrl) {
        console.log('Loading PDF from finalUrl:', this.finalUrl.substring(0, 50));
        const response = await fetch(this.finalUrl);
        const arrayBuffer = await response.arrayBuffer();
        const arrayBufferCopy = arrayBuffer.slice(0);
        loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy });
      }
      
      if (loadingTask) {
        this.pdfDoc = await loadingTask.promise;
        console.log('✓ PDF loaded for search, pages:', this.pdfDoc.numPages);
        if (!this.totalPages && this.pdfDoc.numPages) {
          this.totalPages = this.pdfDoc.numPages;
        }
      } else {
        console.warn('No PDF source available for loading');
      }
    } catch (error) {
      console.error('Error loading PDF for search:', error);
    }
  }

  async loadPdfForSearchFromSrc(): Promise<void> {
    try {
      let data: Uint8Array | null = null;
      
      if (this.pdfSrc instanceof ArrayBuffer) {
        try {
          const length = this.pdfSrc.byteLength;
          const arrayBufferCopy = this.pdfSrc.slice(0);
          data = new Uint8Array(arrayBufferCopy);
          console.log('Loading PDF from ArrayBuffer for search, size:', data.length);
        } catch (e) {
          console.error('ArrayBuffer is detached, cannot load PDF for search');
          return;
        }
      } else if (this.pdfSrc instanceof Uint8Array) {
        try {
          const buffer = this.pdfSrc.buffer;
          if (buffer.byteLength === 0 && this.pdfSrc.length > 0) {
            const uint8ArrayCopy = new Uint8Array(this.pdfSrc.length);
            uint8ArrayCopy.set(this.pdfSrc);
            data = uint8ArrayCopy;
          } else {
            const uint8ArrayCopy = new Uint8Array(this.pdfSrc);
            data = uint8ArrayCopy;
          }
          console.log('Loading PDF from Uint8Array for search, size:', data.length);
        } catch (e) {
          console.error('Error processing Uint8Array for PDF.js:', e);
          return;
        }
      } else if (this.pdfSrc instanceof Blob) {
        const arrayBuffer = await this.pdfSrc.arrayBuffer();
        const arrayBufferCopy = arrayBuffer.slice(0);
        data = new Uint8Array(arrayBufferCopy);
        console.log('Loading PDF from Blob for search, size:', data.length);
      } else if (typeof this.pdfSrc === 'string') {
        console.log('Fetching PDF from URL for search:', this.pdfSrc.substring(0, 50) + '...');
        try {
          const response = await fetch(this.pdfSrc);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const arrayBufferCopy = arrayBuffer.slice(0);
          data = new Uint8Array(arrayBufferCopy);
          console.log('Fetched PDF from URL for search, size:', data.length);
        } catch (fetchError) {
          console.error('Error fetching PDF from URL:', fetchError);
          return;
        }
      } else {
        console.error('Unknown PDF source type:', typeof this.pdfSrc, this.pdfSrc);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Loading PDF document for search with data size:', data.length);
        await this.loadPdfDocForSearch(data);
        console.log('PDF document loaded for search:', !!this.pdfDoc);
      } else {
        console.error('Invalid PDF data for search - data is null or empty');
      }
    } catch (error) {
      console.error('Error loading PDF document for search:', error);
    }
  }

  async searchInPdf(): Promise<void> {
    const searchQuery = this.searchText?.trim();
    
    if (!searchQuery) {
      this.searchMatches = [];
      this.currentMatchIndex = -1;
      return;
    }

    // Ensure PDF document is loaded - try multiple methods
    if (!this.pdfDoc) {
      console.log('PDF document not loaded, attempting to load...');
      
      // Try loading from pdfSrc first
      if (this.pdfSrc) {
        await this.loadPdfForSearchFromSrc();
      }
      
      // If still not loaded, try from finalUrl
      if (!this.pdfDoc && this.finalUrl) {
        await this.initializePdfForSearch();
      }
      
      // Final retry after delay
      if (!this.pdfDoc) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.pdfSrc) {
          await this.loadPdfForSearchFromSrc();
        } else if (this.finalUrl) {
          await this.initializePdfForSearch();
        }
      }
      
      if (!this.pdfDoc) {
        console.error('PDF document could not be loaded for search');
        alert('PDF is still loading. Please wait a moment and try again.');
        return;
      }
    }

    // Update total pages if needed
    if (!this.totalPages && this.pdfDoc?.numPages) {
      this.totalPages = this.pdfDoc.numPages;
    }

    if (!this.totalPages) {
      console.error('Cannot determine PDF page count');
      return;
    }

    this.isSearching = true;
    this.searchMatches = [];
    this.currentMatchIndex = -1;

    try {
      const searchLower = searchQuery.toLowerCase();
      console.log(`Searching entire PDF for: "${searchQuery}" across ${this.totalPages} pages`);
      
      let pagesWithTextLayer = 0;
      let pagesWithOcrText = 0;

      // Search through ALL pages of the PDF
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        try {
          const page = await this.pdfDoc.getPage(pageNum);
          
          // Try multiple text extraction methods for better compatibility
          let textContent: any = null;
          let extractionMethod = 'default';
          
          try {
            textContent = await page.getTextContent({
              normalizeWhitespace: false,
              disableCombineTextItems: false
            });
            extractionMethod = 'standard';
          } catch (e1) {
            try {
              textContent = await page.getTextContent();
              extractionMethod = 'fallback1';
            } catch (e2) {
              try {
                textContent = await page.getTextContent({
                  normalizeWhitespace: true
                });
                extractionMethod = 'fallback2';
              } catch (e3) {
                console.warn(`Page ${pageNum}: All text extraction methods failed`, e3);
                continue;
              }
            }
          }
          
          if (!textContent) {
            console.log(`Page ${pageNum}: No textContent object returned`);
            continue;
          }
          
          let textItems: any[] = [];
          if (Array.isArray(textContent.items)) {
            textItems = textContent.items;
          } else if (textContent.items && typeof textContent.items === 'object') {
            textItems = Object.values(textContent.items);
          } else if (textContent.str) {
            textItems = [{ str: textContent.str, transform: textContent.transform || [1, 0, 0, 1, 0, 0] }];
          }

          let fullPageText = '';
          const pageTextParts: string[] = [];
          const itemPositions: Array<{ item: any; startChar: number; endChar: number }> = [];

          const isOcrPage = !textItems || textItems.length === 0;
          
          if (isOcrPage) {
            console.log(`Page ${pageNum}: No text items found (extraction method: ${extractionMethod}), attempting OCR...`);
            const ocrWords = await this.runOcrOnPage(page, pageNum);
            const viewport = page.getViewport({ scale: 1 });
            const pageContainer = document.querySelector(`.page[data-page-number="${pageNum}"]`);
            const pdfCanvas = pageContainer?.querySelector("canvas");
            let renderedWidth = viewport.width;
            let renderedHeight = viewport.height;
            if (pdfCanvas) {
              renderedWidth = pdfCanvas.width;
              renderedHeight = pdfCanvas.height;
            }
            const ocrCanvasWidth = ocrWords[0]?.canvasWidth || viewport.width;
            const ocrCanvasHeight = ocrWords[0]?.canvasHeight || viewport.height;
            const scaleX = renderedWidth / ocrCanvasWidth;
            const scaleY = renderedHeight / ocrCanvasHeight;
            ocrWords.forEach(word => {
              if (word.text.toLowerCase().includes(searchLower)) {
                this.searchMatches.push({
                  page: pageNum,
                  text: word.text,
                  x: word.x * scaleX,
                  y: word.y * scaleY,
                  width: word.width * scaleX,
                  height: word.height * scaleY,
                  isOcr: true,
                });
              }
            });
            if (ocrWords.length > 0) {
              pagesWithOcrText++;
            }
            continue;
          } else {
            pagesWithTextLayer++;
            console.log(`Page ${pageNum}: Extracted ${textItems.length} text items using ${extractionMethod} method`);
          
            let charOffset = 0;
            
            if (textItems.length > 0) {
              textItems.forEach((item: any) => {
                let text = '';
                
                if (item?.str !== undefined && item.str !== null) {
                  text = String(item.str);
                } else if (item?.text !== undefined && item.text !== null) {
                  text = String(item.text);
                } else if (typeof item === 'string') {
                  text = item;
                }
                
                if (typeof text === 'string') {
                  text = text.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, ' ');
                  
                  const startChar = charOffset;
                  const endChar = charOffset + text.length;
                  
                  pageTextParts.push(text);
                  itemPositions.push({
                    item: item,
                    startChar: startChar,
                    endChar: endChar
                  });
                  
                  charOffset = endChar + 1;
                }
              });
              
              fullPageText = pageTextParts.join(' ');
              
              if (fullPageText.trim().length < 10 && pageTextParts.length > 0) {
                fullPageText = pageTextParts.join('');
              }
              
              fullPageText = fullPageText.replace(/\s+/g, ' ').trim();
              
              if (fullPageText.length === 0) {
                console.log(`Page ${pageNum}: No extractable text after processing (had ${textItems.length} items)`);
                continue;
              }
            }
          }
          
          const lowerPageText = fullPageText.toLowerCase();
          
          console.log(`Page ${pageNum}: Full text length: ${fullPageText.length} characters`);
          
          let searchStart = 0;
          let pageMatchCount = 0;
          while ((searchStart = lowerPageText.indexOf(searchLower, searchStart)) !== -1) {
            const searchEnd = searchStart + searchLower.length;
            
            const matchItem = itemPositions.find(pos => 
              searchStart >= pos.startChar && searchEnd <= pos.endChar
            );
            
            if (matchItem) {
              const matchText = matchItem.item.str || matchItem.item.text || fullPageText.substring(searchStart, searchEnd);
              this.searchMatches.push({
                page: pageNum,
                text: matchText,
                itemIndex: itemPositions.indexOf(matchItem),
                x: matchItem.item.transform?.[4] || matchItem.item.x || 0,
                y: matchItem.item.transform?.[5] || matchItem.item.y || 0,
                charIndex: searchStart,
                context: fullPageText.substring(Math.max(0, searchStart - 30), Math.min(fullPageText.length, searchEnd + 30)),
                isOcr: isOcrPage
              });
              pageMatchCount++;
            } else {
              const firstItem = itemPositions.find(pos => searchStart >= pos.startChar && searchStart < pos.endChar);
              if (firstItem) {
                this.searchMatches.push({
                  page: pageNum,
                  text: fullPageText.substring(Math.max(0, searchStart - 20), Math.min(fullPageText.length, searchEnd + 20)),
                  itemIndex: itemPositions.indexOf(firstItem),
                  x: firstItem.item.transform?.[4] || firstItem.item.x || 0,
                  y: firstItem.item.transform?.[5] || firstItem.item.y || 0,
                  charIndex: searchStart,
                  context: fullPageText.substring(Math.max(0, searchStart - 30), Math.min(fullPageText.length, searchEnd + 30)),
                  isOcr: isOcrPage
                });
                pageMatchCount++;
              } else {
                this.searchMatches.push({
                  page: pageNum,
                  text: fullPageText.substring(searchStart, searchEnd),
                  itemIndex: 0,
                  x: 0,
                  y: 0,
                  charIndex: searchStart,
                  context: fullPageText.substring(Math.max(0, searchStart - 30), Math.min(fullPageText.length, searchEnd + 30)),
                  isOcr: isOcrPage
                });
                pageMatchCount++;
              }
            }
            
            searchStart = searchEnd;
          }
          
          if (pageMatchCount > 0) {
            console.log(`Page ${pageNum}: Found ${pageMatchCount} matches`);
          } else {
            console.log(`Page ${pageNum}: No matches found (text length: ${fullPageText.length})`);
          }
        } catch (pageError) {
          console.error(`Error searching page ${pageNum}:`, pageError);
        }
      }
      
      if (pagesWithTextLayer === 0 && pagesWithOcrText === 0) {
        this.textExtractionMessage = 'No searchable text detected in this PDF. It might be a scanned or image-based document.';
      } else if (pagesWithTextLayer === 0 && pagesWithOcrText > 0) {
        this.textExtractionMessage = 'Text extracted via OCR (scanned document).';
      } else {
        this.textExtractionMessage = '';
      }

      console.log(`✓ Overall search completed: Found ${this.searchMatches.length} matches across ${this.totalPages} pages`);

      if (this.searchMatches.length > 0) {
        this.currentMatchIndex = 0;
        this.navigateToMatch(0);
        console.log(`✓ Navigated to first match on page ${this.searchMatches[0].page}`);
        this.highlightSearchMatches();
      } else {
        console.warn(`⚠ No matches found for "${searchQuery}" in the entire PDF`);
        this.textExtractionMessage = 'No matches found. The PDF might be image-based (scanned) without text layer.';
        this.clearHighlights();
      }
    } catch (error) {
      console.error('Error during overall PDF search:', error);
    } finally {
      this.isSearching = false;
      this.cdr.detectChanges();
    }
  }

  private async ensureOcrWorker(): Promise<TesseractWorker | null> {
    if (!this.ocrEnabled) {
      return null;
    }

    if (!this.ocrWorker) {
      try {
        this.ocrWorker = await createWorker(this.ocrLanguage);
        this.ocrCache.clear();
        return this.ocrWorker;
      } catch (error) {
        console.error('Failed to initialize OCR worker', error);
        this.ocrEnabled = false;
        this.ocrWorker = null;
        return null;
      }
    }

    return this.ocrWorker;
  }

  private async runOcrOnPage(page: any, pageNum: number): Promise<OCRWord[]> {
    if (this.ocrCache.has(pageNum)) return this.ocrCache.get(pageNum)!;

    const worker = await this.ensureOcrWorker();
    if (!worker) return [];
    try {
      const scale = 2;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return [];

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      this.ocrInProgressPages.add(pageNum);

      await page.render({ canvasContext: ctx, viewport }).promise;

      await worker.setParameters({ tessedit_pageseg_mode: 3 as any });

      const result = await worker.recognize(canvas, {}, { hocr: true });

      const words: OCRWord[] = [];

      if (result.data.hocr && typeof result.data.hocr === "string") {
        const doc = new DOMParser().parseFromString(result.data.hocr, "text/html");
        const spans = doc.querySelectorAll("span.ocrx_word, span.ocr_word");

        spans.forEach(span => {
          const text = span.textContent?.trim() || "";
          const title = span.getAttribute("title");

          if (!text || !title) return;

          const match = title.match(/bbox (\d+) (\d+) (\d+) (\d+)/);
          if (!match) return;

          const [, x0, y0, x1, y1] = match.map(Number);

          words.push({
            text,
            x: x0,
            y: y0,
            width: x1 - x0,
            height: y1 - y0,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
          });
        });
      }

      this.ocrCache.set(pageNum, words);
      return words;
    } finally {
      this.ocrInProgressPages.delete(pageNum);
      this.cdr.detectChanges();
    }
  }

  private async highlightSearchMatches() {
    const searchText = this.searchText?.trim().toLowerCase();
    if (!searchText || !this.pdfDoc) {
      this.clearHighlights();
      return;
    }

    const pageContainer = document.querySelector(
      `.page[data-page-number="${this.currentPage}"]`
    ) as HTMLElement;

    if (!pageContainer) return;

    pageContainer.style.position = "relative";

    const oldOverlay = pageContainer.querySelector(".pdf-highlight-overlay");
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement("div");
    overlay.className = "pdf-highlight-overlay";
    Object.assign(overlay.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "20",
    });

    pageContainer.appendChild(overlay);

    try {
      const page = await this.pdfDoc.getPage(this.currentPage);
      const ocrWords = await this.runOcrOnPage(page, this.currentPage);

      if (!ocrWords || ocrWords.length === 0) return;

      const viewport = page.getViewport({ scale: 1 });
      const renderedWidth = pageContainer.offsetWidth;
      const renderedHeight = pageContainer.offsetHeight;
      const ocrCanvasWidth = ocrWords[0].canvasWidth;
      const ocrCanvasHeight = ocrWords[0].canvasHeight;
      const scaleX = renderedWidth / ocrCanvasWidth;
      const scaleY = renderedHeight / ocrCanvasHeight;

      const matchedWords = ocrWords.filter(w =>
        w.text.toLowerCase().includes(searchText)
      );

      matchedWords.forEach((w) => {
        const rect = document.createElement("div");
        Object.assign(rect.style, {
          position: "absolute",
          top: `${w.y * scaleY}px`,
          left: `${w.x * scaleX}px`,
          width: `${w.width * scaleX}px`,
          height: `${w.height * scaleY}px`,
          backgroundColor: "yellow",
          opacity: "0.45",
          borderRadius: "3px",
          pointerEvents: "none",
        });
        overlay.appendChild(rect);

        const matchIndex = this.searchMatches.findIndex(m =>
          m.page === this.currentPage &&
          m.x === w.x &&
          m.y === w.y &&
          m.text === w.text
        );

        if (matchIndex !== -1) {
          this.searchMatches[matchIndex].element = rect;
        }
      });
    } catch (error) {
      console.error('Error highlighting search matches:', error);
    }
  }

  clearHighlights() {
    const selectors = ['.textLayer span', 'span[role="presentation"]', '.textLayer > span', '.pdf-search-match', '.pdf-highlight-overlay'];
    selectors.forEach(selector => {
      document.querySelectorAll<HTMLElement>(selector).forEach(el => {
        if (selector === '.pdf-highlight-overlay') {
          el.remove();
        } else {
          el.classList.remove('pdf-search-match', 'pdf-search-match-current', 'pdf-search-match-ocr');
          el.style.backgroundColor = '';
          el.style.color = '';
          el.style.padding = '';
          el.style.borderRadius = '';
          el.style.fontWeight = '';
          el.style.border = '';
        }
      });
    });
  }

  escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  findNext(): void {
    if (this.searchMatches.length === 0) {
      // If no search results, perform search first
      this.searchInPdf();
      return;
    }

    if (this.currentMatchIndex < this.searchMatches.length - 1) {
      this.currentMatchIndex++;
      this.navigateToMatch(this.currentMatchIndex);
    } else {
      // Wrap around to first match
      this.currentMatchIndex = 0;
      this.navigateToMatch(0);
    }
  }

  findPrevious(): void {
    if (this.searchMatches.length === 0) {
      // If no search results, perform search first
      this.searchInPdf();
      return;
    }

    if (this.currentMatchIndex > 0) {
      this.currentMatchIndex--;
      this.navigateToMatch(this.currentMatchIndex);
    } else {
      // Wrap around to last match
      this.currentMatchIndex = this.searchMatches.length - 1;
      this.navigateToMatch(this.currentMatchIndex);
    }
  }

  navigateToMatch(index: number): void {
    if (this.searchMatches.length === 0 || index < 0 || index >= this.searchMatches.length) {
      return;
    }

    const match = this.searchMatches[index];
    this.currentMatchIndex = index;
    
    // Navigate to the page containing the match
    if (match.page !== this.currentPage) {
      this.currentPage = match.page;
      // Update pdf-viewer page
      if (this.pdfViewer) {
        this.pdfViewer.page = this.currentPage;
      }
    }
    
    // Ensure search bar stays visible by scrolling to top
    setTimeout(() => {
      const searchBar = document.querySelector('.search-bar-container');
      if (searchBar) {
        searchBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
    
    console.log(`Navigating to match ${index + 1} of ${this.searchMatches.length} on page ${match.page}`);
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchInPdf();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // F3 - Find next
    if (event.key === 'F3' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      if (this.searchMatches.length > 0 && this.pageLoaded) {
        this.findNext();
      }
    }
    // Shift+F3 - Find previous
    if (event.key === 'F3' && event.shiftKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      if (this.searchMatches.length > 0 && this.pageLoaded) {
        this.findPrevious();
      }
    }
    // Ctrl+F or Cmd+F - Focus search input
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      // Don't prevent default - let browser handle it, but we can also trigger search
      if (this.searchText.trim() && this.pageLoaded) {
        setTimeout(() => this.searchInPdf(), 100);
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.pdfViewer) {
        this.pdfViewer.page = this.currentPage;
      }
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.pdfViewer) {
        this.pdfViewer.page = this.currentPage;
      }
    }
  }

  onPageChange(event: any): void {
    if (event && event.pageNumber) {
      this.currentPage = event.pageNumber;
    }
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  downloadFile(url: string) {
    window.open(url, "_blank");
  }

  getExtension(filename: string): string {
    return filename?.split(".").pop()?.toLowerCase() || "";
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  ngOnDestroy(): void {
    // Cleanup blob URLs to prevent memory leaks
    if (this.finalUrl && this.finalUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.finalUrl);
    }
    // Cleanup OCR worker
    if (this.ocrWorker) {
      this.ocrWorker.terminate().catch(() => {});
      this.ocrWorker = null;
    }
  }
}
