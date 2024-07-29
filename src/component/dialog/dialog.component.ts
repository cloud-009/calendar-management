import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AppointmentListInterface, DialogInterface } from 'src/interfaces/appointment.interface';
import { AppointmentService } from 'src/services/appointment.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit, OnDestroy {

  currentDateSelected: Date | null = null;
  private _appointmentList: Array<AppointmentListInterface> = [];
  private _service: AppointmentService = inject(AppointmentService);

  //appointment form group
  appointmentForm!: FormGroup;
  private _formBuilder: FormBuilder = inject(FormBuilder);
  private _appointmentSubscription!: Subscription;
  private _postSubscription!: Subscription;

  // dialogRef
  dialogRef: MatDialogRef<DialogComponent> = inject(MatDialogRef<DialogComponent>);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogInterface) {
    this.appointmentForm = this._formBuilder.group({
      appointmentName: this._formBuilder.control('', [Validators.required]),
      appointmentDate: this._formBuilder.control('', [Validators.required]),
    });

    this.appointmentForm.patchValue({
      appointmentName: this.data.appointmentName,
      appointmentDate: new Date(this.data.appointmentDate ? this.data.appointmentDate : '')
    })
  }

  ngOnInit(): void {
    this._getAllAppointment();
  }

  handleCancel(): void {
    this.dialogRef.close();
  }

  handleOk(): void {
    this.dialogRef.close('Yes');
  }

  /**
   * Get all the appointments from the json
   */
  private _getAllAppointment(): void {
    this._appointmentSubscription = this._service.getAllAppointments().subscribe({
      next: (res: Array<AppointmentListInterface>) => {
        this._appointmentList = res;
      },
      error: err => {
        console.log(err);
      }
    })
  }

  /**
   * Add the appointment by selecting date, and providing the appointment name.
   */
  addAppointment() {
    let appointmentDate = this.appointmentForm.get('appointmentDate')?.value;
    let appointmentValue: AppointmentListInterface = {
      id: this._generateUniqueId(),
      appointmentName: this.appointmentForm.get('appointmentName')?.value,
      appointmentDate: appointmentDate ? appointmentDate.toLocaleDateString('en-GB') : null
    };

    if (this._appointmentList.some(item => item.appointmentDate == appointmentValue.appointmentDate)) {
      this._snackBar.open('Appointment already exists. Choose another date please', 'Ok');
    } else {
      this._postSubscription = this._service.postAppointments(appointmentValue).subscribe({
        next: () => {
          this.appointmentForm.reset();
          this.dialogRef.close();
          window.location.reload(); // couldn't figure out to refresh the full calendar
          this._snackBar.open(`Appointment Added for the date:  ${appointmentValue.appointmentDate}.`, 'Ok');
          this._getAllAppointment();
        },
        error: err => {
          console.log(err);
          this.appointmentForm.reset();
          this.dialogRef.close();
          this._snackBar.open('Appointment cannot be added right now. Try again later!!', 'Ok');
        }
      });
    }
  }

  /**
   * Delete the selected appointment
   * @param id 
   */
  deleteAppointment(id: string | undefined): void {
    if (id !== undefined) {
      this._service.deleteAppointment(id).subscribe({
        next: () => {
          this._snackBar.open('Appointment Deleted!!', 'Ok');
          this.dialogRef.close();
        }, error: (err: HttpErrorResponse) => {
          console.error(err);
          this._snackBar.open('Appointment cannot be deleted. Try again later!!', 'Ok');
        }
      })
    } else {
      this._snackBar.open('Appointment cannot be deleted. Try again later!!', 'Ok');
    }
  }

  /**
   * Generate unique id for each appointment. Math.random is not secure, just an easy step for random ID.
   * @returns number
   */
  private _generateUniqueId(): string {
    return String(Math.floor(Math.random() * 1000));
  }

  ngOnDestroy(): void {
    if (this._appointmentSubscription || this._postSubscription) {
      this._appointmentSubscription?.unsubscribe();
      this._postSubscription?.unsubscribe();
    }
  }
}
