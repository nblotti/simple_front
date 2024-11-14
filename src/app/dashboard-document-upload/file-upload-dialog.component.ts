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
import {DocumentService} from "../document.service";
import {HttpEventType} from "@angular/common/http";
import {Router} from "@angular/router";
import {NgEventBus} from "ng-event-bus";
import {UserContextService} from "../auth/user-context.service";
import {FormsModule} from "@angular/forms";
import {catchError, throwError} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    AsyncPipe
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
  protected summaryChecked: WritableSignal<boolean> = signal(false);
  protected templateChecked: WritableSignal<boolean> = signal(false);
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
    this.summaryChecked.set(false);
    this.isFileSelected.set(false)
    this.urlToScrap.set("")
    this.uploadProgress = 0;
    this.active_tab = TABS.DOCUMENTS;

  }

  uploadFile(file: File, documentType: DocumentType) {

    let user = this.userContextService.getUserID()();
    if (!this.isDisabled)
      user = this.selectedCategory().id
    this.fileUploadService.uploadFile(file, documentType, user)
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total != undefined)
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          if (this.summaryChecked()) {
            this.documentService.requestSummary(user, event.body.id)
              .pipe(
                catchError(error => {
                  this.resetFileInput();
                  console.error('An error occurred:', error);
                  return throwError(error);
                })
              )
              .subscribe({
                next: (response) => {
                  this.resetFileInput();
                  this.closeModal.emit();
                  // Reset upload progress after successful upload
                  this.uploadProgress = 0;
                  this.eventBus.cast("reload_data");

                },
                error: (error) => {
                  this.resetFileInput();
                  console.error('An error occurred while creating the job:', error);
                  return throwError(error);
                }
              });

          } else {
            this.resetFileInput();
            this.closeModal.emit();
            this.eventBus.cast("reload_data");
          }
        }
      });

  }

  onUpload() {

    if (this.active_tab == TABS.DOCUMENTS) {
      if (this.fileInput && this.fileInput.nativeElement.files) {

        const file = this.fileInput.nativeElement.files[0];
        const fileType = file.type as FileType;


        if (fileType === FileType.PDF || fileType === FileType.DOCX
          || fileType === FileType.XLSX || fileType === FileType.PPTX) {
          // Call the uploadFile method with the file and its type
          this.uploadFile(file, this.templateChecked() ? DocumentType.TEMPLATE : DocumentType.DOCUMENT);
          // Reset the file input
        } else {
          // Show alert and reset the file input
          alert('Please select a PDF or DOCX file.');
          this.resetFileInput();
        }

      }
    } else if (this.active_tab == TABS.URL) {
      let user = this.userContextService.getUserID()();
      if (this.isDisabled)
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
    this.closeModal.emit();
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


  templateChanged() {
    if (this.templateChecked()) {
      this.summaryChecked.set(false);
    }
  }
}

export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
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

