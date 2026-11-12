import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import * as UIkit from 'uikit';

@Component({
    selector: 'app-practices-2022',
    templateUrl: 'practices.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet]
})

export class PracticesComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
