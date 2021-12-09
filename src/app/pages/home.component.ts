import {Component} from "@angular/core";
import {LoginService} from "../services/login.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent {

  constructor(private loginService: LoginService) {
  }

  logInButton() {
    this.loginService.login();
    // window.location.href = 'http://localhost:8280/observatory/login';
  }
}
