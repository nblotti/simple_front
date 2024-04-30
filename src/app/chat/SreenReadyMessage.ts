import {Source} from "./chat.component";

export class ScreenReadyMessage {

  constructor(public id: string, public role: string, public content: string, public sources: Source[]=[]) {
    this.role = role;
    this.id = id;
    this.content = content;
  }


}

