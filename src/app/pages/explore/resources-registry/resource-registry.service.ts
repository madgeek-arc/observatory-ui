import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Paging } from 'src/survey-tool/catalogue-ui/domain/paging';
import { Document, Content, HighlightedResults, Highlight } from 'src/app/domain/document';
import { URLParameter } from 'src/survey-tool/app/domain/url-parameter';
import { Model } from 'src/survey-tool/catalogue-ui/domain/dynamic-form-model';


@Injectable({
  providedIn: 'root'
})

export class ResourceRegistryService {
  base: string = environment.API_ENDPOINT;

  constructor(private httpClient: HttpClient) { }


  getDocument(from: number = 0, quantity: number = 10, urlParameters: URLParameter[], isAdminPage: boolean) {
    let searchQuery = new HttpParams();
    searchQuery = searchQuery.append('from', from.toString());
    searchQuery = searchQuery.append('quantity', quantity.toString());
    searchQuery = searchQuery.append('order', 'asc');
    if (!isAdminPage) {
      searchQuery = searchQuery.append('status', 'APPROVED');
    }

    if (urlParameters && urlParameters.length > 0) {
      urlParameters.forEach(param => {
        if (param.values && param.values.length > 0) {
          searchQuery = searchQuery.set(param.key, param.values.join(','));
        }
      });
    }

    return this.httpClient.get<Paging<HighlightedResults<Document> | Document>>(this.base + '/documents', {params: searchQuery});
  }

  getDocumentById(id: string) {
    return this.httpClient.get<Document>(`${this.base}/items/${id}?resourceType=document`);
  }

  updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const url = `${this.base}/documents/${id}/status`;
    const body = {status};
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

  stripHtml(htmlString: string): string {
    if (!htmlString) {
      return '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
  }

  replaceWithHighlighted(original: string[], highlights: Highlight[], fieldName: string) {
    if (!original || !Array.isArray(original) || !highlights) return original;

    const fieldHighlights = highlights.filter(h => h.field === fieldName);
    if (fieldHighlights.length == 0) return original;


    const updated = [...original];

    updated.forEach((element, index) => {
      fieldHighlights.forEach((field) => {
        const cleanValue = this.stripHtml(field.value);
        if (cleanValue === element) {
          updated[index] = field.value;
          return;
        }
      });
    });

    return updated;
  }


  cleanNullArrays(obj: any): any {
    // Handle Arrays
    if (Array.isArray(obj)) {
      // If the array is already empty, return it as is to avoid breaking logic that
      //expects an array
      if (obj.length === 0) return obj;

      const cleanedArray = obj.map(el => this.cleanNullArrays(el));

      // if after cleaning, all elements in the array are null, null the entire array
      if (cleanedArray.every(el => el === null)) {
        return null;
      }
      return cleanedArray;
    }

    // Handle Objects
    else if (obj !== null && typeof obj === 'object') {
      if (obj instanceof Date) return obj;

      const cleanedObj: any = {};
      let hasValidData = false;

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = this.cleanNullArrays(obj[key]);
          cleanedObj[key] = value;

          // If at least one property contains data, mark the object as valid
          if (value !== null) {
            hasValidData = true;
          }
        }
      }
      // If the object ended up containing only null values, return null
      return hasValidData ? cleanedObj : null;
    }
    return obj;
  }

}
