import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {DocumentService} from "../document.service";
import {HttpEventType} from "@angular/common/http";
import {Router} from "@angular/router";
import {NgEventBus} from "ng-event-bus";
import {UserContextService} from "../auth/user-context.service";

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  standalone: true,
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent {
  @Input() showModal: boolean = false;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  uploadProgress: number = 0;

  constructor(private fileUploadService: DocumentService,
              private router: Router,
              private eventBus: NgEventBus,
              private userContextService: UserContextService) {
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input && input.files) {
      const file = input.files[0];

      if (file) {
        if (file.type !== 'application/pdf') {
          alert('Please select a PDF file.');
          this.resetFileInput();
          return;
        }

        // Proceed with your file handling (e.g., uploading the file)
        console.log('Selected file:', file);

        // Reset the file input
        this.uploadFile(file);
        this.resetFileInput();
      }
    }
  }


  resetFileInput(): void {
    this.fileInput.nativeElement.value = '';
  }


  uploadFile(file: File) {
    this.fileUploadService.uploadFile(file, this.userContextService.getUserID()())
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total != undefined)
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          console.log('File uploaded successfully:', event.body);
          this.closeModal.emit();
          // Reset upload progress after successful upload
          this.uploadProgress = 0;
          this.eventBus.cast("reload_data");
        }
      });

  }

  onUpload() {
    // Handle file upload logic here
    // You can access the selected file or its data here and upload it to the server
    // Once uploaded, emit the closeModal event to notify the parent to close the modal
    this.closeModal.emit();
  }

  onCancel() {
    // If user cancels, emit the closeModal event to notify the parent to close the modal
    this.closeModal.emit();
  }
}
