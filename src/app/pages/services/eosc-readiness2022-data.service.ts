import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {RawData} from "../../../survey-tool/app/domain/raw-data";


const headerOptions = {
  headers : new HttpHeaders().set('Content-Type', 'application/json')
    .set('Accept', 'application/json'),
};

@Injectable ()
export class EoscReadiness2022DataService {

  private statsAPIURL = environment.STATS_API_ENDPOINT + 'raw?json=';
  private profileName = environment.profileName;
  private OSOStatsAPIURL = environment.OSO_STATS_API_ENDPOINT + 'raw?json=';
  private osoProfileName = environment.osoStatsProfileName;

  constructor(private httpClient: HttpClient) {
  }

  public getQuestion6(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question6","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion6_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question6.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion7(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question7","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion8(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question8","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

}
