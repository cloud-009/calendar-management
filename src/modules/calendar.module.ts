import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from 'src/component/calendar/calendar.component';
import { DialogComponent } from 'src/component/dialog/dialog.component';
import { HttpClientModule } from "@angular/common/http";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog'


@NgModule({
  declarations: [
    CalendarComponent,
    DialogComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    DragDropModule,
    MatDialogModule,
  ],
  exports: [
    CalendarComponent,
    DialogComponent,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    DragDropModule,
    MatDialogModule,
    HttpClientModule
  ]
})
export class CalendarModule { }
