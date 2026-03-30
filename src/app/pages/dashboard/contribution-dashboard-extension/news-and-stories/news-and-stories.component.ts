import {Component, DestroyRef, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {PageContentComponent} from "../../../../../survey-tool/app/shared/page-content/page-content.component";
import {StakeholderNewsService} from "../../../services/stakeholder-news.service";
import {NewsItem, NewsWrapped, NewsResponse, NewsItemRequest} from '../../../../domain/news';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {URLParameter} from 'src/survey-tool/app/domain/url-parameter';
import {NgSelectModule} from '@ng-select/ng-select';

declare var UIkit: any;

@Component({
  selector: 'app-news-and-stories',
  standalone: true,
  imports: [CommonModule, PageContentComponent, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './news-and-stories.component.html'
})
export class NewsAndStoriesComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stakeholderNewsService = inject(StakeholderNewsService);
  private destroyRef = inject(DestroyRef);

  stakeholderId: string | null = null;
  newsItems: NewsWrapped[] = [];
  filteredItems: NewsWrapped[] = [];
  loading: boolean = true;
  searching: boolean = false;
  deleting: boolean = false;

  // Filter selections
  urlParameters: URLParameter[] = [];
  keyword: string = '';
  sort: string = 'creationDate';
  order: string = 'desc';
  activeFilter: string[] = [];
  keywordSubject = new Subject<string>();

  // Applied filters
  appliedSort: string = 'creationDate';
  appliedOrder: string = 'desc';
  appliedActive: string = 'all';

  readonly sortOptions = [
    {label: 'Creation Date', value: 'creationDate'},
    {label: 'Publish Date', value: 'publishDate'},
    {label: 'Title', value: 'title'}
  ];
  readonly orderOptions = [
    {label: 'Ascending', value: 'asc'},
    {label: 'Descending', value: 'desc'}
  ];
  readonly activeOptions = [
    {label: 'Active', value: 'true'},
    {label: 'Inactive', value: 'false'}
  ];

  // Pagination
  pageSize = 5;
  total = 0;
  currentPage = 1;
  totalPages = 0;
  pages: number[] = [];
  offset = 2;

  storyForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    url: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required]),
    publishDate: new FormControl('', [Validators.required]),
    expiryDate: new FormControl('', [Validators.required])
  });

  isUpdateMode = false;
  submitting = false;
  selectedNewsId: string | null = null;
  selectedNewsItem: NewsItem | null = null;
  selectedDeleteId: string | null = null;
  selectedDeleteStakeholderId: string | null = null;

  ngOnInit(): void {
    this.stakeholderId = this.route.snapshot.params['id'];

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.stakeholderId = params['id'];
    });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.keyword = params['keyword'] || '';
      this.sort = params['sort'] || 'creationDate';
      this.order = params['order'] || 'desc';

      const activeVal = params['active'] || '';
      this.activeFilter = activeVal ? [activeVal] : [];

      this.appliedSort = this.sort;
      this.appliedOrder = this.order;
      this.appliedActive = activeVal || 'all';

      const from = params['from'] ? +params['from'] : 0;

      this.urlParameters = [];
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          this.urlParameters.push({key, values: params[key].split(',')});
        }
      }

      if (!params['sort'] || !params['order']) {
        if (!params['sort']) this.updateURLParameters('sort', 'creationDate');
        if (!params['order']) this.updateURLParameters('order', 'desc');
        this.navigateUsingURLParameters();
        return;
      }

      if (this.stakeholderId) {
        this.fetchNews(from);
      }
    });

    // Subject pattern
    this.keywordSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(text => {
      this.updateURLParameters('keyword', text);
      this.updateURLParameters('from', '0');
      this.navigateUsingURLParameters();
    });
  }

  fetchNews(from: number = 0) {
    if (this.loading) {
      // still in initial load — keep showing the full-page spinner
    } else {
      this.searching = true;
    }
    this.stakeholderNewsService.getStakeholderNews(
      this.stakeholderId, from, this.pageSize, this.keyword, this.sort, this.order
    ).subscribe({
      next: (res: NewsResponse) => {
        this.newsItems = res.results;
        this.total = res.total;
        this.paginationInit(res.from);
        this.applyActiveFilter();
        this.loading = false;
        this.searching = false;
      },
      error: (err) => {
        console.error('Error fetching news:', err);
        this.loading = false;
        this.searching = false;
      }
    });
  }

  applyActiveFilter() {
    if (!this.activeFilter.length) {
      this.filteredItems = [...this.newsItems];
    } else {
      const isActive = this.activeFilter[0] === 'true';
      this.filteredItems = this.newsItems.filter(item => item.result.active === isActive);
    }
  }

  getOptionLabel(options: {label: string; value: string}[], value: string): string {
    return options.find(o => o.value === value)?.label ?? value;
  }

  paginationInit(from: number) {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = Math.floor(from / this.pageSize) + 1;
    this.totalPages = Math.ceil(this.total / this.pageSize);
    for (let i = (this.currentPage - this.offset); i < (this.currentPage + 1 + this.offset); ++i) {
      if (i < 1) { addToEndCounter++; }
      if (i > this.totalPages) { addToStartCounter++; }
      if (i >= 1 && i <= this.totalPages) { this.pages.push(i); }
    }
    for (let i = 0; i < addToEndCounter; ++i) {
      if (this.pages.length < this.totalPages) { this.pages.push(this.pages.length + 1); }
    }
    for (let i = 0; i < addToStartCounter; ++i) {
      if (this.pages[0] > 1) { this.pages.unshift(this.pages[0] - 1); }
    }
  }

  goToPage(page: number) {
    this.updateURLParameters('from', ((page - 1) * this.pageSize).toString());
    this.navigateUsingURLParameters();
  }

  previousPage() { this.goToPage(this.currentPage - 1); }
  nextPage() { this.goToPage(this.currentPage + 1); }

  onSortChange() {
    this.updateURLParameters('sort', this.sort);
    this.updateURLParameters('from', '0');
  }

  onOrderChange() {
    this.updateURLParameters('order', this.order);
    this.updateURLParameters('from', '0');
  }

  onActiveChange() {
    this.updateURLParameters('active', this.activeFilter);
    this.updateURLParameters('from', '0');
  }

  /** Fires when user clicks X on a chip inside the ng-select dropdown */
  onActiveRemove(currentValue: string[]) {
    this.updateURLParameters('active', currentValue);
    this.updateURLParameters('from', '0');
    this.navigateUsingURLParameters();
  }

  onSortRemove(currentValue: string) {
    this.sort = currentValue.length ? currentValue[0] : 'creationDate';
    this.updateURLParameters('sort', this.sort);
    this.updateURLParameters('from', '0');
    this.navigateUsingURLParameters();
  }

  onOrderRemove(currentValue: string) {
    this.order = currentValue.length ? currentValue[0] : 'desc';
    this.updateURLParameters('order', this.order);
    this.updateURLParameters('from', '0');
    this.navigateUsingURLParameters();
  }

  applyFilter(dropdownId: string) {
    UIkit.dropdown('#' + dropdownId).hide();
    this.navigateUsingURLParameters();
  }

  /** Badge removal methods */
  removeSortFilter() {
    this.sort = 'creationDate';
    this.updateURLParameters('sort', '');
    this.navigateUsingURLParameters();
  }

  removeOrderFilter() {
    this.order = 'desc';
    this.updateURLParameters('order', '');
    this.navigateUsingURLParameters();
  }

  removeActiveFilter() {
    this.activeFilter = [];
    this.updateURLParameters('active', '');
    this.navigateUsingURLParameters();
  }

  removeKeywordFilter() {
    this.keyword = '';
    this.updateURLParameters('keyword', '');
    this.navigateUsingURLParameters();
  }

  showClearFilter(): boolean {
    return (
      (this.keyword && this.keyword.trim() !== '') ||
      this.appliedSort !== 'creationDate' ||
      this.appliedOrder !== 'desc' ||
      this.appliedActive !== 'all'
    );
  }

  clearFilters() {
    this.urlParameters = this.urlParameters.filter(p =>
      p.key !== 'sort' && p.key !== 'order' && p.key !== 'active' && p.key !== 'keyword'
    );
    this.sort = 'creationDate';
    this.order = 'desc';
    this.activeFilter = [];
    this.keyword = '';
    this.navigateUsingURLParameters();
  }

  updateURLParameters(key: string, value: string | string[]) {
    if (!value || value.length === 0) {
      this.urlParameters = this.urlParameters.filter(param => param.key !== key);
      return;
    }
    if (Array.isArray(value)) {
      for (const urlParameter of this.urlParameters) {
        if (urlParameter.key === key) { urlParameter.values = value; return; }
      }
      this.urlParameters.push({key, values: value});
    } else {
      for (const urlParameter of this.urlParameters) {
        if (urlParameter.key === key) { urlParameter.values = [value]; return; }
      }
      this.urlParameters.push({key, values: [value]});
    }
  }

  navigateUsingURLParameters() {
    const map: {[name: string]: string} = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    this.router.navigate(['.'], {relativeTo: this.route, queryParams: map}).then();
  }

  openAddModal() {
    this.isUpdateMode = false;
    this.selectedNewsId = null;
    this.selectedNewsItem = null;
    this.storyForm.reset();
    UIkit.modal('#story-modal').show();
  }

  openUpdateModal(item: NewsWrapped) {
    this.isUpdateMode = true;
    this.selectedNewsId = item.result.id;
    this.selectedNewsItem = item.result;
    this.storyForm.patchValue({
      title: item.result.title,
      description: item.result.description,
      url: item.result.url,
      image: item.result.image,
      publishDate: item.result.publishDate ? item.result.publishDate.split('T')[0] : '',
      expiryDate: item.result.expiryDate ? item.result.expiryDate.split('T')[0] : ''
    });
    UIkit.modal('#story-modal').show();
  }

  onSubmit() {
    if (this.storyForm.invalid || !this.stakeholderId) return;
    this.submitting = true;
    const formValue = this.storyForm.value;

    const payload: NewsItemRequest = {
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      url: formValue.url ?? '',
      image: formValue.image ?? '',
      publishDate: formValue.publishDate ?? '',
      expiryDate: formValue.expiryDate ?? ''
    };

    if (this.isUpdateMode && this.selectedNewsId) {
      this.stakeholderNewsService
        .putNews(this.stakeholderId, this.selectedNewsId, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            UIkit.modal('#story-modal').hide();
            this.fetchNews((this.currentPage - 1) * this.pageSize);
          },
          error: (err) => {
            this.submitting = false;
            console.error('Error updating story:', err);
          }
        });
    } else {
      this.stakeholderNewsService
        .postNews(this.stakeholderId, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            UIkit.modal('#story-modal').hide();
            this.fetchNews((this.currentPage - 1) * this.pageSize);
          },
          error: (err) => {
            this.submitting = false;
            console.error('Error adding story:', err);
          }
        });
    }
  }

  onDelete() {
    if (!this.selectedDeleteId || !this.selectedDeleteStakeholderId) return;
    this.deleting = true;
    this.stakeholderNewsService.deleteNews(this.selectedDeleteStakeholderId, this.selectedDeleteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting = false;
          UIkit.modal('#delete-modal').hide();
          if (this.newsItems.length === 1 && this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
          } else {
            this.fetchNews((this.currentPage - 1) * this.pageSize);
          }
          this.selectedDeleteId = null;
          this.selectedDeleteStakeholderId = null;
        },
        error: (err) => {
          this.deleting = false;
          console.error('Error deleting story:', err);
        }
      });
  }

  openDeleteModal(item: NewsWrapped) {
    this.selectedDeleteId = item.result.id;
    this.selectedDeleteStakeholderId = item.result.stakeholderId;
    UIkit.modal('#delete-modal').show();
  }
}
