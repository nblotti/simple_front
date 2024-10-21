import {Injectable, Signal, signal, WritableSignal} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  readonly isLogged: WritableSignal<boolean> = signal(false);
  userCategories: WritableSignal<UserCategory[]> = signal([]);
  userAdminCategories: WritableSignal<UserCategory[]> = signal([]);
  groups: WritableSignal<string[]> = signal([]);
  private userID: WritableSignal<string> = signal("");
  private jwtToken: WritableSignal<string> = signal("");

  constructor() {

  }

  getUserID(): Signal<string> {
    return this.userID.asReadonly()
  }

  getGroups(): Signal<string[]> {
    return this.groups.asReadonly()
  }

  getJwtToken(): Signal<string> {
    return this.jwtToken.asReadonly()
  }

  public setLoggedIn(jwtToken: string, user: string, categories: UserCategory[], groups: string[]) {
    this.jwtToken.set(jwtToken);
    this.userID.set(user);
    this.userCategories.set(categories.filter(item => !item.is_admin));
    this.userAdminCategories.set(categories.filter(item => item.is_admin));
    this.isLogged.set(true);
    this.groups.set(groups);
  }

  public logoff() {
    this.userID.set("");
    this.jwtToken.set("");
    this.userCategories.set([]);
    this.isLogged.set(false);
  }


}

export class UserCategory {

  id: string;
  name: string;
  value: boolean;
  is_admin: boolean;

  constructor(id: string, name: string, value: boolean = false, is_admin = false) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.is_admin = is_admin;
  }
}
