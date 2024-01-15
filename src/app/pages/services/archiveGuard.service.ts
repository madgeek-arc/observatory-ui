import {Injectable} from "@angular/core";
import {CanActivateChild, Router, UrlTree} from "@angular/router";
import {Observable, of} from "rxjs";
import {UserService} from "../../../survey-tool/app/services/user.service";
import {Stakeholder, UserInfo} from "../../../survey-tool/app/domain/userInfo";
import {switchMap} from "rxjs/operators";

@Injectable()
export class ArchiveGuardService implements CanActivateChild {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // if (!this.userService.getCurrentUserInfo()) {
    //   return this.fail();
    // }

    return this.userService.getUserInfo().pipe(
      switchMap(res => {
        if (res !== null) {
          return this.checkForAccess(res);
        } else {
          console.log('Not authorized');
          this.router.navigate(["/home"]).then();
          return of(false);
        }
      })
    );

  }

  checkForAccess(userInfo: UserInfo) {
    if (userInfo.coordinators.filter(c => c.type === 'eosc-sb').length > 0) {
      return of(true);
    }
    if (userInfo.stakeholders.filter(c => c.type === 'eosc-sb').length > 0) {
      let stakeHolders: Stakeholder[] = userInfo.stakeholders.filter(c => c.type === 'eosc-sb');
      for (const stakeHolder of stakeHolders) {
        if (stakeHolder.admins.indexOf(userInfo.user.email) >= 0)
          return of(true);
      }
    }
    return of(false);
  }

  fail(): boolean {
    this.router.navigate(['/']).then();
    return false;
  }
}
