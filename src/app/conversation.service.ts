import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Conversation} from "./Conversation";
import {Router} from "@angular/router";
import {Source} from "./chat/chat.component";
import {sprintf} from "sprintf-js";
import {NgEventBus} from "ng-event-bus";


@Injectable({
  providedIn: 'root'
})
export class ConversationService {


  private chat_command_url: string = "https:///assistmeai.nblotti.org/chat/command/?command=%s&conversation_id=%s&perimeter=%s"
  private conversation_url: string = "https://assistmeai.nblotti.org/conversation/"
  private message_url: string = "https://assistmeai.nblotti.org/message/?conversation_id=%s"
  private current_conversation: string = "";
  private current_user: string = "1";
  private documentPerimeter: string = "1";

  constructor(protected httpClient: HttpClient, private router: Router, private eventBus: NgEventBus) {
  }


  loadConversations() {
    let url = this.conversation_url + "perimeter/" + this.current_user + "/"
    return this.httpClient.get<any>(url);

  }


  loadOrCreateConversationsByDocumentId(documentId: string) {
    let url = this.conversation_url + "document/" + documentId + "/?user_id=" + this.current_user
    return this.httpClient.get<any>(url);
  }

  deleteConversation(id: string) {
    let url = this.conversation_url + id + "/"
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
    let conversation = new Conversation(this.current_user, pdf_id = pdf_id);

    let url = this.conversation_url
    return this.httpClient.post<Conversation>(url, conversation);

  }

  clearConversation() {

    let call_url = sprintf(this.message_url, this.current_conversation);
    let obser = this.httpClient.delete<any>(call_url);
    return obser;
  }


  /*********************************************************************************************
   /*On a detecté qu'une nouvelle conversation a été selectionnée, on charge les message dans le chat
   */
  loadConversationMessages() {
    let call_url = sprintf(this.message_url, this.current_conversation);
    return this.httpClient.get<any[]>(call_url);

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
