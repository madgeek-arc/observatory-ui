import {Component, OnInit, ViewChild} from "@angular/core";

@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html'
})

export class ContributionsDashboardComponent {

  open: boolean = true;

  public toggleOpen(event: MouseEvent) {
    event.preventDefault();
    this.open = !this.open;
  }
}
