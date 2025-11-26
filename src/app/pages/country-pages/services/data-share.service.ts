import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ExploreService } from "../../explore/explore.service";
import { AnswerMetadata } from "./coutry-pages.service";

@Injectable({
  providedIn: 'root'
})

export class DataShareService {
  countryCode: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  countryName: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  surveyAnswers: BehaviorSubject<Object[]> = new BehaviorSubject<Object[]>([null, null]);
  countrySurveyAnswer: BehaviorSubject<Object | null> = new BehaviorSubject<Object | null>(null);
  countrySurveyAnswerMetaData: BehaviorSubject<AnswerMetadata | null> = new BehaviorSubject<AnswerMetadata | null>(null);
  year: BehaviorSubject<string> = new BehaviorSubject<string>('2024');

  constructor(private exploreService: ExploreService) {}

  /**
   * Updates a specific item in the surveyAnswers array at the given index
   * @param index - The position in the array where the item should be updated
   * @param item - The new item to be placed at the specified index
   */
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

  /**
   * Calculates the percentage of a value relative to a total
   * @param value - The numeric value to calculate percentage for (as string)
   * @param total - The total value to calculate percentage against (as string)
   * @returns Rounded percentage value or null if inputs are invalid or total is zero
   */
  calculatePercentage(value: string, total: string): number | null {

    if ((!this.exploreService.isNumeric(value) && !this.exploreService.isNumeric(total)) || +total === 0) {
      return null;
    }

    return Math.round((+value / +total + Number.EPSILON) * 100);
  }

  /**
   * Calculates the percentage difference between two values relative to their average
   * @param previous - The first value to compare (as string)
   * @param next - The second value to compare (as string)
   * @returns Rounded percentage difference or null if inputs are invalid or average is zero
   */
  calculateDiffAsPercentage(previous: string | null, next: string | null): number | null {

    if (!this.exploreService.isNumeric(previous) || !this.exploreService.isNumeric(next)) {
      return null;
    }

    const average = (+previous + +next) / 2;
    if (average === 0) {
      return null;
    }

    return Math.round(((+next - +previous) / average + Number.EPSILON) * 100);
  }


  /**checks if there is at least one value that is not null or undefined */
  hasAnyValue(values: any[]): boolean {
    return values.some(value => value != null);
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
