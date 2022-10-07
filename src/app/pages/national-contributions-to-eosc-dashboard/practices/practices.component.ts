import {Component, OnInit} from "@angular/core";
import {CategorizedAreaData} from "../../../domain/categorizedAreaData";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";

@Component({
  selector: 'app-policies',
  templateUrl: './practices.component.html'
})

export class PracticesComponent implements OnInit {

  q15Data: CategorizedAreaData;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.dataService.getMandatedStatus().subscribe(
      rawData => {
        this.q15Data = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData);
        for (let i = 0; i < this.q15Data.series.length; i++) {
          this.q15Data.series[i].data = this.q15Data.series[i].data.map(code => ({ code }));
        }
      },
      error => {
        console.log(error);
      }
    );
  }

}
