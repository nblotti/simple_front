import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {UserCategory, UserContextService} from "./user-context.service";
import {GlobalsService} from "../globals.service";
import {firstValueFrom} from "rxjs";

/*for Google*/
interface GoogleUserProfile {
  info: {
    iss: string; // Subject - Unique identifier for the user (required)
    sub: string; // Subject - Unique identifier for the user (required)
    email?: string; // Email address of the user
    email_verified?: boolean; // True if the user's email address has been verified; otherwise false
    name?: string; // Full name of the user
    picture?: string; // URL of the user's profile picture
    given_name?: string; // Given name(s) or first name(s) of the user
    family_name?: string; // Surname(s) or last name(s) of the user
    "iat": string;
    "exp": string;

  }
}

/**/
interface AzqoreUserProfile {
  info: {
    at_hash: string,
    aud: string,
    c_hash: string,
    sub: string,
    nbf: number
    azp: string,
    amr: string[],
    iss: string,
    exp: number,
    iat: number,
    nonce: string,
  }
}


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private jwtTokenUrl: string = '';
  private userUrl: string = '';

  constructor(private globalsService: GlobalsService, private http: HttpClient, private userContext: UserContextService) {
    this.userUrl = globalsService.serverBase + "category/?group_ids="
    this.jwtTokenUrl = globalsService.serverBase + "user/login"
    //this.jwtTokenUrl = "http://localhost:8000/user/login";
  }

  async doLogin(jwt: object) {


    console.log(JSON.stringify(jwt, null, 2));
    const jwttoken: LoginToken = await firstValueFrom(this.http.post<LoginToken>(this.jwtTokenUrl, jwt));

    if (jwttoken.groups.includes("agp_prod_users")) {
      this.userContext.setLoggedIn(jwttoken.user, this.extractTokens(jwttoken.categories));

      return true;
    } else {
      this.userContext.logoff();
      return false;
    }
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

export class LoginToken {

  user: string;
  groups: string[];
  categories: UserCategory[];
  jwt: string

  constructor(user: string, groups: string[], categories: UserCategory[], jwt: string) {
    this.user = user;
    this.groups = groups;
    this.categories = categories;
    this.jwt = jwt;
  }
}

