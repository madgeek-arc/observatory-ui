import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import {UserService} from "../../../survey-tool/app/services/user.service";
import {Stakeholder} from "../../../survey-tool/app/domain/userInfo";
import { AuthenticationService } from "../../../survey-tool/app/services/authentication.service";
import { catchError, switchMap } from "rxjs/operators";
import { of } from "rxjs";

export const EoscReadinessGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);
  const userService = inject(UserService);

  if (!authenticationService.authenticated) {

    router.navigate(['/home']).then();
    return false;
  }

  return userService.getUserInfo().pipe(
    switchMap(res => {
      let userInfo = res;
      // if (!userService.getCurrentUserInfo()) {
      //   return of(false);
      // }
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

      router.navigate(['/home']).then();
      return of(false);
    }),
    catchError(() => {
      // console.log('Not authorized 2');
      authenticationService.tryLogin();
      return of(false);
    })
  );
}


//
// @Injectable()
// export class EoscReadinessGuardService {
//
//   constructor(private userService: UserService, private router: Router) {
//   }
//
//   canActivate(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
//     let userInfo = this.userService.getCurrentUserInfo();
//     if (!this.userService.getCurrentUserInfo()) {
//       return this.fail();
//     }
//     if (userInfo.coordinators.filter(c => c.type === 'eosc-sb').length > 0) {
//       return true;
//     }
//     if (userInfo.stakeholders.filter(c => c.type === 'eosc-sb').length > 0) {
//       let stakeHolders: Stakeholder[] = userInfo.stakeholders.filter(c => c.type === 'eosc-sb');
//       for (const stakeHolder of stakeHolders) {
//         if (stakeHolder.admins.indexOf(userInfo.user.email) >= 0)
//           return true;
//       }
//       return this.fail();
//     }
//
//     return this.fail();
//   }
//
//   fail(): boolean {
//     this.router.navigate(['/']).then();
//     return false;
//   }
// }
