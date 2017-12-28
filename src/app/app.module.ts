import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChrisMaterialModule } from './material.module';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import { LoadingComponent } from './components/loading/loading.component';
import { MainComponent } from './routes/main/main.component';

import { routes } from './routes';
import {RouterModule} from '@angular/router';
import {GoogleMapsService} from './services/google-maps.service';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ChrisMaterialModule,
    RouterModule.forRoot(routes, {
      useHash: false
    }),
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [GoogleMapsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
