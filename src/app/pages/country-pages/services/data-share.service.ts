import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ExploreService } from "../../explore/explore.service";

@Injectable({
  providedIn: 'root'
})

export class DataShareService {
  countryCode: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  countryName: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  surveyAnswers: BehaviorSubject<Object[]> = new BehaviorSubject<Object[]>([]);
  countrySurveyAnswer: BehaviorSubject<Object | null> = new BehaviorSubject<Object | null>(null);

  constructor(private exploreService: ExploreService) {}


  setItemAt(index: number, item: Object) {
    const current = [...this.surveyAnswers.getValue()];
    current[index] = item;
    this.surveyAnswers.next(current);
  }



  calculateDiff(previous: number | null, next: number | null): number | null {
    // Check empty values
    if (previous === null || next === null || previous === undefined || next === undefined) {
      return null;
    }

    return (next - previous);
  }

  calculatePercentage(value: string, total: string): number | null {

    if ((!this.exploreService.isNumeric(value) && !this.exploreService.isNumeric(total)) || +total === 0) {
      return null;
    }

    return Math.round((+value / +total + Number.EPSILON) * 100);
  }

  calculateDiffAsPercentage(previous: string | null, next: string | null): number | null {

    if (!this.exploreService.isNumeric(previous) || !this.exploreService.isNumeric(next)) {
      return null;
    }

    const average = (+previous + +next) / 2;
    if (average === 0) {
      return null;
    }

    return Math.round(((+previous - +next) / average + Number.EPSILON) * 100);
  }
}
