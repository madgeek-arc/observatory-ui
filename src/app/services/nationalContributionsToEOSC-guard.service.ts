import {Injectable} from "@angular/core";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate, CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import {Observable} from "rxjs";
import {UserService} from "./user.service";
import {Stakeholder} from "../domain/userInfo";


@Injectable()
export class NationalContributionsToEOSCGuardService implements CanActivate {

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) {
  }

  canActivate(childRoute: ActivatedRouteSnapshot,state: RouterStateSnapshot) {
    // const chartId = childRoute.queryParams['chart'];
    // if (chartId == 0 || chartId == 1 || chartId == 2 || chartId == 11 || chartId == 12 || chartId == 13
    //   || chartId == 14 || chartId == 15 || chartId == 16 || chartId == 17){
    //   console.log(childRoute.queryParams['chart'])
    //   return true
    // }
    // else {
      if (!this.userService.userInfo) {
        return this.fail();
      } else {
        if (this.userService.userInfo.coordinators.filter(c => c.type === 'country').length > 0) {
          return true;
        } else if (this.userService.userInfo.stakeholders.filter(c => c.type === 'country').length > 0) {
          let stakeHolders: Stakeholder[] = this.userService.userInfo.stakeholders.filter(c => c.type === 'country');
          for (const stakeHolder of stakeHolders) {
            if (stakeHolder.managers.indexOf(this.userService.userInfo.user.email) >= 0)
              return true;
          }
          return this.fail();
        } else {
          return this.fail();
        }
      // }
    }
  }

  fail(): boolean {
    this.router.navigate(['/']).then();
    return false;
  }
}
