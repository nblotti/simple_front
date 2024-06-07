import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public serverBase: string = 'http://localhost:8010/proxy/';
  constructor() { }
}
