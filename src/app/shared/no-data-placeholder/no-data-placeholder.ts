import { Component, input } from "@angular/core";

/** Dashed "No data" box shown in place of a chart that has nothing to draw. */
@Component({
  selector: 'app-no-data-placeholder',
  template: `
    <div class="uk-placeholder uk-margin-remove uk-flex uk-flex-column uk-flex-center uk-flex-middle uk-text-center"
         [style.height.px]="height()" style="box-sizing: border-box;">
      <span class="material-symbols-outlined uk-text-muted" style="font-size: 32px;">bar_chart</span>
      <span class="uk-text-small uk-text-bold uk-margin-small-top">{{ title() }}</span>
      @if (subtitle()) {
        <span class="uk-text-meta uk-text-small">{{ subtitle() }}</span>
      }
    </div>`
})
export class NoDataPlaceholder {
  title = input.required<string>();
  subtitle = input('');
  height = input.required<number>();
}
