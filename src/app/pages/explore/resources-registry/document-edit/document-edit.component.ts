import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ResourceRegistryService } from "src/app/pages/explore/resources-registry/resource-registry.service";
import { CommonModule } from "@angular/common";
import { Author, Document, Link, Content } from "src/app/domain/document";
import { FormArray } from "@angular/forms";
import { Model } from "src/survey-tool/catalogue-ui/domain/dynamic-form-model";
import { CatalogueUiModule } from "src/survey-tool/catalogue-ui/catalogue-ui.module";
import { WebsocketService } from "src/survey-tool/app/services/websocket.service";
import { SurveyToolModule } from "src/survey-tool/app/survey-tool.module";
import { MessagingSystemModule } from "src/messaging-system-ui/app/messaging-system.module";


@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CatalogueUiModule,
    SurveyToolModule,
    MessagingSystemModule
  ],
})
export class DocumentEditComponent implements OnInit {
    
    documentId: string | null = null;
    document: Document | null = null;
    editForm!: FormGroup;
    docModel: Model;

    constructor(
        private route: ActivatedRoute,
        private resourceRegistryService: ResourceRegistryService,
        private router: Router,
        private wsService: WebsocketService 
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
        this.createForm();
        this.documentId = this.route.snapshot.paramMap.get('id');

        if (this.documentId) {
            this.resourceRegistryService.getDocumentById(this.documentId).subscribe({
                next: (doc: Document) => {
                    this.document = doc;
                    this.editForm.patchValue(doc.docInfo);
                    // FormGroup Arrays
                    this.setAuthorArrayValues(doc);
                    this.setLinkArrayValues(doc);
                    this.setOtherLinkArrayValues(doc);
                    // FormControl Arrays
                    this.setOriginalTitlesArrayValues(doc);
                    this.setOrganisationsArrayValues(doc);
                    this.setTagsArrayValues(doc);
                    this.setOtherTagsArrayValues(doc);
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
            authors: new FormArray([]),
            links: new FormArray([]),
            otherLinks: new FormArray([]),
            tags: new FormArray([]),
            otherTags: new FormArray([]),
            shortDescription: this.createDescriptionGroup(),
            abstract: this.createDescriptionGroup(),
            summary: this.createDescriptionGroup(),
        });
        this.addOtherTag();
        this.addTag();
        this.addOriginalTitle();
        this.addOrganisation();
        this.addAuthor();
        this.addLink();
        this.addOtherLink()
    }

    createDescriptionGroup(): FormGroup {
        return new FormGroup({
            text: new FormControl<string | null>(null),
            generated: new FormControl<boolean | null>(null)
        });
    }

    createAuthorGroup(author?: Author): FormGroup {
        return new FormGroup({
            name: new FormControl<string | null>(author?.name ?? null),
            orcid: new FormControl<string | null>(author?.orcid ?? null)
        })
    }

    createLinkGroup(link?: Link): FormGroup {
        return new FormGroup({
            name: new FormControl<string | null>(link?.name ?? null),
            pid: new FormControl<string | null>(link?.pid ?? null),
            type:  new FormControl<string | null>(link?.type ?? null),
            url:  new FormControl<string | null>(link?.url ?? null),
            description:  new FormControl<string | null>(link?.description ?? null)
        })
    }

    // --------------------------
    //GETTERS 
    // --------------------------

    //Authors
    get authors(): FormArray {
        return this.editForm.get('authors') as FormArray;
    }

    get authorGroups(): FormGroup[] {
        return this.authors.controls as FormGroup[]
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

    get originalTitleControls(): FormControl[] {
        return this.originalTitles.controls as FormControl[];
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

    get organisationControls(): FormControl[] {
        return (this.editForm.get('organisations') as FormArray).controls as FormControl[]
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

    get tagControls(): FormControl[] {
        return this.tags.controls as FormControl[]
    }

    addTag(): void {
        this.tags.push(new FormControl<string | null>(null));
    }

    removeTag(index: number): void {
        this.tags.removeAt(index);
    }

    //Other tags
    get otherTags(): FormArray {
        return this.editForm.get('otherTags') as FormArray
    }

    get otherTagControls(): FormControl[] {
        return this.otherTags.controls as FormControl[]
    }

    addOtherTag(): void {
        this.otherTags.push(new FormControl<string | null>(null));
    }

    removeOtherTag(index: number): void {
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

    setAuthorArrayValues(doc: Document): void {
        this.authors.clear();

        if ( doc.docInfo?.authors && doc.docInfo?.authors.length > 0) {
            doc.docInfo?.authors.forEach((author: Author) => {
                this.authors.push(this.createAuthorGroup(author))
            })
        }
        if (this.authors.length === 0) {
            this.addAuthor();
        }
    }

    setLinkArrayValues(doc: Document): void {
        this.links.clear();

        if (doc.docInfo?.links && doc.docInfo?.links.length > 0) {
            doc.docInfo?.links.forEach((link: Link) => {
                this.links.push(this.createLinkGroup(link))
            })
        }
        if (this.links.length === 0) {
            this.addLink();
        }
    }

    setOtherLinkArrayValues(doc: Document): void {
        this.otherLinks.clear();

        if (doc.docInfo?.otherLinks && doc.docInfo?.otherLinks.length > 0) {
            doc.docInfo?.otherLinks.forEach((otherLink: Link) => {
                this.otherLinks.push(this.createLinkGroup(otherLink))
            })
        }
        if ( this.otherLinks.length === 0) {
            this.addLink();
        }
    }

    private populateSimpleArray(formArray: FormArray, dataArray: string[]): void {
        formArray.clear();

        if (dataArray && dataArray.length > 0) {
            dataArray.forEach((string: string) => {
                formArray.push(new FormControl<string | null>(string));
            })
        }
    }

    setOriginalTitlesArrayValues(doc: Document): void {
        this.populateSimpleArray(this.originalTitles, doc.docInfo?.originalTitles);

        if (this.originalTitles.length === 0) {
            this.addOriginalTitle();
        }
    }

    setOrganisationsArrayValues(doc: Document): void {
        this.populateSimpleArray(this.organisations, doc.docInfo?.organisations);

        if (this.organisations.length === 0) {
            this.addOrganisation();
        }
    }

    setTagsArrayValues(doc: Document): void {
        this.populateSimpleArray(this.tags, doc.docInfo?.tags);

        if (this.tags.length === 0) {
            this.addTag();
        }
    }

    setOtherTagsArrayValues(doc: Document): void {
        this.populateSimpleArray(this.otherTags, doc.docInfo?.otherTags)

        if (this.otherTags.length === 0) {
            this.addOtherTag();
        }
    }

    onSubmit(): void {
        const documentId = this.documentId;
        const docInfo: Content = this.editForm.value;

        if (documentId) {
            this.resourceRegistryService.updateDocument(documentId, docInfo).subscribe({
                next: (response) => {
                    console.log('Document updated successfully:', response);
                    alert('Document updated successfully!');
                },
                error: (error) => {
                    console.error('Error updating document:', error);
                }
            })
        }
    }

}