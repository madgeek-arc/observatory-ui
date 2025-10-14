import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ResourceRegistryService } from '../resource-registry.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Document } from 'src/app/domain/document';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { URLParameter } from 'src/survey-tool/app/domain/url-parameter';
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { Facet } from 'src/survey-tool/catalogue-ui/domain/facet';
import { Paging } from 'src/survey-tool/catalogue-ui/domain/paging';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PageContentComponent } from 'src/survey-tool/app/shared/page-content/page-content.component';
import {
  SidebarMobileToggleComponent
} from 'src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';
import * as UIkit from 'uikit';


@Component({
    selector: 'app-resource-registry-search',
    templateUrl: './search.component.html',
    imports: [CommonModule, FormsModule, RouterModule, NgSelectModule, NgOptimizedImage, PageContentComponent, SidebarMobileToggleComponent]
})

export class SearchComponent implements OnInit {
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  urlParameters: URLParameter[] = []; // Array to hold URL parameters
  destroyRef = inject(DestroyRef);
  documents: Paging<Document> = new Paging<Document>(); // Initialize with empty Paging object

  // Search properties
  from = 0;
  pageSize = 10;
  searchQuery: string = null;
  languageFacets: Facet;
  countryFacets: Facet;
  tagFacets: Facet;
  selectedLanguages: string[] = [];
  selectedCountry: string[] = [];
  selectedTag: string[] = [];

  // Variables to hold applied filters
  appliedLanguages: string[] = [];
  appliedCountries: string[] = [];
  appliedTags: string[] = [];

  // Pagination State
  pages: number[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  offset: number = 2;

  isAdminPage: boolean = false;

  // Alert properties
  statusMessage: string = null;
  statusType: 'success' | 'danger' = null;
  error: string = null;

  alertStates: { [id: string]: { message: string; type: 'success' | 'danger' } } = {};



  constructor(private resourceService: ResourceRegistryService, private route: ActivatedRoute, private router: Router, private resourceRegistryService: ResourceRegistryService) {}

  ngOnInit() {

    if (this.route.snapshot.paramMap.get('stakeholderId') && this.route.snapshot.paramMap.get('stakeholderId') === 'admin-eosc-sb') {
      this.isAdminPage = true
    }

    // Subscribe to route parameters to get initial data
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      // console.log('Reading url params');
      this.urlParameters = [];
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          const urlParameter = new URLParameter();
          urlParameter.key = obj;
          urlParameter.values = params[obj].split(',');
          this.urlParameters.push(urlParameter);
        }
      }
     // Parse selected languages, country, and tags from query parameters
      this.selectedLanguages = params['language'] ? params['language'].split(',') : [];
      this.selectedCountry = params['country'] ? params['country'].split(',') : [];
      this.selectedTag = params['tags'] ? params['tags'].split(',') : [];
      this.searchQuery = params['keyword'] || '';

      // Initialize applied filters from URL parameters
      this.appliedLanguages = [...this.selectedLanguages];
      this.appliedCountries = [...this.selectedCountry];
      this.appliedTags = [...this.selectedTag];

     // Pagination offset from URL
      if (params['from']) {
        this.from = +params['from'];
      } else {
        this.from = 0;
      }

