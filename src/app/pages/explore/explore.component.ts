import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styles: []
})

export class ExploreComponent implements OnInit {

  open: boolean = true;
  activeSection: string = null;


  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {

    this.router.events.subscribe(event => {

      if (event instanceof NavigationEnd) {

        if (event.url.includes('open-science-by-area') && event.url.split('/').length === 4) {
          console.log(event.url);
        }
      }
    })
  }

  linkIsActive(event, name: string) {
    console.log(name+' active: '+event);
  }
}
