import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DocumentService} from "../document.service";
import {HttpEventType} from "@angular/common/http";
import {Router} from "@angular/router";
import {NgEventBus} from "ng-event-bus";

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  standalone: true,
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent {
  @Input() showModal: boolean = false;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  uploadProgress: number = 0;

  constructor(private fileUploadService: DocumentService,
              private router: Router,
              private eventBus: NgEventBus) {
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    // You can do something with the selected file here, like store it in a variable
    // For now, let's upload the file immediately
    this.uploadFile(file);
  }

  uploadFile(file: File) {
    this.fileUploadService.uploadFile(file, "1")
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
