import {Component, DestroyRef, inject, model, OnInit} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResourceRegistryService } from '../resource-registry.service';
import { Document } from 'src/app/domain/document';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { PageContentComponent } from 'src/survey-tool/app/shared/page-content/page-content.component';
import {
  SidebarMobileToggleComponent
} from 'src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';
import {Model} from "../../../../../survey-tool/catalogue-ui/domain/dynamic-form-model";
import {SurveyService} from "../../../../../survey-tool/app/services/survey.service";
import {RecommendationsPage} from "./document-recommendations/document-recommendations";

@Component({
  selector: 'app-document-landing',
  imports: [NgOptimizedImage, CommonModule, PageContentComponent, SidebarMobileToggleComponent, RouterLink, RecommendationsPage],
  templateUrl: './document-landing.component.html',
})

export class DocumentLandingComponent implements OnInit {
  documentId: string = null;
  documentData: Document = null;
  error: string = null;
  destroyRef = inject(DestroyRef);

  isAdminPage: boolean = false;

  statusMessage: string = null;
  statusType: 'success' | 'danger' = null;

  surveyModels: Map<string, Model> = new Map();
  fieldPathsMap: { [key: string]: string } = {};
  surveyNames: Map<string, string> = new Map();

  constructor(private route: ActivatedRoute, private documentService: ResourceRegistryService, private surveyService: SurveyService,) {}

    ngOnInit() {

      if (this.route.snapshot.paramMap.get('stakeholderId') && this.route.snapshot.paramMap.get('stakeholderId') === 'admin-eosc-sb') {
          this.isAdminPage = true
      }
      this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        this.documentId = params['documentId'];
        if (this.documentId) {
          this.documentService.getDocumentById(this.documentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (data) => {
              this.documentData = data;
              this.loadSurveyModels();
            },
            error: (err) => {
              this.error = 'Error fetching document.';
              console.error(err);
            },
          });
        }
      })

      // this.documentId = this.route.snapshot.paramMap.get('documentId');

    }

    onUpdateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
      this.documentService.updateStatus(id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
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

  loadSurveyModels() {
    if (!this.documentData?.references) {
      return;
    }

    const uniqueAnswerIds = [...new Set(this.documentData.references.map(r => r.surveyAnswerId))];
    uniqueAnswerIds.forEach(answerId => {
      this.surveyService.getAnswer(answerId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (answer) => {
          if (answer && answer.surveyId) {
            this.surveyService.getSurvey(answer.surveyId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (model) => {
                if ( model.name) {
                  this.surveyNames.set(answerId, model.name)
                }
                this.surveyModels.set(answerId, model);
                this.generateAllPaths();
              },
              error: (err) => console.error('Failed to load Survey Model', err)
            });
          }
        },
        error: (err) => console.error('Failed to load answer', err)
      })
    })
  }


  generateAllPaths() {
    if (!this.documentData.references) return;

    this.documentData.references.forEach(ref => {
      const model = this.surveyModels.get(ref.surveyAnswerId);
      ref.fields.forEach(fieldId => {
        const path = this.findPathInModel(model, fieldId);
        if (path) {
          this.fieldPathsMap[fieldId] = path;
        }
      });
    });
  }

  findPathInModel(model: Model, targetFieldId: string): string | null {
    if (!model.sections) return null;

    for (const section of model.sections) {
      const startPath = section.name || section.id;

      const result = this.searchRecursively(section, targetFieldId, [startPath]);
      if (result) return result;
    }
    return null;
  }


  searchRecursively(node: any, targetId: string, currentPath: string[]): string | null {
    if (node.name) {
      const isExactMatch = node.name === targetId;
      const isParentMatch = targetId.startsWith(node.name + '-');

      if (isExactMatch || isParentMatch) {
        if (node.label && node.label.text && node.label.text.trim().length > 0) {
          return this.buildResult(node, currentPath);
        }
      }
    }

    if (node.id && String(node.id) === targetId && node.label?.text) {
      return this.buildResult(node, currentPath);
    }


    // A. Fields
    if (node.fields) {
      for (const field of node.fields) {
        const result = this.searchRecursively(field, targetId, [...currentPath]);
        if (result) return result;
      }
    }

    // B. SubSections
    if (node.subSections) {
      for (const subSection of node.subSections) {
        const nextPath = [...currentPath, subSection.name || subSection.id];
        const result = this.searchRecursively(subSection, targetId, nextPath);
        if (result) return result;
      }
    }

    // C. SubFields
    if (node.subFields) {
      for (const subField of node.subFields) {
        const parentName = node.name || node.id;
        const nextPath = [...currentPath];
        if (parentName && currentPath[currentPath.length - 1] !== parentName) {
        }
        const result = this.searchRecursively(subField, targetId, nextPath);
        if (result) return result;
      }
    }
    return null;
  }

  buildResult(node: any, currentPath: string[]): string {
    let finalLabel = node.label?.text;
    if (!finalLabel) {
      finalLabel = node.description;
    }
    if (finalLabel) {
      finalLabel = finalLabel.replace(/<[^>]*>/g, '').trim();
      finalLabel = finalLabel.replace(/&nbsp;/g, ' ');
      if (finalLabel.length > 100) {
        finalLabel = finalLabel.substring(0, 100) + '...';
      }
    } else {

      finalLabel = node.name || node.id;
    }
    return [...currentPath, finalLabel].join(' > ');
  }

  protected readonly indexedDB = indexedDB;
}
