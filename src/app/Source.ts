export class Source {
  blob_id: string;
  file_name: string;
  page: number;
  perimeter: string;
  text: string;
  type: string;

  public constructor(
    blob_id: string,
    file_name: string,
    page: number,
    perimeter: string,
    text: string,
    type: string = "document"
  ) {
    this.blob_id = blob_id;
    this.file_name = file_name;
    this.page = page;
    this.perimeter = perimeter;
    this.text = text;
    this.type = type;
  }
}
