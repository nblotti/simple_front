import {Source} from "../dashboard-main-screen/conversation.service";

export class Document {

  constructor(public id: string, public name: string,public document_type: string) {
    this.id = id;
    this.name = name;
    this.document_type = document_type
  }


}

