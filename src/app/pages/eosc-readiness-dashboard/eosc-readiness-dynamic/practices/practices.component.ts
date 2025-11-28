import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import * as UIkit from 'uikit';

@Component({
    selector: 'app-practices-2022',
    templateUrl: 'practices.component.html',
    standalone: false
})

export class PracticesComponent implements OnInit {

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
