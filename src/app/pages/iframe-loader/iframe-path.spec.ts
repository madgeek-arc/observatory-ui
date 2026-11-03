import { safeIframePath } from './iframe-path';

describe('safeIframePath', () => {
  const base = 'https://app.example/';

  const rejected = (raw: string | null | undefined) => expect(safeIframePath(raw, base)).toBeNull();

  it('gives null for an empty value', () => {
    rejected(undefined);
    rejected(null);
    rejected('');
  });

  describe('rejects script and non-http schemes', () => {
    const values: Record<string, string> = {
      'javascript': 'javascript:parent.__probe=1',
      'mixed case': 'JaVaScRiPt:parent.__probe=1',
      'leading whitespace': '  javascript:parent.__probe=1',
      'tab inside the scheme': 'java\tscript:parent.__probe=1',
      'newline inside the scheme': 'java\nscript:parent.__probe=1',
      'carriage return inside the scheme': 'java\rscript:parent.__probe=1',
      'control character before the scheme': '\u0001javascript:parent.__probe=1',
      'data': 'data:text/html;base64,PHNjcmlwdD5wYXJlbnQuX19wcm9iZT0xPC9zY3JpcHQ+',
      'vbscript': 'vbscript:msgbox(1)',
      'blob': 'blob:https://app.example/1b2c3d',
      'file': 'file:///etc/passwd',
      'about': 'about:blank',
    };
    Object.entries(values).forEach(([name, value]) => it(name, () => rejected(value)));
  });

  describe('rejects other origins', () => {
    const values: Record<string, string> = {
      'external host': 'https://evil.example/page',
      'external http host': 'http://evil.example/page',
      'protocol-relative': '//evil.example/page',
      'backslash after a slash': '/\\evil.example/page',
      'double backslash': '\\\\evil.example/page',
      'credentials before the host': 'https://app.example@evil.example/page',
      'host that starts with the app host': 'https://app.example.evil.example/page',
      'other scheme on the same host': 'http://app.example/page',
      'other port on the same host': 'https://app.example:8443/page',
      'subdomain': 'https://sub.app.example/page',
    };
    Object.entries(values).forEach(([name, value]) => it(name, () => rejected(value)));
  });

  it('rejects a value that cannot be parsed', () => {
    rejected('http://[');
    rejected('https://exa mple.org/');
  });

  describe('accepts same-origin paths and returns them normalised', () => {
    it('relative path', () => {
      expect(safeIframePath('component/content/article?id=1', base)).toBe('/component/content/article?id=1');
    });

    it('root-relative path', () => {
      expect(safeIframePath('/media/system/x.png', base)).toBe('/media/system/x.png');
    });

    it('keeps query and hash', () => {
      expect(safeIframePath('pages?option=com_content&view=article&id=14#top', base)).toBe('/pages?option=com_content&view=article&id=14#top');
    });

    it('keeps percent-encoding', () => {
      expect(safeIframePath('news/a%20b', base)).toBe('/news/a%20b');
    });

    it('turns a same-origin absolute URL into a path', () => {
      expect(safeIframePath('https://app.example/templates/yootheme/css/a.css?v=2', base)).toBe('/templates/yootheme/css/a.css?v=2');
    });

    it('resolves dot segments inside the origin', () => {
      expect(safeIframePath('a/../b', base)).toBe('/b');
      expect(safeIframePath('../../b', base)).toBe('/b');
    });

    it('trims whitespace around a path, as the browser does', () => {
      expect(safeIframePath('  component/x  ', base)).toBe('/component/x');
    });

    it('accepts an overlong path without failing', () => {
      expect(safeIframePath('a'.repeat(10000), base)).toBe('/' + 'a'.repeat(10000));
    });
  });

  it('resolves against the document base by default', () => {
    expect(safeIframePath('component/x')).toBe(new URL('component/x', document.baseURI).pathname);
    expect(safeIframePath('https://evil.example/')).toBeNull();
  });

  it('always returns a path that starts with a single slash', () => {
    ['x', '/x', './x', '../x', 'https://app.example/x', 'x?y=1', '?y=1', '#h'].forEach(raw => {
      const out = safeIframePath(raw, base);
      expect(out).not.toBeNull();
      expect(out!.startsWith('/')).toBeTrue();
      expect(out!.startsWith('//')).toBeFalse();
    });
  });
});
