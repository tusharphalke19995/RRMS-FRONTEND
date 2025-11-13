import { Component, Inject, ViewEncapsulation, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SharedService } from 'app/shared/shared.service';
import { SearchDocService } from '../../../search-document/searchDoc.service';
import { UploadedFilesComponent } from '../../../search-document/uploaded-files/uploaded-files.component';
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
  selector: 'app-image-preview-dailog',
  standalone: true,
  imports: [CommonModule,
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
  ],
  templateUrl: './image-preview-dailog.component.html',
  styleUrl: './image-preview-dailog.component.scss'
})
export class ImagePreviewDailogComponent implements OnInit, AfterViewInit, OnDestroy {
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
  
  constructor(
    private sanitizer: DomSanitizer,
        private dataService: SharedService,
    private _searchDocService: SearchDocService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImagePreviewDailogComponent>
  ) {
    console.log("dadsfvta",data)
  
   this.getUploadMetaDataFiles(data)
  }

  ngOnInit(): void {
    // Component initialization
    // Ensure PDF is ready for search if files are already loaded
    if (this.pdfFiles.length > 0) {
      setTimeout(() => {
        this.initializePdfForSearch();
      }, 1000);
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

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  getUploadMetaDataFiles(res): void {
    console.log("getUploadMetaDataFiles - received data:", res);
    if (res) {
      // Extract file from FileWithMetadata object if needed
      let fileToProcess = res;
      if (res.file && res.file instanceof File) {
        fileToProcess = res.file;
      } else if (res.file && typeof res.file === 'object' && res.file.fileHash) {
        // If it's a file metadata object, fetch from API
        this.fetchFileFromAPI(res.file);
        return;
      }
      
      // Check if res is a base64-encoded object (from API response or explicit base64 object)
      const fileType = fileToProcess.mime_type || fileToProcess.type;
      const base64Content = fileToProcess.base64_content;
      
      console.log("File type:", fileType, "Has base64:", !!base64Content);
      
      // Handle base64-encoded PDF (from API response or explicit base64 object)
      if (base64Content && fileType === "application/pdf") {
        console.log("Loading PDF from base64");
        // Handle base64-encoded PDF
        this.loadPdfFromBase64(base64Content);
        // Create a blob URL for fallback link
        const blob = this.base64ToBlob(base64Content, fileType);
        const fileUrl = URL.createObjectURL(blob);
        this.base64pdf = fileUrl;
        this.pdfFiles.push(fileUrl);
        // Initialize PDF for search after a short delay
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
          this.base64pdf = fileUrl;
          this.pdfFiles.push(fileUrl);
          // Load PDF for pdf-viewer
          this.loadPdfForViewer(res);
          // Initialize PDF for search after loading
          setTimeout(() => {
            this.initializePdfForSearch();
          }, 500);
        } else if (fileType.startsWith("audio/")) {
          this.audioFiles.push(fileUrl);
        } else if (fileType.startsWith("video/")) {
          this.videoFiles.push(fileUrl);
        } else if (
          fileType === "application/msword" ||
          fileType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const googleDocsViewerUrl = `https://rrms-backend.onrender.com/viewer?url=${encodeURIComponent(
            fileUrl
          )}&embedded=true`;

          this.wordViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsViewerUrl);
          console.log("Word document URL:", googleDocsViewerUrl);
          this.wordFiles.push(googleDocsViewerUrl);
        }
        // Handle Excel files (.xls, .xlsx)
        else if (
          fileType === "application/vnd.ms-excel" ||
          fileType ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          const googleDocsViewerUrl = `https://rrms-backend.onrender.com/viewer?url=${encodeURIComponent(
            fileUrl
          )}&embedded=true`;

          this.excelViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsViewerUrl);
          console.log("Excel document URL:", googleDocsViewerUrl);

          this.excelFiles.push(googleDocsViewerUrl);
        } else {
          console.warn("Unsupported file type:", fileType);
        }
      } else {
        console.warn("Unknown data format:", res);
      }
    } else {
      console.error("No file data received");
    }
  }

  async loadPdfForViewer(file: File): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
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
      console.log("loadPdfFromBase64 - base64 length:", base64?.length);
      if (!base64 || base64.length === 0) {
        console.error("Empty base64 string");
        return;
      }
      // Decode base64 string to binary string
      const binaryString = atob(base64);
      // Convert binary string to Uint8Array
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Convert Uint8Array to ArrayBuffer
      this.pdfSrc = bytes.buffer;
      console.log("PDF loaded successfully, ArrayBuffer size:", bytes.buffer.byteLength);
      
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

  onPdfLoadComplete(pdf: any): void {
    this.totalPages = pdf.numPages;
    this.pageLoaded = true;
  }

  afterLoadComplete(pdf: any): void {
    console.log('PDF loaded in viewer:', pdf);
    this.totalPages = pdf?.numPages || 0;
    this.pageLoaded = true;
    
    // Ensure PDF document is loaded for search immediately
    if (!this.pdfDoc && this.pdfSrc) {
      // Load immediately without delay
      this.loadPdfForSearchFromSrc();
    } else if (!this.pdfDoc && this.pdfFiles.length > 0) {
      // If pdfSrc is not ready but we have pdfFiles, try to load from pdfFiles
      this.initializePdfForSearch();
    }
  }
  
  async initializePdfForSearch(): Promise<void> {
    try {
      if (this.pdfFiles.length > 0 && !this.pdfDoc) {
        const pdfUrl = this.pdfFiles[0];
        if (pdfUrl) {
          console.log('Initializing PDF for search from URL:', pdfUrl.substring(0, 50));
          const response = await fetch(pdfUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            await this.loadPdfDocForSearch(bytes);
            console.log('PDF initialized for search successfully');
          }
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
      
      // If still not loaded, try from pdfFiles
      if (!this.pdfDoc && this.pdfFiles.length > 0) {
        await this.initializePdfForSearch();
      }
      
      // Final retry after delay
      if (!this.pdfDoc) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.pdfSrc) {
          await this.loadPdfForSearchFromSrc();
        } else if (this.pdfFiles.length > 0) {
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

  isImage(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("image/");
  }

  isPdf(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("pdf");
  }

  ngOnDestroy() {
    // Cleanup all blob URLs to prevent memory leaks
    this.fileInfo.forEach((fileUrl) => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    });
    this.pdfFiles.forEach((fileUrl) => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    });
    if (this.base64pdf && typeof this.base64pdf === 'string' && this.base64pdf.startsWith('blob:')) {
      URL.revokeObjectURL(this.base64pdf);
    }
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getSafeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  fetchFileFromAPI(fileData: any): void {
    const payload = {
      fileHash: fileData?.fileHash || fileData?.file?.fileHash,
      requested_to: 0,
      comments: "",
      division_id: sessionStorage.getItem("divisionID"),
      case_id: fileData?.caseInfoDetailsId || fileData?.case_details_id,
    };

    this._searchDocService.filePreviewData(payload).subscribe({
      next: (res: any) => {
        if (res) {
          const fileType = res.mime_type || res.type;
          const base64Content = res.base64_content;
          
          if (base64Content && fileType === "application/pdf") {
            this.loadPdfFromBase64(base64Content);
            const blob = this.base64ToBlob(base64Content, fileType);
            const fileUrl = URL.createObjectURL(blob);
            this.base64pdf = fileUrl;
            this.pdfFiles.push(fileUrl);
          }
        }
      },
      error: (error) => {
        console.error("Error fetching file from API:", error);
      }
    });
  }

  
}
