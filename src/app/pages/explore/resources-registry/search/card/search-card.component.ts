import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DatePipe, LowerCasePipe, NgClass, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Document, HighlightedResults } from "../../../../../domain/document";

@Component({
  selector: 'app-search-results',
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    LowerCasePipe,
    DatePipe,
    NgClass,
    NgOptimizedImage
  ],
  templateUrl: 'search-card.component.html'
})

export class SearchCardComponent {
  @Input() documents: HighlightedResults<Document>[] = [];
  @Input() isAdminPage: boolean = false;

  @Output() onUpdateStatus: EventEmitter<{ id: string, status: 'APPROVED' | 'REJECTED' }> = new EventEmitter<{ id: string, status: 'APPROVED' | 'REJECTED' }>();

  alertStates: { [id: string]: { message: string; type: 'success' | 'danger' } } = {};

  getHighlightForField(doc: any, fieldName: string): string | undefined {
    return doc.highlights.find((el: any) => el.field === fieldName)?.value;
  }

  updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    this.onUpdateStatus.emit({id, status});
  }
}
