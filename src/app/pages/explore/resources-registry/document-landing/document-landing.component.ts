import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceRegistryService } from '../resource-registry.service';
import { Document } from 'src/app/domain/document';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';
import { CommonModule, LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { PageContentComponent } from 'src/survey-tool/app/shared/page-content/page-content.component';
import { SidebarMobileToggleComponent } from 'src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';

@Component({
    selector: 'app-document-landing',
    imports: [NgOptimizedImage, CommonModule, PageContentComponent, SidebarMobileToggleComponent],
    templateUrl: './document-landing.component.html'
})

export class DocumentLandingComponent implements OnInit {
  documentId: string = null;
  documentData: Document = null;
  error: string = null;
  destroyRef = inject(DestroyRef);

  isAdminPage: boolean = false;

  constructor(private route: ActivatedRoute, private documentService: ResourceRegistryService) {}

    ngOnInit() {

    if(this.route.snapshot.paramMap.get('stakeholderId') && this.route.snapshot.paramMap.get('stakeholderId') === 'admin-eosc-sb') {
        this.isAdminPage = true
      }

      this.documentId = this.route.snapshot.paramMap.get('documentId');
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
