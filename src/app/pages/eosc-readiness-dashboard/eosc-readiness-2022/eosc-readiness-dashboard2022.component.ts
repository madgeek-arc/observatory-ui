import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { UserInfo } from "../../../../survey-tool/app/domain/userInfo";
import { UserService } from "../../../../survey-tool/app/services/user.service";
import { AuthenticationService } from "../../../../survey-tool/app/services/authentication.service";


declare var UIkit;

@Component({
  selector: 'app-national-contributions-to-eosc-dashboard',
  templateUrl: './eosc-readiness-dashboard2022.component.html',
  styleUrls: ['../eosc-readiness-dashboard.component.css'],
})

export class EoscReadinessDashboard2022Component implements OnInit, AfterViewInit {

  @ViewChild("nav") nav: ElementRef;

  subscriptions = [];
  open: boolean = true;
  activeSection: string = null;
  isPracticesActive: boolean = false;
  isInvestmentsActive: boolean = false;
  // showInvestments: boolean = false;
  userInfo: UserInfo = null;
  activeTab: string;

  constructor(private route: ActivatedRoute, private router: Router,
              private userService: UserService, private authentication: AuthenticationService) {

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeSection = this.route.firstChild.snapshot.url[0].path;
        // console.log('activeSection -> ', this.activeSection);
        if (this.activeSection === 'policies' || this.activeSection === 'practices') {
          this.activeTab = this.route.firstChild.firstChild.snapshot.url[0].path
        } else if (this.activeSection === 'general') {
          this.activeTab = this.route.firstChild.snapshot.params['type'];
        } else
          this.activeTab = 'glossary'

        // console.log(this.route.firstChild.snapshot.url[0].path);
      }
    });

  }

  ngAfterViewInit() {
    switch (this.activeSection) {
      case 'general':
        UIkit.nav(this.nav.nativeElement).toggle(0, false);
        break;
      case 'policies':
        UIkit.nav(this.nav.nativeElement).toggle(1, false);
        break;
      case 'practices':
        UIkit.nav(this.nav.nativeElement).toggle(2, false);
        break;
      case 'glossary':
        UIkit.nav(this.nav.nativeElement).toggle(3, false);
        break;
      default:
        UIkit.nav(this.nav.nativeElement).toggle(0, false);
    }
  }

  ngOnInit(): void {
    this.route.firstChild.url.subscribe(url => {
      this.activeSection = url[0]['path'];
    });

    if (this.activeSection === 'policies' || this.activeSection === 'practices') {
      this.route.firstChild.firstChild.url.subscribe(
        next => {
          this.activeTab = next[0].path;
        }
      );
    } else if (this.activeSection === 'general') {
      this.route.firstChild.params.subscribe(
        next => {
          this.activeTab = next['type'];
        }
      )
    } else
      this.activeTab = 'glossary';

  }

  // coordinatorOrManager(name: string) {
  //   let userInfo: UserInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  //   if (userInfo.coordinators.filter(c => c.type === name).length > 0) {
  //     return true;
  //   } else if (userInfo.stakeholders.filter(c => c.type === name).length > 0) {
  //     let stakeHolders: Stakeholder[] = userInfo.stakeholders.filter(c => c.type === name);
  //     // let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  //     for (const stakeHolder of stakeHolders) {
  //       // console.log(stakeHolder.name);
  //       if (stakeHolder.managers.indexOf(userInfo.user.email) >= 0)
  //         return true;
  //     }
  //     return false
  //   } else {
  //     return false
  //   }
  //
  // }

  toggleSidebar() {
    const el: HTMLElement = document.getElementById('sidebar_toggle');
    if (!el.classList.contains('closed')) {
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
