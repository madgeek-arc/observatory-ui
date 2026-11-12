import {Component, DestroyRef, inject, model, OnInit, ChangeDetectionStrategy, signal} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResourceRegistryService } from '../resource-registry.service';
import { Document } from 'src/app/domain/document';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { PageContentComponent } from 'src/survey-tool/app/shared/page-content/page-content.component';
import {
  SidebarMobileToggleComponent
} from 'src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';
import {Model} from "src/survey-tool/catalogue-ui/domain/dynamic-form-model";
import {SurveyService} from "src/survey-tool/app/services/survey.service";
import {RecommendationsPage} from "./document-recommendations/document-recommendations";
import { Administrator } from "src/survey-tool/app/domain/userInfo";
import { UserService } from "src/survey-tool/app/services/user.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";

@Component({
  selector: 'app-document-landing',
  imports: [NgOptimizedImage, CommonModule, PageContentComponent, SidebarMobileToggleComponent, RouterLink, RecommendationsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-landing.component.html',
})

export class DocumentLandingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private documentService = inject(ResourceRegistryService);
  private surveyService = inject(SurveyService);
  private userService = inject(UserService);
  private stakeholdersService = inject(StakeholdersService);

  documentId = signal<string>(null);
  documentData = signal<Document>(null);
  error: string = null;
  destroyRef = inject(DestroyRef);

  isAdminPage = signal(false);

  statusMessage = signal<string>(null);
  statusType = signal<'success' | 'danger'>(null);

  surveyModels: Map<string, Model> = new Map();
  // The template reads these two; they get a new Map/object per change so the OnPush view refreshes
  fieldPathsMap = signal<{ [key: string]: string }>({});
  surveyNames = signal<Map<string, string>>(new Map());

  showImage = signal(true);

  ngOnInit() {

    if (this.route.snapshot.paramMap.get('stakeholderId') && this.route.snapshot.paramMap.get('stakeholderId') === 'admin-eosc-sb') {
        this.isAdminPage.set(true);
    }

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      let id = params['stakeholderId'];

      if (id === 'admin-eosc-sb') {
        this.initAdminGroup(id);
      }
    })

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.documentId.set(params['documentId']);
      if (this.documentId()) {
        this.documentService.getDocumentById(this.documentId()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (data) => {
            this.documentData.set(data);
            this.loadSurveyModels();
          },
          error: (err) => {
            this.error = 'Error fetching document.';
            console.error(err);
          },
        });
      }
    });

  }

  // Initializes administrator state to ensure the Side Menu appears on page refresh
  initAdminGroup(id: string) {
    this.userService.currentAdministrator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      const currentGroup = next ?? JSON.parse(sessionStorage.getItem('currentAdministrator'));
      if (currentGroup) {
        this.isAdminPage.set(true);
      } else {
        this.stakeholdersService.getAdministrators(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
          res => {
            this.userService.changeCurrentAdministrator(res as Administrator);
            this.isAdminPage.set(true);
          },
          error => console.error('Failed to load administrator info', error)
        );
      }
    });
  }

  onUpdateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    this.documentService.updateStatus(id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.statusMessage.set(status === 'APPROVED' ? 'Document approved successfully.' : 'Document rejected successfully.');
        this.statusType.set('success');
        setTimeout(() => this.statusMessage.set(null), 5000);

        this.documentService.getDocumentById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (data) => {
            this.documentData.set(data);
          },
          error: (err) => {
            this.error = 'Error fetching document after status update.';
            this.statusMessage.set('Failed to refresh document data.');
            this.statusType.set('danger');
          }
      });
      },
      error: (err) => {
        this.error = `Error updating document status to ${status}.`;
        this.statusMessage.set('Failed to update document status.');
        this.statusType.set('danger');
        setTimeout(() => this.statusMessage.set(null), 5000);
        console.error(err);
      }
    });
  }

  loadSurveyModels() {
    if (!this.documentData()?.references) {
      return;
    }

    const uniqueAnswerIds = [...new Set(this.documentData().references.map(r => r.surveyAnswerId))];
    uniqueAnswerIds.forEach(answerId => {
      this.surveyService.getAnswer(answerId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (answer) => {
          if (answer && answer.surveyId) {
            this.surveyService.getSurvey(answer.surveyId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (model) => {
                if ( model.name) {
                  this.surveyNames.update(names => new Map(names).set(answerId, model.name));
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
    if (!this.documentData().references) return;

    // findPathInModel throws when another reference's survey has not loaded yet; the paths found before that
    // were kept on the field, so they are published from a finally block
    const fieldPaths = {...this.fieldPathsMap()};
    try {
      this.documentData().references.forEach(ref => {
        const model = this.surveyModels.get(ref.surveyAnswerId);
        ref.fields.forEach(fieldId => {
          const path = this.findPathInModel(model, fieldId);
          if (path) {
            fieldPaths[fieldId] = path;
          }
        });
      });
    } finally {
      this.fieldPathsMap.set(fieldPaths);
    }
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

  imageError() {
    this.showImage.set(false);
    console.log(this.showImage());
  }
}
