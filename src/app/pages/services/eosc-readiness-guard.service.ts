import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {UserService} from "../../../survey-tool/app/services/user.service";
import {Stakeholder} from "../../../survey-tool/app/domain/userInfo";


@Injectable()
export class EoscReadinessGuardService implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let userInfo = this.userService.getCurrentUserInfo();
    if (!this.userService.getCurrentUserInfo()) {
      return this.fail();
    }
    if (userInfo.coordinators.filter(c => c.type === 'eosc-sb').length > 0) {
      return true;
    }
    if (userInfo.stakeholders.filter(c => c.type === 'eosc-sb').length > 0) {
      let stakeHolders: Stakeholder[] = userInfo.stakeholders.filter(c => c.type === 'eosc-sb');
      for (const stakeHolder of stakeHolders) {
        if (stakeHolder.admins.indexOf(userInfo.user.email) >= 0)
          return true;
      }
      return this.fail();
    }

    return this.fail();
  }

  fail(): boolean {
    this.router.navigate(['/']).then();
    return false;
  }
}
