export class ScreenReadyMessage {

  constructor(public id: string, public role: string, public content: string) {
    this.role = role;
    this.id = id;
    this.content = content;
  }


}

