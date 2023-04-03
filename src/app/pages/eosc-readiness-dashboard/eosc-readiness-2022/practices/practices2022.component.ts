import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import UIkit from "uikit";

@Component({
  selector: 'app-practices-2022',
  templateUrl: 'practices2022.component.html'
})

export class Practices2022Component implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        // console.log('practice component params');
        // console.log(params);
        if (params['type'] === 'publications')
          UIkit.switcher('#topSelector').show(0);
      }
    )
  }
}
