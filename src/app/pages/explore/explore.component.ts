import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
})

export class ExploreComponent implements OnInit {

  open: boolean = true;
  activeSection: string = null;


  ngOnInit() {}
}
