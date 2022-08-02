import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {UserService} from "./user.service";
import {Stakeholder} from "../domain/userInfo";


@Injectable()
export class NationalContributionsToEOSCGuardService implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

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
    }

  }

  fail(): boolean {
    this.router.navigate(['/']).then();
    return false;
  }
}
