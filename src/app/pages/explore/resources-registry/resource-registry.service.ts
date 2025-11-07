import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Paging } from 'src/survey-tool/catalogue-ui/domain/paging';
import { Document, Content } from 'src/app/domain/document';
import { URLParameter } from 'src/survey-tool/app/domain/url-parameter';
import { Model } from 'src/survey-tool/catalogue-ui/domain/dynamic-form-model';


@Injectable({
  providedIn: 'root'
})
export class ResourceRegistryService {
    base: string = environment.API_ENDPOINT;
  constructor(private httpClient: HttpClient) { }
  

  getDocument(from: number = 0, quantity: number = 50, urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    searchQuery = searchQuery.append('resourceType', 'document');
    searchQuery = searchQuery.append('from', from.toString());
    searchQuery = searchQuery.append('quantity', quantity.toString());
    searchQuery = searchQuery.append('order', 'asc');

    if (urlParameters && urlParameters.length > 0) {
    urlParameters.forEach(param => {
      if (param.values && param.values.length > 0) {
        searchQuery = searchQuery.set(param.key, param.values.join(','));
      }
    });
  }

    return this.httpClient.get<Paging<Document>>(this.base + '/items', {params: searchQuery});
  }

  getDocumentById(id: string) {
    return this.httpClient.get<Document>(`${this.base}/items/${id}?resourceType=document`);
  }

  updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const url = `${this.base}/documents/${id}/status`;
    const body = { status };
    return this.httpClient.put(url, body);
  }

  updateDocument(id: string, docInfo: Content) {
   const url = `${this.base}/documents/${id}/docInfo`;
   const body = docInfo;
   return this.httpClient.put(url, body);
  }

  getDocumentModel() {
    const url = `${this.base}/forms/models/m-document`;
    return this.httpClient.get<Model>(url);
  }
  
}
