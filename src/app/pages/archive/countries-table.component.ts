import { Component, Input, OnChanges } from '@angular/core';
import { CountryTableData } from "../../../survey-tool/app/domain/country-table-data";


@Component({
  selector: 'app-countries-table',
  templateUrl: './countries-table.component.html',
})

export class CountriesTableComponent implements OnChanges {

  @Input() countries: CountryTableData[];
  @Input() tableHeaders: string[] = null;
  @Input() tableType: string;

  isSortedBy: string;
  isDescending: boolean = true;
  asc: boolean = true;

  constructor() {}

  ngOnChanges() {
    this.countries.sort((a, b) => (a['name'] > b['name']) ? 1 : -1);
    // console.log('countries ->', this.countries);
    // console.log('table headers ->', this.tableHeaders);
    if (this.tableHeaders) {
      // this.sortByColumn();
    }
  }

  getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

  comparer = (idx, asc) => (a, b) => ((v1, v2) =>
      v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
  )(this.getCellValue(asc ? a : b, idx), this.getCellValue(asc ? b : a, idx));

  // Returns a function responsible for sorting a specific column index
  // (idx = columnIndex, asc = ascending order?).
  // comparer = function(idx, asc) {
  //
  //   // This is used by the array.sort() function...
  //   return function(a, b) {
  //
  //     // This is a transient function, that is called straight away.
  //     // It allows passing in different order of args, based on
  //     // the ascending/descending order.
  //     return function(v1, v2) {
  //
  //       // sort based on a numeric or localeCompare, based on type...
  //       return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
  //         ? v1 - v2
  //         : v1.toString().localeCompare(v2);
  //     }(this.getCellValue(asc ? a : b, idx), this.getCellValue(asc ? b : a, idx));
  //   }
  // };

  sortByColumn(e) {
    console.log(e.target)
    const table = e.target.closest('table');
    console.log(table.children[1]);
    console.log(Array.from(table.children[1].querySelectorAll('tr:nth-child(n + 1)')));
    Array.from(table.children[1].querySelectorAll('tr:nth-child(n + 1)'))
      // .sort(this.comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
      .forEach(tr => table.appendChild(tr));


    // document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
    //   const table = th.closest('table');
    //   // console.log(Array.from(table.querySelectorAll('tr:nth-child(n+2)')));
    //   Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
    //     .sort(this.comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
    //     .forEach(tr => table.appendChild(tr));
    // })));
  }

  // document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
  //   const table = th.closest('table');
  //   Array.from(table.querySelectorAll('tr:nth-child(n+2)')).sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc)).forEach(tr => table.appendChild(tr) );
  // })));

  sortBy(field: string) {

    console.log('Sort clicked, field: ', field);

    if (field === this.isSortedBy) {
      this.isDescending = !this.isDescending;
    } else {
      this.isDescending = true;
    }

    this.isSortedBy = field;

    if (this.isDescending) {
      this.countries.sort((a, b) => b[field] - a[field]);
    } else {
      this.countries.sort((a, b) => a[field] - b[field]);
    }

    // if (field === 'oaSharePublicationsAffiliatedPeerReviewed' || field === 'oaSharePublicationsAffiliated'
    //   || field === 'oaSharePublicationsDepositedPeerReviewed' || field === 'oaSharePublicationsDeposited') {
    //
    //   console.log('sorting number');
    //   if (this.isDescending) {
    //     this.countries.sort((a, b) => b[field] - a[field]);
    //   } else {
    //     this.countries.sort((a, b) => a[field] - b[field]);
    //   }
    // } else if (field !== 'country') {
    //
    //   console.log('sorting string');
    //   if (this.isDescending) {
    //     this.countries.sort((a, b) => (a[field] < b[field]) ? 1 : -1);
    //   } else {
    //     this.countries.sort((a, b) => (a[field] > b[field]) ? 1 : -1);
    //   }
    // } else {
    //
    //   console.log('sorting country');
    //   if (this.isDescending) {
    //     this.countries.sort((a, b) => (a['name'] < b['name']) ? 1 : -1);
    //   } else {
    //     this.countries.sort((a, b) => (a['name'] > b['name']) ? 1 : -1);
    //   }
    // }
  }

  compareStringsAndNumbers(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    // check for num vs string
    if (typeof a === 'number' && typeof b === 'string') {
      return -1;
    }
    // check for string vs num
    if (typeof a === 'string' && typeof b === 'number') {
      return 1;
    }
    // check for string vs string
    if (typeof a === 'string' && typeof b === 'string') {
      if (a < b) return -1;
      else return 1;
    }
    return 0;
  }

}
