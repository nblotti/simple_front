import {Injectable, signal, WritableSignal} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  readonly isLogged: WritableSignal<boolean> = signal(false);

  userGroup: WritableSignal<string[]> = signal([]);

  constructor() {
  }

  setLoggedIn(isLogged: boolean, username: string = "", password: string = "") {
    let groups: string[] = this.getGroups(username)
    this.userGroup.set(groups);
    this.isLogged.set(isLogged);
  }


  getGroups(username:string) {
    let group: string[] = ["A", username];
    return group;
  }

}
