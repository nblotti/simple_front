import {Source} from "../dashboard-main-screen/conversation.service";

export class SharedGroup {

  constructor(public name: string, public owner:string, public creation_date: string, public id: string ="") {
    this.id = id;
    this.name = name;
    this.owner = owner
    this.creation_date = creation_date;
  }


}

