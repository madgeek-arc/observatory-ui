import {Component, OnInit} from "@angular/core";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {LandingPageService} from "../../../services/landing-page.service";

@Component({
  selector: 'app-dataset',
  templateUrl: 'dataset-landing-page.component.ts.html',
  providers: [LandingPageService]
})

export class LandingPageComponent implements OnInit {
  subscriptions = [];
  dataset: Object = null;
  instances: Object[] = null;

  constructor(protected route: ActivatedRoute, protected landingPageService: LandingPageService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.subscriptions.push(
          this.landingPageService.getDataset(params['id']).subscribe(
            res => {
              this.dataset = res;
              this.subscriptions.push(
                this.landingPageService.searchDatasetInstance('dataset_instance', 'type=' + this.dataset['name']).subscribe(
                  res => {
                    this.instances = res['results'];
                  }
                )
              );
            }
          )
        );
      })
    );
  }
}
