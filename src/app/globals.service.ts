import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public serverBase: string = 'https://gpt.azqore.com/assistme/';

  constructor() { }
}
