import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {StateManagerService} from "../state-manager.service";
import {HttpClient, HttpEventType} from "@angular/common/http";
import {UserContextService} from "../auth/user-context.service";
import {DocumentService, DocumentStatus, DocumentType} from "../document.service";
import {CapitalizePipe} from "../capitalize.pipe";
import {Document} from "../Document";
import {map, Observable} from "rxjs";
import {ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {NavigationStateService} from "../dashboard-document-screen/navigation-state.service";
import {NgEventBus} from "ng-event-bus";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CapitalizePipe,
    ReactiveFormsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  readonly documents: WritableSignal<Document[]> = signal([]);
  protected selectedFiles: WritableSignal<{
    data: File;
    uploadProgress: number,
    name: String,
    isIndexing: boolean
  }[]> = signal([]);
  protected readonly DocumentStatus = DocumentStatus;
  protected readonly document = document;
  protected category = this.userContextService.userAdminCategories()[0].id;
  protected active_tab: TABS = TABS.MANAGE;

  constructor(private stateManagerService: StateManagerService, private httpClient: HttpClient,
              private eventBus: NgEventBus, private router: Router, private navStateService: NavigationStateService, private documentService: DocumentService,
              protected userContextService: UserContextService, private fileUploadService: DocumentService) {
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      this.selectedFiles.set(Array.from(input.files).map(file => ({
        data: file,
        uploadProgress: 0,
        isIndexing: false,
        name: file.name
      })));
    }
  }

  onUpload(): void {

    this.selectedFiles().forEach(file => {

      this.fileUploadService.uploadFile(file.data, DocumentType.DOCUMENT, this.category).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total;
          if (total) {
            file.uploadProgress = Math.round(100 * event.loaded / total);
            if (file.uploadProgress == 100) {
              file.isIndexing = true;
            }
          }
        } else if (event.type === HttpEventType.Response) {
          console.log('Upload complete:', file.data.name);
          file.isIndexing = false;
        }
      });
    });
  }


  ngOnInit(): void {

    this.eventBus.on("reload_data").subscribe(value => {
      this.reload();
    });

    this.stateManagerService.chatEnabled.set(false);
    this.loadDocuments();
  }

  onDisplayPDF($event: MouseEvent, documentId: string, documentName: string = "", page: number = -1, content: string = "") {
    const state = {
      documentId: documentId,
      documentName: documentName
    }
    //};
    this.navStateService.setState(state);
    this.router.navigate(['/docs']);
    //this.stateManagerService.loadDocument(Number(documentId), page, content,this.userContextService.getUserID()());
    $event.preventDefault();
  }


  /*********************************************************************************************
   /*Gestion des documents
   /* */
  deleteDocument(blobId: string) {
    return this.documentService.deleteDocument(Number(blobId)).subscribe({
      next: (result) => {
        console.log('Delete successful:', result);
      },
      error: (error) => {
        console.error('Delete failed:', error);
      },
      complete: () => {
        this.reload();
      }
    });
  }

  onCategoryChange($event: any) {
    this.category = $event.target.value
    this.reload();
  }

  trackByCategory(index: number, item: any): number {
    return item.id;
  }

  onTabActivated(tabId: string): void {

    if (tabId === TABS.MANAGE) {
      this.active_tab = TABS.MANAGE;
      this.reload()
    } else if (tabId === TABS.UPLOAD) {
      this.resetFileInput();
      this.active_tab = TABS.UPLOAD;
    }
  }

  protected resetFileInput() {
    this.selectedFiles.set([])
  }

  private fetchDocuments(): Observable<Document[]> {
    return this.documentService.fetchDocuments("" + this.category, DocumentType.DOCUMENT).pipe(map(response => {
      if (response.length == 0)
        return []
      return response
    }));
  }

  private loadDocuments() {
    this.fetchDocuments().subscribe(value =>
      this.documents.set(value));
  }

  private reload() {
    this.loadDocuments();
  }
}


export enum TABS {
  MANAGE = 'manage',
  UPLOAD = 'upload'
}
