import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SurveyAnswer} from "../domain/survey";

@Injectable()
export class SurveyService {
  base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {}

  getLatestAnswer(stakeHolderId: string, surveyId: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/latest?stakeholderId=${stakeHolderId}&surveyId=${surveyId}`);
  }

  getPermissions(resourceId: string, userId: string) {
    return this.http.get<string[]>(this.base + `/permissions?resourceId=${resourceId}&userId=${userId}`);
  }
}
