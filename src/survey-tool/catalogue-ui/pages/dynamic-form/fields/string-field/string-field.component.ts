import { Component, EventEmitter, Output } from "@angular/core";
import { Field, HandleBitSet } from "../../../../domain/dynamic-form-model";
import { BaseFieldComponent } from "../base-field.component";

@Component({
  selector: 'app-string-url-email-field',
  templateUrl: './string-field.component.html'
})

export class StringFieldComponent extends BaseFieldComponent {

  @Output() handleBitSets = new EventEmitter<Field>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  /** Bitsets--> **/

  updateBitSet(fieldData: Field) {
    this.timeOut(200).then(() => { // Needed for radio buttons strange behaviour
      if (fieldData.form.mandatory) {
        this.handleBitSets.emit(fieldData);
      }
    });
  }

}
