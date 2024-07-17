import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Stakeholder, UserInfo} from "../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../survey-tool/app/services/user.service";
import {AuthenticationService} from "../../../../survey-tool/app/services/authentication.service";

declare var UIkit;

@Component({
  selector: 'app-national-contributions-to-eosc-dashboard',
  templateUrl: './eosc-readiness-dashboard.component2021.html',
  styleUrls: ['../eosc-readiness-dashboard.component.css'],
})

export class EoscReadinessDashboardComponent2021 implements OnInit, AfterViewInit{

  @ViewChild("nav") nav: ElementRef;

  subscriptions = [];
  open: boolean = true;
  isPoliciesActive: boolean = false;
  isPracticesActive: boolean = false;
  isInvestmentsActive: boolean = false;
  showInvestments: boolean = false;
  userInfo: UserInfo = null;
  activeLink: number = 0;

  constructor(private route: ActivatedRoute, private router: Router,
              private userService: UserService, private authentication: AuthenticationService) {}

  ngAfterViewInit() {
    if (this.isPoliciesActive)
      UIkit.nav(this.nav.nativeElement).toggle(0, false);
    if (this.isPracticesActive)
      UIkit.nav(this.nav.nativeElement).toggle(1, false);
    if (this.isInvestmentsActive)
      UIkit.nav(this.nav.nativeElement).toggle(2, false);
  }

  ngOnInit(): void {
    this.route.children[0].url.subscribe( url => {
      this.isPoliciesActive = (url[0]['path'] === 'policies');
      this.isPracticesActive = (url[0]['path'] === 'practices');
      this.isInvestmentsActive = (url[0]['path'] === 'investments');
    })

    this.router.events.subscribe((url:any) =>  {
      if (url.url) {
        this.isPoliciesActive = (url.url.indexOf('policies') > -1);
        this.isPracticesActive = (url.url.indexOf('practices') > -1);
        this.isInvestmentsActive = (url.url.indexOf('investments') > -1);
      }
    });

    this.route.queryParams.subscribe(
      queryParams => {
        if (queryParams['chart'])
          this.activeLink = queryParams['chart'];
        else
          this.updateUrlPathParam(0);
      }
    );

    if (this.authentication.authenticated) {
      this.showInvestments = this.coordinatorOrManager('eosc-sb');
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
    let userInfo: UserInfo = this.userService.getCurrentUserInfo();
    if (userInfo.coordinators.filter(c => c.type === name).length > 0) {
      return true;
    } else if (userInfo.stakeholders.filter(c => c.type === name).length > 0) {
      let stakeHolders: Stakeholder[] = userInfo.stakeholders.filter(c => c.type === name);
      // let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      for (const stakeHolder of stakeHolders) {
        // console.log(stakeHolder.name);
        if (stakeHolder.admins.indexOf(userInfo.user.email) >= 0)
          return true;
      }
      return false
    } else {
      return false
    }

  }

  toggleSidebar() {
    const el: HTMLElement = document.getElementById('sidebar_toggle');
    if(!el.classList.contains('closed')) {
      el.classList.add('closed');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.remove('sidebar_main_active');
      el1.classList.add('sidebar_main_inactive');
    } else {
      el.classList.remove('closed');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.add('sidebar_main_active');
      el1.classList.remove('sidebar_main_inactive');
    }
  }
}
