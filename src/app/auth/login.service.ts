import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserCategory, UserContextService} from './user-context.service';
import {GlobalsService} from '../globals.service';
import {firstValueFrom} from 'rxjs';

/* Interfaces for user profiles */

// Profile for Google OAuth
interface GoogleUserProfile {
  info: {
    iss: string; // Issuer
    sub: string; // Subject
    email?: string; // Email address
    email_verified?: boolean; // Email verification status
    name?: string; // Full name
    picture?: string; // Profile picture URL
    given_name?: string; // Given name
    family_name?: string; // Family name
    iat: string; // Issued at
    exp: string; // Expiration time
  }
}

/* Profile for Azqore OAuth */
interface AzqoreUserProfile {
  info: {
    at_hash: string,
    aud: string,
    c_hash: string,
    sub: string,
    nbf: number,
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
  private jwtTokenUrl: string;
  private jwtLocalTokenUrl: string;
  private userUrl: string;
  private _redirectUrlKey = 'redirectUrl';
  private _redirectParamsKey = 'redirectParams';

  constructor(private globalsService: GlobalsService, private http: HttpClient, private userContext: UserContextService) {
    this.userUrl = `${globalsService.serverAssistmeBase}category/?group_ids=`;
    this.jwtTokenUrl = `${globalsService.serverAssistmeBase}user/login`;
    this.jwtLocalTokenUrl = `${this.jwtTokenUrl}/local`;
  }



  set redirectUrl(url: string) {
    console.log(`Setting redirectUrl: ${url}`);
    localStorage.setItem(this._redirectUrlKey, url);
  }

  get redirectUrl(): string {
    const url = localStorage.getItem(this._redirectUrlKey) || '';
    console.log(`Getting redirectUrl: ${url}`);
    return url;
  }
  set redirectParams(params: any) {
    console.log(`Setting redirectParams: ${JSON.stringify(params)}`);
    localStorage.setItem(this._redirectParamsKey, JSON.stringify(params));
  }

  get redirectParams(): any {
    const params = JSON.parse(localStorage.getItem(this._redirectParamsKey) || '{}');
    console.log(`Getting redirectParams: ${JSON.stringify(params)}`);
    return params;
  }
  async doLogin(jwt: object): Promise<boolean> {
    // Make a POST request to receive the JWT token
    const jwttoken: LoginToken = await firstValueFrom(this.http.post<LoginToken>(this.jwtTokenUrl, jwt));

    if (jwttoken.groups.includes('agp_prod_users')) {
      // Set user context if login is successful
      this.userContext.setLoggedIn(jwttoken.jwt, jwttoken.user, this.extractTokens(jwttoken.categories), jwttoken.groups);
      return true;
    } else {
      // Log off if the user is not authorized
      this.userContext.logoff();
      return false;
    }
  }

  public isLogged(): boolean {
    return this.userContext.isLogged();
  }

  async doLocalLogin(jwt: object): Promise<boolean> {
    try {
      // Make a POST request to receive the JWT token for local login
      const jwttoken: LoginToken = await firstValueFrom(this.http.post<LoginToken>(this.jwtLocalTokenUrl, jwt));

      if (jwttoken.groups.includes('agp_prod_users')) {
        // Set user context if local login is successful
        this.userContext.setLoggedIn(jwttoken.jwt, jwttoken.user, this.extractTokens(jwttoken.categories), jwttoken.groups);
        return true;
      } else {
        // Log off if the user is not authorized
        this.userContext.logoff();
        return false;
      }
    } catch (error) {
      console.error('Error during local login', error);
      return false;
    }
  }

  // Helper method to extract user categories from response
  extractTokens(data: any[]): UserCategory[] {
    return data.map(item => {
      const id = item.category_id;
      const label = item.category_name;
      const enabled = item.enabled;
      const is_admin = item.is_admin;

      return new UserCategory(id, label, enabled, is_admin);
    });
  }

  // Construct the full redirect URL including query parameters
  constructRedirectUrl(): string {
    if (!this.redirectUrl) {
      return '/';
    }

    const url = new URL(this.redirectUrl, window.location.origin);
    if (this.redirectParams) {
      Object.keys(this.redirectParams).forEach(key => {
        url.searchParams.append(key, this.redirectParams[key]);
      });
    }

    return url.pathname + url.search;
  }
}

// Definition of LoginToken class
export class LoginToken {
  user: string;
  groups: string[];
  categories: UserCategory[];
  jwt: string;

  constructor(user: string, groups: string[], categories: UserCategory[], jwt: string) {
    this.user = user;
    this.groups = groups;
    this.categories = categories;
    this.jwt = jwt;
  }
}
