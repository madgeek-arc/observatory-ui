import { Component, DestroyRef, inject, Input, OnChanges, OnInit } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Document } from 'src/app/domain/document';
import { ResourceRegistryService } from "../../resource-registry.service";

@Component({
  selector: 'app-document-recommendations',
  templateUrl: './document-recommendations.html',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
})

export class RecommendationsPage implements OnChanges {

  private destroyRef = inject(DestroyRef);
  private resourcesRegistryService = inject(ResourceRegistryService);

  @Input() documentId: string = null;

  recommendedDocs: Document[] = [];
  showImage = new Map<string, boolean>();

  ngOnChanges() {
    if (this.documentId) {
      // FIXME: set status to null to get documents of all statuses in the admin resources-registry page, implement correctly.
      this.resourcesRegistryService.getRecommendations(this.documentId, 3, null).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res: Document[]) => {
          this.recommendedDocs = res;
        },
        error: (err) => console.error('Error fetching recommendations for document', err),
      });
    }
  }

  imageError(id: string) {
    this.showImage.set(id, false);
  }

}
