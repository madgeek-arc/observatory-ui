import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataCheckService {

  constructor() { }

  /**checks if there is at least one value that is not null or undefined */
  hasAnyValue(values: any[]): boolean {
    
    return values.some(value => value !=null);
  }

  /** Checks if there is available data for at least one of the specified questions.
   * 
   * If a question's value is an array, it looks for at least one element
   * with a truthy value in the `${q}-1` key. If it's a simple value, it checks if it's truthy.
   */
  hasSurveyData(data: any, questions: string[]): boolean {
    if (!data) {
      return false;
    }

    return questions.some(q => {
      if (Array.isArray(data[q])) {
        return data[q].some((item: any) => !!item[`${q}-1`]);
      } else {
        return !!data[q];
      }
    });
  }
}
