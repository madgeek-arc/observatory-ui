import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Coordinator, Stakeholder, StakeholdersMembers, UserInfo} from "../domain/userInfo";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class UserService {

  options = {withCredentials: true};
  base = environment.API_ENDPOINT;

  userId = null;
  currentStakeholder = new BehaviorSubject<Stakeholder>(null);
  currentCoordinator = new BehaviorSubject<Coordinator>(null);

  constructor(public http: HttpClient) {}


  changeCurrentStakeholder(currentGroup: Stakeholder) {
    this.currentStakeholder.next(currentGroup);
    sessionStorage.setItem('currentStakeholder', currentGroup.id);
    sessionStorage.removeItem('currentCoordinator');
    this.currentCoordinator.next(null);
  }

  changeCurrentCoordinator(currentCoordinator: Coordinator) {
    this.currentCoordinator.next(currentCoordinator);
    sessionStorage.setItem('currentCoordinator', currentCoordinator.id);
    sessionStorage.removeItem('currentStakeholder');
    this.currentStakeholder.next(null);
  }

  getUserInfo() {
    return this.http.get<UserInfo>(this.base + '/user/info');
  }

  setUserConsent(value: boolean) {
    return this.http.patch(this.base + `/user/consent?consent=${value}`, null);
  }

  getStakeholdersMembers(id: string) {
    return this.http.get<StakeholdersMembers>(this.base + `/stakeholders/${id}/members`, this.options);
  }

}
