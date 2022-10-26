import {Component} from "@angular/core";

@Component({
  selector: 'app-national-contributions-to-eosc-dashboard',
  templateUrl: './national-contributions-to-eosc-dashboard.component.html',
  styleUrls: ['../../../app/shared/sidemenudashboard/side-menu-dashboard.component.css','./national-contributions-to-eosc-dashboard.component.css']
})

export class NationalContributionsToEOSCDashboardComponent {

  open: boolean = true;

  constructor() {
  }
}
