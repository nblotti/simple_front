import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {HttpEventType} from "@angular/common/http";
import {Router} from "@angular/router";
import {NgEventBus} from "ng-event-bus";
import {UserContextService} from "../auth/user-context.service";
import {FormsModule} from "@angular/forms";
import {throwError} from "rxjs";
import {NgIf} from "@angular/common";
import {catchError} from "rxjs/operators";
import {DocumentService} from "../document.service";

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent {
  @Input() showModal: boolean = false;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('fileInput', {static: false}) fileInput!: ElementRef<HTMLInputElement>;
  isDisabled: boolean = true; // or false depending on your logic
  selectedCategory = computed(() => {
      return this.userContextService.userAdminCategories()[0];
    }
  )

  protected uploadProgress: number = 0;
  protected isFileSelected: WritableSignal<boolean> = signal(false);
  protected urlToScrap: WritableSignal<string> = signal("");
  protected active_tab: TABS = TABS.DOCUMENTS;

  constructor(private fileUploadService: DocumentService,
              private documentService: DocumentService,
              private router: Router,
              private eventBus: NgEventBus,
              protected userContextService: UserContextService,
              private renderer: Renderer2) {

  }


  resetFileInput(): void {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.value = '';
    this.isFileSelected.set(false)
    this.urlToScrap.set("")
    this.uploadProgress = 0;
    this.active_tab = TABS.DOCUMENTS;

  }

  uploadFile(file: File, documentType: DocumentType, focus_only: string = "false") {

    let user = this.userContextService.getUserID()();
    if (!this.isDisabled)
      user = this.selectedCategory().id
    this.fileUploadService.uploadFile(file, documentType, user, focus_only)
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total != undefined)
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.resetFileInput();
          this.closeModal.emit();
          this.eventBus.cast("reload_data");

        }
      });

  }

  onUpload() {

    if (this.active_tab == TABS.DOCUMENTS) {
      if (this.fileInput && this.fileInput.nativeElement.files) {

        const file = this.fileInput.nativeElement.files[0];
        const fileType = file.type as FileType;


        if (fileType === FileType.PDF
          || fileType === FileType.DOCX
          || fileType === FileType.XLSX
          || fileType === FileType.PPTX
          || fileType === FileType.HTML
          || fileType === FileType.JPEG
          || fileType === FileType.PNG
          || fileType === FileType.BMP
          || fileType === FileType.TIFF
          || fileType === FileType.HEIF) {
          // Call the uploadFile method with the file and its type
          this.uploadFile(file, DocumentType.DOCUMENT, "true");
          // Reset the file input
        } else {
          // Show alert and reset the file input
          alert('Please select a valid file type (PDF, DOCX, XLSX, PPTX, HTML, JPEG/JPG, PNG, BMP, TIFF, HEIF).');
          this.resetFileInput();
        }

      }
    } else if (this.active_tab == TABS.URL) {
      let user = this.userContextService.getUserID()();
      if (!this.isDisabled)
        user = this.selectedCategory().id.toString()

      this.documentService.requestScrap(user, this.urlToScrap()).subscribe({
        next: () => {
          this.resetFileInput();
          this.closeModal.emit();
          this.eventBus.cast("reload_data");
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  onCancel() {
    this.resetFileInput();
    setTimeout(() => this.closeModal.emit(), 1000);
  }

  onFileSelected($event: any) {

    if (this.fileInput && this.fileInput.nativeElement.files) {
      this.isFileSelected.set(this.fileInput.nativeElement.files.length > 0);
    } else {
      this.isFileSelected.set(false);
    }

  }


  onTabActivated(tabId: string): void {
    console.log(`Tab activated: ${tabId}`);
    this.resetFileInput();
    if (tabId === TABS.DOCUMENTS) {
      this.active_tab = TABS.DOCUMENTS;
    } else if (tabId === TABS.URL) {
      this.active_tab = TABS.URL;
    }
  }


  isValidUrl() {
    const control: HTMLInputElement = document.createElement("input");
    control.type = "url";
    control.value = this.urlToScrap();
    return control.checkValidity();
  }


  perimeterChanged($event: any) {
    this.isDisabled = !this.isDisabled;
  }

  isAdmin() {
    return this.userContextService.userAdminCategories().length != 0;
  }


}

enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  HTML = 'text/html',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  BMP = 'image/bmp',
  TIFF = 'image/tiff',
  HEIF = 'image/heif'
}

export enum DocumentType {
  SUMMARY = "SUMMARY",
  DOCUMENT = "DOCUMENT",
  TEMPLATE = "TEMPLATE",
  ALL = "ALL"
}


export enum TABS {
  DOCUMENTS = 'documents',
  URL = 'url'
}

