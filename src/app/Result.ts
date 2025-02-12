import {Source} from "./Source";


export class Result {
  public result: string;
  public sources: Source[];
  public question: string;

  public constructor(result: string = '', sources: Source[] = [], question: string = '') {
    this.question = question
    this.result = result;
    this.sources = sources;
  }
}
