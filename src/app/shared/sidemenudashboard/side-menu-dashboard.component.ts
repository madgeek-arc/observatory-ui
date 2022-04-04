import {Component, Input, OnInit, ViewChild} from "@angular/core";
import {Coordinator, Stakeholder} from "../../domain/userInfo";
import {UserService} from "../../services/user.service";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-side-menu-dashboard',
  templateUrl: 'side-menu-dashboard.component.html',
  styleUrls: ['./side-menu-dashboard.component.css']
})

export class SideMenuDashboardComponent implements OnInit {

  subscriptions = [];
  toggle: number[] = [];
  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  ready = false;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(next => {
        this.currentStakeholder = next;
        if (this.currentStakeholder !== null) {
          this.ready = true;
        }
      })
    );
    this.subscriptions.push(
      this.userService.currentCoordinator.subscribe(next => {
        this.currentCoordinator = next;
        if (this.currentCoordinator !== null) {
          this.ready = true;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

}
