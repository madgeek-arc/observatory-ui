import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ResourceRegistryService } from "src/app/pages/explore/resources-registry/resource-registry.service";
import { CommonModule } from "@angular/common";
import { Author, Document, Link } from "src/app/domain/document";
import { Validators } from "@angular/forms";
import { FormArray } from "@angular/forms";
import { Description } from "src/app/domain/document";
import { Content } from "src/app/domain/document";

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class DocumentEditComponent implements OnInit {
    
    documentId: string | null = null;
    document: Document | null = null;
    editForm!: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private resourceRegistryService: ResourceRegistryService,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.documentId = this.route.snapshot.paramMap.get('id');

        if (this.documentId) {
            this.resourceRegistryService.getDocumentById(this.documentId).subscribe({
                next: (doc: Document) => {
                    this.document = doc;
                    console.log('Document loaded successfully:', this.document);
                },
                error: (error) => {
                    console.error('Error fetching document:', error);
                }
            });
        } else {
            console.error('No document ID provided in route.');
    }
}

    initializeForm(docInfo: Content): void {
        this.editForm = this.fb.group({
            title: [docInfo.title],
            acronym: [docInfo.acronym],
            country: [docInfo.country],
            language: [docInfo.language],
            publicationDate: [docInfo.publicationDate],
        })
    }

    createDescriptionGroup(description: Description): FormGroup {
        return this.fb.group({
            text: [description.text],
            generated: [description.generated]
        });
    }

    createAuthorGroup(author: Author): FormGroup {
        return this.fb.group({
            name: [author.name],
            orcid: [author.orcid]
        });
    }

    createLinkGroup(link: Link): FormGroup {
        return this.fb.group({
            name: [link.name],
            pid: [link.pid],
            type: [link.type],
            url: [link.url],
            description: [link.description]
        })
    }
}