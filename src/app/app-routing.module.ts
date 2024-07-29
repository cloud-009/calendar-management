import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from 'src/component/calendar/calendar.component';
import { NotfoundComponent } from 'src/pages/notfound/notfound.component';

const routes: Routes = [
  { path: '', redirectTo: 'calendar-view', pathMatch: 'full' },
  { path: 'calendar-view', component: CalendarComponent },
  { path: '**', component: NotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
