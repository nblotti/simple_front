import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GlobalsService} from "../globals.service";
import {UserContextService} from "../user-context.service";

@Injectable({
  providedIn: 'root'
})
export class AssistantService {


  public assistants: WritableSignal<Assistant[]> = signal([]);

  assistant_base_url: string;

  constructor(private httpClient: HttpClient, private globalsService: GlobalsService, private userContextService: UserContextService) {

    this.assistant_base_url = globalsService.serverBase + "assistants/"
  }


  sendCommand(current_message: string, currentAssistant: number) {
    return this.httpClient.get<string>(this.assistant_base_url);
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

    let assistant = new Assistant("", this.userContextService.userID, "New Assistant", "", "You are a usefull assistant")
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
      cur_assistant.description)
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

  public constructor(id: string, userid: string = "", name: string, conversation_id: string = "", description: string) {
    this.id = id;
    this.userid = userid;
    this.description = description;
    this.conversation_id = conversation_id
    this.name = name;
  }
}


