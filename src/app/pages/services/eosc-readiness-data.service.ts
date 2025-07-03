import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { ChartData, Data, RawData } from "../../domain/raw-data";


const headerOptions = {
  headers : new HttpHeaders().set('Content-Type', 'application/json')
    .set('Accept', 'application/json'),
};

@Injectable ({providedIn: 'root'})
export class EoscReadinessDataService {

  private statsAPIURL = environment.STATS_API_ENDPOINT + 'raw?json=';
  private profileName = environment.profileName;
  private OSOStatsAPIURL = environment.OSO_STATS_API_ENDPOINT ;
  private osoProfileName = environment.osoStatsProfileName;

  constructor(private httpClient: HttpClient) {}

  // ======= DYNAMIC ========
  getQuestion(year: string, name: string): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.${year}.${name}","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  getQuestionComment(year: string, name: string): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.${year}.${name}.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // ======= EXPLORE =======

  getOSOStats(JSONString: string): Observable<Data> {
    return this.httpClient.get<Data>(this.OSOStatsAPIURL + 'raw?json=' + encodeURIComponent(JSONString), headerOptions);
  }

  getOSOStatsChartData(JSONString: string): Observable<ChartData> {
    return this.httpClient.get<ChartData>(this.OSOStatsAPIURL + 'chart/json?json=' + encodeURIComponent(JSONString), headerOptions);
  }

  getLastUpdateDate() {
    return this.httpClient.get<RawData>(this.OSOStatsAPIURL + 'raw?json=' + encodeURIComponent('{"series":[{"query":{"name":"creation_date","profile":"observatory"}}],"verbose":true}'));
  }

  // ======= GENERAL ========
  public getQuestion1(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question1","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion1comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question1.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion2(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question2","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion2comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question2.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion3(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question3","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion3comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question3.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion4(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question4","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion4comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question4.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion5(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question5","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion5comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question5.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }



  // ======= NATIONAL POLICY ========
  // Publications
  public getQuestion6(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question6","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion6comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question6.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion10comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question10.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion14comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question14.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion18comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question18.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion22comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question22.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion26comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question26.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion30comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question30.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion34comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question34.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion38comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question38.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion42comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question42.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion46comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question46.comment","profile":"${this.profileName}"}}],"verbose":true}`
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

  public getQuestion50comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question50.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }



  // ======= FINANCIAL STRATEGY =======
  // Publications
  public getQuestion7(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question7","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion7comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question7.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion11(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question11","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion11comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question11.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion15(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question15","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion15comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question15.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion19(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question19","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion19comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question19.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion23(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question23","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion23comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question23.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion27(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question27","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion27comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question27.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion31(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question31","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion31comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question31.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion35(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question35","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion35comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question35.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion39(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question39","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion39comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question39.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion43(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question43","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion43comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question43.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion47(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question47","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion47comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question47.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion51(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question51","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion51comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question51.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }



  // ======= RPOs =======
  // Publications
  public getQuestion8(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question8","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion8comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question8.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion12(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question12","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion12comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question12.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion16(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question16","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion16comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question16.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion20(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question20","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion20comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question20.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion24(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question24","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion24comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question24.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion28(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question28","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion28comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question28.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion32(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question32","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion32comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question32.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion36(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question36","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion36comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question36.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion40(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question40","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion40comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question40.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion44(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question44","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion44comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question44.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion48(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question48","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion48comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question48.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion52(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question52","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion52comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question52.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }



  // ======= RFOs =======
  // Publications
  public getQuestion9(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question9","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion9comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question9.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion13(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question13","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion13comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question13.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion17(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question17","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion17comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question17.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion21(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question21","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion21comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question21.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion25(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question25","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion25comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question25.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion29(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question29","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion29comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question29.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion33(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question33","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion33comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question33.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion37(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question37","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion37comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question37.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion41(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question41","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }


  public getQuestion41comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question41.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion45(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question45","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion45comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question45.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion49(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question49","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion49comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question49.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion53(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question53","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion53comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question53.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }



  // ======= NATIONAL MONITORING =======
  // Publications
  public getQuestion54(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question54","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion54comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question54.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion58(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question58","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion58comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question58.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion62(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question62","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }


  public getQuestion62comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question62.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion66(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question66","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }


  public getQuestion66comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question66.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion70(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question70","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion70comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question70.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion74(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question74","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion74comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question74.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion78(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question78","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion78comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question78.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion82(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question82","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion82comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question82.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion86(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question86","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion86comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question86.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion90(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question90","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion90comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question90.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion94(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question94","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion94comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question94.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion98(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question98","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion98comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question98.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }



  // ======= USE CASES =======
  // Publications
  public getQuestion55(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question55","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion55comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question55.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion59(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question59","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion59comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question59.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion63(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question63","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion63comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question63.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion67(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question67","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion67comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question67.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion71(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question71","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion71comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question71.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion75(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question75","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion75comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question75.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion79(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question79","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion79comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question79.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion83(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question83","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion83comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question83.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion87(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question87","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion87comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question87.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion91(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question91","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion91comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question91.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion95(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question95","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion95comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question95.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion99(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question99","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion99comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question99.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }



  // ======= FINANCIAL INVESTMENTS =======
  // Publications
  public getQuestion56(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question56","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion56comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question56.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion60(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question60","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion60comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question60.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion64(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question64","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion64comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question64.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion68(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question68","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion68comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question68.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion72(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question72","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion72comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question72.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion76(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question76","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion76comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question76.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion80(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question80","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion80comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question80.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion84(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question84","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion84comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question84.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion88(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question88","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion88comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question88.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion92(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question92","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion92comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question92.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion96(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question96","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion96comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question96.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion100(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question100","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion100comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question100.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }





  // ======= OUTPUTS =======
  // Publications
  public getQuestion57(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question57","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion57comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question57.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Data
  public getQuestion61(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question61","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion61comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question61.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion65(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question65","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion65comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question65.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion69(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question69","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion69comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question69.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Software
  public getQuestion73(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question73","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion73comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question73.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Services
  public getQuestion77(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question77","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion77comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question77.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Infrastructure
  public getQuestion81(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question81","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion81comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question81.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion85(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question85","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion85comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question85.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion89(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question89","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion89comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question89.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Skills/Training
  public getQuestion93(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question93","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion93comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question93.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Assessment
  public getQuestion97(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question97","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion97comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question97.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  // Engagement
  public getQuestion101(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question101","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

  public getQuestion101comment(): Observable<RawData> {
    const query: string = `{"series":[{"query":{"name":"eosc.sb.2022.Question101.comment","profile":"${this.profileName}"}}],"verbose":true}`
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(query), headerOptions);
  }

}
