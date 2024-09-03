import { Component, OnInit } from "@angular/core";
import {ActivatedRoute} from "@angular/router";


// declare var UIkit;

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
})

export class ExploreComponent implements OnInit {

  open: boolean = true;
  activeSection: string = null;

  constructor(private route: ActivatedRoute) {
  }
  ngOnInit() {
    console.log(this.route.firstChild.snapshot.params);
  }
}
