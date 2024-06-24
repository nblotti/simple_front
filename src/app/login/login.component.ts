import {Component, inject} from '@angular/core';
import {Router} from "@angular/router";
import {UserContextService} from "../user-context.service";
import {FormsModule} from "@angular/forms";
import {GlobalsService} from "../globals.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import { OAuthService} from "angular-oauth2-oidc";
import {authCodeFlowConfig} from "../auth/auth.config";
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private password: string = "";
  private username: string = "";
  private userUrl:string  = '';

  private oauthService = inject(OAuthService)

  constructor(private router: Router, private userContext: UserContextService, private globalsService: GlobalsService,
              private httpClient: HttpClient) {

    this.userUrl = globalsService.serverBase + "user"


  }


  doLogin() {



    /*
     const ids = ['1', '2', '3'];
     this.getUserCategories(ids)
 */
  }

  getUserCategories(userIds: string[]): void {

    const userIdList = userIds.join(',');

    let params = new HttpParams();
    userIds.forEach(userId => {
      params = params.append('user_ids', userId);
    });

    this.httpClient.get<CategoryType[]>(this.userUrl, {params})
      .subscribe({
        next: (categories) => {
          const categoryMap = new Map<string, string>();

          // Assuming categories is an array of objects with properties `id` and `name`
          categories.forEach(category => {
            categoryMap.set("" + category[0], category[1]);
          });

          this.userContext.setLoggedIn(true, this.username); // Assuming username and password are defined somewhere in the service or received via args
          this.userContext.userCategories.set(categoryMap);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }


}

type CategoryType = [number, string];

