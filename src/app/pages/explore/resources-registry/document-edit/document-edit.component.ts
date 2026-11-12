import { Component, inject, OnInit, ViewChild, ChangeDetectionStrategy, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ResourceRegistryService } from "src/app/pages/explore/resources-registry/resource-registry.service";
import { Document } from "src/app/domain/document";
import { Model } from "src/survey-tool/catalogue-ui/domain/dynamic-form-model";
import { SurveyComponent } from "src/survey-tool/catalogue-ui/pages/dynamic-form/survey.component";
import { WebsocketService } from "src/survey-tool/catalogue-ui/services/websocket.service";
import { UntypedFormGroup } from "@angular/forms";


@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  standalone: true,
  imports: [SurveyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WebsocketService]
})

export class DocumentEditComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private resourceRegistryService = inject(ResourceRegistryService);
  private router = inject(Router);

  @ViewChild(SurveyComponent) child: SurveyComponent

  documentId: string | null = null;
  // document: Document | null = null;
  docModel = signal<Model>(undefined);
  payload = signal<object>(null);
  errorMessage = signal<string>(null);

  ngOnInit(): void {
    this.resourceRegistryService.getDocumentModel().subscribe({
      next: (model: Model) => {
        this.docModel.set(model);
      },
      error: (error) => {
        console.error('Failed to load document model:', error);
      }
    })

    this.documentId = this.route.snapshot.paramMap.get('id');

    if (this.documentId) {
      this.resourceRegistryService.getDocumentById(this.documentId).subscribe({
        next: (doc: Document) => {
          // this.document = doc;
          this.payload.set({'answer': {docInfo: doc.docInfo}});
        },
        error: (error) => {
          console.error('Error fetching document:', error);
        }
      });
    } else {
      console.error('No document ID provided in route.');
    }
  }


  onSubmit(event: UntypedFormGroup): void {
    const documentId = this.documentId;
    // const docInfo: Content = this.editForm.value;

    if (documentId) {
      const doc = this.resourceRegistryService.cleanObjectInPlace(event.get('docInfo').value);

      this.resourceRegistryService.updateDocument(documentId, doc).subscribe({
        next: () => {
          this.router.navigate(['document-landing', this.documentId], {relativeTo: this.route.parent}).then();
        },
        error: () => {
          this.errorMessage.set('Failed to save the document');
        }
      });
    }
  }

}
