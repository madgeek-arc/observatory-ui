import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ResourceRegistryService } from "src/app/pages/explore/resources-registry/resource-registry.service";
import { CommonModule } from "@angular/common";
import { Author, Document, Link } from "src/app/domain/document";
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
    ) {}

    ngOnInit(): void {
        this.createForm();
        this.documentId = this.route.snapshot.paramMap.get('id');

        if (this.documentId) {
            this.resourceRegistryService.getDocumentById(this.documentId).subscribe({
                next: (doc: Document) => {
                    this.document = doc;
                    this.editForm.patchValue(doc.docInfo)
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

    createForm(): void {
        this.editForm = new FormGroup({
            title: new FormControl<string | null>(null, Validators.required),
            acronym: new FormControl<string | null>(null),
            country: new FormControl<string | null>(null),
            language: new FormControl<string | null>(null),
            startDate: new FormControl<string | null>(null),
            endDate: new FormControl<string | null>(null),
            author: new FormArray([]),
            shortDescription: this.createDescriptionGroup()
        });
    }

    createDescriptionGroup(): FormGroup {
        return new FormGroup({
            text: new FormControl<string | null>(null),
            generated: new FormControl<boolean | null>(null)
        });
    }

    createAuthorGroup(): FormGroup {
        return new FormGroup({
            name: new FormControl<string | null>(null),
            orcid: new FormControl<string | null>(null)
        })
    }

    // --------------------------
    //GETTERS 
    // --------------------------

    get authors(): FormArray {
        return this.editForm.get('authors') as FormArray;
    }

    addAuthor(): void {
        this.authors.push(this.createAuthorGroup());
    }

    removeAuthor(index: number ): void {
        this.authors.removeAt(index);
    }

}