import {Component, OnInit, ViewChild} from "@angular/core";

@Component({
  selector: 'app-top-menu-dashboard',
  templateUrl: 'top-menu-dashboard.component.html',
  styleUrls: ['./top-menu-dashboard.component.css']
})

export class TopMenuDashboardComponent {

  parseUsername() {
    // let firstLetters = "";
    // let matches = this.getUserName().match(/\b(\w)/g);
    // if(matches)
    //   firstLetters += matches.join('');
    // return firstLetters;
    return 'SM';
  }

  logout() {
    // this.authService.logout();
  }
}
