import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GlobalsService} from "./globals.service";


@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  readonly isLogged: WritableSignal<boolean> = signal(false);

  userCategories: WritableSignal<UserCategory[]> = signal([]);
  private userUrl: string = '';

  constructor(private globalsService: GlobalsService, private httpClient: HttpClient) {
    this.userUrl = globalsService.serverBase + "category/?group_ids="

  }

  public _userID = ""

  get userID(): string {
    return this._userID;
  }

  setLoggedIn(isLogged: boolean, userID: string, userGroups: string[]) {
    this.isLogged.set(isLogged);
    this._userID = userID;
    this.getUserCategories(userGroups);
  }

  getUserCategories(groups: string[]) {

    const userIdList = groups.join(',');

    let url = this.userUrl + userIdList
    this.httpClient.get<string[]>(url)
      .subscribe({
        next: (results) => {
          const categories: UserCategory[] = [];
          categories.push(new UserCategory(this.userID, "My Documents", true));
          // Assuming categories is an array of objects with properties `id` and `name`
          results.forEach(category => {
            categories.push(new UserCategory(category[1], category[2]));
          });

          this.userCategories.set(categories);
        },
        error: (err) => {
          console.error(err);
        }
      });
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
