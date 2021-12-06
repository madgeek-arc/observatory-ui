import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SurveyAnswer} from "../domain/survey";

@Injectable()
export class SurveyService {

  options = {withCredentials: true};
  base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {}

  getLatestAnswer(stakeHolderId: string, surveyId: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/latest?stakeholderId=${stakeHolderId}&surveyId=${surveyId}`);
  }

  getPermissions(resourceId: string) {
    return this.http.get<string[]>(this.base + `/permissions?resourceId=${resourceId}`);
  }

  getAnswerValues(answerId: string) {
    return this.http.get<Object>(this.base + `/answers/${answerId}/answer`, this.options);
  }
}
