import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Conversation} from "./Conversation";
import {Router} from "@angular/router";
import {sprintf} from "sprintf-js";
import {GlobalsService} from "../globals.service";
import {UserContextService} from "../user-context.service";


@Injectable({
  providedIn: 'root'
})
export class ConversationService {


  private chat_command_no_perimeter_url: string
  private chat_command_perimeter_url: string
  private conversation_url: string
  private message_url: string
  private current_conversation: number = 0;
  //private current_user: string = "1";
  private documentPerimeter: string = "";

  constructor(protected httpClient: HttpClient, private router: Router, private globalsService: GlobalsService,
              private userContextService: UserContextService) {

    this.chat_command_no_perimeter_url = globalsService.serverBase + "chat/command/?command=%s&conversation_id=%s"
    this.chat_command_perimeter_url = globalsService.serverBase + "chat/command/?command=%s&conversation_id=%s&perimeter=%s"
    this.conversation_url = globalsService.serverBase + "conversation/"
    this.message_url = globalsService.serverBase + "message/?conversation_id=%s"
  }


  loadConversations() {
    let url = this.conversation_url + "perimeter/" + this.userContextService.userID + "/"
    return this.httpClient.get<any>(url);

  }


  loadOrCreateConversationsByDocumentId(documentId: number) {
    let url = this.conversation_url + "document/" + documentId + "/?user_id=" + this.userContextService.userID
    return this.httpClient.get<any>(url);
  }

  deleteConversation(id: number) {
    let url = this.conversation_url + id + "/"
    let obser = this.httpClient.delete<any>(url);
    return obser;

  }

  sendCommand(command: string) {

    let call_url: string
    if (this.documentPerimeter.length == 0)
      call_url = sprintf(this.chat_command_no_perimeter_url, command, this.current_conversation);
    else
      call_url = sprintf(this.chat_command_perimeter_url, command, this.current_conversation, this.documentPerimeter);

    console.log(call_url);
    return this.httpClient.get<Result>(call_url);

  }

  getCurrentConversation() {
    return this.current_conversation
  }


  setCurrentConversation(current_conversation: number = 0) {
    this.current_conversation = current_conversation;
  }

  setDocumentConversation(conversation_id: any, pdf_id: string) {
    this.setCurrentConversation(conversation_id);
    this.router.navigate(['/docs', pdf_id, 0]);

  }

  setDocumentPerimeter(perimeter: string) {
    this.documentPerimeter = perimeter;
  }

  getDocumentPerimeter() {
    return this.documentPerimeter;
  }


  createConversation(pdf_id: number = 0) {
    let conversation = new Conversation(this.userContextService.userID, pdf_id);

    let url = this.conversation_url
    return this.httpClient.post<Conversation>(url, conversation);

  }

  clearConversation(conversation_id =-1) {

    if(conversation_id != -1)
      this.current_conversation = conversation_id;

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

export class Source {
  blob_id: string
  file_name: string
  page: number
  perimeter: string


  public constructor(blob_id: string, file_name: string, page: number, perimeter: string) {
    this.blob_id = blob_id;
    this.file_name = file_name;
    this.page = page;
    this.perimeter = perimeter;

  }
}


export class Messages {
  content: string
  additional_kwargs: any
  response_metadata: any
  type: string
  name: string
  id: string
  example: boolean

  public constructor(content: string, type: string, additional_kwargs: any = {}, response_metadata: any = {},
                     name: string = "", id: string = "", example: boolean = false) {
    this.content = content
    this.additional_kwargs = additional_kwargs
    this.response_metadata = response_metadata
    this.type = type
    this.name = name
    this.id = id
    this.example = example
  }
}

