import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { APP_ROUTES } from './app/app.routes';

// bootstrapApplication(AppComponent, {
//   providers: [importProvidersFrom(HttpClientModule)],
// });

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideRouter(APP_ROUTES)],
});
