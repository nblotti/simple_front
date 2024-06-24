import {AfterViewInit, Component, computed, Signal, signal, WritableSignal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ConversationService} from "../conversation.service";
import {StatemanagerService} from "../statemanager.service";
import {Conversation} from "../Conversation";
import {DatePipe, NgIf} from "@angular/common";
import {NgEventBus} from "ng-event-bus";
import {UserContextService} from "../user-context.service";
import {DocumentService} from "../document.service";


@Component({
  selector: 'dashboard-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {


  userCategories: Signal<Map<number, string>> = signal(new Map<number, string>());
  readonly conversations: WritableSignal<Conversation[]> = signal([])
  readonly documents: WritableSignal<string[][]> = signal([])
  readonly isIT: Signal<boolean> = signal(false);
  readonly isHelpDesk: Signal<boolean> = signal(false);
  private perimeter = new Map<string, boolean>();

  constructor(private router: Router, private route: ActivatedRoute, protected httpClient: HttpClient,
              private conversationService: ConversationService,
              protected userContextService: UserContextService,
              private documentService: DocumentService,
              private stateManagerService: StatemanagerService,
              private eventBus: NgEventBus,
              private datePipe: DatePipe) {


    eventBus.on("reload_data").subscribe(value => {

      this.reload();
    })

  }

  setPerimeter() {
    let perimeter = ""
    for (let [key, value] of this.perimeter) {
      if (value)
        perimeter = `${perimeter} ${key}`
    }
    return this.conversationService.setDocumentPerimeter(perimeter);
  }

  ngAfterViewInit() {


    let derivedCounter = computed(() => {

      this.userContextService.userCategories().forEach((value, key) => {
        this.perimeter.set(key, false);
      })
      let perimeter = ""
      for (let [key, value] of this.perimeter) {
        if (value)
          perimeter = `${perimeter} ${key}`
      }

      return perimeter;
    });

    this.reload();
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

    let current_conversation: number = 0


    let current_date = this.datePipe.transform(new Date(), 'dd.MM.yyyy');
    this.conversations().forEach((loc_conversation) => {

      if ((loc_conversation.pdf_id == 0) && loc_conversation.created_on == current_date) {
        if (current_conversation != 0 || current_conversation < loc_conversation.id) {
          current_conversation = loc_conversation.id;
        }
      }
    });

    if (current_conversation == 0) {
      this.conversationService.createConversation().subscribe(value => {
        this.setConversation(value.id);
      })
    } else {
      this.setConversation(current_conversation);
    }
  }


  onDisplayPDF($event: MouseEvent, documentId: string) {
    let page_number = 0
    this.stateManagerService.loadDocument(Number(documentId))

    $event.preventDefault()
  }

  /*********************************************************************************************
   /*Gestion des documents
   /*
   */

  deleteDocument(blobId: string) {

    return this.documentService.deleteDocument(Number(blobId)).subscribe({
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
  deleteConversation(id: number) {
    this.conversationService.deleteConversation(id).subscribe(value => {
      this.reloadConversations();
    })
  }

  isCurrentConversation(id: number) {
    return this.conversationService.getCurrentConversation() == id;
  }

  setConversation(conversation_id: number) {
    this.conversationService.setCurrentConversation(conversation_id);
  }

  setDocumentConversation(conversation_id: number, pdf_id: number) {
    this.stateManagerService.loadConversationAndDocument(conversation_id, pdf_id);
  }

  /*********************************************************************************************
   /*Changement du périmètre
   /*
   */


  getInput(categoryKey: string): any {
    return this.perimeter.get(categoryKey);
  }

  setInput( event: any,categoryKey: string = ""): void {

    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;
    if (categoryKey.length == 0)
      this.perimeter.set(this.userContextService.userName, isChecked);
    else
      this.perimeter.set(categoryKey, isChecked);
    this.setPerimeter();
  }

  addConversation() {
    this.conversationService.createConversation().subscribe(value => {
      this.reloadConversations();
    })
  }

  private reload() {
    this.loadDocuments();
    this.reloadConversations();
    this.perimeter.set(this.userContextService.userName, true);
  }

  private loadDocuments() {
    this.fetchDocuments().subscribe(value =>
      this.documents.set(value));
  }

  private fetchDocuments(): Observable<string[][]> {
    return this.documentService.fetchDocuments().pipe(map(response => {
      if (response.length == 0)
        return []
      return response
    }));
  }


}
