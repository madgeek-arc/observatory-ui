import { Component, Input, HostBinding } from "@angular/core";
import { CommonModule, NgClass, NgOptimizedImage } from "@angular/common";

@Component({
    selector: 'app-info-card',
    standalone: true,
    templateUrl: './info-card.component.html',
    imports: [NgClass, CommonModule, NgOptimizedImage],
})

export class InfoCardComponent {
  protected readonly Math = Math;
    @Input() titleHtml?: string;
    @Input() value!: number | string | null;
    @Input() unit?: string;
    @Input() diff?: number | null; 

 
}