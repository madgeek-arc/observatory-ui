import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ResourceRegistryService } from "src/app/pages/explore/resources-registry/resource-registry.service";
import { CommonModule } from "@angular/common";
import { Author, Document } from "src/app/domain/document";
import { FormArray } from "@angular/forms";


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
            originalTitles: new FormArray([]),
            acronym: new FormControl<string | null>(null),
            country: new FormControl<string | null>(null),
            language: new FormControl<string | null>(null),
            startDate: new FormControl<string | null>(null),
            endDate: new FormControl<string | null>(null),
            publicationDate: new FormControl<string | null>(null),
            modificationDate: new FormControl<string | null>(null),
            organisations: new FormArray([]),
            authors: new FormArray([this.createAuthorGroup()]),
            links: new FormArray([]),
            otherLinks: new FormArray([]),
            tags: new FormArray([]),
            otherTags: new FormArray([]),
            shortDescription: this.createDescriptionGroup(),
            abstract: this.createDescriptionGroup(),
            summary: this.createDescriptionGroup(),
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

    createLinkGroup(): FormGroup {
        return new FormGroup({
            name: new FormControl<string | null>(null),
            pid: new FormControl<string | null>(null),
            type:  new FormControl<string | null>(null),
            url:  new FormControl<string | null>(null),
            description:  new FormControl<string | null>(null)
        })
    }

    // --------------------------
    //GETTERS 
    // --------------------------

    //Authors
    get authors(): FormArray {
        return this.editForm.get('authors') as FormArray;
    }

    addAuthor(): void {
        this.authors.push(this.createAuthorGroup());
    }

    removeAuthor(index: number ): void {
        this.authors.removeAt(index);
    }

    //Original Titles
    get originalTitles(): FormArray {
        return this.editForm.get('originalTitles') as FormArray;
    }

    addOriginalTitle(): void {
        this.originalTitles.push(new FormControl<string | null>(null));
    }

    removeOriginalTitle(index: number): void {
        this.originalTitles.removeAt(index);
    }

    //Organisations
    get organisations(): FormArray {
        return this.editForm.get('organisations') as FormArray
    }

    addOrganisation(): void {
        this.organisations.push(new FormControl<string | null>(null));
    }

    removeOrganisations(index: number): void {
        this.organisations.removeAt(index);
    }

    //Tags 
    get tags(): FormArray {
        return this.editForm.get('tags') as FormArray
    }

    addTag(): void {
        this.tags.push(new FormControl<string | null>(null));
    }

    removeTags(index: number): void {
        this.tags.removeAt(index);
    }

    //Other tags
    get otherTags(): FormArray {
        return this.editForm.get('otherTags') as FormArray
    }

    addOtherTag(): void {
        this.otherTags.push(new FormControl<string | null>(null));
    }

    removeOtherTags(index: number): void {
        this.otherTags.removeAt(index)
    }

    //Links
    get links(): FormArray {
        return this.editForm.get('links') as FormArray
    }

    addLink(): void {
        this.links.push(this.createLinkGroup());
    }

    removeLink(index: number): void {
        this.links.removeAt(index)
    }

    //Other Links
    get otherLinks(): FormArray {
        return this.editForm.get('otherLinks') as FormArray
    }

    addOtherLink(): void {
        this.otherLinks.push(this.createLinkGroup())
    }

    removeOtherLink(index: number): void {
        this.otherLinks.removeAt(index)
    }

}