// Jasmine removed its spies after every spec; Vitest keeps them until told otherwise, so do that here.
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