      this.documents.results = [];
      // console.log('Query params:', params);
      // console.log('Parsed languages:', this.selectedLanguages);
      this.loadDocuments();

    });
   // Initialize search input event listener for real-time search
    fromEvent(this.searchInput.nativeElement, 'input').pipe(
      map((event: any) => event.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((text: string) => {
      this.searchQuery = text;
      this.updateURLParameters('from', '0');
      this.updateURLParameters('keyword', text);
      this.navigateUsingURLParameters();
    });
  }

  // Load documents based on current parameters
  loadDocuments() {
    this.resourceService.getDocument(this.from, this.pageSize, this.urlParameters)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        if (data.results.length > 0) {
          this.documents = data;
          // console.log('Documents loaded, total so far:', this.documents.results.length);
          this.paginationInit();
          if (data.facets && data.facets.length > 0) {
            this.languageFacets = data.facets.find(facet => facet.field === 'language');
            // console.log('Language facets:', this.languageFacets);
          }
        }
        if (data.facets && data.facets.length > 0) {
          this.countryFacets = data.facets.find(facet => facet.field === 'country');
          // console.log('Country facets:', this.countryFacets);
        }
        if (data.facets && data.facets.length > 0) {
          this.tagFacets = data.facets.find(facet => facet.field === 'tags');
          // console.log('Tag facets:', this.tagFacets);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });

  }

  // Pagination methods
  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.totalPages = Math.ceil(this.documents.total / this.pageSize);
    this.currentPage = Math.ceil(this.from / this.pageSize) + 1;
    this.pages = [];

    for (let i = (+this.currentPage - this.offset); i <= (+this.currentPage + this.offset); i++) {
      if (i < 1) { addToEndCounter++;}
      if (i > this.totalPages) { addToStartCounter++; }
      if (i >= 1 && i <= this.totalPages) {
        this.pages.push(i);
      }
    }
    for (let i = 0; i < addToEndCounter; i++) {
      if (this.pages.length < this.totalPages) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for (let i = 0; i < addToStartCounter; i++) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1);
      }
    }
  }

  goToPage(page: number) {
    const targetPage = page + 1;
    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.updateURLParameters('from', (page * this.pageSize).toString());
      this.navigateUsingURLParameters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      const newPage = this.currentPage - 1;
      this.updateURLParameters('from', ((newPage - 1) * this.pageSize).toString());
      this.navigateUsingURLParameters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      const newPage = this.currentPage + 1;
      this.updateURLParameters('from', ((newPage - 1) * this.pageSize).toString());
      this.navigateUsingURLParameters();
    }
  }

  updateURLParameters(key: string, value: string | string[]) {

    if (!value || value.length === 0) {
      // If values are empty, remove the parameter
      this.urlParameters = this.urlParameters.filter(param => param.key !== key);
      return;
    }

    if (Array.isArray(value)) {

      for (const urlParameter of this.urlParameters) {
        if (urlParameter.key === key) {
          urlParameter.values = value;
          return;
        }
      }

      this.urlParameters.push({key: key, values: value });

    } else if (typeof value === 'string') {
      for (const urlParameter of this.urlParameters) {
        if (urlParameter.key === key) {
          urlParameter.values = [value];
          return;
        }
      }
      this.urlParameters.push({key: key, values: [value] });
    }

    // console.log('Received values:', values);
  }

  navigateUsingURLParameters() {
    const map: { [name: string]: string } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    // console.log('Navigating with params:', map);

    this.router.navigate(['.'], {relativeTo: this.route, queryParams: map});
  }

  /** Filter methods ----------------------------------------------------------------------------------------------->**/

  onFilterChange(key: string, value: string[]) {
    this.updateURLParameters(key, value);
    this.updateURLParameters('from', '0');
  }

  clearFilters() {
    // Remove filters from urlParameters
    this.urlParameters = this.urlParameters.filter(param =>
      param.key !== 'language' &&
      param.key !== 'country' &&
      param.key !== 'tags' &&
      param.key !== 'quantity'
    );
    // this.updateURLParameters('from', '0');
    this.navigateUsingURLParameters();
    this.selectedLanguages = [];
    this.selectedCountry = [];
    this.selectedTag = [];
    this.removeKeywordFilter();
  }

  applyFilter(dropDownId: string) {
    UIkit.dropdown('#'+dropDownId).hide();
    this.navigateUsingURLParameters();
  }

  onFilterRemove(key: string, currentValue: string[]){
    this.updateURLParameters(key, currentValue);
    this.navigateUsingURLParameters();
  }

  showClearFilter(): boolean {
    return (
      (this.appliedLanguages && this.appliedLanguages.length > 0) ||
      (this.appliedCountries && this.appliedCountries.length > 0) ||
      (this.appliedTags && this.appliedTags.length > 0) ||
      (this.searchQuery && this.searchQuery.trim() !== '')
    );
  }

  removeLanguageFilter(language: string) {
    this.selectedLanguages = this.selectedLanguages.filter(lang => lang !== language);
    this.appliedLanguages = this.appliedLanguages.filter(lang => lang !== language);
    this.updateURLParameters('language', this.selectedLanguages);
    this.navigateUsingURLParameters();
  }

  removeCountryFilter(country: string) {
    this.selectedCountry = this.selectedCountry.filter(c => c !== country);
    this.appliedCountries = this.appliedCountries.filter(c => c !== country);
    this.updateURLParameters('country', this.selectedCountry);
    this.navigateUsingURLParameters();
  }

  removeTagFilter(tag: string) {
    this.selectedTag = this.selectedTag.filter(t => t !== tag);
    this.appliedTags = this.appliedTags.filter(t => t !== tag);
    this.updateURLParameters('tags', this.selectedTag);
    this.navigateUsingURLParameters();
  }

  removeKeywordFilter() {
    this.searchQuery = '';
    this.updateURLParameters('keyword', '');
    this.navigateUsingURLParameters();
  }

  /** <---------------------------------------------------------------------------------------------- Filter methods **/

  // Alert methods
   onUpdateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
  this.resourceRegistryService.updateStatus(id, status)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        console.log(`Document ${id} status updated to ${status}`);

        this.alertStates[id] = {
          message: status === 'APPROVED'
            ? 'Document approved successfully.'
            : 'Document rejected successfully.',
          type: 'success'
        };

        // Εμφανίζουμε πράσινο alert (success)
        // this.statusMessage = status === 'APPROVED'
        //   ? 'Document approved successfully.'
        //   : 'Document rejected successfully.';
        // this.statusType = 'success';
        // window.scrollTo({ top: 0, behavior: 'smooth' });
        // setTimeout(() => this.statusMessage = null, 5000);
        setTimeout(() => delete this.alertStates[id], 5000);

        // Κάνουμε ξανά GET μόνο για το συγκεκριμένο document
        this.resourceRegistryService.getDocumentById(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (data) => {
              // Ενημερώνουμε μόνο το document που άλλαξε μέσα στη λίστα
              const index = this.documents.results.findIndex(d => d.id === id);
              if (index !== -1) {
                this.documents.results[index] = data;
              }
            },
            error: (err) => {
              this.error = 'Error fetching document after status update.';
              this.statusMessage = 'Failed to refresh document data.';
              this.statusType = 'danger';
              setTimeout(() => this.statusMessage = null, 5000);
              console.error(err);
            }
          });
      },
      error: (err) => {
        this.error = `Error updating document status to ${status}.`;
        this.statusMessage = 'Failed to update document status.';
        this.statusType = 'danger';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.statusMessage = null, 5000);
        console.error(err);
      }
    });
}



}
