import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ResourceRegistryService } from "src/app/pages/explore/resources-registry/resource-registry.service";
import { CommonModule } from "@angular/common";
import { Document } from "src/app/domain/document";
import { Model } from "src/survey-tool/catalogue-ui/domain/dynamic-form-model";
import { CatalogueUiModule } from "src/survey-tool/catalogue-ui/catalogue-ui.module";
import { SurveyToolModule } from "src/survey-tool/app/survey-tool.module";
import { SurveyComponent } from "src/survey-tool/catalogue-ui/pages/dynamic-form/survey.component";
import { WebsocketService } from "../../../../../survey-tool/app/services/websocket.service";


@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CatalogueUiModule,
    SurveyToolModule,
  ],
  providers: [WebsocketService]
})

export class DocumentEditComponent implements OnInit {

  @ViewChild(SurveyComponent) child: SurveyComponent

  documentId: string | null = null;
  document: Document | null = null;
  docModel: Model;
  payload: object = null;

  constructor(
    private route: ActivatedRoute,
    private resourceRegistryService: ResourceRegistryService,
  ) {}

  ngOnInit(): void {
    this.resourceRegistryService.getDocumentModel().subscribe({
      next: (model: Model) => {
        this.docModel = model
      },
      error: (error) => {
        console.error('Failed to load document model:', error);
      }
    })

    this.documentId = this.route.snapshot.paramMap.get('id');

    if (this.documentId) {
      this.resourceRegistryService.getDocumentById(this.documentId).subscribe({
        next: (doc: Document) => {
          this.document = doc;
          this.payload = {'answer': {docInfo: doc.docInfo}};
        },
        error: (error) => {
          console.error('Error fetching document:', error);
        }
      });
    } else {
      console.error('No document ID provided in route.');
    }
  }


  onSubmit(event): void {
    const documentId = this.documentId;
    // const docInfo: Content = this.editForm.value;

    if (documentId) {
      this.resourceRegistryService.updateDocument(documentId, event[0].get('docInfo').value).subscribe({
        next: (response) => {
          console.log('Document updated successfully:', response);
          alert('Document updated successfully!');
        },
        error: (error) => {
          console.error('Error updating document:', error);
        }
      });
    }
  }

}
