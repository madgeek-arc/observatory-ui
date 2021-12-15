import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";

@Injectable()
export class LoginService {

  base = environment.API_LOGIN;

  constructor() {}

  login(redirectUrl?: string) {
    if (redirectUrl) {
      window.location.href = this.base + `/oauth2/authorization/eosc?redirectUrl=${redirectUrl}`;
    }
    else
      window.location.href = this.base + '/oauth2/authorization/eosc';
  }

  logout() {
    window.location.href = this.base + '/logout';
  }

}
