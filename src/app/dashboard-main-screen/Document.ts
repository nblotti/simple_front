export class Document {

  constructor(public id: string, public name: string, public owner: string, public perimeter: string,
              public created_on: string, public summary_id: string, public summary_status: string,
              public document_type: string) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.perimeter = perimeter;
    this.created_on = created_on;
    this.summary_id = summary_id;
    this.summary_status = summary_status;
    this.document_type = document_type;
  }

}

export class SharedDocument {

  constructor(public id: string, public name: string, public owner: string, public perimeter: string,
              public created_on: string, public summary_id: string, public summary_status: string,
              public document_type: string, public shared_group_id: string) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.perimeter = perimeter;
    this.created_on = created_on;
    this.summary_id = summary_id;
    this.summary_status = summary_status;
    this.document_type = document_type;
    this.shared_group_id = shared_group_id;
  }

}
