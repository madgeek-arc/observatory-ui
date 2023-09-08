import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {MessagingSystemService} from "./messaging-system.service";
import {BehaviorSubject} from "rxjs";

declare var SockJS;
declare var Stomp;

const URL = environment.WS_ENDPOINT;

@Injectable()
export class MessagingWebsocketService {

  stompClient: Promise<typeof Stomp>;
  // msg: BehaviorSubject<UnreadMessages> = new BehaviorSubject<UnreadMessages>(null);

  constructor(private messagingService: MessagingSystemService) {}

  initializeWebSocketConnection(topic: string) {
    const ws = new SockJS(URL);
    const that = this;

    this.stompClient = new Promise((resolve, reject) => {
      let stomp = Stomp.over(ws);

      stomp.debug = null; // removes debug logs
      stomp.connect({}, function(frame) {
        const timer = setInterval(() => {
          if (stomp.connected) {
            clearInterval(timer);
            stomp.subscribe(`${topic}`, (message) => {
              if (message.body) {
                that.messagingService.unreadMessages.next(JSON.parse(message.body))
                // that.msg.next(JSON.parse(message.body));
              }
            });
            resolve(stomp);
          }
        }, 500);
      }, function (error) {
        setTimeout( () => {that.initializeWebSocketConnection(topic)}, 1000);
        console.log('STOMP: Reconnecting...');
      });
    });

    this.stompClient.then(client => client.ws.onclose = (event) => {
      // this.msg.next(null);
      this.initializeWebSocketConnection(topic);
    });
  };


  WsJoin(path: string, action: string) {
    this.stompClient.then( client => client.send(`${path}`, {}, action));
  }
}
