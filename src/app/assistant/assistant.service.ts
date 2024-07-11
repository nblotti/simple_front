import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
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

    this.assistant_base_url = globalsService.serverBase + "assistant/"
    let assistants = []
    assistants.push(new Assistant("1", this.userContextService.userID, "Default", "You are a usefull assistant", true));
    assistants.push(new Assistant("2", this.userContextService.userID, "Traductor", "You are an english professor, translate and rephrase when required"));
    assistants.push(new Assistant("3", this.userContextService.userID, "Professor", "You are a speicalist in geology helping me writting an article"));

    this.assistants.set(assistants);
  }


  sendCommand(current_message: string, currentAssistant: number) {
    return this.httpClient.get<string>(this.assistant_base_url);
  }

  getAssistants() {
    return this.assistants;

  }

  saveAssistant(newAssistant: Assistant) {

    let assistants = []

    for (const assistant of this.assistants()) {
      if (assistant.id == newAssistant.id) {
        newAssistant.selected = true;
        assistants.push(newAssistant);
      } else {
        newAssistant.selected = false;
        assistants.push(assistant);
      }
    }
    this.assistants.set(assistants);
    console.log('Value saved: ', newAssistant.name, " / ", newAssistant.description);


  }

  createAssistant() {

    let assistants = []

    for (const assistant of this.assistants()) {
      assistant.selected = false;
      assistants.push(assistant);
    }
    let id = uuidv4().toString()
    assistants.push(new Assistant(id, this.userContextService.userID, "", "", true)
    );
    this.assistants.set(assistants.reverse());
  }
}


export class Assistant {
  id: string
  userid: string
  name: string
  description: string;
  selected: boolean;

  public constructor(id: string, userid: string = "", name: string, description: string, selected: boolean = false) {
    this.id = id;
    this.userid = userid;
    this.description = description;
    this.name = name;
    this.selected = selected;
  }
}


