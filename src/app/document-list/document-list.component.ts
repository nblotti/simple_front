import {AfterViewInit, Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgEventBus} from "ng-event-bus";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe, JsonPipe} from "@angular/common";

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [FormsModule, HttpClientModule, JsonPipe],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent implements AfterViewInit {


  private _documents: string[][] = [];
  private _conversations: Conversation[] = [];
  private current_conversation: String = "";
  private user_id = "1"


  constructor(private router: Router, private route: ActivatedRoute, protected httpClient: HttpClient, private datePipe: DatePipe, private eventBus: NgEventBus) {

  }


  getDocumentsBaseUrl() {
    return "https://assistmeai.nblotti.org/files/";
  }


  getConversationsBaseUrl() {
    return "https://assistmeai.nblotti.org/chat/conversations/";
  }


  onDisplayPDF($event: MouseEvent, documentId: string) {
    this.router.navigate(['/docs', documentId, this.current_conversation], {relativeTo: this.route});


    $event.preventDefault()
  }

  public getDocuments(): string[][] {
    return this._documents;
  }


  public getConverations(): Conversation[] {

    return this._conversations;
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {

      this.current_conversation = ""
      if (params['id'] != null) this.current_conversation = params['id']
    });
    this.loadDocuments();
    this.loadConversations();
  }

  loadConversations() {
    let url = this.getConversationsBaseUrl() + this.user_id + "/"
    return this.httpClient.get<any>(url).subscribe({
      next: (result) => {
        this._conversations = result;

        if (this.current_conversation.length == 0) {

          let current_date = this.datePipe.transform(new Date(), 'dd.MM.yyyy');
          this._conversations.forEach((conversation) => {

            if (conversation.pdf_id == "-1" && conversation.created_on == current_date) {
              if (this.current_conversation.length == 0 || this.current_conversation > conversation.id) {
                this.current_conversation = conversation.id
              }
            }
          });

        }
        if (this.current_conversation.length == 0) {
          this.createConversation();
        }else{
          this.eventBus.cast("command:conversationchange", this.current_conversation)

        }
      }, error: (error) => {
        console.error('Delete failed:', error);
      }, complete: () => {
      }
    });

  }

  deleteItem(blobId: string) {
    let url = this.getDocumentsBaseUrl() + blobId + "/"
    return this.httpClient.delete<any>(url).subscribe({
      next: (result) => {
        console.log('Delete successful:', result);
      }, error: (error) => {
        console.error('Delete failed:', error);
      }, complete: () => {
        this.loadDocuments();
        this.loadConversations()
      }
    });

  }

  deleteConversation(id: string) {
    let url = this.getConversationsBaseUrl() + id + "/"
    return this.httpClient.delete<any>(url).subscribe({
      next: (result) => {
        console.log('Delete successful:', result);
      }, error: (error) => {
        console.error('Delete failed:', error);
      }, complete: () => {
        this.loadConversations();
      }
    });

  }

  isCurrentConversation(id: string) {
    return this.current_conversation == id;
  }

  setConversation(conversation_id: string, document_id: string) {


    this.eventBus.cast("command:conversationchange", conversation_id)

    if (document_id != "-1") this.router.navigate(['/docs', document_id, conversation_id], {relativeTo: this.route});
    else
      this.current_conversation = conversation_id;
  }

  private createConversation() {
    let conversation = new Conversation(this.user_id);
    let url = this.getConversationsBaseUrl()
    this.httpClient.post<Conversation>(url, conversation).subscribe({
      next: (result) => {
        this.current_conversation = result.id;
      }, error: (error) => {
        console.error('Delete failed:', error);
      }, complete: () => {
        this.loadConversations()
      }
    });

  }

  private loadDocuments() {
    this.fetchDocuments().subscribe(value => this._documents = value);
  }

  private fetchDocuments(): Observable<string[][]> {
    let url = this.getDocumentsBaseUrl()
    return this.httpClient.get<any>(url).pipe(map(response => JSON.parse(response)));
  }
}

class Conversation {
  id: string;
  user_id: string;
  description: string
  pdf_id: string;
  pdf_name: string;
  created_on: string;

  public constructor(user_id: string, id: string = "", description: string = "", pdf_id: string = "", pdf_name: string = "", created_on: string = "") {
    this.id = id;
    this.user_id = user_id;
    this.description = description;
    this.pdf_id = pdf_id;
    this.pdf_name = pdf_name;
    this.created_on = created_on;
  }
}
