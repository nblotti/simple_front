export class Document {

  constructor(public id: string, public name: string, public document_type: string,public focus_only:boolean) {
    this.id = id;
    this.name = name;
    this.document_type = document_type
    this.focus_only = focus_only;
  }


}

