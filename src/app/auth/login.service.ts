import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {UserCategory, UserContextService} from "./user-context.service";
import {GlobalsService} from "../globals.service";
import {firstValueFrom} from "rxjs";

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

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private jwtTokenUrl: string = '';
  private userUrl: string = '';

  constructor(private globalsService: GlobalsService, private http: HttpClient, private userContext: UserContextService) {
    this.userUrl = globalsService.serverBase + "category/?group_ids="
    this.jwtTokenUrl = globalsService.serverBase + "user/login"

  }

  async doLogin(jwt: object) {
    let groups: string[] = [];
    groups.push("1");

    console.log(JSON.stringify(jwt, null, 2));
    const jwttoken = await firstValueFrom(this.http.post<string[]>(this.jwtTokenUrl,jwt));
    console.log("Jwttoken Retrieved:", jwttoken);

    const profile = jwt as GoogleUserProfile;


    let userCategories = await this.getUserCategories(['group1', 'group2'], profile.info.sub);

    this.userContext.setLoggedIn(true, profile.info.sub, userCategories)

    return true;
  }

  async getUserCategories(groups: string[], userID:string): Promise<UserCategory[]> {
    const userIdList = groups.join(',');
    const url = `${this.userUrl}${userIdList}`;

    try {
      const results = await firstValueFrom(this.http.get<string[]>(url));

      const categories: UserCategory[] = [];
      categories.push(new UserCategory(userID, "My Documents", true));

      results.forEach(category => {
        categories.push(new UserCategory(category[1], category[2]));
      });

      return categories;
    } catch (error) {
      console.error(error);
      return []; // Return an empty array in case of error
    }
  }
}
