import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
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
import { PSM } from 'tesseract.js/src/constants/PSM';
// import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { createWorker, Worker as TesseractWorker, RecognizeResult  } from 'tesseract.js';
import { fromEvent, Subscription } from 'rxjs';

interface OCRWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // startChar?: number;
  // endChar?: number;

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
  @ViewChild('pdfStage', { static: false }) pdfStage?: ElementRef<HTMLElement>;
  @ViewChild('searchInputEl', { static: false }) searchInputEl?: ElementRef<HTMLInputElement>;
  
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
  pageRenderedMap: Map<number, boolean> = new Map();

  // PDF viewer properties
  pdfSrc: string | ArrayBuffer | Uint8Array | Blob = '';
  searchText: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  pageLoaded: boolean = false;
  private isInitialLoad: boolean = true;
  private isManualNavigation: boolean = false;

  // UX controls
  zoom: number = 1;
  zoomMin: number = 0.5;
  zoomMax: number = 3;
  zoomStep: number = 0.1;
  zoomScale: 'page-width' | 'page-fit' = 'page-width';
  pageJump: number | null = null;
  showFloatingNav: boolean = false;

  // Search progress (UI only)
  searchProgressCurrent: number = 0;
  searchProgressTotal: number = 0;
  
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
  private ocrCache = new Map<number,OCRWord[]>();
  ocrInProgressPages = new Set<number>();
  ocrLanguage = 'eng';

  private _subscriptions = new Subscription();
  private _scrollContainer: HTMLElement | null = null;
  
  // Available OCR languages
  // ocrLanguages = [
  //   { code: 'eng', name: 'English' },
  //   { code: 'spa', name: 'Spanish' },
  //   { code: 'fra', name: 'French' },
  //   { code: 'deu', name: 'German' },
  //   { code: 'ita', name: 'Italian' },
  //   { code: 'por', name: 'Portuguese' },
  //   { code: 'rus', name: 'Russian' },
  //   { code: 'chi_sim', name: 'Chinese (Simplified)' },
  //   { code: 'jpn', name: 'Japanese' },
  //   { code: 'kor', name: 'Korean' },
  //   { code: 'ara', name: 'Arabic' },
  //   { code: 'hin', name: 'Hindi' },
  // ];

  constructor(
    private sanitizer: DomSanitizer,
    private dataService: SharedService,
    private _searchDocService: SearchDocService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Don't load data in constructor - move to ngOnInit to avoid change detection issues
  }

  ngOnInit(): void {
    // Load data from route state or sessionStorage
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;
    
    let previewData: any = null;
    
    if (state && state.data) {
      previewData = state.data;
    } else {
      // Try sessionStorage as fallback
      const storedData = sessionStorage.getItem('pdfPreviewData');
      if (storedData) {
        try {
          previewData = JSON.parse(storedData);
        } catch (e) {
          console.error('Error parsing stored data:', e);
        }
      }
    }
    
    // If no data in state, try SharedService
    if (!previewData) {
      previewData = this.dataService.getPdfPreviewData();
    }
    
    if (previewData) {
      // Clear the stored data after reading
      if (sessionStorage.getItem('pdfPreviewData')) {
        const stored = JSON.parse(sessionStorage.getItem('pdfPreviewData') || '{}');
        if (stored.useShared) {
          // Data is in SharedService, don't clear sessionStorage
        } else {
          sessionStorage.removeItem('pdfPreviewData');
        }
      }
      this.getUploadMetaDataFiles(previewData);
    }
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
    this._subscriptions.unsubscribe();
    if (this.ocrWorker) {
      this.ocrWorker.terminate().catch(() => {});
      this.ocrWorker = null;
    }
  }

  onPdfLoadError(err: any) {
    console.error('PDF load error:', err);
    this.pageLoaded = false;
  }

  get zoomPercent(): number {
    return Math.round(this.zoom * 100);
  }

  zoomIn(): void {
    this.zoom = Math.min(this.zoomMax, Number((this.zoom + this.zoomStep).toFixed(2)));
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoomMin, Number((this.zoom - this.zoomStep).toFixed(2)));
  }

  resetZoom(): void {
    this.zoom = 1;
  }

  toggleFitMode(): void {
    this.zoomScale = this.zoomScale === 'page-width' ? 'page-fit' : 'page-width';
    this.zoom = 1;
  }

  applyPageJump(): void {
    if (!this.pageLoaded) return;
    const raw = Number(this.pageJump);
    if (!raw || Number.isNaN(raw)) return;
    const page = Math.max(1, Math.min(this.totalPages || raw, raw));
    this._goToPage(page);
  }

  private _goToPage(page: number): void {
    this.isManualNavigation = true;
    this.currentPage = page;
    this.cdr.detectChanges();
    setTimeout(() => (this.isManualNavigation = false), 300);
  }

  private _isScrollable(el: HTMLElement | null): boolean {
    if (!el) return false;
    const canScrollBySize = el.scrollHeight > el.clientHeight + 2;
    if (!canScrollBySize) return false;

    const style = window.getComputedStyle(el);
    const overflowY = (style.overflowY || '').toLowerCase();
    const allowsScroll = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
    return allowsScroll;
  }

  private _getPdfScrollContainer(): HTMLElement | null {
    // Prefer the actual scrollable container. Depending on CSS, ng2 container
    // may be overflow: visible, so it won't scroll.
    const host = this.pdfStage?.nativeElement;
    const ng2 = host?.querySelector('.ng2-pdf-viewer-container') as HTMLElement | null;
    if (this._isScrollable(ng2)) return ng2;

    const area = document.querySelector('.pdf-preview-area') as HTMLElement | null;
    if (this._isScrollable(area)) return area;

    // Fallback: if neither is scrollable (rare), try host
    if (this._isScrollable(host || null)) return host as HTMLElement;
    return null;
  }

  scrollPdf(direction: 'up' | 'down'): void {
    const container = this._getPdfScrollContainer();
    const amount = (container?.clientHeight ?? window.innerHeight) * 0.85;
    const delta = direction === 'up' ? -amount : amount;

    if (container) {
      container.scrollBy({ top: delta, behavior: 'smooth' });
      return;
    }

    window.scrollBy({ top: delta, behavior: 'smooth' });
  }

  private _attachScrollListener(): void {
    if (this._scrollContainer) return;
    const container = this._getPdfScrollContainer();
    if (!container) return;
    this._scrollContainer = container;
    this._subscriptions.add(
      fromEvent(container, 'scroll').subscribe(() => {
        this.showFloatingNav = container.scrollTop > 180;
      })
    );
  }

  private _isTypingContext(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || (el as any).isContentEditable;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && (event.key === 'f' || event.key === 'F')) {
      event.preventDefault();
      this.searchInputEl?.nativeElement?.focus();
      return;
    }

    if (this._isTypingContext(event.target)) {
      return;
    }

    if (event.key === 'PageDown') {
      event.preventDefault();
      this.scrollPdf('down');
      return;
    }
    if (event.key === 'PageUp') {
      event.preventDefault();
      this.scrollPdf('up');
      return;
    }

    if (this.searchText?.trim() && this.searchMatches?.length) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.findNext();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.findPrevious();
        return;
      }
    }

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.zoomIn();
      return;
    }
    if (event.key === '-') {
      event.preventDefault();
      this.zoomOut();
      return;
    }
    if (event.ctrlKey && event.key === '0') {
      event.preventDefault();
      this.resetZoom();
      return;
    }
  }

  getUploadMetaDataFiles(res: any) {
    console.log("PdfPreviewPageComponent - Data received:", res);
    
    // Reset to page 1 when loading new file
    this.currentPage = 1;
    this.isInitialLoad = true; // Reset initial load flag
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
    // Use setTimeout to ensure change detection runs in the correct context
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
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
      // Reset to page 1 when loading new PDF
      this.currentPage = 1;
      // Use setTimeout to ensure change detection runs in the correct context
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
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
    // Reset to page 1 when loading new PDF
    this.currentPage = 1;
    // Use setTimeout to ensure change detection runs in the correct context
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
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

 
  afterLoadComplete(pdf: any) {
    this.pageLoaded = true;
    this.totalPages = pdf.numPages;
    this.currentPage = 1;
    this.pdfViewerReady = true;
    this.isInitialLoad = true;
    this._attachScrollListener();
  }

  async onPageRendered(event: any) {
     this.pageLoaded = true;
     this.pageRenderedMap.set(this.currentPage, true);
  //  await this.waitForTextLayer(this.currentPage);
  // this.highlightCurrentPage();
  }

   highlightCurrentPage() {
    const pageTextLayer = document.querySelector(
      `.page[data-page-number="${this.currentPage}"] .textLayer`
    );

    if (!pageTextLayer) return;

    // Remove old highlights
    pageTextLayer.querySelectorAll('.highlight').forEach(el => {
      const parent = el.parentNode!;
      parent.replaceChild(document.createTextNode(el.textContent!), el);
    });

    // Apply new highlights
    const term = this.searchText.toLowerCase();
    const spans = pageTextLayer ? pageTextLayer.querySelectorAll("span") : [];

    spans.forEach((span: HTMLElement) => {
      const txt = span.textContent?.toLowerCase() || '';

      if (txt.includes(term)) {
        const inner = span.textContent!;
        const highlighted = inner.replace(
          new RegExp(`(${this.searchText})`, 'ig'),
          `<mark class="highlight">$1</mark>`
        );
        span.innerHTML = highlighted;
      }
    });

    this.scrollToCurrentMatch();
  }

  // private waitForTextLayer(pageNumber: number): Promise<void> {
  //   return new Promise(resolve => {
  //     let attempts = 0;

  //     const interval = setInterval(() => {
  //       const layer = document.querySelector(
  //         `.page[data-page-number="${pageNumber}"] .textLayer`
  //       ) as HTMLElement;

  //       debugger;
  //       if (layer) {
  //         const spans = layer.querySelectorAll('span');
  //         if (spans.length > 0) {
  //           clearInterval(interval);
  //           resolve();
  //         }
  //       }

  //       attempts++;
  //       if (attempts > 20) {
  //         clearInterval(interval);
  //         console.warn("Text layer unavailable after max retries");
  //         resolve();
  //       }
  //     }, 150);
  //   });
  // }
 
//   scrollToCurrentMatch() {
//   const match = this.searchMatches[this.currentMatchIndex];
//   if (!match) return;

//   if (match.page !== this.currentPage) return;

//   const pdfContainer = document.querySelector('.pdf-viewer-container');
//   if (!pdfContainer) return;

//   // Convert match.y into container scroll position
//   // const scrollTop = match.y - pdfContainer.clientHeight / 2;
// let scrollTop = match.y;

//    if (scrollTop < 0) scrollTop = 0;

//   // Prevent scrolling below bottom
//   const maxScroll = pdfContainer.scrollHeight - pdfContainer.clientHeight;
//   if (scrollTop > maxScroll) scrollTop = maxScroll;

//   pdfContainer.scrollTo({
//     top: scrollTop,
//     behavior: 'smooth'
//   });
// }

scrollToCurrentMatch() {
  const match = this.searchMatches[this.currentMatchIndex];
  if (!match || !match.element) return;

  match.element.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

  cleanupEmptyTextLayers() {
    // Remove empty text layers and endOfContent markers
    const emptyTextLayers = document.querySelectorAll('.textLayer');
    emptyTextLayers.forEach((layer: Element) => {
      const htmlLayer = layer as HTMLElement;
      const endOfContent = htmlLayer.querySelector('.endOfContent');
      const hasOnlyEndOfContent = endOfContent && htmlLayer.children.length === 1;
      const isEmpty = htmlLayer.children.length === 0 || 
                     (htmlLayer.textContent?.trim() === '' && hasOnlyEndOfContent);
      
      if (isEmpty || hasOnlyEndOfContent) {
        htmlLayer.style.display = 'none';
        htmlLayer.style.height = '0';
        htmlLayer.style.width = '0';
        htmlLayer.style.margin = '0';
        htmlLayer.style.padding = '0';
        htmlLayer.style.minHeight = '0';
        htmlLayer.style.minWidth = '0';
        htmlLayer.style.overflow = 'hidden';
      }
      
      // Remove endOfContent markers
      const endMarkers = htmlLayer.querySelectorAll('.endOfContent');
      endMarkers.forEach(marker => {
        const markerEl = marker as HTMLElement;
        markerEl.style.display = 'none';
        markerEl.style.height = '0';
        markerEl.style.width = '0';
        markerEl.style.margin = '0';
        markerEl.style.padding = '0';
      });
    });
  }

  async initializePdfForSearch() {
    debugger;

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
          const  ocrWords  = await this.runOcrOnPage(page, pageNum);

          const viewport = page.getViewport({ scale: 1 });

  const pageContainer = document.querySelector(`.page[data-page-number="${pageNum}"]`);
  const pdfCanvas = pageContainer?.querySelector("canvas");

  let renderedWidth = viewport.width;
  let renderedHeight = viewport.height;

  if (pdfCanvas) {
    renderedWidth = pdfCanvas.width;
    renderedHeight = pdfCanvas.height;
  }

  // OCR canvas dimensions
  const ocrCanvasWidth = ocrWords[0]?.canvasWidth || viewport.width;
  const ocrCanvasHeight = ocrWords[0]?.canvasHeight || viewport.height;

  // SCALE FACTORS
  const scaleX = renderedWidth / ocrCanvasWidth;
  const scaleY = renderedHeight / ocrCanvasHeight;

ocrWords.forEach(word => {
  if (word.text.toLowerCase().includes(this.searchText.toLowerCase())) {
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
        // setTimeout(() => {
        //   this.highlightSearchMatches();
        // }, 500);
        // setTimeout(() => {
        //   this.highlightSearchMatches();
        // }, 1500);
        // setTimeout(() => {
        //   this.highlightSearchMatches();
        // }, 2500);
          this.highlightSearchMatches();
       
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
      // this.searchInPdf();
    }
  }

private async runOcrOnPage(page: any, pageNum: number): Promise<OCRWord[]> {
  if (this.ocrCache.has(pageNum)) return this.ocrCache.get(pageNum)!;

  const worker = await this.ensureOcrWorker();
  if (!worker) return [];
try{
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
}
finally {
      this.ocrInProgressPages.delete(pageNum);
      this.cdr.detectChanges();
    }
}




  async navigateToMatch(index: number) {
    if (index < 0 || index >= this.searchMatches.length) return;
    
    this.currentMatchIndex = index;
    const match = this.searchMatches[index];
    
    if (match && match.page) {
      // Use safe navigation - only update currentPage, let ng2-pdf-viewer handle the rest
      this.currentPage = match.page;
      this.cdr.detectChanges();
      
      // Wait for page to render, then highlight
    //   const waitForRender = () => {
    //   if (this.pageRenderedMap.get(this.currentPage)) {
    //     this.highlightSearchMatches();
    //   } else {
    //     setTimeout(waitForRender, 100);
    //   }
    // };

    // waitForRender();
    // await this.waitForTextLayer(this.currentPage);
    this.highlightSearchMatches();
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
      // this.searchInPdf();
    } else if (!this.searchText?.trim()) {
      this.clearHighlights();
    }
  }
private async highlightSearchMatches() {
  const searchText = this.searchText?.trim().toLowerCase();
  if (!searchText) {
    this.clearHighlights();
    return;
  }

  const pageContainer = document.querySelector(
    `.page[data-page-number="${this.currentPage}"]`
  ) as HTMLElement;

  if (!pageContainer) return;

  pageContainer.style.position = "relative";

  // remove old overlay
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
  pageContainer.style.position = "relative";

  // OCR words for this page
  const page = await this.pdfDoc.getPage(this.currentPage);
  const ocrWords = await this.runOcrOnPage(page, this.currentPage);

  if (!ocrWords || ocrWords.length === 0) return;

  // --- IMPORTANT: compute scaling factors ---
  const viewport = page.getViewport({ scale: 1 });

  const renderedWidth = pageContainer.offsetWidth;
  const renderedHeight = pageContainer.offsetHeight;

  const ocrCanvasWidth = ocrWords[0].canvasWidth;
  const ocrCanvasHeight = ocrWords[0].canvasHeight;

  const scaleX = renderedWidth / ocrCanvasWidth;
  const scaleY = renderedHeight / ocrCanvasHeight;

  // find matching OCR words
  const matchedWords = ocrWords.filter(w =>
    w.text.toLowerCase().includes(searchText)
  );

  // matchedWords.forEach(w => {
  //   const rect = document.createElement("div");

  //   Object.assign(rect.style, {
  //     position: "absolute",
  //     top: `${w.y * scaleY}px`,
  //     left: `${w.x * scaleX}px`,
  //     width: `${w.width * scaleX}px`,
  //     height: `${w.height * scaleY}px`,
  //     backgroundColor: "yellow",
  //     opacity: "0.45",
  //     borderRadius: "3px",
  //     pointerEvents: "none",
  //   });

  //   overlay.appendChild(rect);
  // });
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

  // if (matchedWords.length > 0) {
  //   pageContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  // }
}

  /**
 * Waits for the textLayer of the current page to be rendered and returns all span elements.
 * Retries until max attempts or timeout.
 */
// private async getTextLayerSpans(pageNumber: number): Promise<NodeListOf<HTMLElement>> {
//   return new Promise((resolve) => {
//     let attempts = 0;
//     const maxAttempts = 20;

//     const interval = setInterval(() => {
//       const selector = `.page[data-page-number="${pageNumber}"] .textLayer span`;
//       const spans = document.querySelectorAll<HTMLElement>(selector);

//       if (spans.length > 0) {
//         clearInterval(interval);
//         console.log(`Found ${spans.length} spans on page ${pageNumber}`);
//         resolve(spans);
//       } else {
//         attempts++;
//         if (attempts > maxAttempts) {
//           clearInterval(interval);
//           console.warn(`Text layer not available for page ${pageNumber} after ${maxAttempts} attempts`);
//           resolve(spans); // returns empty NodeList
//         }
//       }
//     }, 150); // check every 150ms
//   });
// }

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
    if (!this.pageLoaded || this.currentPage <= 1) {
      return;
    }
    
    // Clear initial load flag if still set
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
    }
    
    // Set manual navigation flag to prevent onPageChange interference
    this.isManualNavigation = true;
    
    // Decrement page
    this.currentPage = this.currentPage - 1;
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Reset manual navigation flag after page has time to render
    setTimeout(() => {
      this.isManualNavigation = false;
    }, 500);
  }

  nextPage() {
    if (!this.pageLoaded || this.currentPage >= this.totalPages) {
      return;
    }
    
    // Clear initial load flag if still set
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
    }
    
    // Set manual navigation flag to prevent onPageChange interference
    this.isManualNavigation = true;
    
    // Increment page
    this.currentPage = this.currentPage + 1;
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Reset manual navigation flag after page has time to render
    setTimeout(() => {
      this.isManualNavigation = false;
    }, 500);
  }

  goBack() {
    this.router.navigate(['/search-document']);
  }

  trackByFn(index: number, item: any): any {
    return index;
  }
}

