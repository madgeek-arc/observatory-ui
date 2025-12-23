import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Paging } from 'src/survey-tool/catalogue-ui/domain/paging';
import { Document, Content, HighlightedResults, Highlight } from 'src/app/domain/document';
import { URLParameter } from 'src/survey-tool/app/domain/url-parameter';
import { Model } from 'src/survey-tool/catalogue-ui/domain/dynamic-form-model';


type CleanOptions = {
  removeNull?: boolean;
  removeEmptyString?: boolean;
  removeUndefined?: boolean; // optional extra
};

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

  cleanObjectInPlace(obj: any, options: CleanOptions = {}) {
    const {removeNull = true, removeEmptyString = true, removeUndefined = true} = options;

    const seen = new WeakSet<object>();

    function isMissing(value: any): boolean {
      if (removeUndefined && value === undefined) return true;
      if (removeNull && value === null) return true;
      if (removeEmptyString && value === "") return true;
      return false;
    }

    // Walk returns true if the value contains any meaningful data
    function walk(value: any): boolean {
      if (isMissing(value)) {
        return false;
      }

      if (value && typeof value === "object") {
        if (seen.has(value)) return true; // assume cyclic refs are meaningful
        seen.add(value);

        if (Array.isArray(value)) {
          let write = 0;
          let hasMeaningful = false;

          for (let read = 0; read < value.length; read++) {
            const item = value[read];

            const itemHasMeaning = item && typeof item === "object" ? walk(item) : !isMissing(item);

            if (itemHasMeaning) {
              value[write++] = value[read];
              hasMeaningful = true;
            }
          }

          value.length = write;
          return hasMeaningful;
        } else {
          // plain object
          let hasMeaningful = false;

          for (const key of Object.keys(value)) {
            const prop = value[key];
            const propHasMeaning =
              prop && typeof prop === "object" ? walk(prop) : !isMissing(prop);

            if (!propHasMeaning) {
              value[key] = null;
            } else {
              hasMeaningful = true;
            }
          }

          return hasMeaningful;
        }
      }

      return true;
    }

    const hasMeaningful = walk(obj);

    // If the root object itself is empty, normalize it to null
    if (!hasMeaningful && typeof obj === "object") {
      return null;
    }

    return obj;
  }

}
