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

  // ======= NATIONAL POLICY ========
  // Publications
  public getQuestion6(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question6","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion6_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question6.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion10(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question10","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion10_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question10.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion14(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question14","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion14_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question14.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion18(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question18","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion18_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question18.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion22(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question22","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion22_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question22.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion26(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question26","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion26_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question26.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion30(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question30","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion30_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question30.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion34(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question34","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion34_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question34.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion38(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question38","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion38_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question38.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion42(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question42","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion42_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question42.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion46(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question46","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion46_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question46.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion50(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question50","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion50_1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question50.1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }




  // ======= FINANCIAL STRATEGY =======
  // Publications
  public getQuestion7(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question7","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion11(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question11","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion15(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question15","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion19(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question19","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion23(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question23","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion27(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question27","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion31(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question31","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion35(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question35","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion39(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question39","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion43(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question43","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion47(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question47","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion51(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question51","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }





  // ======= RPOs =======
  // Publications
  // Data
  // Software
  // Services
  // Infrastructure
  // Skills/Training
  // Assessment
  // Engagement
  public getQuestion8(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question8","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }




  // ======= RFOs =======
  // Publications
  // Data
  // Software
  // Services
  // Infrastructure
  // Skills/Training
  // Assessment
  // Engagement
  public getQuestion9(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question9","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion54(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question54","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion55(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question55","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion56(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question56","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion58(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question58","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }


  // Publications
  // Data
  // Software
  // Services
  // Infrastructure
  // Skills/Training
  // Assessment
  // Engagement

}
