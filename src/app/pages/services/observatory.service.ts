import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
import {NewsResponse} from "../dashboard/news-and-stories/news.model";

@Injectable({
  providedIn: 'root'
})
export class ObservatoryService {

  base: string = environment.API_ENDPOINT;

  constructor(private http: HttpClient) { }

  getStakeholderNews(id: string, from: number = 0, quantity: number = 10): Observable<NewsResponse> {
    const params = new HttpParams()
      .set('from', from.toString())
      .set('quantity', quantity.toString());

    return this.http.get<NewsResponse>(`${this.base}/stakeholders/${id}/news`, { params });
  }

  // Add new story
  postNews(stakeholderId: string, newsItem: any): Observable<NewsResponse> {
    return this.http.post<NewsResponse>(`${this.base}/stakeholders/${stakeholderId}/news`, newsItem);
  }

// Update existing story
  putNews(stakeholderId: string, newsId: string, newsItem: any): Observable<NewsResponse> {
    return this.http.put<NewsResponse>(`${this.base}/stakeholders/${stakeholderId}/news/${newsId}`, newsItem);
  }
}
