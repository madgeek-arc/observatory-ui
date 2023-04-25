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
  public getQuestion8(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question8","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion12(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question12","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion16(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question16","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion20(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question20","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion24(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question24","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion28(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question28","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion32(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question32","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion36(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question36","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion40(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question40","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion44(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question44","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion48(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question48","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion52(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question52","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }





  // ======= RFOs =======
  // Publications
  public getQuestion9(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question9","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion13(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question13","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion17(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question17","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion21(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question21","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion25(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question25","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion29(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question29","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion33(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question33","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion37(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question37","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion41(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question41","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion45(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question45","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion49(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question49","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion53(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question53","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }







  // ======= NATIONAL MONITORING =======
  // Publications
  public getQuestion54(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question54","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion58(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question58","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion62(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question62","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion66(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question66","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion70(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question70","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion74(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question74","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion78(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question78","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion82(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question82","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion86(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question86","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion90(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question90","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion94(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question94","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion98(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question98","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }






  // ======= USE CASES =======
  // Publications
  public getQuestion55(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question55","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion59(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question59","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion63(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question63","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion67(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question67","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion71(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question71","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion75(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question75","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion79(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question79","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion83(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question83","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion87(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question87","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion91(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question91","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion95(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question95","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion99(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question99","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }







  // ======= FINANCIAL INVESTMENTS =======
  // Publications
  public getQuestion56(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question56","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion60(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question60","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }
  public getQuestion64(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question64","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion68(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question68","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion72(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question72","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion76(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question76","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion80(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question80","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion84(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question84","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion88(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question88","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion92(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question92","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion96(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question96","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion100(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question100","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }





  // ======= OUTPUTS =======
  // Publications
  public getQuestion57(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question57","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion61(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question61","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion65(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question65","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion69(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question69","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion73(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question73","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion77(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question77","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion81(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question81","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion85(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question85","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion89(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question89","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion93(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question93","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion97(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question97","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion101(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question101","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

}
