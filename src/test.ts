// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: true }},
);

// Since Angular 21 TestBed is zoneless unless told otherwise. The app is bootstrapped with
// provideZoneChangeDetection() (see main.ts), so run the specs the same way.
beforeEach(() => getTestBed().configureTestingModule({ providers: [provideZoneChangeDetection()] }));
