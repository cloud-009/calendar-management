import { DragDrop, DragRef, DropListRef } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concatMap, Subscription } from 'rxjs';
import { AppointmentListInterface, DialogInterface } from 'src/interfaces/appointment.interface';
import { AppointmentService } from 'src/services/appointment.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {

  currentDateSelected!: Date | null;
  private _appointmentList: Array<AppointmentListInterface> = [];
  private _appointmentService: AppointmentService = inject(AppointmentService);
  private _appointmentSubscription!: Subscription;

  private _elR: ElementRef = inject(ElementRef);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _renderer: Renderer2 = inject(Renderer2);
  private _dialog: MatDialog = inject(MatDialog);

  //Properties and injectables related to drag-drop service
  private _dragdropService: DragDrop = inject(DragDrop);
  private _dropListRef!: DropListRef<HTMLElement>;
  private _dragRefs: DragRef<HTMLElement>[] = [];

  //calendar view reference
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  constructor() { }

  onDateSelected(date: any) {
    console.log(date)
  }

  ngOnInit(): void {
    this._getAllAppointments();
  }

  private _getAllAppointments(): void {
    this._appointmentSubscription = this._appointmentService.getAllAppointments().subscribe({
      next: (res: Array<AppointmentListInterface>) => {
        this._appointmentList = res;
        this._showAppointmentName(this._appointmentList);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    })
  }

  ngAfterViewInit(): void {
    this._injectCustomElement();
    this._addDragDropDirective();
  }

  /**
   * Add the drag and drop using DragDrop service.
   * Using createDrag(), and createDropList() methods
   */
  private _addDragDropDirective(): void {
    const tbodyElement: ElementRef<HTMLElement> = this._elR.nativeElement.querySelector('.mat-calendar-body');
    const tdElements: NodeListOf<HTMLElement> = this._elR.nativeElement.querySelectorAll('.mat-calendar-body-cell-container');

    this._dropListRef = this._dragdropService.createDropList(tbodyElement);
    this._dropListRef.withItems(this._dragRefs);

    tdElements.forEach((item: HTMLElement) => {
      const dragRef: DragRef<HTMLElement> = this._dragdropService.createDrag(item);
      dragRef._withDropContainer(this._dropListRef);

      dragRef.ended.subscribe((event) => this._onDragEnd(event, item));
      this._dragRefs.push(dragRef);
    });
  }

  /**
   * Inject custom button element in the header section of the Mat-Calendar.
   */
  private _injectCustomElement(): void {
    const selectedElement: ElementRef<HTMLElement> = this._elR.nativeElement.querySelector('.mat-calendar-controls');
    const referenceChild: ElementRef<HTMLButtonElement> = this._elR.nativeElement.querySelector('.mat-calendar-previous-button');

    const injectingElement: HTMLDivElement = this._renderer.createElement('div');
    this._renderer.addClass(injectingElement, 'custom-header-element');

    const buttonAddElement: HTMLButtonElement = this._renderer.createElement('button');
    const buttonDeleteElement: HTMLButtonElement = this._renderer.createElement('button');
    this._renderer.addClass(buttonAddElement, 'custom-button-element');
    this._renderer.addClass(buttonDeleteElement, 'custom-button-element');
    buttonAddElement.innerText = 'Add Appointment';
    buttonDeleteElement.innerText = 'Delete Appointment';

    this._renderer.appendChild(injectingElement, buttonAddElement);
    this._renderer.appendChild(injectingElement, buttonDeleteElement);
    this._renderer.insertBefore(selectedElement, injectingElement, referenceChild);

    //add event to the add button
    this._renderer.listen(buttonAddElement, 'click', () => {
      this._openDialogComponent({ message: 'add-appointment' });
    })

    //add event to the delete button
    this._renderer.listen(buttonDeleteElement, 'click', () => {
      if (!this.currentDateSelected) {
        this._snackBar.open('Select a date with appointment to delete it.', 'Ok');
      } else {
        const selectedID: AppointmentListInterface | undefined = this._appointmentList.find((item: AppointmentListInterface) => {
          return item.appointmentDate == this.currentDateSelected?.toLocaleDateString('en-GB');
        });
        this._openDialogComponent({ message: 'delete-appointment', id: selectedID?.id });
      }
    })
  }

  /**
   * Open the dialog component to perform user actions
   * @param message 
   */
  private _openDialogComponent(value: DialogInterface): void {
    this._dialog.open(DialogComponent, {
      width: '50%',
      data: {
        id: value.id,
        appointmentDate: this.currentDateSelected,
        appointmentName: '',
        message: value.message,
        droppedDate: value.dragdropDate?.droppedDate
      }
    }).afterClosed().subscribe(() => {
      this._getAllAppointments();
      this.calendar.updateTodaysDate();
    });
  }

  /**
   * Add appointment flag to show the user appointment is added.
   */
  private _showAppointmentName(appointmentList: Array<AppointmentListInterface>) {
    const buttonElements: NodeListOf<HTMLElement> = this._elR.nativeElement.querySelectorAll('.mat-calendar-body-cell');
    const spanElements: NodeListOf<HTMLElement> = this._elR.nativeElement.querySelectorAll('.mat-calendar-body-cell-content');

    const appointmentMap: Map<number, string> = new Map<number, string>();

    appointmentList.forEach((item: AppointmentListInterface) => {
      const appointmentDate = Number(item.appointmentDate?.split('/')[0]);
      appointmentMap.set(appointmentDate, item.appointmentName || '');
    });

    spanElements.forEach((span: HTMLElement, i: number) => {
      const spanDate: number = Number(span.textContent?.trim());
      if (appointmentMap.has(spanDate)) {
        const appointmentName: string = appointmentMap.get(spanDate) || '';
        const truncatedText: string = this.truncateText(appointmentName);
        const parentElement: NodeListOf<HTMLElement> = this._renderer.parentNode(buttonElements[i]);
        appointmentName.length > 18 ? this._renderer.setAttribute(parentElement, 'title', appointmentName) : '';

        const appointmentNameElement: HTMLElement = this._renderer.createElement('span');
        this._renderer.addClass(appointmentNameElement, 'appointment-name');
        const text: string = this._renderer.createText(truncatedText);
        this._renderer.appendChild(appointmentNameElement, text);

        this._renderer.appendChild(buttonElements[i], appointmentNameElement);
      }
    });
  }


  /**
   * Method for truncating the Appointment name to fit in the calendar cells.
   * @param text 
   * @returns 
   */
  private truncateText(text: string): string {
    let truncatedText: string = text;
    let truncateLength: number = 18;
    if (text.length >= truncateLength) {
      truncatedText = text.substring(0, truncateLength) + '...';
    }
    return truncatedText;
  }

  /**
   * Calls after the drag ends to find the dropped element by getting the _lastKnowPointerPosition provided by the DragRef.
   * @param event 
   * @param draggedElement 
   */
  private _onDragEnd(event: { source: DragRef<HTMLElement> }, draggedElement: HTMLElement): void {
    const dragPosition: { x: number, y: number } = event.source['_lastKnownPointerPosition'];
    const droppedElement: HTMLElement | null = this._findClosestDropTarget(dragPosition);

    if (droppedElement && droppedElement.classList.contains('mat-calendar-body-cell-container')) {
      const draggedDate = this._getDateFromElement(draggedElement);
      const droppedDate = this._getDateFromElement(droppedElement);

      if (draggedDate && droppedDate) {
        const draggedAppointment = this._appointmentList.find(appointment => appointment.appointmentDate === draggedDate.toLocaleDateString('en-GB'));
        const droppedAppointment = this._appointmentList.find(appointment => appointment.appointmentDate === droppedDate.toLocaleDateString('en-GB'));

        if (draggedAppointment) {
          if (droppedAppointment) {
            this._swapAppointments(draggedAppointment, droppedAppointment);
          } else {
            this._moveAppointment(draggedAppointment, droppedDate.toLocaleDateString('en-GB'));
          }
        }
      }
    }
  }

  /**
   * Finding the closest td cell element from the drop position using the boundary rectangle of the dragging cell.
   * @param dragPosition 
   * @returns 
   */
  private _findClosestDropTarget(dragPosition: { x: number; y: number }): HTMLElement | null {
    const tdElements: NodeListOf<HTMLElement> = this._elR.nativeElement.querySelectorAll('.mat-calendar-body-cell-container');
    let closestElement: HTMLElement | null = null;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    tdElements.forEach((element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const distance = this._calculateDistance(dragPosition, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = element;
      }
    });
    return closestElement;
  }

  /**
   * Get the dates of dragging and dropped cell.
   * @param element 
   * @returns 
   */
  private _getDateFromElement(element: HTMLElement): Date | null {
    const dateFromElement: number = Number(element.querySelector('.mat-calendar-body-cell-content')?.textContent?.trim());
    const todayDate = new Date();
    let dateString: string;
    let [day, month, year] = [todayDate.getDate(), todayDate.getMonth() + 1, todayDate.getFullYear()];
    dateFromElement < 9 ? dateString = `${month}/0${dateFromElement}/${year}` : dateString = `${month}/${dateFromElement}/${year}`;
    return dateFromElement ? new Date(dateString) : null;
  }

  /**
   * Calculating the distance from the drop coordinates to the center of each cell to get the closest cell.
   * @param point1 
   * @param point2 
   * @returns 
   */
  private _calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
  }

  /**
   * Method to swap the appointments if dragging dropped both cells have the appointment shceduled.
   * @param draggedAppointment 
   * @param droppedAppointment 
   */
  private _swapAppointments(draggedAppointment: AppointmentListInterface, droppedAppointment: AppointmentListInterface): void {
    const updatedDraggedAppointment = { ...draggedAppointment, appointmentDate: droppedAppointment.appointmentDate };
    const updatedDroppedAppointment = { ...droppedAppointment, appointmentDate: draggedAppointment.appointmentDate };

    this._appointmentService.updateAppointment(draggedAppointment.id, updatedDraggedAppointment).pipe(
      concatMap(() => this._appointmentService.updateAppointment(droppedAppointment.id, updatedDroppedAppointment))
    ).subscribe({
      next: () => {
        // refreshing the calendar with calendar.updateTodaysDate() makes _addDragDropDirective() method not work
        window.location.reload();
        this._getAllAppointments();
        this._snackBar.open('Appointments swapped', 'Ok');
      },
      error: (error) => {
        console.error('Error updating appointments:', error);
        this._snackBar.open('Cannot change the date of appointments. Please try again later!!', 'Ok');
      }
    });
  }

  /**
   * Method to move the appointment if there is no appointment scheduled in the dropped cell.
   * @param draggedAppointment 
   * @param newDate 
   */
  private _moveAppointment(draggedAppointment: AppointmentListInterface, newDate: string): void {
    const updatedDraggedAppointment = { ...draggedAppointment, appointmentDate: newDate };

    this._appointmentService.updateAppointment(draggedAppointment.id, updatedDraggedAppointment).subscribe({
      next: () => {
        // refreshing the calendar with calendar.updateTodaysDate() makes _addDragDropDirective() method not work
        window.location.reload();
        this._getAllAppointments();
        this._snackBar.open('Appointment Updated', 'Ok');
      }, error: (err: HttpErrorResponse) => {
        console.error(err);
        this._snackBar.open('Unable to update the appointment. Please try again later!!', 'Ok');
      }
    })
  }

  ngOnDestroy(): void {
    if (this._appointmentSubscription) {
      this._appointmentSubscription.unsubscribe();
    }
  }
}
