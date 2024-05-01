import {Component, signal, WritableSignal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ConversationService} from "../conversation.service";
import {StatemanagerService} from "../statemanager.service";
import {Conversation} from "../Conversation";
import {DatePipe} from "@angular/common";
import {NgEventBus} from "ng-event-bus";


@Component({
  selector: 'dashboard-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {


  isJiraChecked: boolean = false;
  isDocumentInfoChecked: boolean = false;
  isAcademyChecked: boolean = false;
  isMyDocumentsChecked: boolean = true;

  readonly conversations: WritableSignal<Conversation[]> = signal([])
  readonly documents: WritableSignal<string[][]> = signal([])

  private perimeter = "1"

  constructor(private router: Router, private route: ActivatedRoute, protected httpClient: HttpClient,
              private conversationService: ConversationService,
              private stateManagerService: StatemanagerService,
              private eventBus: NgEventBus,
              private datePipe: DatePipe) {


    this.route.params.subscribe(params => {
      this.reload();
    });

    eventBus.on("reload_data").subscribe(value => {
      this.reload();
    })

  }

  reloadConversations() {
    this.conversationService.loadConversations().subscribe({

      next: (result) => {
        this.conversations.update((value) => result);
        this.selectCurrentConversation();
      }, error: (error) => {
        console.error('Delete failed:', error);
      },
      complete: () => {
      }
    });
  }

  selectCurrentConversation() {

    let current_conversation = ""


    let current_date = this.datePipe.transform(new Date(), 'dd.MM.yyyy');
    this.conversations().forEach((loc_conversation) => {

      if ((loc_conversation.pdf_id == null || loc_conversation.pdf_id == "-1") && loc_conversation.created_on == current_date) {
        if (current_conversation.length == 0 || current_conversation < loc_conversation.id) {
          current_conversation = loc_conversation.id;
        }
      }
    });

    if (current_conversation.length == 0) {
      this.conversationService.createConversation().subscribe(value => {
        this.setConversation(value.id);
      })
    } else {
      this.setConversation(current_conversation);
    }
  }

  getDocumentsBaseUrl() {
    return "https://assistmeai.nblotti.org/files/";
  }

  onDisplayPDF($event: MouseEvent, documentId: string) {
    let page_number = 0
    this.stateManagerService.loadDocument(documentId)

    $event.preventDefault()
  }

  /*********************************************************************************************
   /*Gestion des documents
   /*
   */

  deleteDocument(blobId: string) {
    let url = this.getDocumentsBaseUrl() + blobId + "/"
    return this.httpClient.delete<any>(url).subscribe({
      next: (result) => {
        console.log('Delete successful:', result);
      }, error: (error) => {
        console.error('Delete failed:', error);
      }, complete: () => {
        this.loadDocuments();
        this.reloadConversations();
      }
    });

  }

  /*********************************************************************************************
   /*Gestion des conversations
   /*
   */
  deleteConversation(id: string) {
    this.conversationService.deleteConversation(id).subscribe(value => {
      this.reloadConversations();
    })
  }

  isCurrentConversation(id: string) {
    return this.conversationService.getCurrentConversation() == id;
  }

  setConversation(conversation_id: string) {
    this.conversationService.setCurrentConversation(conversation_id);
  }

  setDocumentConversation(conversation_id: string, pdf_id: string) {
    this.stateManagerService.loadConversationAndDocument(conversation_id, pdf_id);
  }

  /*********************************************************************************************
   /*Changement du périmètre
   /*
   */


  handleJiraChange($event: Event) {
    this.getUserString();
  }

  handleDocumentInfoChange($event: Event) {
    this.getUserString();
  }

  handleAcademyChange($event: Event) {
    this.getUserString();
  }

  handleMyDocumentsChange($event: Event) {
    this.getUserString();
  }

  addConversation() {
    this.conversationService.createConversation().subscribe(value => {
      this.reloadConversations();
    })
  }

  private reload() {
    this.loadDocuments();
    this.reloadConversations();
  }

  private loadDocuments() {
    this.fetchDocuments().subscribe(value =>
      this.documents.set(value));
  }

  private fetchDocuments(): Observable<string[][]> {
    let url = this.getDocumentsBaseUrl()
    return this.httpClient.get<any>(url).pipe(map(response => JSON.parse(response)));
  }

  private getUserString() {
    let documentPerimeter = this.isJiraChecked ? " J" : "";
    documentPerimeter += this.isDocumentInfoChecked ? " D" : "";
    documentPerimeter += this.isAcademyChecked ? " A" : "";
    this.conversationService.setDocumentPerimeter(this.isMyDocumentsChecked, documentPerimeter)
  }
}
