export class Document {


  constructor(public id: string, public name: string, public owner: string, public perimeter: string, public created_on : string) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.perimeter = perimeter;
    this.created_on = created_on;
  }

}
