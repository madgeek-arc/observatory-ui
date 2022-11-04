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
  isPracticesActive: boolean = false;
  isInvestmentsActive: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngAfterViewInit() {
    // UIkit.nav(this.nav.nativeElement).toggle(this.activeIndex, false);
    UIkit.nav(this.nav.nativeElement).toggle(0, false);
  }

  ngOnInit(): void {

    this.router.events.subscribe((url:any) =>  {
      // console.log(url.url);
      if (url.url) {
        this.isPoliciesActive = (url.url.indexOf('policies') > -1);
        this.isPracticesActive = (url.url.indexOf('practices') > -1);
        this.isInvestmentsActive = (url.url.indexOf('investments') > -1);
      }
      // console.log(this.isPoliciesActive);
    });
  }

  updateUrlPathParam(chartId: number) {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { chart: chartId },
        queryParamsHandling: 'merge'
      });
  }
}
