import { NgModule } from "@angular/core";
import { PremiumSortPipe } from "./premium-sort.pipe";

@NgModule({
  imports: [PremiumSortPipe],
  exports: [
    PremiumSortPipe,
  ]
})

export class PipeModule {}
