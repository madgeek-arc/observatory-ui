// import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
// import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
// import { UserInfo } from "../../../../survey-tool/app/domain/userInfo";
//
// declare var UIkit;
//
// @Component({
//     selector: 'app-national-contributions-to-eosc-dashboard',
//     templateUrl: './eosc-readiness-dashboard.component.html',
//     styleUrls: ['../eosc-readiness-dashboard.component.css'],
//     standalone: false
// })
//
// export class EoscReadinessDashboardComponent implements OnInit, AfterViewInit {
//
//   @ViewChild("nav") nav: ElementRef;
//
//   open: boolean = true;
//   activeSection: string = null;
//   userInfo: UserInfo = null;
//   year: string = null;
//   activeTab: string;
//
//   constructor(private route: ActivatedRoute, private router: Router) {
//
//     this.router.events.subscribe((event: any) => {
//       if (event instanceof NavigationEnd) {
//         this.activeSection = this.route.firstChild.snapshot.url[0].path;
//         // console.log('activeSection -> ', this.activeSection);
//         if (this.activeSection === 'policies' || this.activeSection === 'practices') {
//           this.activeTab = this.route.firstChild.firstChild.snapshot.url[0].path
//         } else if (this.activeSection === 'general') {
//           this.activeTab = this.route.firstChild.snapshot.params['type'];
//         } else
//           this.activeTab = 'glossary'
//
//         // console.log('activeTab -> ', this.activeTab);
//       }
//     });
//
//   }
//
//   ngAfterViewInit() {
//     this.initDropNavigation(this.activeSection);
//   }
//
//   ngOnInit(): void {
//
//     this.route.firstChild.url.subscribe(url => {
//       this.activeSection = url[0]['path'];
//     });
//
//     if (this.activeSection === 'policies' || this.activeSection === 'practices') {
//       this.route.firstChild.firstChild.url.subscribe(
//         next => {
//           this.activeTab = next[0].path;
//         }
//       );
//     } else if (this.activeSection === 'general') {
//       this.route.firstChild.params.subscribe(
//         next => {
//           this.activeTab = next['type'];
//         }
//       )
//     } else
//       this.activeTab = 'glossary';
//
//
//     this.route.paramMap.subscribe({
//       next: value => {
//         if (this.year && this.year !== value.get('year')) {
//
//           this.route.firstChild.url.subscribe(url => {
//             if (this.activeSection !== url[0]['path']) {
//               this.activeSection = url[0]['path'];
//               this.initDropNavigation(this.activeSection);
//             }
//           });
//
//         }
//         this.year = value.get('year');
//       }
//     });
//
//   }
//
//   initDropNavigation(activeSection: string): void {
//     // console.log(UIkit.nav(this.nav.nativeElement));
//     switch (activeSection) {
//       case 'general':
//         UIkit.nav(this.nav.nativeElement).toggle(0, false);
//         break;
//       case 'policies':
//         UIkit.nav(this.nav.nativeElement).toggle(1, false);
//         break;
//       case 'practices':
//         UIkit.nav(this.nav.nativeElement).toggle(2, false);
//         break;
//       case 'glossary':
//         UIkit.nav(this.nav.nativeElement).toggle(3, false);
//         break;
//       default:
//         UIkit.nav(this.nav.nativeElement).toggle(0, false);
//     }
//   }
//
//
//   toggleSidebar() {
//     const el: HTMLElement = document.getElementById('sidebar_toggle');
//     if (!el.classList.contains('closed')) {
//       el.classList.add('closed');
//       const el1: HTMLElement = document.getElementById('sidebar_main_content');
//       el1.classList.remove('sidebar_main_active');
//       el1.classList.add('sidebar_main_inactive');
//     } else {
//       el.classList.remove('closed');
//       const el1: HTMLElement = document.getElementById('sidebar_main_content');
//       el1.classList.add('sidebar_main_active');
//       el1.classList.remove('sidebar_main_inactive');
//     }
//   }
// }
import { Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from "@angular/router";
import { DashboardSideMenuComponent, MenuItem, MenuSection} from "../../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.component";
import { DashboardSideMenuService} from "../../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";
import { FormsModule} from "@angular/forms";
import { NgIf} from "@angular/common";
import {IconsService} from "../../../../survey-tool/app/shared/icons/icons.service";
import {exploreIcons} from "../../explore/explore.icons";

@Component({
  standalone: true,
  selector: 'app-readiness',
  imports: [
    DashboardSideMenuComponent,
    RouterOutlet,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './eosc-readiness-dashboard.component.html'
})

export class EoscReadinessDashboardComponent implements OnInit {
  menuItems: MenuItem[] = [];
  menuSections: MenuSection[] = [];
  year: string = '2024';

  hasSidebar = true;
  hasAdminMenu = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private layoutService: DashboardSideMenuService, private iconService: IconsService) { }

  ngOnInit() {
    this.iconService.registerIcons(exploreIcons);

    this.initMenuItems();

    this.layoutService.setOpen(true);

  }

  initMenuItems() {
    const BASE_PATH = `/eoscreadiness/${this.year}`;
    const defaultRoute = `${BASE_PATH}/general/researchers`;
    this.menuItems.push(new MenuItem('0', 'General', null, defaultRoute, defaultRoute, {name: 'clear_all'}));
    // General with all subitems
    this.menuItems[0].items.push(new MenuItem('0-0', 'Researchers', null, `${BASE_PATH}/general/researchers`, null));
    this.menuItems[0].items.push(new MenuItem('0-1', 'RPOs', null, `${BASE_PATH}/general/RPOs`, null, {name: ''}));
    this.menuItems[0].items.push(new MenuItem('0-2', 'RFOs', null, `${BASE_PATH}/general/RFOs`, null, {name: ''}));
    this.menuItems[0].items.push(new MenuItem('0-3', 'Repositories', null, `${BASE_PATH}/general/repositories`, null, {name: ''}));
    this.menuItems[0].items.push(new MenuItem('0-4', 'Investments', null, `${BASE_PATH}/general/investments`, null, {name: ''}));

    // Default  Policies Route
    const defaultPoliciesRoute = `${BASE_PATH}/policies/nationalPolicy/all`;
    this.menuItems.push(new MenuItem('1', 'EOSC Policies', null, defaultPoliciesRoute, defaultPoliciesRoute, {name: 'policy'}));
    // Policies with all subitems
    this.menuItems[1].items.push(new MenuItem('1-0', 'National Policy', null, defaultPoliciesRoute, null, {name: ''}));
    this.menuItems[1].items.push(new MenuItem('1-1', 'Financial Strategy', null, `${BASE_PATH}/policies/financialStrategy/all`,null,  {name: ''}));
    this.menuItems[1].items.push(new MenuItem('1-2', 'RPOs with Policy', null, `${BASE_PATH}/policies/RPOs/all`, null, {name: ''}));
    this.menuItems[1].items.push(new MenuItem('1-3', 'RFOs with Policy', null, `${BASE_PATH}/policies/RPOs/all`, null, {name: ''}));

    // Default Practices Route
    const defaultPracticesRoute = `${BASE_PATH}/practices/nationalMonitoring/all`;
    this.menuItems.push(new MenuItem('2', 'EOSC Practices', null, defaultPracticesRoute, null, {name: 'assignment'}));
    // Practices with all subitems
    this.menuItems[2].items.push(new MenuItem('2-0', 'Monitoring', null, defaultPracticesRoute, null, {name: ''}));
    this.menuItems[2].items.push(new MenuItem('2-1', 'Use Cases', null, `${BASE_PATH}/practices/useCases/all`, null, {name: ''}));
    this.menuItems[2].items.push(new MenuItem('2-2', 'Investments', null, `${BASE_PATH}/practices/investments/all`, null, {name: ''}));
    this.menuItems[2].items.push(new MenuItem('2-3', 'Outputs', null, `${BASE_PATH}/practices/outputs/all`, null, {name: ''}));

    //Glossary
    const glossaryRoute = `${BASE_PATH}/glossary`;
    this.menuItems.push(new MenuItem('3', 'Glossary', null, glossaryRoute, null, {name: 'auto_stories'}));

    this.menuSections.push({items: this.menuItems});
  }

  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }
}
