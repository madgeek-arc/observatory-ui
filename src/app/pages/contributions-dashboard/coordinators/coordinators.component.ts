import {Component, OnInit} from "@angular/core";
import {SurveyService} from "../../../services/survey.service";
import {UserService} from "../../../services/user.service";
import {Paging} from "../../../../catalogue-ui/domain/paging";
import {Survey, SurveyInfo} from "../../../domain/survey";
import {Subscription} from "rxjs/internal/Subscription";
import {URLParameter} from "../../../../catalogue-ui/domain/url-parameter";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-contributors-dashboard',
  templateUrl: './coordinators.component.html'
})

export class CoordinatorsComponent implements OnInit{

  public surveysList = [];
  public eoscSBMembers = [];

  sub: Subscription;
  urlParameters: URLParameter[] = [];

  surveyEntries: Paging<SurveyInfo>;
  surveyEntriesResults: SurveyInfo[];

  pageSize = 10;
  totalPages = 0;
  isPreviousPageDisabled = false;
  isFirstPageDisabled = false;
  isNextPageDisabled = false;
  isLastPageDisabled = false;

  //Paging
  total: number;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  loading = false;

  constructor(private userService: UserService, private surveyService: SurveyService, public route: ActivatedRoute, public router: Router) {
  }

  ngOnInit() {

    this.surveysList = [
      { id: 1, name: 'National Contributions to EOSC' }
    ];

    this.eoscSBMembers = [
      { id: 1, name: 'EOSC SB (Greece)' },
      { id: 2, name: 'EOSC SB (France)' },
      { id: 3, name: 'EOSC SB (Ireland)' },
      { id: 4, name: 'EOSC SB (Italy)' },
    ];

    this.sub = this.route.params.subscribe(params => {
      this.urlParameters.splice(0, this.urlParameters.length);
      // this.foundResults = true;
      for (const obj in params) {
        if (params.hasOwnProperty(obj)) {
          const urlParameter: URLParameter = {
            key: obj,
            values: params[obj].split(',')
          };
          this.urlParameters.push(urlParameter);
        }
      }

      // request results from the registry
      // this.loading = true; // Uncomment for spinner
      this.surveyService.getSurveyEntries(this.urlParameters).subscribe(
        surveyEntries => {
          // this.surveyEntries = next;
          // this.surveyEntriesResults = this.surveyEntries.results;
          this.updateSurveyEntriesList(surveyEntries);

        },
      error => {},
      () => {
        this.paginationInit();
        this.loading = false;
      }
      );
    });

  }

  updateSurveyEntriesList(searchResults: Paging<SurveyInfo>) {

    // INITIALISATIONS

    // this.errorMessage = null;
    this.surveyEntries = searchResults;
    this.surveyEntriesResults = this.surveyEntries.results;
    // this.searchResultsSnippets.facets.sort();
    // this.isFirstPageDisabled = false;
    // this.isPreviousPageDisabled = false;
    // this.isLastPageDisabled = false;
    // this.isNextPageDisabled = false;
    // if (this.searchResultsSnippets.results.length === 0) {
    //   this.foundResults = false;
    // } else {
    //   this.sortFacets.transform(this.searchResultsSnippets.facets,['Portfolios', 'Users', 'TRL', 'Life Cycle Status'])
    // }

    // // update form values using URLParameters
    // for (const urlParameter of this.urlParameters) {
    //   if (urlParameter.key === 'searchFields') {
    //     this.searchForm.get('searchFields').setValue(urlParameter.values[0]);
    //   }
    //   if (urlParameter.key === 'query') {
    //     this.searchForm.get('query').setValue(urlParameter.values[0]);
    //   } else if (urlParameter.key === 'advanced') {
    //     this.advanced = urlParameter.values[0] === 'true';
    //   } else {
    //     for (const facet of this.searchResultsSnippets.facets) {
    //       if (facet.field === urlParameter.key) {
    //         //
    //         for (const parameterValue of urlParameter.values) {
    //           for (const facetValue of facet.values) {
    //             if (parameterValue === facetValue.value) {
    //               facetValue.isChecked = true;
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    this.updatePagingURLParametersQuantity(this.pageSize);
    this.currentPage = (searchResults.from / this.pageSize) + 1;
    this.totalPages = Math.ceil(searchResults.total / this.pageSize);
    if (this.currentPage === 1) {
      this.isFirstPageDisabled = true;
      this.isPreviousPageDisabled = true;
    }
    if (this.currentPage === this.totalPages) {
      this.isLastPageDisabled = true;
      this.isNextPageDisabled = true;
    }
  }

  updatePagingURLParameters(from: number) {
    let foundFromCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === 'from') {
        foundFromCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(from + '');
        break;
      }
    }
    if (!foundFromCategory) {
      const newFromParameter: URLParameter = {
        key: 'from',
        values: [from + '']
      };
      this.urlParameters.push(newFromParameter);
    }
  }

  updatePagingURLParametersQuantity(quantity: number) {
    let foundQuantityCategory = false;
    for (const urlParameter of this.urlParameters) {
      if (urlParameter.key === 'quantity') {
        foundQuantityCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(quantity + '');
      }
    }
    if (!foundQuantityCategory) {
      const newQuantityParameter: URLParameter = {
        key: 'quantity',
        values: [quantity + '']
      };
      this.urlParameters.push(newQuantityParameter);
    }
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = (this.surveyEntries.from / this.pageSize) + 1;
    this.pageTotal = Math.ceil(this.surveyEntries.total / this.pageSize);
    for ( let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.pageTotal ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.pageTotal)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.pageTotal) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    let from: number = (this.currentPage - 1) * this.pageSize
    this.updatePagingURLParameters(from);
    return this.navigateUsingParameters();
  }

  previousPage() {
    // if (this.currentPage > 1) {
      this.currentPage--;
      let from: number = this.surveyEntries.from;
      from -= this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    // }
  }

  nextPage() {
    // if (this.currentPage < this.pageTotal) {
      this.currentPage++;
      let from: number = this.surveyEntries.from;
      from += this.pageSize;
      this.updatePagingURLParameters(from);
      return this.navigateUsingParameters();
    // }
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParameters) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    // console.log(map);
    return this.router.navigate(['/contributions/surveys', map]);
  }

}
