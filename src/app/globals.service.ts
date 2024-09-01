import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public serverAssistmeBase: string = 'https://gpt.azqore.com/assistme/';
  public serverJobBase: string = 'https://gpt.azqore.com/jobs/';

  constructor() { }
}
