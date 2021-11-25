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

  change() {
    const el: HTMLElement = document.getElementById('hamburger');
    if(el.classList.contains('change')) {
      el.classList.remove('change');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.remove('sidebar_main_active');
    } else {
      el.classList.add('change');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.add('sidebar_main_active');
    }
  }
}
