import {Injectable, Signal, signal, WritableSignal} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  readonly isLogged: WritableSignal<boolean> = signal(false);
  userCategories: WritableSignal<UserCategory[]> = signal([]);
  groups: WritableSignal<string[]> = signal([]);
  private userUrl: string = '';
  private userID: WritableSignal<string> = signal("");

  constructor() {

  }

  getUserID(): Signal<string> {
    return this.userID.asReadonly()
  }

  getGroups(): Signal<string[]> {
    return this.groups.asReadonly()
  }

  public setLoggedIn(user: string, categories: UserCategory[], groups: string[]) {
    this.userID.set(user);
    this.userCategories.set(categories);
    this.isLogged.set(true);
    this.groups.set(groups);
  }

  public logoff() {
    this.userID.set("");
    this.userCategories.set([]);
    this.isLogged.set(false);
  }

  extractTokens(data: any[]) {
    return data.map(item => {
      const id = item[1].toString();
      const label = item[2].toString();
      const enabled = item[3] && item[3] == true ? true : false;
      return new UserCategory(id, label, enabled);
    });
  }

}

export class UserCategory {

  id: string;
  label: string;
  value: boolean;
  owner: string;

  constructor(id: string, label: string, value: boolean = false, owner = "") {
    this.id = id;
    this.label = label;
    this.value = value;
    this.owner = owner;
  }
}
