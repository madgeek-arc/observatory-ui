import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { BehaviorSubject } from "rxjs";
import { UserActivity } from "../domain/userInfo";

declare var SockJS;
declare var Stomp;

const URL = environment.WS_ENDPOINT;

export class Revision {
  field: string;
  value: string;
}

@Injectable()
export class WebsocketService {
  private surveyAnswerId: string | null = null;

  stompClient: Promise<typeof Stomp>;
  activeUsers: BehaviorSubject<UserActivity[]> = new BehaviorSubject<UserActivity[]>(null);
  stompClientEdit: Promise<typeof Stomp>;
  edit: BehaviorSubject<Revision> = new BehaviorSubject<Revision>(null);

  count1 = 0;
  count2 = 0;

  constructor() {}

  initializeWebSocketConnection(id: string, resourceType: string, action?: string) {
    const ws = new SockJS(URL);
    const that = this;

    this.surveyAnswerId = id;

    this.stompClient = new Promise((resolve, reject) => {
      let stomp = Stomp.over(ws);

      stomp.debug = null;
      stomp.connect({}, function(frame) {
        const timer = setInterval(() => {
          if (stomp.connected) {
            clearInterval(timer);
            that.count1 = 0;
            stomp.subscribe(`/topic/active-users/${resourceType}/${that.surveyAnswerId}`, (message) => {
              if (message.body) {
                that.activeUsers.next(JSON.parse(message.body));
                console.log(that.activeUsers);
              }
            });
            // that.WsJoin(id, resourceType, action);
            resolve(stomp);
          }
        }, 1000);
      }, function (error) {
        let timeout = 1000;
        that.count1 > 20 ? timeout = 10000 : that.count1++ ;
        setTimeout( () => {
          that.initializeWebSocketConnection(that.surveyAnswerId, resourceType)
        }, timeout);
        console.log('STOMP: Reconnecting...'+ that.count1);
      });
    });

    this.stompClient.then(client => client.ws.onclose = (event) => {
      this.activeUsers.next(null);
      this.initializeWebSocketConnection(that.surveyAnswerId, resourceType);
    });
  };

  initializeWebSocketEditConnection(id: string, resourceType: string, action?: string) {
    const ws = new SockJS(URL);
    const that = this;

    this.surveyAnswerId = id;

    this.stompClientEdit = new Promise((resolve, reject) => {
      let stomp = Stomp.over(ws);

      stomp.debug = null;
      stomp.connect({}, function(frame) {
        const timer = setInterval(() => {
          if (stomp.connected) {
            clearInterval(timer);
            that.count2 = 0;
            stomp.subscribe(`/topic/edit/${resourceType}/${that.surveyAnswerId}`, (message) => {
              if (message.body) {
                that.edit.next(JSON.parse(message.body));
                console.log(that.edit);
              }
            });
            // that.WsJoin(id, resourceType, action);
            resolve(stomp);
          }
        }, 1000);
      }, function (error) {
        let timeout = 1000;
        that.count2 > 20 ? timeout = 10000 : that.count2++ ;
        setTimeout( () => {
          that.initializeWebSocketEditConnection(that.surveyAnswerId, resourceType)
        }, timeout);
        console.log('STOMP: Reconnecting...'+ that.count2);
      });
    });

    this.stompClientEdit.then(client => client.ws.onclose = (event) => {
      this.edit.next(null);
      this.initializeWebSocketEditConnection(that.surveyAnswerId, resourceType);
    });
  }

  WsLeave(id: string, resourceType: string, action: string) { // {} is for headers
    this.stompClient.then( client => client.send(`/app/leave/${resourceType}/${this.surveyAnswerId}`, {}, action));
  }

  WsJoin(id: string, resourceType: string, action: string) {
    this.stompClient.then( client => client.send(`/app/join/${resourceType}/${this.surveyAnswerId}`, {}, action));
  }

  WsFocus(resourceType: string, field?: string, value?: string) {
    this.stompClient.then( client => client.send(`/app/focus/${resourceType}/${this.surveyAnswerId}/${field}`, {}, value));
  }

  WsEdit(resourceType: string, field: string, value: Revision) {
    this.stompClientEdit.then( client => client.send(`/app/edit/${resourceType}/${this.surveyAnswerId}`, {}, value));
  }
}
