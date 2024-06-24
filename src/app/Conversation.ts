
export class Conversation {
  id: number;
  perimeter: string;
  description: string
  pdf_id: number;
  pdf_name: string;
  created_on: string;

  public constructor(perimeter: string, pdf_id: number = 0, id: number = 0, description: string = "",  pdf_name: string = "", created_on: string = "") {
    this.id = id;
    this.perimeter = perimeter;
    this.description = description;
    this.pdf_id = pdf_id;
    this.pdf_name = pdf_name;
    this.created_on = created_on;
  }
}
