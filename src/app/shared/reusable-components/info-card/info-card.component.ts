import { Component, Input, HostBinding, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule, NgClass, NgOptimizedImage } from "@angular/common";

@Component({
    selector: 'app-info-card',
    standalone: true,
    templateUrl: './info-card.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, CommonModule, NgOptimizedImage],
})

export class InfoCardComponent {
  protected readonly Math = Math;
  protected readonly Number = Number;
    @Input() titleHtml?: string;
    @Input() value!: number | string | null;
    @Input() unit?: string;
    @Input() diff?: number | null;
    @Input() colorClass: string = '';


}
