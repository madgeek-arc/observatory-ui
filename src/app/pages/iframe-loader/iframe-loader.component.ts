import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgIf } from "@angular/common";
import { SafeUrlPipe } from "../../../survey-tool/catalogue-ui/shared/pipes/safeUrlPipe";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: 'app-iframe-loader',
  standalone: true,
  templateUrl: './iframe-loader.component.html',
  imports: [
    NgIf
  ]
})

export class IframeLoaderComponent implements OnInit {
  iframeUrl?: SafeResourceUrl;
  sanitizeUrl = new SafeUrlPipe(this.sanitizer);

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit() {

    this.route.params.subscribe(params => {
      console.log(params);
      this.urlSelector(params['selector']);
    });
  }

  urlSelector(selector: string) {
    switch (selector) {
      case '1':
        this.iframeUrl = this.sanitizeUrl.transform('https://www.youtube.com/embed/', 'resourceUrl');
        break;
      case '2':
        this.iframeUrl = this.sanitizeUrl.transform('https://google.com/embed/', 'resourceUrl');
        break;
      default:
        // maybe have a fallback / handle url errors
    }
  }

}
