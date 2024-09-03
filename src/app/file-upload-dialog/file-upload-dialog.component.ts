import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {DocumentService} from "../document.service";
import {HttpEventType} from "@angular/common/http";
import {Router} from "@angular/router";
import {NgEventBus} from "ng-event-bus";
import {UserContextService} from "../auth/user-context.service";
import {FormsModule} from "@angular/forms";
import {catchError, throwError} from "rxjs";

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent {
  @Input() showModal: boolean = false;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('fileInput', {static: false}) fileInput!: ElementRef<HTMLInputElement>;

  protected uploadProgress: number = 0;
  protected summaryChecked: boolean = false

  constructor(private fileUploadService: DocumentService,
              private documentService: DocumentService,
              private router: Router,
              private eventBus: NgEventBus,
              private userContextService: UserContextService) {
  }


  resetFileInput(): void {
    this.fileInput.nativeElement.value = '';
  }


  uploadFile(file: File, fileType: FileType) {
    let user = this.userContextService.getUserID()();
    this.fileUploadService.uploadFile(file, fileType, user)
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total != undefined)
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          console.log('File uploaded successfully:', event.body);
          this.documentService.requestSummary(user, event.body.id)
            .pipe(
              catchError(error => {
                console.error('An error occurred:', error);
                return throwError(error);
              })
            )
            .subscribe({
              next: (response) => {
                console.log('Job created successfully', response);
                this.closeModal.emit();
                // Reset upload progress after successful upload
                this.uploadProgress = 0;
                this.eventBus.cast("reload_data");

              },
              error: (error) => {
                console.error('An error occurred while creating the job:', error);
                return throwError(error);
              }
            });


        }
      });

  }

  onUpload() {

    if (this.fileInput && this.fileInput.nativeElement.files) {

      const file = this.fileInput.nativeElement.files[0];
      const fileType = file.type as FileType;


      if (fileType === FileType.PDF || fileType === FileType.DOCX) {
        // Call the uploadFile method with the file and its type
        this.uploadFile(file, fileType);
        // Reset the file input
        this.resetFileInput();
      } else {
        // Show alert and reset the file input
        alert('Please select a PDF or DOCX file.');
        this.resetFileInput();
      }


      this.closeModal.emit();
    }
  }

  onCancel() {
    // If user cancels, emit the closeModal event to notify the parent to close the modal
    this.closeModal.emit();
  }
}

export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}
