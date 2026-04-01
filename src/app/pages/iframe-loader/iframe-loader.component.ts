import { Component, OnInit } from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

import { SafeUrlPipe } from "../../../survey-tool/catalogue-ui/shared/pipes/safeUrlPipe";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
    selector: 'app-iframe-loader',
    templateUrl: './iframe-loader.component.html',
    imports: []
})

export class IframeLoaderComponent implements OnInit {
  iframeUrl?: SafeResourceUrl;
  sanitizeUrl = new SafeUrlPipe(this.sanitizer);

  pathParams: string;
  iframePath: string;

  private boundIframeMessage!: (event: MessageEvent) => void;

  private readonly ALLOWED_ORIGINS = [
    'https://www.eoscobservatory.eu',
    'https://beta.eoscobservatory.eu',
    'http://localhost:4200'
  ];

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router) { }

  ngOnInit() {
    
    this.route.queryParams.subscribe(params => {
      this.iframePath = params['path'] || null;
      this.urlSelector(this.pathParams);
    });

    this.route.params.subscribe(params => {
      console.log(params);
      this.pathParams = params['selector'];
      this.urlSelector(this.pathParams);
    });

    this.boundIframeMessage = this.onIframeMessage.bind(this);
    window.addEventListener('message', this.boundIframeMessage);
  }

  urlSelector(selector: string) {
    switch (selector) {
      case 'eosc-observatory':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=17&tmpl=yootheme', 'resourceUrl');
        break;
      case 'eosc-track':
        // this.iframeUrl = this.sanitizeUrl.transform('http://88.197.53.1/?option=com_content&view=article&id=10', 'resourceUrl');
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=18&tmpl=yootheme', 'resourceUrl');
        break;
      case 'news':
        console.log('path', this.iframePath);
        if(this.iframePath) {
          this.iframeUrl = this.sanitizeUrl.transform(this.iframePath, 'resourceUrl');
          this.iframePath = null;
        } else {
          this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=14&tmpl=yootheme', 'resourceUrl');
        }
        break;
      case 'data-workflow-and-methodology':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=15&tmpl=yootheme', 'resourceUrl');
        break;
      case 'publications-and-deliverables':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=12&tmpl=yootheme', 'resourceUrl');
        break;
      case 'data-download':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=13&tmpl=yootheme', 'resourceUrl');
        break;
      case 'support-and-faq':
        this.iframeUrl = this.sanitizeUrl.transform('./pages?option=com_content&view=article&id=16&tmpl=yootheme', 'resourceUrl');
        break;
      default:
        // maybe have a fallback / handle url errors
    }
  }

  onIframeMessage(event: MessageEvent) {

    if (!this.ALLOWED_ORIGINS.includes(event.origin)) return;
    if (event.data?.type !== 'joomla-navigate') return;

    if (event.data?.type === 'joomla-navigate') {
      let newsItemURL = event.data.url.split('/').slice(3).join('/');

      if(newsItemURL.startsWith('pages')) {
        return;
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { path: newsItemURL },
        replaceUrl: false
      });
    }
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.boundIframeMessage);
  }

}
