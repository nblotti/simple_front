import {Source} from "../dashboard-main-screen/conversation.service";

export class ScreenReadyMessage {

  constructor(public id: number, public role: string, public content: string, public sources: Source[]=[]) {
    this.role = role;
    this.id = id;
    this.content = content;
  }


}

