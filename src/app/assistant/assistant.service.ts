import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GlobalsService} from "../globals.service";
import {UserContextService} from "../auth/user-context.service";
import {sprintf} from "sprintf-js";

@Injectable({
  providedIn: 'root'
})
export class AssistantService {


  public assistants: WritableSignal<Assistant[]> = signal([]);


  private assistant_base_url: string;
  private assistant_command_url: string;
  private message_url: string
  private assistant_document_base_url: string

  private perimeter: string = ""

  constructor(private httpClient: HttpClient, private globalsService: GlobalsService,
              private userContextService: UserContextService) {

    this.assistant_base_url = globalsService.serverAssistmeBase + "assistants/"
    this.assistant_command_url = this.assistant_base_url + "command/?command=%s&conversation_id=%s"
    this.message_url = globalsService.serverAssistmeBase + "message/?conversation_id=%s"

    this.assistant_document_base_url = globalsService.serverAssistmeBase + "assistantsdocument/"
  }


  sendCommand(current_message: string, currentAssistant: number) {

    let call_url = sprintf(this.assistant_command_url, current_message, currentAssistant);

    if (this.perimeter.length != 0)
      call_url = sprintf("%s&perimeter=%s", call_url, this.perimeter)

    return this.httpClient.get<Result>(call_url);
  }

  loadAssistantDocuments(currentAssistant: string) {
    let call_url = sprintf("%sassistant/%s/", this.assistant_document_base_url, currentAssistant);

    return this.httpClient.get<AssistantDocument[]>(call_url);
  }

  createAssistantDocument(assistantDocument: AssistantDocument) {
    let call_url = this.assistant_document_base_url;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.post<AssistantDocument>(this.assistant_document_base_url, assistantDocument, {headers: headers})
  }


  loadAssistants() {
    let url = this.assistant_base_url + this.userContextService.getUserID()() + "/"

    this.httpClient.get<Assistant[]>(url)
      .subscribe({
        next: (results) => {
          const assistants: Assistant[] = [];
          results.forEach(assist => {
            assistants.push(assist);
          });

          this.assistants.set(assistants);
          if (assistants.length == 0)
            this.createAssistant();

        },
        error: (err) => {
          console.error(err);
        }
      });

  }

  loadConversationMessages(conversation_id: number) {
    let call_url = sprintf(this.message_url, conversation_id);
    return this.httpClient.get<any[]>(call_url);

  }

  getAssistants() {
    return this.assistants;
  }

  updateAssistant(assistant: Assistant) {

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.put(this.assistant_base_url, assistant, {headers: headers})
      .subscribe({
        next: (assistant) => {
          this.loadAssistants();
        },
        error: (err) => {
          console.error(err);
        }

      });


  }

  createAssistant() {

    let assistant = new Assistant("", this.userContextService.getUserID()(), "New Assistant", "", "You are a useful assistant", "3.5", false)
    this.saveAssistant(assistant);


  }

  cloneAssistant(id: string) {
    let cur_assistant: any = null;

    for (const assistant of this.assistants()) {
      if (assistant.id == id) {
        cur_assistant = assistant
      }
    }
    if (cur_assistant == null)
      return;
    this.saveAssistant(new Assistant(
      "",
      this.userContextService.getUserID()(),
      "Clone of " + cur_assistant.name,
      "",
      cur_assistant.description,
      cur_assistant.gpt_model_number,
      cur_assistant.use_documents)
    );

  }

  deleteAssistant(id: string) {

    let url = this.assistant_base_url + id + "/"


    this.httpClient.delete(url).subscribe(value => {
        this.loadAssistants();
      }
    )
  }

  setDocumentPerimeter(perimeter: string) {
    this.perimeter = perimeter
  }

  deleteAssistantDocuments(id: string) {

    let url = this.assistant_document_base_url + id + "/"
    return this.httpClient.delete(url);

  }

  private saveAssistant(assistant: Assistant) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.post(this.assistant_base_url, assistant, {headers: headers})
      .subscribe({
        next: (assistant) => {
          this.loadAssistants();
        },
        error: (err) => {
          console.error(err);
        }

      });
  }
}


export class Assistant {
  id: string
  userid: string
  name: string
  conversation_id: string
  description: string
  gpt_model_number: string
  use_documents: boolean

  public constructor(id: string, userid: string = "", name: string, conversation_id: string = "", description: string,
                     gpt_model_number: string, use_documents: boolean) {
    this.id = id;
    this.userid = userid;
    this.description = description;
    this.conversation_id = conversation_id
    this.name = name;
    this.gpt_model_number = gpt_model_number
    this.use_documents = use_documents
  }
}

class AssistantDocument {
  id: string
  assistant_id: string
  document_id: string
  document_name: string

  public constructor(id: string, assistant_id: string, document_id: string, document_name: string) {
    this.id = id;
    this.assistant_id = assistant_id;
    this.document_id = document_id;
    this.document_name = document_name;
  }
}


class Result {
  result: string

  public constructor(result: string) {
    this.result = result;
  }
}


