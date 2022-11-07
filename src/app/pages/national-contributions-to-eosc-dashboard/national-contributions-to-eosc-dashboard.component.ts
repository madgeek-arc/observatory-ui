import {Component, ElementRef, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Stakeholder, UserInfo} from "../../domain/userInfo";
import {UserService} from "../../services/user.service";
import {AuthenticationService} from "../../services/authentication.service";

declare var UIkit;

@Component({
  selector: 'app-national-contributions-to-eosc-dashboard',
  templateUrl: './national-contributions-to-eosc-dashboard.component.html',
  styleUrls: ['../../../app/shared/sidemenudashboard/side-menu-dashboard.component.css','./national-contributions-to-eosc-dashboard.component.css']
})

export class NationalContributionsToEOSCDashboardComponent {

  @ViewChild("nav") nav: ElementRef;

  subscriptions = [];
  open: boolean = true;
  isPoliciesActive: boolean = true;
  isPracticesActive: boolean = false;
  isInvestmentsActive: boolean = false;
  showInvestments: boolean = false;
  userInfo: UserInfo = null;

  constructor(private route: ActivatedRoute, private router: Router,
              private userService: UserService, private authentication: AuthenticationService) {}

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

    if (this.authentication.authenticated) {
      this.subscriptions.push(
        this.userService.getUserInfo().subscribe(
          next => {
            this.userService.setUserInfo(next);
            this.userInfo = next;
            this.showInvestments = this.coordinatorOrManager('country');
          },
          error => {
            console.log(error);
          }
        )
      );
    }
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

  coordinatorOrManager(name: string) {
    if (this.userInfo.coordinators.filter(c => c.type === name).length > 0) {
      return true;
    } else if (this.userInfo.stakeholders.filter(c => c.type === name).length > 0) {
      let stakeHolders: Stakeholder[] = this.userInfo.stakeholders.filter(c => c.type === name);
      for (const stakeHolder of stakeHolders) {
        // console.log(stakeHolder.name);
        if (stakeHolder.managers.indexOf(this.userService.userInfo.user.email) >= 0)
          return true;
      }
      return false
    } else {
      return false
    }

  }
}
