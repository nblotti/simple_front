import {Source} from "../dashboard/conversation.service";

export class SharedGroupUser {

  constructor(public group_id: string, public user_id:string, public creation_date: string, public id: string ="") {
    this.id = id;
    this.group_id = group_id;
    this.user_id = user_id
    this.creation_date = creation_date;
  }


}

