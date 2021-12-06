import {Injectable} from "@angular/core";
import {Router} from "@angular/router";

@Injectable()
export class LoginService {

  constructor(private router: Router) {}

  login() {
    window.location.href = 'http://localhost:8280/observatory/login';
  }

  logout() {
    window.location.href = 'http://localhost:8280/observatory/logout';
  }
}
