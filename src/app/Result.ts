import {Source} from "./Source";


export class Result {
  public result: string;
  public sources: Source[];

  public constructor(result: string = '', sources: Source[] = []) {
    this.result = result;
    this.sources = sources;
  }
}
