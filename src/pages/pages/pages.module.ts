import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotfoundComponent } from '../notfound/notfound.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";

@NgModule({
  declarations: [
    NotfoundComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule
  ],
  exports: [
    NotfoundComponent,
    MatButtonModule
  ]
})
export class PagesModule { }
