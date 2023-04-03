import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";

import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'national-policy.component.html'
})

export class NationalPolicyComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        // console.log('policies component params');
        console.log(params);
        if (params['type'] === 'publications')
          UIkit.switcher('#topSelector').show(0);
        if (params['type'] === 'data')
          UIkit.switcher('#topSelector').show(1);
      }
    );
  }

}
