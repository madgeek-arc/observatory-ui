import { NgModule } from "@angular/core";
import { PremiumSortFacetsPipe, PremiumSortFacetValuesPipe, PremiumSortPipe } from "./pipes/premium-sort.pipe";
import { SafeUrlPipe } from "./pipes/safeUrlPipe";
import { UniquePipe } from "./pipes/uniquePipe.pipe";

@NgModule({
  declarations: [
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    PremiumSortFacetValuesPipe,
    SafeUrlPipe,
    UniquePipe
  ],
  imports: [],
  exports: [
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    PremiumSortFacetValuesPipe,
    SafeUrlPipe,
    UniquePipe
  ]
})

export class CatalogueUiSharedModule { }
