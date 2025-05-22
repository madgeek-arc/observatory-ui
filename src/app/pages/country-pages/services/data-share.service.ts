import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";

@Injectable({
  providedIn: 'root'
})

export class DataShareService {
  countryCode: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  countryName: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  surveyAnswers: BehaviorSubject<Object[]> = new BehaviorSubject<Object[]>([]);
  countrySurveyAnswer: BehaviorSubject<Object | null> = new BehaviorSubject<Object | null>(null);


  setItemAt(index: number, item: Object) {
    const current = [...this.surveyAnswers.getValue()];
    current[index] = item;
    this.surveyAnswers.next(current);
  }


  isNumeric(value: string | null): boolean {
    // Check if the value is empty
    if (value === null)
      return false;

    if (value.trim() === '') {
      return false;
    }

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !isNaN(number) && isFinite(number) && String(number) === value;
  }

}
