import {Component, OnInit} from "@angular/core";

@Component({
  selector: 'app-contributors-dashboard',
  templateUrl: './coordinators.component.html'
})

export class CoordinatorsComponent implements OnInit{

  public surveysList = [];
  public eoscSBMembers = [];

  ngOnInit() {

    this.surveysList = [
      { id: 1, name: 'National Contributions to EOSC' }
    ];

    this.eoscSBMembers = [
      { id: 1, name: 'EOSC SB (Greece)' },
      { id: 2, name: 'EOSC SB (France)' },
      { id: 3, name: 'EOSC SB (Ireland)' },
      { id: 4, name: 'EOSC SB (Italy)' },
    ];

  }

}
