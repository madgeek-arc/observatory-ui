import { NgModule } from "@angular/core";
import { CommonModule, NgStyle } from "@angular/common";
import { HighchartsChartModule } from "highcharts-angular";
import { HighchartsTilemapComponent } from "./highcharts-tilemap.component";
import { HighchartsCategoryMapComponent } from "./category-map/highcharts-category-map.component";
import { HighchartsBubbleMapComponent } from "./bubble-map/highcharts-bubble-map.component";
import { HighchartsColorAxisMapComponent } from "./color-axis-map/highcharts-color-axis-map.component";
import { HighchartsCustomHighlightedMapComponent } from "./custom-highlighted-map/highcharts-custom-highlighted-map.component";
import { HighchartsBarComponent } from "./bar-chart/highcharts-bar.component";
import { HighchartsColumnRangesComponent } from "./column-ranges-chart/highcharts-column-ranges.component";
import { GaugeActivityComponent } from "./gauge-activity/gauge-activity.component";
import { GaugeSimpleComponent } from "./gauge-simple/gauge-simple.component";
import { PieChartComponent } from "./pie-chart/pie-chart.component";
import { TreeGraphComponent } from "./tree-graph/tree-graph.component";
import { BubbleChartComponent } from "./bubble-chart/bubble-chart.component";
import { PackedBubbleChartComponent } from "./packed-bubble-chart/packed-bubble-chart.component";
import { AreaChartComponent } from "./area-chart/area-chart-component";
import { StreamGraphComponent } from "./stream-graph/stream-graph.component";
import { FixedTooltipMapComponent } from "./fixed-tooltip-map/fixed-tooltip-map.component";
import { BarOrColumnChartComponent } from "./bar-chart/bar-or-column-chart.component";
import { StackedColumnComponent } from "./stacked-column-chart/stacked-column.component";
import { TreemapComponent } from "./treemap/treemap.component";
import { ReportPieChartComponent } from "./report-pie-chart/report-pie-chart.component";
// import { SankeyChartComponent } from "./sankey-chart/sankey-chart.component";

@NgModule({
  imports: [
    CommonModule,
    HighchartsChartModule,
    NgStyle
  ],
  declarations: [
    HighchartsTilemapComponent,
    HighchartsCategoryMapComponent,
    HighchartsBubbleMapComponent,
    HighchartsColorAxisMapComponent,
    HighchartsCustomHighlightedMapComponent,
    HighchartsBarComponent,
    HighchartsColumnRangesComponent,
    GaugeActivityComponent,
    GaugeSimpleComponent,
    PieChartComponent,
    TreeGraphComponent,
    BubbleChartComponent,
    PackedBubbleChartComponent,
    AreaChartComponent,
    StreamGraphComponent,
    FixedTooltipMapComponent,
    BarOrColumnChartComponent,
    StackedColumnComponent,
    TreemapComponent,
    // SankeyChartComponent,
    ReportPieChartComponent
  ],
  exports: [
    HighchartsTilemapComponent,
    HighchartsCategoryMapComponent,
    HighchartsCustomHighlightedMapComponent,
    HighchartsBubbleMapComponent,
    HighchartsColorAxisMapComponent,
    HighchartsBarComponent,
    HighchartsColumnRangesComponent,
    GaugeActivityComponent,
    GaugeSimpleComponent,
    PieChartComponent,
    TreeGraphComponent,
    BubbleChartComponent,
    PackedBubbleChartComponent,
    AreaChartComponent,
    StreamGraphComponent,
    FixedTooltipMapComponent,
    BarOrColumnChartComponent,
    StackedColumnComponent,
    TreemapComponent,
    // SankeyChartComponent,
    ReportPieChartComponent
  ]
})

export class ChartsModule {}
