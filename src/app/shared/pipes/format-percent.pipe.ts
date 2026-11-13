import { Pipe, PipeTransform } from "@angular/core";
import { formatPercent } from "../../domain/format-indicator-value";

/** Template version of formatPercent — {{ 75.3 | formatPercent }} -> "75.30%".*/
@Pipe({ name: 'formatPercent' })
export class FormatPercentPipe implements PipeTransform {
  transform(value: number): string {
    return formatPercent(value);
  }
}
