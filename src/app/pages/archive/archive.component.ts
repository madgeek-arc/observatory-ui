import {Component, ChangeDetectionStrategy} from "@angular/core";
import { RouterLinkActive, RouterLink, RouterOutlet } from "@angular/router";

@Component({
    selector: 'app-national-contributions-to-eosc-dashboard',
    templateUrl: './archive.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, RouterLink, RouterOutlet]
})

export class ArchiveComponent {

  constructor() {
  }
}
