import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'content-collapse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-collapse.component.html',
  styleUrls: ['./content-collapse.component.scss']
})

export class ContentCollapseComponent implements AfterViewInit {
  @Input() maxHeight = 200;
  isCollapsed = true;
  showToggleButton = false;

  @ViewChild('contentWrapper') contentWrapper!: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.contentWrapper.nativeElement.scrollHeight > this.maxHeight) {
        this.showToggleButton = true;
      }
    }, 200);
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }
}
