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

  constructor(private httpClient: HttpClient, private globalsService: GlobalsService, private userContextService: UserContextService) {

    this.assistant_base_url = globalsService.serverBase + "assistants/"
    this.assistant_command_url = this.assistant_base_url + "command/?command=%s&conversation_id=%s"
    this.message_url = globalsService.serverBase + "message/?conversation_id=%s"
  }


  sendCommand(current_message: string, currentAssistant: number) {

    let call_url = sprintf(this.assistant_command_url, current_message, currentAssistant);
    return this.httpClient.get<Result>(call_url);
  }

  loadAssistants() {
    let url = this.assistant_base_url + this.userContextService.userID + "/"

    this.httpClient.get<Assistant[]>(url)
      .subscribe({
        next: (results) => {
          const assistants: Assistant[] = [];
          results.forEach(assist => {
            assistants.push(assist);
          });

          this.assistants.set(assistants);
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

    let assistant = new Assistant("", this.userContextService.userID, "New Assistant", "", "You are a usefull assistant","3.5")
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
      this.userContextService.userID,
      "Clone of " + cur_assistant.name,
      "",
      cur_assistant.description,
      cur_assistant.gpt_model_number)
    );

  }

  deleteAssistant(id: string) {

    let url = this.assistant_base_url + id + "/"


    this.httpClient.delete(url).subscribe(value => {
        this.loadAssistants();
      }
    )
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
  description: string;
  gpt_model_number: string

  public constructor(id: string, userid: string = "", name: string, conversation_id: string = "", description: string, gpt_model_number: string) {
    this.id = id;
    this.userid = userid;
    this.description = description;
    this.conversation_id = conversation_id
    this.name = name;
    this.gpt_model_number = gpt_model_number;
  }
}

class Result {
  result: string

  public constructor(result: string) {
    this.result = result;
  }
}


