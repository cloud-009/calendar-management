export interface AppointmentListInterface {
    id: string;
    appointmentName: string;
    appointmentDate: string | null;
    message?: string;
}

export interface DialogInterface {
    id?: string;
    message?: string;
    appointmentName?: string;
    appointmentDate?: string;
    dragdropDate?: DragDropInterface
}

export interface DragDropInterface {
    draggedDate: Date;
    droppedDate: Date;
    droppedElement: HTMLElement;
}