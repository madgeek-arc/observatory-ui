import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { DataShareService } from "../services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-general-R&D-overview',
  standalone: true,
  templateUrl: './general-R&D-overview.component.html',
  imports: [
    LowerCasePipe,
    NgOptimizedImage
  ]
})

export class GeneralRDOverviewComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  countryCode?: string;
  countryName?: string;

  constructor(private dataShareService: DataShareService) {}

  ngOnInit() {
    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
      }
    });

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName = name;
      }
    });
  }

}
