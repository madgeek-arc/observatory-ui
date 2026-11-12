import { Component, input, output, ChangeDetectionStrategy } from "@angular/core";
import { DatePipe, LowerCasePipe, NgClass, NgOptimizedImage } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Document, HighlightedResults } from "src/app/domain/document";

@Component({
  selector: 'app-search-results',
  imports: [
    RouterLink,
    LowerCasePipe,
    DatePipe,
    NgClass,
    NgOptimizedImage
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'search-card.component.html'
})

export class SearchCardComponent {
  documents = input<HighlightedResults<Document>[]>([]);
  isAdminPage = input<boolean>(false);

  onUpdateStatus = output<{ id: string, status: 'APPROVED' | 'REJECTED' }>();

  showImage = new Map<string, boolean>();

  alertStates: { [id: string]: { message: string; type: 'success' | 'danger' } } = {};

  getHighlightForField(doc: any, fieldName: string): string | undefined {
    return doc.highlights.find((el: any) => el.field === fieldName)?.value;
  }

  updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    this.onUpdateStatus.emit({id, status});
  }

  imageError(id: string) {
    this.showImage.set(id, false);
  }
}
