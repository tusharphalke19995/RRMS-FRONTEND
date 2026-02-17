import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef, Inject, Optional, ElementRef, HostListener } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SharedService } from 'app/shared/shared.service';
import { SearchDocService } from '../../../search-document/searchDoc.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { createWorker, Worker as TesseractWorker } from 'tesseract.js';
import { fromEvent, Subscription } from 'rxjs';

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
  selector: 'app-pdf-preview',
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
    MatDialogModule,
    RouterLink,
    TranslocoModule,
    PdfViewerModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './pdf-preview.component.html',
  styleUrl: './pdf-preview.component.scss'
})
export class PdfPreviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pdfViewer', { static: false }) pdfViewer: any;
  @ViewChild('pdfStage', { static: false }) pdfStage?: ElementRef<HTMLElement>;
  @ViewChild('searchInputEl', { static: false }) searchInputEl?: ElementRef<HTMLInputElement>;
  
  pdfFiles: string[] = [];
  audioFiles: string[] = [];
  videoFiles: string[] = [];
  fileInfo: string[] = [];
  imageFiles: string[] = [];
  base64pdf: SafeResourceUrl | null = null;
  pdfTitle: string = "PDF Preview";
  pageRenderedMap: Map<number, boolean> = new Map();

  // PDF viewer properties
  pdfSrc: string | ArrayBuffer | Uint8Array | Blob = '';
  searchText: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  pageLoaded: boolean = false;
  private isInitialLoad: boolean = true;
  private isManualNavigation: boolean = false;
  
  // PDF.js document for custom search
  pdfDoc: any = null;
  searchMatches: any[] = [];
  currentMatchIndex: number = -1;
  isSearching: boolean = false;
  pdfViewerReady: boolean = false;
  textExtractionMessage: string = '';

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

  // OCR helpers
  private ocrEnabled = true;
  private ocrWorker: TesseractWorker | null = null;
  private ocrCache = new Map<number, OCRWord[]>();
  ocrInProgressPages = new Set<number>();
  ocrLanguage = 'eng';
  
  // File info
  fileName: string = '';
  finalUrl: string = '';
  isLoadingFromApi: boolean = false;
  caseMetaData: any = null;

  private _subscriptions = new Subscription();
  private _scrollContainer: HTMLElement | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private dataService: SharedService,
    private cdr: ChangeDetectorRef,
    private _searchDocService: SearchDocService,
    private _snackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() public dialogRef: MatDialogRef<PdfPreviewComponent>,
    @Optional() public router: Router,
    @Optional() private route: ActivatedRoute
  ) {
    // Initialize from dialog data or route state
  }

  ngOnInit(): void {
    // Load data from dialog data or route state
    let previewData: any = null;
    
    if (this.data) {
      previewData = this.data;
    } else {
      // Try route state or sessionStorage
      if (this.router) {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state || window.history.state;
        if (state && state.data) {
          previewData = state.data;
        }
      } else {
        const navigation = window.history.state;
        if (navigation && navigation.data) {
          previewData = navigation.data;
        }
      }
      
      if (!previewData) {
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
    }
    
    if (previewData) {
      this.loadPdfData(previewData);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pdfViewerReady = true;
      if (this.pdfFiles.length > 0 || this.pdfSrc) {
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
    
    // Cleanup blob URLs
    if (this.finalUrl && this.finalUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.finalUrl);
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
    return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
  }

  private _getPdfScrollContainer(): HTMLElement | null {
    const host = this.pdfStage?.nativeElement;
    const ng2 = host?.querySelector('.ng2-pdf-viewer-container') as HTMLElement | null;
    if (this._isScrollable(ng2)) return ng2;

    const area = document.querySelector('.pdf-preview-area') as HTMLElement | null;
    if (this._isScrollable(area)) return area;

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

  loadPdfData(res: any) {
    console.log("PdfPreviewComponent - Data received:", res);
    
    // Reset to page 1 when loading new file
    this.currentPage = 1;
    this.isInitialLoad = true;
    this.pdfFiles = [];
    this.audioFiles = [];
    this.videoFiles = [];
    this.imageFiles = [];
    this.fileInfo = [];

    if (!res) {
      console.error("No data provided");
      return;
    }

    // Extract file from FileWithMetadata object if needed
    let fileToProcess = res;
    if (res.file && res.file instanceof File) {
      fileToProcess = res.file;
    } else if (res.file && typeof res.file === 'object' && res.file.fileHash) {
      fileToProcess = res.file;
    }
    
    // Store case metadata if available
    this.caseMetaData =
      res.caseMetaData ||
      res.caseId ||
      res.case_id ||
      res.caseInfoDetailsId ||
      res.caseInfoDetailsID ||
      null;
    
    // Check if file has fileHash - if so, call API to get file data
    const fileId = fileToProcess.file_id || res.file_id;
    const caseId =
      res.caseId ??
      res.case_id ??
      res.caseInfoDetailsId ??
      res.caseInfoDetailsID ??
      fileToProcess.caseId ??
      fileToProcess.case_id ??
      null;
    const fileHash = fileToProcess.fileHash || res.fileHash;
    if (fileHash) {
      console.log("File has fileHash, calling API to fetch file data");
      // If caseId is missing, fall back to fileId to preserve legacy behavior
      this.loadPdfFromFileHash(fileToProcess, fileHash, caseId ?? fileId);
      return;
    }
    
    // Check if res is a base64-encoded object (from API response or explicit base64 object)
    const fileType = fileToProcess.mime_type || fileToProcess.type;
    const base64Content = fileToProcess.base64_content || fileToProcess.base64Content;
    
    console.log("File type:", fileType, "Has base64:", !!base64Content);
    
    // Set file name - prioritize name property, then file_name, then extract from path
    this.fileName = fileToProcess.name || fileToProcess.file_name || "document.pdf";
    
    // Handle base64-encoded PDF (from API response or explicit base64 object)
    if (base64Content && fileType === "application/pdf") {
      console.log("Loading PDF from base64");
      this.loadPdfFromBase64(base64Content);
      const blob = this.base64ToBlob(base64Content, fileType);
      const fileUrl = URL.createObjectURL(blob);
      this.finalUrl = fileUrl;
      this.base64pdf = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
      this.pdfFiles.push(fileUrl);
      setTimeout(() => {
        this.initializePdfForSearch();
      }, 500);
      return;
    }
    
    // Handle file path first (from folder tree) - this is a URL string, not a File object
    if (fileToProcess.path && typeof fileToProcess.path === 'string') {
      let pathUrl = fileToProcess.path;
      
      // If path is already a full URL (http:// or https://), use it directly
      // Don't decode full URLs as they may contain encoded path segments
      if (pathUrl.startsWith('http://') || pathUrl.startsWith('https://')) {
        // Use the URL as-is for full URLs
        this.finalUrl = pathUrl;
      } else {
        // For relative paths or file system paths, try to decode
        try {
          pathUrl = decodeURIComponent(fileToProcess.path);
        } catch (e) {
          // If decoding fails, use original path
          pathUrl = fileToProcess.path;
        }
        this.finalUrl = pathUrl;
      }
      
      // Set fileName from name property if available
      if (fileToProcess.name && !this.fileName) {
        this.fileName = fileToProcess.name;
      }
      
      const extension = this.getFileExtension(fileToProcess.path || fileToProcess.name || '');
      const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
      const audioTypes = ["mp3", "wav", "ogg","mpeg"];
      const videoTypes = ["mp4", "webm","mpeg"];
      
      if (imageTypes.includes(extension)) {
        this.imageFiles.push(this.finalUrl);
      } else if (audioTypes.includes(extension)) {
        this.audioFiles.push(this.finalUrl);
      } else if (videoTypes.includes(extension)) {
        this.videoFiles.push(this.finalUrl);
      } else if (extension === "pdf") {
        this.loadPdfFromUrl(this.finalUrl);
      }
    } else if (typeof fileToProcess === 'string' && (fileToProcess.startsWith('http://') || fileToProcess.startsWith('https://'))) {
      // Handle direct URL string
      this.finalUrl = fileToProcess;
      const extension = this.getFileExtension(fileToProcess);
      if (extension === "pdf") {
        this.loadPdfFromUrl(this.finalUrl);
      }
    } else if (fileToProcess instanceof File || fileToProcess instanceof Blob) {
      // Handle File/Blob object (actual File or Blob instance)
      try {
        const fileUrl = URL.createObjectURL(fileToProcess);
        const fileType = fileToProcess.type;
        this.finalUrl = fileUrl;
        
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
      } catch (error) {
        console.error('Error creating object URL:', error);
        console.warn("Failed to process file object:", res);
      }
    } else {
      console.warn("Unknown data format:", res);
    }

    // Use setTimeout to ensure change detection runs in the correct context
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  loadPdfFromFileHash(fileToProcess: any, fileHash: string, caseId: any): void {
    this.isLoadingFromApi = true;
    
    // Set file name from fileToProcess if available
    this.fileName = fileToProcess.name || fileToProcess.file_name || "document.pdf";
    
    // Prepare payload for API call
    const payload = {
      fileHash: fileHash,
      requested_to: 0,
      comments: "",
      division_id: sessionStorage.getItem("divisionID"),
      case_id: caseId,
    };

    console.log('Calling filePreviewData API with payload:', payload);

    this._searchDocService.filePreviewData(payload).subscribe({
      next: (res: any) => {
        this.isLoadingFromApi = false;
        
        if (!res) {
          console.error("No file data received from API");
          this._snackBar.open("No file data received. The file may be too large (>1GB) or the server is unavailable. Please try again or contact administrator.", "Close", {
            duration: 8000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
          return;
        }

        // Check file type from API response
        const resFileType = res.mime_type || res.type;
        const base64 = res.base64_content;
        const fileName = res.file_name || this.fileName || "document";

        if (!resFileType) {
          console.error("No mime type in API response");
          this._snackBar.open("Unable to determine file type", "Close", {
            duration: 3000,
            horizontalPosition: "right",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
          return;
        }

        // Update fileName from API response if available
        if (fileName && fileName !== this.fileName) {
          this.fileName = fileName;
        }

        const lowerFileType = (resFileType || '').toString().toLowerCase();
        const isImage = lowerFileType.startsWith("image/");
        const isVideo = lowerFileType.startsWith("video/");
        const isAudio = lowerFileType.startsWith("audio/");
        const isPdf = lowerFileType === "application/pdf";

        console.log('API response - fileType:', resFileType, 'isPdf:', isPdf);

        // Handle PDF files
        if (isPdf) {
          console.log("Loading PDF from API base64 response");
          this.loadPdfFromBase64(base64);
          const blob = this.base64ToBlob(base64, resFileType);
          const fileUrl = URL.createObjectURL(blob);
          this.finalUrl = fileUrl;
          this.base64pdf = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
          this.pdfFiles.push(fileUrl);
          setTimeout(() => {
            this.initializePdfForSearch();
          }, 500);
        } else if (isImage) {
          // Handle images
          const fileUrl = `data:${resFileType};base64,${base64}`;
          this.imageFiles.push(fileUrl);
        } else if (isAudio) {
          // Handle audio
          const fileUrl = `data:${resFileType};base64,${base64}`;
          this.audioFiles.push(fileUrl);
        } else if (isVideo) {
          // Handle video
          const fileUrl = `data:${resFileType};base64,${base64}`;
          this.videoFiles.push(fileUrl);
        } else {
          // Handle office documents - download directly
          const downloadOnlyMimeTypes = [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/csv",
            "application/csv",
          ];
          const fileExt = (fileName || '').toString().split('.').pop()?.toLowerCase() || '';
          const downloadOnlyExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv"];
          
          const isDownloadOnly = downloadOnlyMimeTypes.includes(lowerFileType) || downloadOnlyExts.includes(fileExt);

          if (isDownloadOnly) {
            const blob = this.base64ToBlob(base64, resFileType);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          } else {
            console.warn("Unsupported file type from API:", resFileType);
            this._snackBar.open(`Unsupported file type: ${resFileType}`, "Close", {
              duration: 3000,
              horizontalPosition: "right",
              verticalPosition: "top",
              panelClass: ["error-snackbar"],
            });
          }
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingFromApi = false;
        console.error("Error fetching file preview from API:", error);
        this._snackBar.open("Error fetching file preview. Please try again or contact administrator.", "Close", {
          duration: 5000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
        this.cdr.detectChanges();
      }
    });
  }

  async loadPdfFromUrl(url: string): Promise<void> {
    try {
      console.log('Loading PDF from URL:', url);
      
      // Use fetch with credentials if needed (for CORS)
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf,application/octet-stream,*/*'
        },
        // Include credentials for same-origin requests
        credentials: 'include' as RequestCredentials
      };
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 100)}`);
      }
      
      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('pdf') && !contentType.includes('octet-stream')) {
        console.warn('Response content-type is not PDF:', contentType);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Received empty PDF data');
      }
      
      // Create a copy immediately to avoid detached ArrayBuffer issues
      const arrayBufferCopy = arrayBuffer.slice(0);
      this.pdfSrc = arrayBufferCopy;
      this.finalUrl = url;
      
      // Extract filename from URL if not already set
      if (!this.fileName || this.fileName === 'document.pdf') {
        try {
          // Handle both absolute URLs and relative paths
          let urlPath: string;
          if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
              const urlObj = new URL(url);
              urlPath = urlObj.pathname;
            } catch (e) {
              // If URL parsing fails, try to extract from pathname manually
              const match = url.match(/\/cm\/(.+)$/);
              if (match && match[1]) {
                // Decode the path segment
                urlPath = decodeURIComponent(match[1]);
                // Extract filename from the decoded path
                const pathParts = urlPath.split(/[\\\/]/);
                const fileNameFromPath = pathParts[pathParts.length - 1];
                if (fileNameFromPath) {
                  this.fileName = fileNameFromPath;
                }
              } else {
                urlPath = url.split('?')[0];
              }
            }
          } else {
            // For relative paths, extract from the path string
            urlPath = url.split('?')[0]; // Remove query parameters
          }
          
          if (!this.fileName || this.fileName === 'document.pdf') {
            const fileNameFromUrl = urlPath.split('/').pop() || urlPath.split('\\').pop() || 'document.pdf';
            this.fileName = decodeURIComponent(fileNameFromUrl);
          }
        } catch (e) {
          console.log('Could not extract filename from URL:', e);
          // Keep existing fileName or use default
          if (!this.fileName) {
            this.fileName = 'document.pdf';
          }
        }
      }
      
      // Ensure PDF viewer is initialized
      setTimeout(() => {
        this.initializePdfForSearch();
        this.cdr.detectChanges();
      }, 500);
    } catch (error) {
      console.error("Error loading PDF from URL:", error);
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to load PDF: ${errorMessage}\n\nURL: ${url.substring(0, 100)}...`);
      // Re-throw to allow caller to handle
      throw error;
    }
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
    
    // Highlight matches when page is rendered
    if (this.searchText?.trim() && this.searchMatches.length > 0) {
      setTimeout(() => {
        this.highlightSearchMatches();
      }, 200);
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
          // Create a copy to avoid detached ArrayBuffer issues
          const arrayBufferCopy = arrayBuffer.slice(0);
          loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy });
        } else {
          loadingTask = pdfjsLib.getDocument(this.pdfSrc);
        }
      } else if (this.pdfSrc instanceof ArrayBuffer) {
        // Check if ArrayBuffer is detached, if so, we can't use it
        try {
          // Try to access byteLength to check if it's detached
          const length = this.pdfSrc.byteLength;
          loadingTask = pdfjsLib.getDocument({ data: this.pdfSrc });
        } catch (e) {
          console.error('ArrayBuffer is detached, cannot load PDF for search');
          throw new Error('ArrayBuffer is detached');
        }
      } else if (this.pdfSrc instanceof Uint8Array) {
        // Create a copy to avoid detached ArrayBuffer issues
        try {
          // Check if the underlying ArrayBuffer is detached
          const buffer = this.pdfSrc.buffer;
          if (buffer.byteLength === 0 && this.pdfSrc.length > 0) {
            // ArrayBuffer is detached, create a new copy from the data
            const uint8ArrayCopy = new Uint8Array(this.pdfSrc.length);
            uint8ArrayCopy.set(this.pdfSrc);
            loadingTask = pdfjsLib.getDocument({ data: uint8ArrayCopy });
          } else {
            // Safe to use, but create a copy anyway
            const uint8ArrayCopy = new Uint8Array(this.pdfSrc);
            loadingTask = pdfjsLib.getDocument({ data: uint8ArrayCopy });
          }
        } catch (e) {
          console.error('Uint8Array buffer is detached, cannot load PDF for search');
          throw new Error('Uint8Array buffer is detached');
        }
      } else if (this.pdfSrc instanceof Blob) {
        const arrayBuffer = await this.pdfSrc.arrayBuffer();
        // Create a copy to avoid detached ArrayBuffer issues
        const arrayBufferCopy = arrayBuffer.slice(0);
        loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy });
      } else if (this.pdfFiles && this.pdfFiles.length > 0) {
        console.log('Loading PDF from pdfFiles:', this.pdfFiles[0].substring(0, 50));
        const response = await fetch(this.pdfFiles[0]);
        const arrayBuffer = await response.arrayBuffer();
        // Create a copy to avoid detached ArrayBuffer issues
        const arrayBufferCopy = arrayBuffer.slice(0);
        loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy });
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

    // Ensure PDF document is loaded
    if (!this.pdfDoc) {
      console.log('PDF document not loaded, attempting to load...');
      
      if (this.pdfSrc) {
        await this.initializePdfForSearch();
      }
      
      if (!this.pdfDoc && this.pdfFiles.length > 0) {
        await this.initializePdfForSearch();
      }
      
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
    this.searchProgressTotal = this.totalPages || 0;
    this.searchProgressCurrent = 0;

    try {
      const searchLower = searchQuery.toLowerCase();
      console.log(`Searching entire PDF for: "${searchQuery}" across ${this.totalPages} pages`);
      
      let pagesWithTextLayer = 0;
      let pagesWithOcrText = 0;

      // Search through ALL pages of the PDF
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        try {
          this.searchProgressCurrent = pageNum;
          const page = await this.pdfDoc.getPage(pageNum);
          
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
          
            const pageTextParts: string[] = [];
            const itemPositions: Array<{item: any, startChar: number, endChar: number}> = [];
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
          if (fullPageText.length > 0) {
            console.log(`Page ${pageNum}: Sample text: ${fullPageText.substring(0, Math.min(100, fullPageText.length))}...`);
          }
          
          // Search for all occurrences in this page
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
      } else {
        console.warn(`⚠ No matches found for "${searchQuery}" in the entire PDF`);
        this.clearHighlights();
      }

    } catch (error) {
      console.error('Error searching PDF:', error);
    } finally {
      this.isSearching = false;
      this.searchProgressCurrent = 0;
      this.searchProgressTotal = 0;
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

  onOcrLanguageChange() {
    if (this.ocrWorker) {
      this.ocrWorker.terminate().catch(err => console.error('Error terminating OCR worker:', err));
      this.ocrWorker = null;
    }
    this.ocrCache.clear();
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

  async navigateToMatch(index: number) {
    if (index < 0 || index >= this.searchMatches.length) return;
    
    this.currentMatchIndex = index;
    const match = this.searchMatches[index];
    
    if (match && match.page) {
      // Navigate to the page containing the match
      if (match.page !== this.currentPage) {
        this.currentPage = match.page;
        // Update pdf-viewer page
        if (this.pdfViewer) {
          this.pdfViewer.page = this.currentPage;
        }
      }
      
      // Wait for page to render, then highlight
      setTimeout(() => {
        this.highlightSearchMatches();
        this.scrollToCurrentMatch();
      }, 300);
      
      this.cdr.detectChanges();
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

  private async highlightSearchMatches() {
    const searchText = this.searchText?.trim().toLowerCase();
    if (!searchText || !this.pdfDoc) {
      this.clearHighlights();
      return;
    }

    // Wait a bit for the page to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try multiple selectors to find the page container
    let pageContainer = document.querySelector(
      `.page[data-page-number="${this.currentPage}"]`
    ) as HTMLElement;

    if (!pageContainer) {
      // Try alternative selectors
      pageContainer = document.querySelector(
        `pdf-viewer .page[data-page-number="${this.currentPage}"]`
      ) as HTMLElement;
    }

    if (!pageContainer) {
      // Try finding by class and checking data attribute
      const allPages = document.querySelectorAll('.page');
      for (let i = 0; i < allPages.length; i++) {
        const page = allPages[i] as HTMLElement;
        const pageNum = page.getAttribute('data-page-number');
        if (pageNum && parseInt(pageNum) === this.currentPage) {
          pageContainer = page;
          break;
        }
      }
    }

    if (!pageContainer) {
      // Retry after a short delay
      setTimeout(() => this.highlightSearchMatches(), 200);
      return;
    }

    pageContainer.style.position = "relative";

    // Remove old overlay
    const oldOverlay = pageContainer.querySelector(".pdf-highlight-overlay");
    if (oldOverlay) oldOverlay.remove();

    // Get all matches for current page
    const pageMatches = this.searchMatches.filter(m => m.page === this.currentPage);
    
    if (pageMatches.length === 0) {
      return;
    }

    try {
      const page = await this.pdfDoc.getPage(this.currentPage);
      const viewport = page.getViewport({ scale: 1 });
      
      // Get rendered dimensions
      const pdfCanvas = pageContainer.querySelector("canvas");
      let renderedWidth = pageContainer.offsetWidth || viewport.width;
      let renderedHeight = pageContainer.offsetHeight || viewport.height;
      
      if (pdfCanvas) {
        renderedWidth = pdfCanvas.width || renderedWidth;
        renderedHeight = pdfCanvas.height || renderedHeight;
      }

      // Check if this is an OCR page (has OCR matches)
      const ocrMatches = pageMatches.filter(m => m.isOcr);
      
      if (ocrMatches.length > 0) {
        // Handle OCR matches
        const ocrWords = await this.runOcrOnPage(page, this.currentPage);
        
        if (ocrWords && ocrWords.length > 0) {
          const ocrCanvasWidth = ocrWords[0].canvasWidth || viewport.width;
          const ocrCanvasHeight = ocrWords[0].canvasHeight || viewport.height;
          const scaleX = renderedWidth / ocrCanvasWidth;
          const scaleY = renderedHeight / ocrCanvasHeight;

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

          // Highlight OCR matches
          ocrMatches.forEach((match) => {
            // Find matching OCR word
            const ocrWord = ocrWords.find(w => 
              Math.abs(w.x - (match.x / scaleX)) < 5 &&
              Math.abs(w.y - (match.y / scaleY)) < 5
            );

            if (ocrWord) {
              const rect = document.createElement("div");
              const isCurrentMatch = this.searchMatches.indexOf(match) === this.currentMatchIndex;
              
              Object.assign(rect.style, {
                position: "absolute",
                top: `${ocrWord.y * scaleY}px`,
                left: `${ocrWord.x * scaleX}px`,
                width: `${ocrWord.width * scaleX}px`,
                height: `${ocrWord.height * scaleY}px`,
                backgroundColor: isCurrentMatch ? "orange" : "yellow",
                opacity: isCurrentMatch ? "0.6" : "0.45",
                borderRadius: "3px",
                pointerEvents: "none",
                border: isCurrentMatch ? "2px solid red" : "none",
              });

              overlay.appendChild(rect);
              match.element = rect;
            } else if (match.x && match.y && match.width && match.height) {
              // Use match coordinates directly if available
              const rect = document.createElement("div");
              const isCurrentMatch = this.searchMatches.indexOf(match) === this.currentMatchIndex;
              
              Object.assign(rect.style, {
                position: "absolute",
                top: `${match.y}px`,
                left: `${match.x}px`,
                width: `${match.width}px`,
                height: `${match.height}px`,
                backgroundColor: isCurrentMatch ? "orange" : "yellow",
                opacity: isCurrentMatch ? "0.6" : "0.45",
                borderRadius: "3px",
                pointerEvents: "none",
                border: isCurrentMatch ? "2px solid red" : "none",
              });

              overlay.appendChild(rect);
              match.element = rect;
            }
          });
        }
      } else {
        // Handle text layer matches
        const textMatches = pageMatches.filter(m => !m.isOcr);
        
        if (textMatches.length > 0) {
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

          // Get text content to calculate positions
          try {
            const textContent = await page.getTextContent();
            const textItems = textContent.items || [];
            
            // Calculate scale factors
            const scaleX = renderedWidth / viewport.width;
            const scaleY = renderedHeight / viewport.height;

            textMatches.forEach((match) => {
              if (match.x !== undefined && match.y !== undefined) {
                const rect = document.createElement("div");
                const isCurrentMatch = this.searchMatches.indexOf(match) === this.currentMatchIndex;
                
                Object.assign(rect.style, {
                  position: "absolute",
                  top: `${(match.y || 0) * scaleY}px`,
                  left: `${(match.x || 0) * scaleX}px`,
                  width: `${(match.width || 100) * scaleX}px`,
                  height: `${(match.height || 20) * scaleY}px`,
                  backgroundColor: isCurrentMatch ? "orange" : "yellow",
                  opacity: isCurrentMatch ? "0.6" : "0.45",
                  borderRadius: "3px",
                  pointerEvents: "none",
                  border: isCurrentMatch ? "2px solid red" : "none",
                });

                overlay.appendChild(rect);
                match.element = rect;
              }
            });
          } catch (error) {
            console.error('Error highlighting text layer matches:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error highlighting search matches:', error);
    }
  }

  scrollToCurrentMatch() {
    const match = this.searchMatches[this.currentMatchIndex];
    if (!match) return;

    // Try to scroll to the match element if it exists
    if (match.element) {
      try {
        match.element.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        return;
      } catch (e) {
        console.warn('Error scrolling to match element:', e);
      }
    }

    // Fallback: scroll to the page container
    const pageContainer = document.querySelector(
      `.page[data-page-number="${match.page}"]`
    ) as HTMLElement;
    
    if (pageContainer) {
      pageContainer.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
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
          
          const badges = el.querySelectorAll('.ocr-badge');
          badges.forEach(badge => badge.remove());
        }
      });
    });
  }

  previousPage() {
    if (!this.pageLoaded || this.currentPage <= 1) {
      return;
    }
    
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
    }
    
    this.isManualNavigation = true;
    this.currentPage = this.currentPage - 1;
    
    // Update pdf-viewer page
    if (this.pdfViewer) {
      this.pdfViewer.page = this.currentPage;
    }
    
    // Highlight matches on new page
    if (this.searchText?.trim() && this.searchMatches.length > 0) {
      setTimeout(() => {
        this.highlightSearchMatches();
      }, 300);
    }
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.isManualNavigation = false;
    }, 500);
  }

  nextPage() {
    if (!this.pageLoaded || this.currentPage >= this.totalPages) {
      return;
    }
    
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
    }
    
    this.isManualNavigation = true;
    this.currentPage = this.currentPage + 1;
    
    // Update pdf-viewer page
    if (this.pdfViewer) {
      this.pdfViewer.page = this.currentPage;
    }
    
    // Highlight matches on new page
    if (this.searchText?.trim() && this.searchMatches.length > 0) {
      setTimeout(() => {
        this.highlightSearchMatches();
      }, 300);
    }
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.isManualNavigation = false;
    }, 500);
  }

  onNoClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else if (this.router) {
      // Navigate back to folder-tree if used as route component
      this.router.navigate(['/folder-tree']);
    }
  }

  goBack() {
    if (this.router) {
      this.router.navigate(['/folder-tree']);
    }
  }

  trackByFn(index: number, item: any): any {
    return index;
  }

  getFileExtension(filename: string): string {
    return filename?.split(".").pop()?.toLowerCase() || "";
  }
}

