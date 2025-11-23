import { Component, Inject, ViewEncapsulation, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
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
import { SearchDocService } from "../searchDoc.service";
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from "@angular/platform-browser";
import { SharedService } from "app/shared/shared.service";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local worker file from assets to match installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `/assets/pdf.worker.min.mjs`;

@Component({
  selector: "app-uploaded-files",
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
    NgFor,
    NgIf
  ],
  templateUrl: "./uploaded-files.component.html",
  styleUrl: "./uploaded-files.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class UploadedFilesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pdfCanvas', { static: false }) pdfCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfContainer', { static: false }) pdfContainer: ElementRef<HTMLDivElement>;
  fileInfo: string[] = [];
  imageFiles: string[] = [];
  pdfFiles: string[] = [];
  audioFiles: string[] = [];
  videoFiles: string[] = [];
  caseMetaData: any;
  htmlPreviewContent: SafeHtml | null = null;
  fileType: string = "";
  base64pdf: SafeResourceUrl | null = null;
  pdfTitle: string = "PDF Preview";
  wordFiles: string[] = [];
  excelFiles: string[] = [];
  excelViewerUrl: SafeResourceUrl;
  wordHtml: string;
  wordViewerUrl: SafeResourceUrl;

  // PDF.js related properties
  pdfDoc: any = null;
  currentPage: number = 1;
  totalPages: number = 0;
  pageRendering: boolean = false;
  pageNumPending: number = null;
  scale: number = 1.5;
  searchText: string = '';
  searchMatches: any[] = [];
  currentMatchIndex: number = -1;
  isSearching: boolean = false;
  pdfData: string = '';
  constructor(
    private sanitizer: DomSanitizer,
    private dataService: SharedService,
    private _searchDocService: SearchDocService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UploadedFilesComponent>
  ) {
    console.log("dadsfvta", data);
    this.getCasedataSelected();
    this.getUploadMetaDataFiles();
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    // View initialization - PDF rendering will happen after data is loaded
  }

  onNoClose(): void {
    this.dialogRef.close({ data: false });
  }

  getCasedataSelected() {
    this.dataService.getCaseData().subscribe((caseData) => {
      this.caseMetaData = caseData;
      console.log("this.caseMetaData", this.caseMetaData);
    });
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
  getUploadMetaDataFiles(): void {
    const payload = {
      fileHash: this.data?.file?.fileHash || this.data?.fileHash,
      requested_to: 0,
      comments: "",
      division_id: sessionStorage.getItem("divisionID"),
      case_id:
        this.data?.case_details_id ||
        this.caseMetaData?.CaseInfoDetailsId ||
        this.data?.caseInfoDetailsId,
    };

    this._searchDocService.filePreviewData(payload).subscribe({
      next: (res: any) => {
        if (res) {
          const fileType = res.mime_type || res.type;
          const fileUrl = `data:${fileType};base64,${res.base64_content}`;
          const safeUrl: SafeResourceUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
          if (fileType.startsWith("image/")) {
            this.imageFiles.push(fileUrl);
          } else if (fileType === "application/pdf") {
            this.base64pdf = safeUrl;
            this.pdfFiles.push(fileUrl);
            this.pdfData = res.base64_content;
            // Load PDF using PDF.js
            this.loadPdfFromBase64(res.base64_content);
          } else if (fileType.startsWith("audio/")) {
            this.audioFiles.push(fileUrl);
          } else if (fileType.startsWith("video/")) {
            this.videoFiles.push(fileUrl);
          }  else {
            console.warn("Unsupported file type:", fileType);
          }
        } else {
          console.error("No file data received");
        }
      },
      error: (error) => {
        console.error("Error fetching file preview:", error);
      },
    });
  }

  async loadPdfFromBase64(base64: string): Promise<void> {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      this.currentPage = 1;
      
      // Render first page
      setTimeout(() => {
        this.renderPage(this.currentPage);
      }, 100);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  }

  async renderPage(num: number): Promise<void> {
    this.pageRendering = true;
    
    try {
      const page = await this.pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: this.scale });
      const canvas = this.pdfCanvas?.nativeElement;
      
      if (!canvas) {
        this.pageRendering = false;
        return;
      }
      
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      
      // Draw search highlights on the current page
      if (this.searchText && this.searchMatches.length > 0) {
        await this.drawSearchHighlights(page, viewport, context);
      }
      
      this.pageRendering = false;

      if (this.pageNumPending !== null) {
        this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      this.pageRendering = false;
    }
  }

  async drawSearchHighlights(page: any, viewport: any, context: CanvasRenderingContext2D): Promise<void> {
    const pageMatches = this.searchMatches.filter(m => m.page === this.currentPage);
    if (pageMatches.length === 0) return;

    try {
      const textContent = await page.getTextContent();
      const searchText = this.searchText.toLowerCase();
      
      context.save();
      context.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Yellow highlight with transparency
      context.strokeStyle = 'rgba(255, 200, 0, 0.5)';
      context.lineWidth = 1;

      textContent.items.forEach((item: any) => {
        if (item.str && item.str.toLowerCase().includes(searchText)) {
          const tx = item.transform;
          const x = tx[4];
          const y = viewport.height - tx[5]; // Convert to canvas coordinates
          const width = item.width || 100;
          const height = item.height || (viewport.height / 20);

          // Draw highlight rectangle
          context.fillRect(x, y - height, width, height);
          context.strokeRect(x, y - height, width, height);
        }
      });

      // Highlight current match with a different color
      if (this.currentMatchIndex >= 0 && this.currentMatchIndex < this.searchMatches.length) {
        const currentMatch = this.searchMatches[this.currentMatchIndex];
        if (currentMatch.page === this.currentPage) {
          context.fillStyle = 'rgba(255, 165, 0, 0.5)'; // Orange for current match
          context.strokeStyle = 'rgba(255, 140, 0, 0.8)';
          context.lineWidth = 2;
          context.fillRect(currentMatch.x, currentMatch.y - currentMatch.height, currentMatch.width, currentMatch.height);
          context.strokeRect(currentMatch.x, currentMatch.y - currentMatch.height, currentMatch.width, currentMatch.height);
        }
      }

      context.restore();
    } catch (error) {
      console.error("Error drawing highlights:", error);
    }
  }

  queueRenderPage(num: number): void {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  previousPage(): void {
    if (this.currentPage <= 1) {
      return;
    }
    this.currentPage--;
    this.queueRenderPage(this.currentPage);
    this.currentMatchIndex = -1;
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) {
      return;
    }
    this.currentPage++;
    this.queueRenderPage(this.currentPage);
    this.currentMatchIndex = -1;
  }

  async searchInPdf(): Promise<void> {
    if (!this.searchText.trim() || !this.pdfDoc) {
      this.searchMatches = [];
      this.currentMatchIndex = -1;
      // Re-render current page to clear highlights
      if (this.currentPage > 0) {
        await this.renderPage(this.currentPage);
      }
      return;
    }

    this.isSearching = true;
    this.searchMatches = [];
    this.currentMatchIndex = -1;

    try {
      const searchText = this.searchText.toLowerCase();
      
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        const page = await this.pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: this.scale });
        
        textContent.items.forEach((item: any, itemIndex: number) => {
          if (item.str && item.str.toLowerCase().includes(searchText)) {
            // Get text item position
            const tx = item.transform;
            const x = tx[4];
            const y = tx[5];
            const width = item.width || 0;
            const height = item.height || (viewport.height / 20);
            
            this.searchMatches.push({
              page: pageNum,
              text: item.str,
              itemIndex: itemIndex,
              x: x,
              y: viewport.height - y, // Convert to canvas coordinates
              width: width,
              height: height
            });
          }
        });
      }

      if (this.searchMatches.length > 0) {
        // Navigate to first match
        const firstMatch = this.searchMatches[0];
        if (firstMatch.page !== this.currentPage) {
          this.currentPage = firstMatch.page;
          await this.renderPage(this.currentPage);
        } else {
          // Re-render to show highlights
          await this.renderPage(this.currentPage);
        }
        this.currentMatchIndex = 0;
        this.highlightSearchResults();
      } else {
        // Re-render to clear any previous highlights
        await this.renderPage(this.currentPage);
      }
    } catch (error) {
      console.error("Error searching PDF:", error);
    } finally {
      this.isSearching = false;
    }
  }

  highlightSearchResults(): void {
    // Re-render page to update highlights
    if (this.currentMatchIndex >= 0 && this.currentMatchIndex < this.searchMatches.length) {
      const match = this.searchMatches[this.currentMatchIndex];
      if (match.page === this.currentPage) {
        // Re-render to show updated highlight
        this.renderPage(this.currentPage);
        // Scroll to canvas if needed
        setTimeout(() => {
          const canvas = this.pdfCanvas?.nativeElement;
          if (canvas) {
            canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }

  async nextMatch(): Promise<void> {
    if (this.searchMatches.length === 0) {
      return;
    }
    
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.searchMatches.length;
    const match = this.searchMatches[this.currentMatchIndex];
    
    if (match.page !== this.currentPage) {
      this.currentPage = match.page;
      await this.renderPage(this.currentPage);
    } else {
      await this.renderPage(this.currentPage);
    }
    
    // Scroll to highlight
    setTimeout(() => {
      const canvas = this.pdfCanvas?.nativeElement;
      if (canvas) {
        canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  async previousMatch(): Promise<void> {
    if (this.searchMatches.length === 0) {
      return;
    }
    
    this.currentMatchIndex = this.currentMatchIndex <= 0 
      ? this.searchMatches.length - 1 
      : this.currentMatchIndex - 1;
    const match = this.searchMatches[this.currentMatchIndex];
    
    if (match.page !== this.currentPage) {
      this.currentPage = match.page;
      await this.renderPage(this.currentPage);
    } else {
      await this.renderPage(this.currentPage);
    }
    
    // Scroll to highlight
    setTimeout(() => {
      const canvas = this.pdfCanvas?.nativeElement;
      if (canvas) {
        canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchInPdf();
    }
  }

  isImage(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("image/");
  }

  isPdf(fileUrl: string): boolean {
    return fileUrl && fileUrl.startsWith("blob:") && fileUrl.includes("pdf");
  }

  ngOnDestroy() {
    this.fileInfo.forEach((fileUrl) => {
      URL.revokeObjectURL(fileUrl);
    });
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
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
}
