import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeHeroComponent } from './sections/home-hero/home-hero.component';
import { HomeComponent } from './home.component';
import { routing } from './home.routes';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  declarations: [HomeHeroComponent, HomeComponent]
})
export class HomeModule { }
