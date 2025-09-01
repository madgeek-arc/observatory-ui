import { Injectable } from "@angular/core";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { UserService } from "../../../survey-tool/app/services/user.service";

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(public router: Router, private userService: UserService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((response: HttpErrorResponse) => {
        // console.log("error is intercept", response);
        if (response.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', response.error.message);
        } else {
          if (response.status === 401) {
            // console.log('trying to login');
            // this.authenticationService.tryLogin();
            this.userService.clearUserInfo();
            // this.router.navigate(['/']);
          }
        }
        return throwError(response.error);
      })
    );
  }
}
