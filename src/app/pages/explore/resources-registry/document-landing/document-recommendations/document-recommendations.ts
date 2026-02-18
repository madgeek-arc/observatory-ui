import {Component, DestroyRef, inject, Input, OnInit} from "@angular/core";
import {Document} from 'src/app/domain/document';
import {ResourceRegistryService} from "../../resource-registry.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-document-recommendations',
  templateUrl: './document-recommendations.html',
  standalone: true,
  imports: [CommonModule],
})

export class RecommendationsPage implements OnInit {

  private resourcesRegistryService = inject(ResourceRegistryService);
  destroyRef = inject(DestroyRef);

  @Input() documentId: string = null;
  recommendedDocs: Document[] = [];

  ngOnInit() {
    if (this.documentId) {
      this.resourcesRegistryService.getRecommendations(this.documentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        {
          next: (res: Document[]) => {
            this.recommendedDocs = res;
          },
          error: (err) => console.error('Error fetching recommendations for document', err),
        });
    }
  }

}
