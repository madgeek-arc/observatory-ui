import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RawData } from "../domain/raw-data";


const headerOptions = {
  headers : new HttpHeaders().set('Content-Type', 'application/json')
    .set('Accept', 'application/json'),
};

@Injectable ()
export class DataService {

  private statsAPIURL = environment.STATS_API_ENDPOINT + 'raw?json=';
  private profileName = environment.profileName;

  constructor(private httpClient: HttpClient) {}

  public getFinancialContrToEOSCLinkedToPolicies(): Observable<RawData> {
    const financialContrToEOSCLinkedToPoliciesQuery = `{"series":[{"query":{"name":"eosc.obs.question5","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(financialContrToEOSCLinkedToPoliciesQuery), headerOptions);
  }

  public getMandatedStatus(): Observable<RawData> {
    const mandatedStatusQuery = `{"series":[{"query":{"name":"eosc.obs.question17","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(mandatedStatusQuery), headerOptions);
  }

  public getTotalFundingForEOSC(): Observable<RawData> {
    const totalFundingForEOSCQuery = `{"series":[{"query":{"name":"eosc.obs.question6.sum","profile":"${this.profileName}"}}],"verbose":true}`;
    return this.httpClient.get<RawData>(this.statsAPIURL + encodeURIComponent(totalFundingForEOSCQuery), headerOptions);
  }
}
