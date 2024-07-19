import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadinessDataService} from "../../../services/eosc-readiness-data.service";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../services/data-handler.service";

@Component({
  selector: 'app-policies2022',
  templateUrl: 'policies2022.component.html'
})

export class Policies2022Component implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadinessDataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
  }


}
