import {Injectable, signal, WritableSignal} from '@angular/core';
import {GlobalsService} from "./globals.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  readonly isLogged: WritableSignal<boolean> = signal(false);

  userCategories: WritableSignal<Map<string, string>> = signal(new Map<string, string>());
  public _userName = "1"


  setLoggedIn(isLogged: boolean,  username: string = "", userGroup = new Map<string, string>()) {
    this.isLogged.set(isLogged);
    this._userName =username;
    this.userCategories.set(userGroup);
  }


  get userName(): string {
    return this._userName;
  }
}
