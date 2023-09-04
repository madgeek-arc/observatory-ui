import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {UserService} from "../../../survey-tool/app/services/user.service";
import {Stakeholder} from "../../../survey-tool/app/domain/userInfo";

@Injectable()
export class ArchiveGuardService implements CanActivateChild {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.userService.userInfo) {
      return this.fail();
    }
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
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
