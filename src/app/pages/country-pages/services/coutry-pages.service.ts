import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class SurveyPublicAnswer {
  private base = environment.API_ENDPOINT;
  private os_europe = environment.OS_EUROPE_API_ENDPOINT;

  constructor(private http: HttpClient) {}

  getAnswer(stakeholderId: string, surveyId: string) {
    let params = new HttpParams();
    params = params.append('stakeholderId', stakeholderId);
    params = params.append('surveyId', surveyId);
    return this.http.get<Object>(this.base + '/answers/public', {params});
  }

  getOSAnswer(stakeholderId: string, surveyId: string) {
    let params = new HttpParams();
    params = params.append('stakeholderId', stakeholderId);
    params = params.append('surveyId', surveyId);
    return this.http.get<Object>(this.os_europe + '/answers/public', {params});
  }
}
