import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";

@Injectable()
export class LoginService {

  base = environment.API_LOGIN;

  constructor() {}

  login() {
    window.location.href = this.base + '/oauth2/authorization/eosc';
  }

  logout() {
    window.location.href = this.base + '/logout';
  }
}
