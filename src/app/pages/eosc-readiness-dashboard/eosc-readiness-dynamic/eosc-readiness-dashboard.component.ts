import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { UserInfo } from "../../../../survey-tool/app/domain/userInfo";

declare var UIkit;

@Component({
    selector: 'app-national-contributions-to-eosc-dashboard',
    templateUrl: './eosc-readiness-dashboard.component.html',
    styleUrls: ['../eosc-readiness-dashboard.component.css'],
    standalone: false
})

export class EoscReadinessDashboardComponent implements OnInit, AfterViewInit {

  @ViewChild("nav") nav: ElementRef;

  open: boolean = true;
  activeSection: string = null;
  userInfo: UserInfo = null;
  year: string = null;
  activeTab: string;

  constructor(private route: ActivatedRoute, private router: Router) {

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

        // console.log('activeTab -> ', this.activeTab);
      }
    });

  }

  ngAfterViewInit() {
    this.initDropNavigation(this.activeSection);
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


    this.route.paramMap.subscribe({
      next: value => {
        if (this.year && this.year !== value.get('year')) {

          this.route.firstChild.url.subscribe(url => {
            if (this.activeSection !== url[0]['path']) {
              this.activeSection = url[0]['path'];
              this.initDropNavigation(this.activeSection);
            }
          });

        }
        this.year = value.get('year');
      }
    });

  }

  initDropNavigation(activeSection: string): void {
    // console.log(UIkit.nav(this.nav.nativeElement));
    switch (activeSection) {
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
