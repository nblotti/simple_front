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
  private jwtLocalTokenUrl: string = ""
  private userUrl: string = '';

  constructor(private globalsService: GlobalsService, private http: HttpClient, private userContext: UserContextService) {
    this.userUrl = globalsService.serverAssistmeBase + "category/?group_ids="
    this.jwtTokenUrl = globalsService.serverAssistmeBase + "user/login"
    this.jwtLocalTokenUrl = this.jwtTokenUrl + "/local"
  }

  async doLogin(jwt: object) {

    //console.log(JSON.stringify(jwt, null, 2));
    const jwttoken: LoginToken = await firstValueFrom(this.http.post<LoginToken>(this.jwtTokenUrl, jwt));

    if (jwttoken.groups.includes("agp_prod_users")) {
      this.userContext.setLoggedIn(jwttoken.jwt,jwttoken.user, this.extractTokens(jwttoken.categories), jwttoken.groups);

      return true;
    } else {
      this.userContext.logoff();
      return false;
    }
  }

  public isLogged() {
    return this.userContext.isLogged();
  }

  async doLocalLogin(jwt: object) {

    try {
      const jwttoken: LoginToken = await firstValueFrom(this.http.post<LoginToken>(this.jwtLocalTokenUrl, jwt));

      if (jwttoken.groups.includes("agp_prod_users")) {
        this.userContext.setLoggedIn(jwttoken.jwt, jwttoken.user, this.extractTokens(jwttoken.categories), jwttoken.groups);
        return true;
      } else {
        this.userContext.logoff();
        return false;
      }
    } catch (error) {
      console.error('Error during local login', error);
      return false;
    }
  }


  extractTokens(data: any[]) {
    return data.map(item => {
      const id = item.category_id;
      const label = item.category_name;
      const enabled = item.enabled;
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

