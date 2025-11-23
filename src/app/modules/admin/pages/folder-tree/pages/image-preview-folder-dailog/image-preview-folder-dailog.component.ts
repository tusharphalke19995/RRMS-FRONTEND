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
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for ng2-pdf-viewer
// Use local worker file from assets to match installed version 5.4.394
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/assets/pdf.worker.min.mjs`;
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

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImagePreviewFolderDailogComponent>
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
    const audioTypes = ["mp3", "wav", "ogg"];
    const videoTypes = ["mp4", "webm"];
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
      this.pdfSrc = arrayBuffer;
      
      // Also load PDF document for custom search
      const bytes = new Uint8Array(arrayBuffer);
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
      const loadingTask = pdfjsLib.getDocument({ 
        data: bytes,
        verbosity: 0 // Reduce console output
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
    try {
      if (this.finalUrl && !this.pdfDoc) {
        console.log('Initializing PDF for search from URL:', this.finalUrl.substring(0, 50));
        const response = await fetch(this.finalUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          await this.loadPdfDocForSearch(bytes);
          console.log('PDF initialized for search successfully');
        }
      }
    } catch (error) {
      console.error('Error initializing PDF for search:', error);
    }
  }

  async loadPdfForSearchFromSrc(): Promise<void> {
    try {
      let data: Uint8Array | null = null;
      
      if (this.pdfSrc instanceof ArrayBuffer) {
        data = new Uint8Array(this.pdfSrc);
        console.log('Loading PDF from ArrayBuffer for search, size:', data.length);
      } else if (this.pdfSrc instanceof Uint8Array) {
        data = this.pdfSrc;
        console.log('Loading PDF from Uint8Array for search, size:', data.length);
      } else if (typeof this.pdfSrc === 'string') {
        // If it's a blob URL, fetch it
        console.log('Fetching PDF from URL for search:', this.pdfSrc.substring(0, 50) + '...');
        try {
          const response = await fetch(this.pdfSrc);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          data = new Uint8Array(arrayBuffer);
          console.log('Fetched PDF from URL for search, size:', data.length);
        } catch (fetchError) {
          console.error('Error fetching PDF from URL:', fetchError);
          // Try to get from pdfSrc if it's already an ArrayBuffer
          if (this.pdfSrc && typeof this.pdfSrc !== 'string') {
            console.log('Trying alternative method to get PDF data');
          }
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
      
      // Search through ALL pages of the PDF
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        try {
          const page = await this.pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Check if page has text content
          if (!textContent || !textContent.items || textContent.items.length === 0) {
            console.log(`Page ${pageNum} has no text content (might be image-based PDF)`);
            continue;
          }
          
          console.log(`Page ${pageNum}: Extracted ${textContent.items.length} text items`);
          
          // Build complete page text preserving word boundaries
          const pageTextParts: string[] = [];
          const itemPositions: Array<{item: any, startChar: number, endChar: number}> = [];
          let charOffset = 0;
          
          textContent.items.forEach((item: any) => {
            if (item?.str && typeof item.str === 'string' && item.str.trim().length > 0) {
              const text = item.str.trim();
              const startChar = charOffset;
              const endChar = charOffset + text.length;
              
              pageTextParts.push(text);
              itemPositions.push({
                item: item,
                startChar: startChar,
                endChar: endChar
              });
              
              // Add space between items, but track character positions accurately
              charOffset = endChar + 1;
            }
          });
          
          if (pageTextParts.length === 0) {
            console.log(`Page ${pageNum} has no extractable text`);
            continue;
          }
          
          const fullPageText = pageTextParts.join(' ');
          const lowerPageText = fullPageText.toLowerCase();
          
          console.log(`Page ${pageNum}: Full text length: ${fullPageText.length} characters`);
          
          // Search for all occurrences in this page
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
              this.searchMatches.push({
                page: pageNum,
                text: matchItem.item.str,
                itemIndex: itemPositions.indexOf(matchItem),
                x: matchItem.item.transform?.[4] || 0,
                y: matchItem.item.transform?.[5] || 0,
                charIndex: searchStart,
                context: fullPageText.substring(Math.max(0, searchStart - 30), Math.min(fullPageText.length, searchEnd + 30))
              });
              pageMatchCount++;
            } else {
              // Match spans multiple items - use first item
              const firstItem = itemPositions.find(pos => searchStart < pos.endChar);
              if (firstItem) {
                this.searchMatches.push({
                  page: pageNum,
                  text: fullPageText.substring(Math.max(0, searchStart - 20), Math.min(fullPageText.length, searchEnd + 20)),
                  itemIndex: itemPositions.indexOf(firstItem),
                  x: firstItem.item.transform?.[4] || 0,
                  y: firstItem.item.transform?.[5] || 0,
                  charIndex: searchStart,
                  context: fullPageText.substring(Math.max(0, searchStart - 30), Math.min(fullPageText.length, searchEnd + 30))
                });
                pageMatchCount++;
              }
            }
            
            searchStart = searchEnd;
          }
          
          if (pageMatchCount > 0) {
            console.log(`Page ${pageNum}: Found ${pageMatchCount} matches`);
          }
        } catch (pageError) {
          console.error(`Error searching page ${pageNum}:`, pageError);
        }
      }

      console.log(`✓ Overall search completed: Found ${this.searchMatches.length} matches across ${this.totalPages} pages`);

      if (this.searchMatches.length > 0) {
        this.currentMatchIndex = 0;
        this.navigateToMatch(0);
        console.log(`✓ Navigated to first match on page ${this.searchMatches[0].page}`);
      } else {
        console.warn(`⚠ No matches found for "${searchQuery}" in the entire PDF`);
        console.log('This might be because:');
        console.log('1. The PDF is image-based (scanned) without text layer');
        console.log('2. The search text does not exist in the PDF');
        console.log('3. The PDF text extraction failed');
      }
    } catch (error) {
      console.error('Error during overall PDF search:', error);
    } finally {
      this.isSearching = false;
    }
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
  }
}
