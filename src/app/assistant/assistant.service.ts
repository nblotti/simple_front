import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GlobalsService} from "../globals.service";
import {UserContextService} from "../user-context.service";
import {v4 as uuidv4} from "uuid";

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

  saveAssistant(newAssistant: Assistant) {

    let assistants = []

    for (const assistant of this.assistants()) {
      if (assistant.id == newAssistant.id) {
        assistants.push(newAssistant);
      } else {
        assistants.push(assistant);
      }
    }
    this.assistants.set(assistants);
    console.log('Value saved: ', newAssistant.name, " / ", newAssistant.description);


  }

  createAssistant() {

    let assistant = new Assistant("", this.userContextService.userID, "New Assistant", "", "You are a usefull assistant")

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.post(this.assistant_base_url, assistant, {headers: headers}).subscribe(value => {
        this.loadAssistants();
      }
    )


  }

  cloneAssistant(id: string) {
    let cur_assistant: any
    let assistants = []

    for (const assistant of this.assistants()) {
      if (assistant.id == id) {
        cur_assistant = assistant
      }
      assistants.push(assistant);

    }
    let newid = uuidv4().toString()
    assistants.push(new Assistant(
      newid,
      this.userContextService.userID,
      "Clone of " + cur_assistant.name,
      "",
      cur_assistant.description)
    );
    this.assistants.set(assistants.reverse());
  }

  deleteAssistant(id: string) {

    let url = this.assistant_base_url + id + "/"


    this.httpClient.delete(url).subscribe(value => {
        this.loadAssistants();
      }
    )
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


