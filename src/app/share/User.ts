import {Source} from "../dashboard/conversation.service";

export class User {

  constructor(public cn: string, public givenName: string) {
    this.cn = cn;
    this.givenName = givenName;
  }


}

