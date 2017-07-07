/**
 * @api {module} projeto/src/app/professors/professors.module.ts Professors Module
 * @apiName Professors Module
 * @apiGroup Professor
 * @apiParam {component} AddProfessorComponent
 * @apiParam {component} EditProfessorComponent
 * @apiParam {component} ViewProfessorsComponent
 * @apiParam {component} AddRestrictionComponent
 */

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
import { AddRestrictionComponent } from './add-restriction/add-restriction.component';

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
        ViewProfessorsComponent,
        AddRestrictionComponent
        ],
    exports: []
})

export class ProfessorsModule {}