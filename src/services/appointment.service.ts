import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { AppointmentListInterface } from 'src/interfaces/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly _base_url: string = "http://localhost:3210";
  private _http: HttpClient = inject(HttpClient);

  constructor() { }

  getAllAppointments(): Observable<Array<AppointmentListInterface>> {
    return this._http.get<Array<AppointmentListInterface>>(`${this._base_url}/appointment`);
  }

  postAppointments(value: AppointmentListInterface): Observable<AppointmentListInterface> {
    return this._http.post<AppointmentListInterface>(`${this._base_url}/appointment/`, value);
  }

  updateAppointment(id: string, updatedAppointment: AppointmentListInterface): Observable<AppointmentListInterface> {
    return this._http.put<AppointmentListInterface>(`${this._base_url}/appointment/${id}`, updatedAppointment);
  }

  deleteAppointment(id: string | undefined): Observable<void> {
    return this._http.delete<void>(`${this._base_url}/appointment/${id}`);
  }
}
