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

  sortedColumnIndex: number = -1;
  asc: boolean = true;

  constructor() {}

  ngOnChanges() {
    this.countries.sort((a, b) => (a['name'] > b['name']) ? 1 : -1);
    // console.log('countries ->', this.countries);
    // console.log('table headers ->', this.tableHeaders);
  }

  // Returns a function responsible for sorting a specific column index (idx = columnIndex, asc = ascending order?).
  comparer(idx, asc) {
    this.sortedColumnIndex = idx;
    function getCellValue(tr, idx) {
      return tr.children[idx].innerText || tr.children[idx].textContent;
    }
    // This is used by the array.sort() function...
    return function(a, b) {
      // This is a transient function, that is called straight away.
      // It allows passing in different order of args, based on the ascending/descending order.
      return function(v1, v2) {
        // sort based on a numeric or localeCompare, based on type...
        return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2)) ? v1 - v2 : v1.toString().localeCompare(v2);
      }(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
    }
  };

  sortByColumn(e) {
    const table = e.target.closest('table');
    const tbody = table.querySelector('tbody');
    Array.from(tbody.querySelectorAll('tr'))
      .sort(this.comparer(Array.from(e.target.parentNode.children).indexOf(e.target), this.asc = !this.asc))
      .forEach(tr => tbody.appendChild(tr));
  }

}
