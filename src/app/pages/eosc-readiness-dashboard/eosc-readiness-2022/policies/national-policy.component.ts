import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'national-policy.component.html'
})

export class NationalPolicyComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        console.log(params);
        if (params['type'] === 'publications')
          UIkit.switcher('#topSelector').show(0);
      }
    )
  }
}
