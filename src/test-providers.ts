import { provideZoneChangeDetection } from '@angular/core';

// Since Angular 21 TestBed is zoneless unless told otherwise. The app is bootstrapped with
// provideZoneChangeDetection() (see main.ts), so run the specs the same way.
export default [provideZoneChangeDetection()];
