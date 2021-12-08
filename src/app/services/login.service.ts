import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable()
export class LoginService {

  base = environment.API_LOGIN;

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    window.location.href = this.base + '/oauth2/authorization/eosc';
  }

  logout() {
    window.location.href = 'http://localhost:8280/observatory/logout';
  }
}
