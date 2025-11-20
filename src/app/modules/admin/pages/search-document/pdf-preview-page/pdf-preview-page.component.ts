import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { TranslocoModule } from '@ngneat/transloco';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SharedService } from 'app/shared/shared.service';
import { SearchDocService } from '../searchDoc.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker, Worker as TesseractWorker } from 'tesseract.js';

// Configure PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/assets/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('Failed to set PDF.js worker:', e);
}

@Component({
  selector: 'app-pdf-preview-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatChipsModule,
    TranslocoModule,
    PdfViewerModule,
    RouterLink,
    NgFor,
    NgIf,
  ],
  templateUrl: './pdf-preview-page.component.html',
  styleUrl: './pdf-preview-page.component.scss'
})
export class PdfPreviewPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pdfViewer', { static: false }) pdfViewer: any;
  
  pdfFiles: string[] = [];
  audioFiles: string[] = [];
  videoFiles: string[] = [];
  fileInfo: string[] = [];
  imageFiles: string[] = [];
  caseMetaData: any;
  base64pdf: SafeResourceUrl | null = null;
  pdfTitle: string = "PDF Preview";
  wordFiles: string[] = [];
  excelFiles: string[] = [];
  excelViewerUrl: SafeResourceUrl;
  wordHtml: string;
  wordViewerUrl: SafeResourceUrl;

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
  pdfViewerReady: boolean = false;
  textExtractionMessage: string = '';

  // OCR helpers
  private ocrEnabled = true;
  private ocrWorker: TesseractWorker | null = null;
  private ocrCache = new Map<number, string>();
  ocrInProgressPages = new Set<number>();
  ocrLanguage = 'eng';
  
  // Available OCR languages
  ocrLanguages = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'kor', name: 'Korean' },
    { code: 'ara', name: 'Arabic' },
    { code: 'hin', name: 'Hindi' },
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private dataService: SharedService,
    private _searchDocService: SearchDocService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Load data from route state or sessionStorage
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;

    let previewData: any = null;

    if (state && state.data) {
      previewData = state.data;
    } else {
      // Check shared service first (handles large payloads)
      const sharedData = this.dataService.getPdfPreviewData();
      if (sharedData) {
        previewData = sharedData;
        this.dataService.clearPdfPreviewData?.();
      } else {
        // Fallback to sessionStorage
        const storedData = sessionStorage.getItem('pdfPreviewData');
        if (storedData) {
          try {
            const data = JSON.parse(storedData);
            if (data?.useShared) {
              const sharedFallback = this.dataService.getPdfPreviewData();
              if (sharedFallback) {
                previewData = sharedFallback;
                this.dataService.clearPdfPreviewData?.();
              }
            } else {
              previewData = data;
            }
          } catch (e) {
            console.error('Error parsing stored data:', e);
          }
        }
      }
    }

    if (previewData) {
      this.getUploadMetaDataFiles(previewData);
    } else {
      console.error('No preview data available for PDF preview page.');
    }
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pdfViewerReady = true;
      if (this.pdfFiles.length > 0) {
        this.initializePdfForSearch();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    // Cleanup
    if (this.ocrWorker) {
      this.ocrWorker.terminate().catch(() => {});
      this.ocrWorker = null;
    }
  }

  getUploadMetaDataFiles(res: any) {
    console.log("PdfPreviewPageComponent - Data received:", res);
    
    this.pdfFiles = [];
    this.audioFiles = [];
    this.videoFiles = [];
    this.imageFiles = [];
    this.fileInfo = [];
    this.wordFiles = [];
    this.excelFiles = [];

    if (!res) {
      console.error("No data provided");
      return;
    }

    // Extract file from FileWithMetadata object if needed
    let fileToProcess = res;
    if (res.file && res.file instanceof File) {
      fileToProcess = res.file;
    } else if (res.file && typeof res.file === 'object' && res.file.fileHash) {
      // If it's a file metadata object, we might need to fetch from API
      // For now, try to process it directly
      fileToProcess = res.file;
    }
    
    // Check if res is a base64-encoded object (from API response or explicit base64 object)
    const fileType = fileToProcess.mime_type || fileToProcess.type;
    const base64Content = fileToProcess.base64_content || fileToProcess.base64Content;
    
    console.log("File type:", fileType, "Has base64:", !!base64Content);
    
    // Handle base64-encoded PDF (from API response or explicit base64 object)
    if (base64Content && fileType === "application/pdf") {
      console.log("Loading PDF from base64");
      this.loadPdfFromBase64(base64Content);
      const blob = this.base64ToBlob(base64Content, fileType);
      const fileUrl = URL.createObjectURL(blob);
      this.base64pdf = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
      this.pdfFiles.push(fileUrl);
      setTimeout(() => {
        this.initializePdfForSearch();
      }, 500);
      return;
    }
    
    // Handle File object
    if (fileToProcess instanceof File || (fileToProcess.type && !fileToProcess.base64_content)) {
      const fileUrl = URL.createObjectURL(fileToProcess);
      const fileType = fileToProcess.type;
      if (fileType.startsWith("image/")) {
        this.imageFiles.push(fileUrl);
      } else if (fileType === "application/pdf") {
        this.base64pdf = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
        this.pdfFiles.push(fileUrl);
        this.loadPdfForViewer(fileUrl);
        setTimeout(() => {
          this.initializePdfForSearch();
        }, 500);
      } else if (fileType.startsWith("audio/")) {
        this.audioFiles.push(fileUrl);
      } else if (fileType.startsWith("video/")) {
        this.videoFiles.push(fileUrl);
      }
    } else {
      console.warn("Unknown data format:", res);
    }

    this.caseMetaData = res.caseMetaData || res;
    this.cdr.detectChanges();
  }

  loadPdfFromBase64(base64: string) {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      this.pdfSrc = window.URL.createObjectURL(blob);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading PDF from base64:', error);
    }
  }

  loadPdfForViewer(urlOrFile: string | File) {
    if (urlOrFile instanceof File) {
      const fileUrl = URL.createObjectURL(urlOrFile);
      this.pdfSrc = fileUrl;
    } else {
      this.pdfSrc = urlOrFile;
    }
    this.cdr.detectChanges();
  }

  base64ToBlob(base64: string, mime: string): Blob {
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
    return new Blob(byteArrays, { type: mime });
  }

  afterLoadComplete(event: any) {
    this.totalPages = event.pagesCount;
    this.pageLoaded = true;
    this.currentPage = 1;
    this.pdfViewerReady = true;
    
    // Initialize PDF for search after a delay to ensure viewer is ready
    setTimeout(() => {
      this.initializePdfForSearch();
    }, 1000);
    
    this.cdr.detectChanges();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageNumber || this.currentPage;
    this.pageLoaded = true;
    this.cdr.detectChanges();
    
    // Re-apply highlights when page changes
    if (this.searchText?.trim() && this.searchMatches.length > 0) {
      setTimeout(() => {
        this.highlightSearchMatches();
      }, 800);
    }
  }

  async initializePdfForSearch() {
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
          loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        } else {
          loadingTask = pdfjsLib.getDocument(this.pdfSrc);
        }
      } else if (this.pdfSrc instanceof ArrayBuffer) {
        loadingTask = pdfjsLib.getDocument({ data: this.pdfSrc });
      } else if (this.pdfSrc instanceof Uint8Array) {
        loadingTask = pdfjsLib.getDocument({ data: this.pdfSrc });
      } else if (this.pdfSrc instanceof Blob) {
        const arrayBuffer = await this.pdfSrc.arrayBuffer();
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      } else if (this.pdfFiles && this.pdfFiles.length > 0) {
        console.log('Loading PDF from pdfFiles:', this.pdfFiles[0].substring(0, 50));
        const response = await fetch(this.pdfFiles[0]);
        const arrayBuffer = await response.arrayBuffer();
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      } else if (this.base64pdf) {
        const base64 = (this.base64pdf as any).changingThisBreaksApplicationSecurity?.split(',')[1];
        if (base64) {
          console.log('Loading PDF from base64');
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        }
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

  async searchInPdf() {
    const searchQuery = this.searchText?.trim();
    
    if (!searchQuery) {
      this.searchMatches = [];
      this.currentMatchIndex = -1;
      this.clearHighlights();
      return;
    }

    // Ensure PDF document is loaded - try multiple methods
    if (!this.pdfDoc) {
      console.log('PDF document not loaded, attempting to load...');
      
      // Try loading from pdfSrc first
      if (this.pdfSrc) {
        await this.initializePdfForSearch();
      }
      
      // If still not loaded, try from pdfFiles
      if (!this.pdfDoc && this.pdfFiles.length > 0) {
        await this.initializePdfForSearch();
      }
      
      // Final retry after delay
      if (!this.pdfDoc) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.initializePdfForSearch();
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
            // Method 1: Standard getTextContent with normalizeWhitespace
            textContent = await page.getTextContent({
              normalizeWhitespace: false, // Keep original spacing
              disableCombineTextItems: false // Allow combining text items
            });
            extractionMethod = 'standard';
          } catch (e1) {
            try {
              // Method 2: Try without options
              textContent = await page.getTextContent();
              extractionMethod = 'fallback1';
            } catch (e2) {
              try {
                // Method 3: Try with different options
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
          
          // Check if page has text content structure
          if (!textContent) {
            console.log(`Page ${pageNum}: No textContent object returned`);
            continue;
          }
          
          // Handle different textContent structures
          let textItems: any[] = [];
          if (Array.isArray(textContent.items)) {
            textItems = textContent.items;
          } else if (textContent.items && typeof textContent.items === 'object') {
            // Some PDFs might have items as an object
            textItems = Object.values(textContent.items);
          } else if (textContent.str) {
            // Some PDFs might have text directly in textContent
            textItems = [{ str: textContent.str, transform: textContent.transform || [1, 0, 0, 1, 0, 0] }];
          }

          let fullPageText = '';
          const pageTextParts: string[] = [];
          const itemPositions: Array<{ item: any; startChar: number; endChar: number }> = [];

          const isOcrPage = !textItems || textItems.length === 0;
          
          if (isOcrPage) {
            console.log(`Page ${pageNum}: No text items found (extraction method: ${extractionMethod}), attempting OCR...`);
            fullPageText = await this.runOcrOnPage(page, pageNum);
            if (!fullPageText) {
              continue;
            }
            pagesWithOcrText++;
          } else {
            pagesWithTextLayer++;
            console.log(`Page ${pageNum}: Extracted ${textItems.length} text items using ${extractionMethod} method`);
          
          // Build complete page text preserving word boundaries
          const pageTextParts: string[] = [];
          const itemPositions: Array<{item: any, startChar: number, endChar: number}> = [];
          let charOffset = 0;
          
          if (textItems.length > 0) {
            textItems.forEach((item: any) => {
              // Extract text from various possible structures
              let text = '';
              
              if (item?.str !== undefined && item.str !== null) {
                text = String(item.str);
              } else if (item?.text !== undefined && item.text !== null) {
                text = String(item.text);
              } else if (typeof item === 'string') {
                text = item;
              }
              
              // Process the text - don't skip empty strings, they might be important for spacing
              if (typeof text === 'string') {
                // Remove null characters and other control characters that might break search
                text = text.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, ' ');
                
                const startChar = charOffset;
                const endChar = charOffset + text.length;
                
                // Add text to our collection
                pageTextParts.push(text);
                itemPositions.push({
                  item: item,
                  startChar: startChar,
                  endChar: endChar
                });
                
                // Add space between items for word separation, but track positions accurately
                charOffset = endChar + 1;
              }
            });
            
            // Build full page text - try different joining strategies
            fullPageText = pageTextParts.join(' ');
            
            // If joined text is too short, try joining without spaces
            if (fullPageText.trim().length < 10 && pageTextParts.length > 0) {
              fullPageText = pageTextParts.join('');
            }
            
            // Remove excessive whitespace but preserve single spaces
            fullPageText = fullPageText.replace(/\s+/g, ' ').trim();
            
            if (fullPageText.length === 0) {
              console.log(`Page ${pageNum}: No extractable text after processing (had ${textItems.length} items)`);
              continue;
            }
          }
          }
          
          const lowerPageText = fullPageText.toLowerCase();
          
          console.log(`Page ${pageNum}: Full text length: ${fullPageText.length} characters`);
          if (fullPageText.length > 0) {
            console.log(`Page ${pageNum}: Sample text: ${fullPageText.substring(0, Math.min(100, fullPageText.length))}...`);
          }
          
          // Search for all occurrences in this page (case-insensitive)
          let searchStart = 0;
          let pageMatchCount = 0;
          while ((searchStart = lowerPageText.indexOf(searchLower, searchStart)) !== -1) {
            const searchEnd = searchStart + searchLower.length;
            
            // Find the text item(s) containing this match
            const matchItem = itemPositions.find(pos => 
              searchStart >= pos.startChar && searchEnd <= pos.endChar
            );
            
            if (matchItem) {
              // Match is within a single item
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
              // Match spans multiple items - find the item that contains the start position
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
                // Fallback: create match from text position even if we can't find exact item
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
          // Continue to next page instead of failing completely
        }
      }
      
      console.log(`✓ Overall search completed: Found ${this.searchMatches.length} matches across ${this.totalPages} pages`);

      if (pagesWithTextLayer === 0 && pagesWithOcrText === 0) {
        this.textExtractionMessage = 'No searchable text detected in this PDF. It might be a scanned or image-based document.';
      } else if (pagesWithTextLayer === 0 && pagesWithOcrText > 0) {
        this.textExtractionMessage = 'Text extracted via OCR (scanned document).';
      } else {
        this.textExtractionMessage = '';
      }

      if (this.searchMatches.length > 0) {
        this.currentMatchIndex = 0;
        this.navigateToMatch(0);
        console.log(`✓ Navigated to first match on page ${this.searchMatches[0].page}`);
        
        // Highlight matches after search - multiple attempts
        setTimeout(() => {
          this.highlightSearchMatches();
        }, 500);
        setTimeout(() => {
          this.highlightSearchMatches();
        }, 1500);
        setTimeout(() => {
          this.highlightSearchMatches();
        }, 2500);
      } else {
        console.warn(`⚠ No matches found for "${searchQuery}" in the entire PDF`);
        console.log('This might be because:');
        console.log('1. The PDF is image-based (scanned) without text layer');
        console.log('2. The search text does not exist in the PDF');
        console.log('3. The PDF text extraction failed');
        this.clearHighlights();
      }

    } catch (error) {
      console.error('Error searching PDF:', error);
    } finally {
      this.isSearching = false;
      this.cdr.detectChanges();
    }
  }

  private async ensureOcrWorker(): Promise<TesseractWorker | null> {
    if (!this.ocrEnabled) {
      return null;
    }

    // If language changed or worker doesn't exist, recreate worker
    if (!this.ocrWorker) {
      try {
        // createWorker can take language as first parameter
        // It returns a Promise<Worker> that's already initialized
        this.ocrWorker = await createWorker(this.ocrLanguage);
        // Clear cache when language changes
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

  onOcrLanguageChange() {
    // Terminate old worker and clear cache when language changes
    if (this.ocrWorker) {
      this.ocrWorker.terminate().catch(err => console.error('Error terminating OCR worker:', err));
      this.ocrWorker = null;
    }
    this.ocrCache.clear();
    
    // If there's a current search, re-run it with new language
    if (this.searchText?.trim()) {
      this.searchInPdf();
    }
  }

  private async runOcrOnPage(page: any, pageNum: number): Promise<string> {
    if (!this.ocrEnabled) {
      return '';
    }

    if (this.ocrCache.has(pageNum)) {
      return this.ocrCache.get(pageNum)!;
    }

    const worker = await this.ensureOcrWorker();
    if (!worker) {
      return '';
    }

    this.ocrInProgressPages.add(pageNum);
    this.cdr.detectChanges();

    try {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        return '';
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      const {
        data: { text },
      } = await worker.recognize(canvas);

      const cleanedText = text?.replace(/\s+/g, ' ').trim() || '';
      this.ocrCache.set(pageNum, cleanedText);
      return cleanedText;
    } catch (error) {
      console.error(`OCR failed on page ${pageNum}`, error);
      return '';
    } finally {
      this.ocrInProgressPages.delete(pageNum);
      this.cdr.detectChanges();
    }
  }

  navigateToMatch(index: number) {
    if (index < 0 || index >= this.searchMatches.length) return;
    
    this.currentMatchIndex = index;
    const match = this.searchMatches[index];
    
    if (match && match.page) {
      // Use safe navigation - only update currentPage, let ng2-pdf-viewer handle the rest
      this.currentPage = match.page;
      this.cdr.detectChanges();
      
      // Wait for page to render, then highlight
      setTimeout(() => {
        this.highlightSearchMatches();
      }, 1500);
    }
  }

  findNext() {
    if (this.searchMatches.length === 0) return;
    const nextIndex = (this.currentMatchIndex + 1) % this.searchMatches.length;
    this.navigateToMatch(nextIndex);
  }

  findPrevious() {
    if (this.searchMatches.length === 0) return;
    const prevIndex = this.currentMatchIndex <= 0 
      ? this.searchMatches.length - 1 
      : this.currentMatchIndex - 1;
    this.navigateToMatch(prevIndex);
  }

  onSearchKeyPress(event: any) {
    if (event.key === 'Enter') {
      this.searchInPdf();
    } else if (!this.searchText?.trim()) {
      this.clearHighlights();
    }
  }

  highlightSearchMatches() {
    const searchText = this.searchText?.toLowerCase().trim();
    if (!searchText || this.searchMatches.length === 0) {
      this.clearHighlights();
      return;
    }

    const retryHighlight = (attempt: number = 0) => {
      const maxAttempts = 15;
      const delays = [100, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3000];
      const delay = delays[Math.min(attempt, delays.length - 1)] || 3000;

      setTimeout(() => {
        const selectors = [
          '.textLayer span',
          'span[role="presentation"]',
          '.textLayer > span',
          'pdf-viewer .textLayer span'
        ];

        let spans: NodeListOf<HTMLElement> | null = null;
        for (const selector of selectors) {
          spans = document.querySelectorAll<HTMLElement>(selector);
          if (spans.length > 0) {
            console.log(`Found ${spans.length} spans using selector: ${selector}`);
            break;
          }
        }

        if (!spans || spans.length === 0) {
          if (attempt < maxAttempts) {
            console.log(`Retry ${attempt + 1}/${maxAttempts} - No spans found yet`);
            retryHighlight(attempt + 1);
          } else {
            console.warn('Max retries reached, text layer not available');
          }
          return;
        }

        // Clear previous highlights
        this.clearHighlights();

        // Build full text from all spans on current page
        const fullText = Array.from(spans).map(span => span.textContent || '').join(' ');
        const searchLower = searchText.toLowerCase();
        const fullTextLower = fullText.toLowerCase();
        
        console.log(`Searching for "${searchText}" in text of length ${fullText.length}`);
        console.log(`Sample text: ${fullText.substring(0, 200)}...`);
        
        // Get matches for current page
        const pageMatches = this.searchMatches.filter(m => m.page === this.currentPage);
        
        // Find all match positions in the full text
        const matches: Array<{start: number, match: any}> = [];
        let index = fullTextLower.indexOf(searchLower);
        
        while (index !== -1) {
          // Try to find corresponding match object
          const matchObj = pageMatches.find(m => {
            const matchStartInText = fullTextLower.indexOf(searchLower, Math.max(0, index - 50));
            return Math.abs(matchStartInText - index) < 10; // Allow some tolerance
          }) || pageMatches[matches.length % pageMatches.length]; // Fallback to round-robin
          
          matches.push({ start: index, match: matchObj });
          index = fullTextLower.indexOf(searchLower, index + 1);
        }

        console.log(`Found ${matches.length} text occurrences of "${searchText}" on page ${this.currentPage}`);

        // Highlight matches by mapping character positions to spans
        let currentCharIndex = 0;
        let highlightedCount = 0;

        Array.from(spans).forEach((span) => {
          const spanText = span.textContent || '';
          const spanStart = currentCharIndex;
          const spanEnd = currentCharIndex + spanText.length;

          // Check if any match overlaps with this span
          matches.forEach((matchData, matchIdx) => {
            const matchStart = matchData.start;
            const matchEnd = matchStart + searchLower.length;
            const matchObj = matchData.match;
            
            // Check if match overlaps with this span
            if (matchStart < spanEnd && matchEnd > spanStart) {
              const isOcrMatch = matchObj?.isOcr === true;
              
              span.classList.add('pdf-search-match');
              if (isOcrMatch) {
                span.classList.add('pdf-search-match-ocr');
              }
              
              // Check if this is the current match
              const currentMatch = this.searchMatches[this.currentMatchIndex];
              const matchOnCurrentPage = currentMatch?.page === this.currentPage;
              const isCurrentMatch = currentMatch && matchObj && 
                currentMatch.page === matchObj.page && 
                Math.abs(currentMatch.charIndex - matchStart) < 5;
              
              if (isCurrentMatch && matchOnCurrentPage) {
                span.classList.add('pdf-search-match-current');
              }
              
              // Apply inline styles - different colors for OCR matches
              const isCurrent = isCurrentMatch && matchOnCurrentPage;
              const bgColor = isOcrMatch 
                ? (isCurrent ? '#ff6b6b' : '#ffd93d')  // Red/orange for OCR matches
                : (isCurrent ? '#ff9800' : '#ffff00'); // Orange/yellow for native matches
              
              span.style.cssText += `
                background-color: ${bgColor} !important;
                color: #000000 !important;
                padding: 2px 4px !important;
                border-radius: 3px !important;
                font-weight: bold !important;
                box-shadow: 0 0 2px rgba(0,0,0,0.3) !important;
                z-index: 1000 !important;
                opacity: 1 !important;
                visibility: visible !important;
                display: inline-block !important;
                position: relative !important;
              `;
              
              // Add OCR badge if it's an OCR match
              if (isOcrMatch && !span.querySelector('.ocr-badge')) {
                const badge = document.createElement('span');
                badge.className = 'ocr-badge';
                badge.textContent = 'OCR';
                badge.style.cssText = `
                  position: absolute;
                  top: -8px;
                  right: -8px;
                  background: #e74c3c;
                  color: white;
                  font-size: 8px;
                  padding: 1px 3px;
                  border-radius: 3px;
                  font-weight: bold;
                  z-index: 1001;
                  line-height: 1;
                `;
                span.style.position = 'relative';
                span.appendChild(badge);
              }
              highlightedCount++;
            }
          });

          currentCharIndex = spanEnd + 1; // +1 for space between spans
        });

        console.log(`Successfully highlighted ${highlightedCount} spans`);

        // If no highlights and we have matches, try again
        if (highlightedCount === 0 && matches.length > 0 && attempt < maxAttempts) {
          console.log(`No highlights applied, retrying... (attempt ${attempt + 1})`);
          retryHighlight(attempt + 1);
        } else if (highlightedCount > 0) {
          // Scroll to current match if on current page
          const currentMatch = this.searchMatches[this.currentMatchIndex];
          if (currentMatch && currentMatch.page === this.currentPage) {
            const currentMatchSpan = Array.from(spans).find(span => 
              span.classList.contains('pdf-search-match-current')
            );
            if (currentMatchSpan) {
              currentMatchSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      }, delay);
    };

    retryHighlight();
  }

  clearHighlights() {
    const selectors = ['.textLayer span', 'span[role="presentation"]', '.textLayer > span', '.pdf-search-match'];
    selectors.forEach(selector => {
      document.querySelectorAll<HTMLElement>(selector).forEach(span => {
        span.classList.remove('pdf-search-match', 'pdf-search-match-current', 'pdf-search-match-ocr');
        span.style.backgroundColor = '';
        span.style.color = '';
        span.style.padding = '';
        span.style.borderRadius = '';
        span.style.fontWeight = '';
        span.style.border = '';
        
        // Remove OCR badges
        const badges = span.querySelectorAll('.ocr-badge');
        badges.forEach(badge => badge.remove());
      });
    });
  }

  previousPage() {
    if (this.currentPage > 1 && this.pageLoaded) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages && this.pageLoaded) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  goBack() {
    this.router.navigate(['/search-document']);
  }

  trackByFn(index: number, item: any): any {
    return index;
  }
}

