import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
import {NewsItem, NewsItemRequest, NewsResponse} from "../../domain/news";

@Injectable({
  providedIn: 'root'
})
export class StakeholderNewsService {

  base: string = environment.API_ENDPOINT;

  constructor(private http: HttpClient) { }

  getStakeholderNews(
    id: string,
    from: number = 0,
    quantity: number = 10,
    keyword: string = '',
    sort: string = 'creationDate',
    order: string = 'desc'
  ): Observable<NewsResponse> {
    let params = new HttpParams()
      .set('from', from.toString())
      .set('quantity', quantity.toString())
      .set('sort', sort)
      .set('order', order);

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<NewsResponse>(`${this.base}/stakeholders/${id}/news`, { params });
  }

  // Add new story
  postNews(stakeholderId: string, newsItem: NewsItemRequest): Observable<NewsItem> {
    return this.http.post<NewsItem>(`${this.base}/stakeholders/${stakeholderId}/news`, newsItem);
  }

  putNews(stakeholderId: string, newsId: string, newsItem: NewsItemRequest): Observable<NewsItem> {
    return this.http.put<NewsItem>(`${this.base}/stakeholders/${stakeholderId}/news/${newsId}`, newsItem);
  }

  // Delete story
  deleteNews(stakeholderId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/stakeholders/${stakeholderId}/news/${id}`)
  }
}
