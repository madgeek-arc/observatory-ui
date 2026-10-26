import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";


// declare var UIkit;

@Component({
    selector: 'app-custom-search',
    templateUrl: './custom-search.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class CustomSearchComponent implements OnInit {

  ngOnInit() {
  }
}
