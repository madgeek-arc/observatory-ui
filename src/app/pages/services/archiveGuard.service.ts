import {inject} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from "@angular/router";
import {of} from "rxjs";
import {UserService} from "../../../survey-tool/app/services/user.service";
import {Stakeholder} from "../../../survey-tool/app/domain/userInfo";
import {catchError, switchMap} from "rxjs/operators";
import {AuthenticationService} from "../../../survey-tool/app/services/authentication.service";

export const ArchiveGuardService: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);
  const userService = inject(UserService);

  return userService.getUserInfo().pipe(
    switchMap(res => {
      if (res !== null) {
        if (res.coordinators.filter(c => c.type === 'eosc-sb').length > 0) {
          return of(true);
        }
        if (res.stakeholders.filter(c => c.type === 'eosc-sb').length > 0) {
          let stakeHolders: Stakeholder[] = res.stakeholders.filter(c => c.type === 'eosc-sb');
          for (const stakeHolder of stakeHolders) {
            if (stakeHolder.admins.indexOf(res.user.email) >= 0)
              return of(true);
          }
        }
        return of(false);
      } else {
        console.log('Not authorized');
        router.navigate(["/home"]).then();
        return of(false);
      }
    }),
    catchError(() => {
      console.log('Not authorized 2');
      authenticationService.tryLogin();
      return of(false);
    })
  );

}
