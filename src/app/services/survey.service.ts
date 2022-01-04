import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Survey, SurveyAnswer} from "../domain/survey";
import {Paging} from "../../catalogue-ui/domain/paging";
import {StakeholdersMembers} from "../domain/userInfo";

@Injectable()
export class SurveyService {

  options = {withCredentials: true};
  base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {}

  getLatestAnswer(stakeHolderId: string, surveyId: string) {
    return this.http.get<SurveyAnswer>(this.base + `/answers/latest?stakeholderId=${stakeHolderId}&surveyId=${surveyId}`, this.options);
  }

  changeAnswerValidStatus(answerId: string, valid: boolean) {
    return this.http.patch<SurveyAnswer>(this.base + `/answers/${answerId}/validation?validated=${valid}`, null, this.options);
  }

  getSurveys(id: string) {
    return this.http.get<Paging<Survey>>(this.base + `/surveys?stakeholderId=${id}`);
  }

  getSurvey(surveyId: string) {
    return this.http.get<Survey>(this.base + `/surveys/${surveyId}`);
  }

  getPermissions(resourceId: string) {
    return this.http.get<string[]>(this.base + `/permissions?resourceId=${resourceId}`);
  }

  getAnswerValues(answerId: string) {
    return this.http.get<Object>(this.base + `/answers/${answerId}/answer`, this.options);
  }

  addContributor(stakeholderId: string, email: string) {
    return this.http.post<StakeholdersMembers>(this.base + `/stakeholders/${stakeholderId}/contributors`, email, this.options);
  }

  removeContributor(stakeholderId: string, email: string) {
    return this.http.delete<StakeholdersMembers>(this.base + `/stakeholders/${stakeholderId}/contributors/${email}`, this.options);
  }

}
