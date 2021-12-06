import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MemberOf, StakeholdersMembers, UserInfo} from "../domain/userInfo";
import {BehaviorSubject} from "rxjs";
import {Paging} from "../../catalogue-ui/domain/paging";
import {Survey} from "../domain/survey";

@Injectable()
export class UserService {

  options = {withCredentials: true};
  base = environment.API_ENDPOINT;

  userId = null;
  currentStakeholderGroup = new BehaviorSubject<MemberOf>(null);

  constructor(public http: HttpClient) {}


  changeCurrentGroup(currentGroup: MemberOf) {
    this.currentStakeholderGroup.next(currentGroup);
  }

  getUserInfo() {
    return this.http.get<UserInfo>(this.base + '/user/info');
  }

  setUserConsent(value: boolean) {
    return this.http.patch(this.base + `/user/consent?consent=${value}`, null);
  }

  getUserSurveys(type: string) {
    return this.http.get<Paging<Survey>>(this.base + `/surveys/type/${type}`);
  }

  getStakeholdersMembers(id: string) {
    return this.http.get<StakeholdersMembers>(this.base + `/stakeholders/${id}/members`);
  }

}
