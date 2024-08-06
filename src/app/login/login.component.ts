import {Component, inject} from '@angular/core';
import {Router} from "@angular/router";
import {UserContextService} from "../auth/user-context.service";
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
  protected password: string = "";
  protected username: string = "";
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




}

type CategoryType = [number, string];

