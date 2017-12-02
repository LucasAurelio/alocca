import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { HomeComponent } from './home.component';
import { MaterialModule } from './../material.module';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule
        ],
    declarations: [HomeComponent],
    exports: []
})

export class HomeModule {}