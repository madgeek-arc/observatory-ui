import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResourceRegistryService } from '../resource-registry.service';
import { Document, HighlightedResults } from 'src/app/domain/document';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { NgSelectModule } from '@ng-select/ng-select';
import { SearchCardComponent } from "./card/search-card.component";
import { URLParameter } from 'src/survey-tool/app/domain/url-parameter';
import { Facet } from 'src/survey-tool/catalogue-ui/domain/facet';
import { Paging } from 'src/survey-tool/catalogue-ui/domain/paging';
import { PageContentComponent } from 'src/survey-tool/app/shared/page-content/page-content.component';
import {
  SidebarMobileToggleComponent
} from 'src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component';
import * as UIkit from 'uikit';
import { UserService } from "src/survey-tool/app/services/user.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { Administrator } from "src/survey-tool/app/domain/userInfo";

@Component({
  selector: 'app-resource-registry-search',
  providers: [ResourceRegistryService, StakeholdersService],
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, NgSelectModule, PageContentComponent, SidebarMobileToggleComponent, SearchCardComponent]
})

export class SearchComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private stakeholdersService = inject(StakeholdersService);
  private resourceRegistryService = inject(ResourceRegistryService);

  keywordSubject = new Subject<string>();

  urlParameters: URLParameter[] = []; // Array to hold URL parameters
  documents = signal<Paging<HighlightedResults<Document>>>(new Paging<any>()); // Initialize with empty Paging object

  // Search properties
  from = 0;
  pageSize = 10;
  searchQuery = signal<string>(null);
  languageFacets = signal<Facet>(undefined);
  countryFacets = signal<Facet>(undefined);
  tagFacets = signal<Facet>(undefined);
  statusFacets = signal<Facet>(undefined);
  selectedLanguages = signal<string[]>([]);
  selectedCountry = signal<string[]>([]);
  selectedTag = signal<string[]>([]);
  selectedStatus = signal<string[]>([]);
  loading = signal(true);
  searching = signal(false);

  // Variables to hold applied filters
  appliedLanguages = signal<string[]>([]);
  appliedCountries = signal<string[]>([]);
  appliedTags = signal<string[]>([]);
  appliedStatus = signal<string[]>([]);

  // Pagination State
  pages = signal<number[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  offset: number = 2;

  isAdminPage = signal(false);

  // Alert properties
  statusMessage: string = null;
  statusType: 'success' | 'danger' = null;
  error: string = null;

  alertStates: { [id: string]: { message: string; type: 'success' | 'danger' } } = {};



  ngOnInit() {
    this.loading.set(true);
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      let id = params['id'] || params['stakeholderId'];

      if (id) {
        this.initAdminGroup(id);
       }
    })

    if (this.route.snapshot.paramMap.get('stakeholderId') && this.route.snapshot.paramMap.get('stakeholderId') === 'admin-eosc-sb') {
      this.isAdminPage.set(true);
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
      this.selectedLanguages.set(params['language'] ? params['language'].split(',') : []);
      this.selectedCountry.set(params['country'] ? params['country'].split(',') : []);
      this.selectedTag.set(params['tags'] ? params['tags'].split(',') : []);
      this.selectedStatus.set(params['status'] ? params['status'].split(',') : []);
      this.searchQuery.set(params['keyword'] || '');

      // Initialize applied filters from URL parameters
      this.appliedLanguages.set([...this.selectedLanguages()]);
      this.appliedCountries.set([...this.selectedCountry()]);
      this.appliedTags.set([...this.selectedTag()]);
      this.appliedStatus.set([...this.selectedStatus()]);

      // Pagination offset from URL
      if (params['from']) {
        this.from = +params['from'];
      } else {
        this.from = 0;
      }

      this.setResults([]);
      this.loadDocuments();

    });
    this.keywordSubject.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((text: string) => {
      this.searchQuery.set(text);
      this.updateURLParameters('from', '0');
      this.updateURLParameters('keyword', text);
      this.navigateUsingURLParameters();
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

  // Load documents based on current parameters
  loadDocuments() {
    if (!this.loading()) {
      this.searching.set(true);
    }
    this.resourceRegistryService.getDocument(this.from, this.pageSize, this.urlParameters, this.isAdminPage())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data) => {

          if (data?.results?.length > 0) {
            const documents = data as Paging<HighlightedResults<Document>>;

            documents.results.forEach((element) => {
              const docInfo = element.result?.docInfo;

              if (docInfo) {
                if (docInfo.organisations && element.highlights) {
                  docInfo.organisations = this.resourceRegistryService.replaceWithHighlighted(
                    docInfo.organisations,
                    element.highlights,
                    'organisations'
                  );
                }
              }
            });
            this.documents.set(documents);
            this.loading.set(false);
            this.searching.set(false);
            this.paginationInit();
            if (data.facets && data.facets.length > 0) {
              this.languageFacets.set(data.facets.find(facet => facet.field === 'language'));
              this.countryFacets.set(data.facets.find(facet => facet.field === 'country'));
              this.tagFacets.set(data.facets.find(facet => facet.field === 'tags'));
              this.statusFacets.set(data.facets.find(facet => facet.field === 'status'));
            }
          } else {
            this.setResults([]);
            this.loading.set(false);
            this.searching.set(false);
          }
        },
        error: (err) => {
          console.error('API error:', err);
          this.loading.set(false);
          this.searching.set(false);
        }
      });
  }

  // Pagination methods
  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    const totalPages = Math.ceil(this.documents().total / this.pageSize);
    const currentPage = Math.ceil(this.from / this.pageSize) + 1;
    const pages: number[] = [];

    for (let i = (+currentPage - this.offset); i <= (+currentPage + this.offset); i++) {
      if (i < 1) {
        addToEndCounter++;
      }
      if (i > totalPages) {
        addToStartCounter++;
      }
      if (i >= 1 && i <= totalPages) {
        pages.push(i);
      }
    }
    for (let i = 0; i < addToEndCounter; i++) {
      if (pages.length < totalPages) {
        pages.push(pages.length + 1);
      }
    }
    for (let i = 0; i < addToStartCounter; i++) {
      if (pages[0] > 1) {
        pages.unshift(pages[0] - 1);
      }
    }

    this.totalPages.set(totalPages);
    this.currentPage.set(currentPage);
    this.pages.set(pages);
  }

  goToPage(page: number) {
    const targetPage = page + 1;
    if (targetPage >= 1 && targetPage <= this.totalPages()) {
      this.updateURLParameters('from', (page * this.pageSize).toString());
      this.navigateUsingURLParameters();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      const newPage = this.currentPage() - 1;
      this.updateURLParameters('from', ((newPage - 1) * this.pageSize).toString());
      this.navigateUsingURLParameters();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      const newPage = this.currentPage() + 1;
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

      this.urlParameters.push({key: key, values: value});

    } else if (typeof value === 'string') {
      for (const urlParameter of this.urlParameters) {
        if (urlParameter.key === key) {
          urlParameter.values = [value];
          return;
        }
      }
      this.urlParameters.push({key: key, values: [value]});
    }

  }

  navigateUsingURLParameters() {
    const map: { [name: string]: string } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }

    this.router.navigate(['.'], {relativeTo: this.route, queryParams: map}).then();
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
      param.key !== 'status' &&
      param.key !== 'quantity'
    );
    // this.updateURLParameters('from', '0');
    this.navigateUsingURLParameters();
    this.selectedLanguages.set([]);
    this.selectedCountry.set([]);
    this.selectedTag.set([]);
    this.selectedStatus.set([]);
    this.removeKeywordFilter();
  }

  applyFilter(dropDownId: string) {
    UIkit.dropdown('#' + dropDownId).hide();
    this.navigateUsingURLParameters();
  }

  onFilterRemove(key: string, currentValue: string[]) {
    this.updateURLParameters(key, currentValue);
    this.navigateUsingURLParameters();
  }

  showClearFilter(): boolean {
    return (
      (this.appliedLanguages() && this.appliedLanguages().length > 0) ||
      (this.appliedCountries() && this.appliedCountries().length > 0) ||
      (this.appliedTags() && this.appliedTags().length > 0) ||
      (this.appliedStatus() && this.appliedStatus().length > 0) ||
      (this.searchQuery() && this.searchQuery().trim() !== '')
    );
  }

  removeLanguageFilter(language: string) {
    this.selectedLanguages.update(languages => languages.filter(lang => lang !== language));
    this.appliedLanguages.update(languages => languages.filter(lang => lang !== language));
    this.updateURLParameters('language', this.selectedLanguages());
    this.navigateUsingURLParameters();
  }

  removeCountryFilter(country: string) {
    this.selectedCountry.update(countries => countries.filter(c => c !== country));
    this.appliedCountries.update(countries => countries.filter(c => c !== country));
    this.updateURLParameters('country', this.selectedCountry());
    this.navigateUsingURLParameters();
  }

  removeTagFilter(tag: string) {
    this.selectedTag.update(tags => tags.filter(t => t !== tag));
    this.appliedTags.update(tags => tags.filter(t => t !== tag));
    this.updateURLParameters('tags', this.selectedTag());
    this.navigateUsingURLParameters();
  }

  removeStatusFilter(status: string) {
    this.selectedStatus.update(statuses => statuses.filter(t => t !== status));
    this.appliedStatus.update(statuses => statuses.filter(t => t !== status));
    this.updateURLParameters('status', this.selectedStatus());
    this.navigateUsingURLParameters();
  }

  removeKeywordFilter() {
    this.searchQuery.set('');
    this.updateURLParameters('keyword', '');
    this.navigateUsingURLParameters();
  }

  /** <---------------------------------------------------------------------------------------------- Filter methods **/

  // Alert methods
  onUpdateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    this.resourceRegistryService.updateStatus(id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        console.log(`Document ${id} status updated to ${status}`);

        this.alertStates[id] = {
          message: status === 'APPROVED' ? 'Document approved successfully.' : 'Document rejected successfully.',
          type: 'success'
        };
        setTimeout(() => delete this.alertStates[id], 5000);

        this.resourceRegistryService.getDocumentById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (data) => {
            // Ενημερώνουμε μόνο το document που άλλαξε μέσα στη λίστα
            const index = this.documents().results.findIndex(d => d.result.id === id);
            if (index !== -1) {
              // A new array with a new element, so the OnPush card re-renders the changed document
              this.setResults(this.documents().results.map((element, i) => i === index ? {...element, result: data} : element));
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
        window.scrollTo({top: 0, behavior: 'smooth'});
        setTimeout(() => this.statusMessage = null, 5000);
        console.error(err);
      }
    });
  }

  /** Gives the signal a new Paging with the given results, so OnPush children see a new array. */
  private setResults(results: HighlightedResults<Document>[]) {
    this.documents.update(documents => ({...documents, results}));
  }

  getHighlightForField(doc: any, fieldName: string): string | undefined {
    return doc.highlights.find((el: any) => el.field === fieldName)?.value;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected readonly HTMLInputElement = HTMLInputElement;
}
