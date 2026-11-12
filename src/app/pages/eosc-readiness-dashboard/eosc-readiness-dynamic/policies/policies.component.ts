import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: 'app-policies',
    templateUrl: 'policies.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet]
})

export class PoliciesComponent {

}
