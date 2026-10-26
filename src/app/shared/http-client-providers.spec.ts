import { HttpClient, provideHttpClient, withXhr } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ReusableComponentsModule } from '../../survey-tool/app/shared/reusablecomponents/reusable-components.module';
import { CatalogueUiReusableComponentsModule } from '../../survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';

/**
 * Both shared modules declare `provideHttpClient(withRequestsMadeViaParent())`. Angular rejects combining that with
 * `withXhr()`/`withFetch()` while the module's decorator is evaluated, which blanks the whole app at startup and is
 * invisible to the compiler. The v22 migration added `withXhr()` to both, so this guards the pair.
 */
describe('HttpClient providers of the shared modules', () => {
  it('load and resolve HttpClient through the parent HttpClient', () => {
    TestBed.configureTestingModule({
      imports: [ReusableComponentsModule, CatalogueUiReusableComponentsModule],
      providers: [provideHttpClient(withXhr())]
    });
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
