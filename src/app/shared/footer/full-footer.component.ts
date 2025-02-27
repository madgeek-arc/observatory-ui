import {Component} from '@angular/core';

@Component({
  selector: 'app-full-footer',
  templateUrl: './full-footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FullFooterComponent {

  constructor() {
  }

  scrollToTop(){
    window.scroll(0,0);
  }
}
