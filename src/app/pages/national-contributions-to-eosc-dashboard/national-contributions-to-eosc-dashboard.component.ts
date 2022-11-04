import {Component, ElementRef, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

declare var UIkit;

@Component({
  selector: 'app-national-contributions-to-eosc-dashboard',
  templateUrl: './national-contributions-to-eosc-dashboard.component.html',
  styleUrls: ['../../../app/shared/sidemenudashboard/side-menu-dashboard.component.css','./national-contributions-to-eosc-dashboard.component.css']
})

export class NationalContributionsToEOSCDashboardComponent {

  @ViewChild("nav") nav: ElementRef;

  open: boolean = true;
  isPoliciesActive: boolean = true;

  ngAfterViewInit() {
    // UIkit.nav(this.nav.nativeElement).toggle(this.activeIndex, false);
    UIkit.nav(this.nav.nativeElement).toggle(0, false);
  }

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    // console.log(this.route);
    // this.route.url.subscribe(url => {
    //   console.log('URL --> ', url);
    // });
    this.router.events.subscribe((url:any) =>  {
        // console.log(url.url);
      this.isPoliciesActive = url.url === '/nationalContributionsToEOSC/policies';
      // console.log(this.isPoliciesActive);
    });
    // console.log(this.router.url);  // to print only path eg:"/login"
  }
}
