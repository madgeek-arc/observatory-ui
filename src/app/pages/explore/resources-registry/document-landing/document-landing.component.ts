import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResourceRegistryService } from '../resource-registry.service';
import { Document } from 'src/app/domain/document';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { PageContentComponent } from 'src/survey-tool/app/shared/page-content/page-content.component';
import {
  SidebarMobileToggleComponent
} from 'src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';

@Component({
  selector: 'app-document-landing',
  imports: [NgOptimizedImage, CommonModule, PageContentComponent, SidebarMobileToggleComponent, RouterLink],
  templateUrl: './document-landing.component.html'
})

export class DocumentLandingComponent implements OnInit {
  documentId: string = null;
  documentData: Document = null;
  error: string = null;
  destroyRef = inject(DestroyRef);

  isAdminPage: boolean = false;

  statusMessage: string = null;
  statusType: 'success' | 'danger' = null;

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

    onUpdateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
      this.documentService.updateStatus(id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          console.log(`Document ${id} status updated to ${status}`);

          this.statusMessage = status === 'APPROVED' ? 'Document approved successfully.' : 'Document rejected successfully.';
          this.statusType = 'success' ;
          setTimeout(() => this.statusMessage = null, 5000);

          this.documentService.getDocumentById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (data) => {
              this.documentData = data;
            },
            error: (err) => {
              this.error = 'Error fetching document after status update.';
              this.statusMessage = 'Failed to refresh document data.';
              this.statusType = 'danger';
            }
        });
        },
        error: (err) => {
          this.error = `Error updating document status to ${status}.`;
          this.statusMessage = 'Failed to update document status.';
          this.statusType = 'danger';
          setTimeout(() => this.statusMessage = null, 5000);
          console.error(err);
        }
      });
  }

}
