
export class Conversation {
  id: string;
  perimeter: string;
  description: string
  pdf_id: string;
  pdf_name: string;
  created_on: string;

  public constructor(perimeter: string, pdf_id: string, id: string = "", description: string = "",  pdf_name: string = "", created_on: string = "") {
    this.id = id;
    this.perimeter = perimeter;
    this.description = description;
    this.pdf_id = pdf_id;
    this.pdf_name = pdf_name;
    this.created_on = created_on;
  }
}
