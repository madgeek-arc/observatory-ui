import { HttpClient, provideHttpClient, withXhr } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CatalogueUiReusableComponentsModule } from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';

/**
 * The catalogue-ui module declares `provideHttpClient(withRequestsMadeViaParent())`. Angular rejects combining that with
 * `withXhr()`/`withFetch()` while the module's decorator is evaluated, which blanks the whole app at startup and is
 * invisible to the compiler. The v22 migration added `withXhr()` to it, so this guards it.
 */
describe('HttpClient provider of the catalogue-ui shared module', () => {
  it('load and resolve HttpClient through the parent HttpClient', () => {
    TestBed.configureTestingModule({
      imports: [CatalogueUiReusableComponentsModule],
      providers: [provideHttpClient(withXhr())]
    });
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
