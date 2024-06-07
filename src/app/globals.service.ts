import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public serverBase: string = 'REPLACE ME WITH YOUR SERVER BASE URL';
  constructor() { }
}
