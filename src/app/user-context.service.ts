import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GlobalsService} from "./globals.service";


@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  readonly isLogged: WritableSignal<boolean> = signal(false);

  userCategories:WritableSignal<Map<string,string>> = signal(new Map<string,string>());
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

  getUserCategories(groups: string[]){

    const userIdList = groups.join(',');

    let url = this.userUrl + userIdList
    this.httpClient.get<string[]>(url)
      .subscribe({
        next: (categories) => {
          const categoryMap = new Map<string, string>();
          categoryMap.set("" + this.userID, "My Documents");
          // Assuming categories is an array of objects with properties `id` and `name`
          categories.forEach(category => {
            categoryMap.set("" + category[1], category[2]);
          });

          this.userCategories.set(categoryMap);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

}
