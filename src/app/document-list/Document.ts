export class Document {

  constructor(public name: string, public role: string, public content: string) {
    this.role = role;
    this.name = name;
    this.content = content;
  }

}
