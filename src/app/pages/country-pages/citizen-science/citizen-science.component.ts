import { Component } from '@angular/core';
import { NgClass, NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'app-citizen-science',
  standalone: true,
  templateUrl: './citizen-science.component.html',
  imports: [
    NgClass,
    NgOptimizedImage
  ]
})
export class CitizenScienceComponent {
  colorChange = 2;

}
