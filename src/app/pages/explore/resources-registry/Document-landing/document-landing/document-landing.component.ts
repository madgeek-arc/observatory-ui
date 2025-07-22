import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceRegistryService } from '../../resource-registry.service';
import { Document } from 'src/app/domain/document';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';
import { CommonModule, LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { PageContentComponent } from 'src/survey-tool/app/shared/page-content/page-content.component';
import { SidebarMobileToggleComponent } from 'src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';

@Component({
  selector: 'app-document-landing',
  standalone: true,
  imports: [LowerCasePipe, NgOptimizedImage, CommonModule, PageContentComponent, SidebarMobileToggleComponent],
  templateUrl: './document-landing.component.html',
  styleUrls: ['./document-landing.component.less']
})

export class DocumentLandingComponent implements OnInit {
  documentId: string = null;
  documentData: Document = null;
  error: string = null;
  destroyRef = inject(DestroyRef);

  constructor(private route: ActivatedRoute, private documentService: ResourceRegistryService) {}

    ngOnInit() {
      this.documentId = this.route.snapshot.paramMap.get('documentId');
      console.log( this.route.snapshot.paramMap)
      console.log(this.documentId)
      if (this.documentId) {
        this.documentService.getDocumentById(this.documentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (data) => {
            this.documentData = data;
            
          },
          error: (err) => {
            this.error = 'Error fetching document.';
            console.error(err);
          },
        });
      }
    }

}
