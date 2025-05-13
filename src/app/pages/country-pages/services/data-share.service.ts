import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";

@Injectable({
  providedIn: 'root'
})

export class DataShareService {
  countryCode: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  countryName: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  surveyAnswers: BehaviorSubject<SurveyAnswer[]> = new BehaviorSubject<SurveyAnswer[]>([]);


  setItemAt(index: number, item: SurveyAnswer) {
    const current = [...this.surveyAnswers.getValue()];
    current[index] = item;
    this.surveyAnswers.next(current);
  }
}
