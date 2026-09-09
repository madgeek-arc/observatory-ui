import { Component, input } from "@angular/core";

@Component({
  selector: 'app-loading-placeholder',
  templateUrl: './loading-placeholder.html'
})
export class LoadingPlaceholder {
  height = input.required<number>();
}
