import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {StateManagerService} from "../state-manager.service";
import {HttpClient} from "@angular/common/http";
import {UserContextService} from "../auth/user-context.service";
import {DocumentService, DocumentStatus, DocumentType} from "../document.service";
import {CapitalizePipe} from "../capitalize.pipe";
import {Document} from "../dashboard-main-screen/Document";
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
  protected readonly DocumentStatus = DocumentStatus;
  protected readonly document = document;

  protected category = this.userContextService.userAdminCategories()[0].id;

  constructor(private stateManagerService: StateManagerService, private httpClient: HttpClient,
              private eventBus: NgEventBus, private router: Router, private navStateService: NavigationStateService, private documentService: DocumentService,
              protected userContextService: UserContextService,) {
  }


  ngOnInit(): void {

    this.eventBus.on("reload_data").subscribe(value => {
      this.reload();
    });

    this.stateManagerService.chatEnabled.set(false);
    this.loadDocuments();
  }

  onDisplayPDF($event: MouseEvent, documentId: string, page: number = -1, content: string = "") {
    // let page_number = 0;
    // this.stateManagerService.loadDocument(Number(documentId), page, content);
    //this.stateManagerService.loadDocument(Number(documentId), page, content);
    const state = {
      documentId: documentId
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
