import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public serverBase: string = 'https://azqoregpt.nblotti.org/assistme/';

  constructor() { }
}
