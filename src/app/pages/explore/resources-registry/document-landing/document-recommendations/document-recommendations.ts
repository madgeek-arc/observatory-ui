import { Component, DestroyRef, inject, input, OnChanges, ChangeDetectionStrategy, signal } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Document } from 'src/app/domain/document';
import { ResourceRegistryService } from "../../resource-registry.service";

@Component({
  selector: 'app-document-recommendations',
  templateUrl: './document-recommendations.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
})

export class RecommendationsPage implements OnChanges {

  private destroyRef = inject(DestroyRef);
  private resourcesRegistryService = inject(ResourceRegistryService);

  documentId = input<string>(null);
  isAdminPage = input(false);

  recommendedDocs = signal<Document[]>([]);
  showImage = new Map<string, boolean>();

  ngOnChanges() {
    if (this.documentId()) {
      let quantity = 3;
      let status: string | null = 'APPROVED';
      if (this.isAdminPage()) {
        quantity = 5;
        status = null;
      }
      this.resourcesRegistryService.getRecommendations(this.documentId(), quantity, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res: Document[]) => {
          this.recommendedDocs.set(res);
        },
        error: (err) => console.error('Error fetching recommendations for document', err),
      });
    }
  }

  imageError(id: string) {
    this.showImage.set(id, false);
  }

}
