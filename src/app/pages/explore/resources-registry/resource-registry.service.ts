import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Paging } from 'src/survey-tool/catalogue-ui/domain/paging';
import {Document, Content, HighlightedResults, Highlight} from 'src/app/domain/document';
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

    return this.httpClient.get<Paging<HighlightedResults<Document> | Document>>(this.base + '/documents', {params: searchQuery});
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

   stripHtml(htmlString: string): string {
    if (!htmlString) {
      return '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
  }

  // applyHighlightsToContent(highlightedResult: HighlightedResults<Document>): HighlightedResults<Document> {
  //
  //   const documentData = highlightedResult.result;
  //   const content: Content = documentData.docInfo;
  //   const highlights = highlightedResult.highlights;
  //
  //   const fields = [
  //     {name: 'title', isArray: false, path: 'title'},
  //     {name: 'shortDescription', isArray: false, path: 'shortDescription.text'},
  //     {name : 'organisations', isArray: true, path: 'organisations'}
  //   ];
  //
  //   fields.forEach(field => {
  //     const highlightArray = highlights.find(h => h.hasOwnProperty(field.name))?.[field.name];
  //
  //
  //
  //     if (highlightArray && highlightArray.length > 0) {
  //       const highlightedValueWithTags = highlightArray[0];
  //       const cleanValue = this.stripHtml(highlightedValueWithTags);
  //
  //       if (!field.isArray) {
  //         const originalValueContainer = (field.name === 'title') ? content : content.shortDescription;
  //         const originalValueKey =  (field.name === 'title') ? 'title' : 'text';
  //
  //         const originalValue = (originalValueContainer as any)[originalValueKey];
  //         //MATCH
  //         if (originalValue && originalValue.includes(cleanValue)) {
  //           //REPLACE
  //           (originalValueContainer as any)[originalValueKey] = originalValue.replace(cleanValue, highlightedValueWithTags);
  //         }
  //       } else {
  //         //ARRAY-MATCH
  //         const index = content.organisations.findIndex(org => org === cleanValue);
  //
  //         if (index !== -1) {
  //           //REPLACE
  //           content.organisations[index] = highlightedValueWithTags;
  //         }
  //       }
  //     }
  //   });
  //   return highlightedResult;
  // }

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

}
