import { Component, contentChild, input, TemplateRef } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { LoadingPlaceholder } from "../loading-placeholder/loading-placeholder";
import { QueryState } from "../../pages/explore/custom-search/services/custom-search.service";

/** Shows a spinner while loading, a message on error or when there's no data,
 *  and the parent's <ng-template> content only on success with data. */
@Component({
  selector: 'app-card-state',
  templateUrl: './card-state.html',
  imports: [LoadingPlaceholder, NgTemplateOutlet]
})
export class CardState {
  state = input.required<QueryState<unknown>>();
  height = input.required<number>();
  empty = input(false);
  emptyText = input('No data for the selected period.');

  readonly content = contentChild.required(TemplateRef);
}
