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
      case 'eosc-observatory':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=10&tmpl=yootheme', 'resourceUrl');
        break;
      case 'eosc-track':
        // this.iframeUrl = this.sanitizeUrl.transform('http://88.197.53.1/?option=com_content&view=article&id=10', 'resourceUrl');
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=10&tmpl=yootheme', 'resourceUrl');
        break;
      case 'news':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=10&tmpl=yootheme', 'resourceUrl');
        break;
      case 'data-workflow-and-methodology':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=10&tmpl=yootheme', 'resourceUrl');
        break;
      case 'publications-and-deliverables':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=10&tmpl=yootheme', 'resourceUrl');
        break;
      case 'data-download':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=10&tmpl=yootheme', 'resourceUrl');
        break;
      case 'support-and-faq':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=10&tmpl=yootheme', 'resourceUrl');
        break;
      default:
        // maybe have a fallback / handle url errors
    }
  }

}
