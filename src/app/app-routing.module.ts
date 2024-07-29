import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from 'src/component/calendar/calendar.component';

const routes: Routes = [
  { path: '', redirectTo: 'calendar-view', pathMatch: 'full' },
  { path: 'calendar-view', component: CalendarComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
