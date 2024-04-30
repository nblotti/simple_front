import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Conversation} from "./Conversation";
import {Router} from "@angular/router";
import {Source} from "./chat/chat.component";
import {sprintf} from "sprintf-js";
import {NgEventBus} from "ng-event-bus";
import {Subscription} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ConversationService {


  private chat_command_url: string = "https:///assistmeai.nblotti.org/chat/command/v1/?command=%s&conversation_id=%s&perimeter=%s"
  private current_conversation: string = "";
  private current_user: string = "1";
  private documentPerimeter: string = "1";

  constructor(protected httpClient: HttpClient, private router: Router, private eventBus: NgEventBus,) {
  }

  getConversationsBaseUrl() {
    return "https://assistmeai.nblotti.org/chat/conversations/";
  }


  loadConversations() {
    let url = this.getConversationsBaseUrl() + "perimeter/" + this.current_user + "/"
    return this.httpClient.get<any>(url);

  }


  loadOrCreateConversationsByDocumentId(documentId: string) {
    let url = this.getConversationsBaseUrl() + "document/" + documentId + "/?user_id=" + this.current_user
    return this.httpClient.get<any>(url);
  }

  deleteConversation(id: string) {
    let url = this.getConversationsBaseUrl() + id + "/"
    let obser = this.httpClient.delete<any>(url);
    return obser;

  }

  sendCommand(command: string) {
    let call_url = sprintf(this.chat_command_url, command, this.current_conversation, this.documentPerimeter);
    console.log(call_url);
    return this.httpClient.get<Result>(call_url);

  }

  getCurrentConversation() {
    return this.current_conversation
  }


  setCurrentConversation(current_conversation: string) {
    this.current_conversation = current_conversation;
    this.eventBus.cast("load_conversation")
    console.log("current conversation : " + current_conversation);
  }

  setDocumentConversation(conversation_id: any, pdf_id: string) {
    this.setCurrentConversation(conversation_id);
    this.router.navigate(['/docs', pdf_id, 0]);

  }

  setDocumentPerimeter(is_my_documentsChecked: boolean, documentPerimeter: string) {

    this.documentPerimeter = is_my_documentsChecked ? this.current_user + " " + documentPerimeter : documentPerimeter;
  }

  getDocumentPerimeter() {
    return this.documentPerimeter;
  }


  createConversation(pdf_id: string = "") {
    let conversation = new Conversation(
      this.current_user,
      pdf_id = pdf_id);

    let url = this.getConversationsBaseUrl()
    return this.httpClient.post<Conversation>(url, conversation);

  }
}

class Result {
  result: string
  sources: Source[]

  public constructor(result: string, sources: Source[] = []) {
    this.result = result;
    this.sources = sources
  }
}
