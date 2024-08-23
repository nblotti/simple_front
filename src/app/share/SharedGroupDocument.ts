export class SharedGroupDocument {

  constructor(public group_id: string, public document_id: string, public creation_date: string, public id: string = "") {
    this.id = id;
    this.group_id = group_id;
    this.document_id = document_id
    this.creation_date = creation_date;
  }


}

