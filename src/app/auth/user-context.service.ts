import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GlobalsService} from "../globals.service";


@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  readonly isLogged: WritableSignal<boolean> = signal(false);
  userCategories: WritableSignal<UserCategory[]> = signal([]);
  private userUrl: string = '';

  constructor() {

  }
  public _userID = ""

  get userID(): string {
    return this._userID;
  }

  setLoggedIn(isLogged: boolean, userID: string, userGroups: UserCategory[]) {
    this._userID = userID;
    this.userCategories.set(userGroups);
    this.isLogged.set(isLogged);
  }



}

export class UserCategory {

  id: string;
  label: string;
  value: boolean;

  constructor(id: string, label: string, value: boolean = false) {
    this.id = id;
    this.label = label;
    this.value = value;
  }
}
