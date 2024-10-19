import {Source} from "./conversation.service";

export class SharedGroupDTO {

  constructor(public id: string, public name: string, public creation_date: string, public owner:string) {
    this.id = id;
    this.name = name;
    this.owner = owner
    this.creation_date = creation_date;
  }


}

