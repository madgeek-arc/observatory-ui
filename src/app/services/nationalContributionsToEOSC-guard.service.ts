import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {UserService} from "./user.service";


@Injectable()
export class NationalContributionsToEOSCGuardService implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.userService.userInfo) {
      this.router.navigate(['/']).then();
      return false;
    } else {
      if (this.userService.userInfo.coordinators.filter(c => c.type === 'country').length > 0) {
        return true;
      } else {
        this.router.navigate(['/']).then();
        return false;
      }
    }

  }
}
