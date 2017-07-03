import { NgModule } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { FlashMessagesModule} from 'angular2-flash-messages';

import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import 'hammerjs';

import { AppRoutingModule } from '../app-routing.module';

import {AddProfessorComponent} from './add-professor/add-professor.component';
import {EditProfessorComponent} from './edit-professor/edit-professor.component';
import {ViewProfessorsComponent} from './view-professors/view-professors.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        FlashMessagesModule],
    declarations: [
        AddProfessorComponent,
        EditProfessorComponent,
        ViewProfessorsComponent],
    exports: []
})

export class ProfessorsModule {}