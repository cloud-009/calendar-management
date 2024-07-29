# Calendar Management
#### This application allows you to perform basic operations with calendar. Like adding, removing and updating appointments.

## How to run this appplication ?

1. Please clone the respository using `git clone `.
2. Install the dependencies using `npm install`.
3. Run the angular application using `ng serve` or if you want to mention port number then `ng serve --port 4321`.
You can change the `4321` with any port number you'd like.
4. Then run the `json-server` which acts as a fake-backend for this application. In your terminal type `json-server appointment.json --port 3210`. Please do not change this port as the same port is being used in the application.
5. If you do want to change the port number for `json-server`, change the port number in terminal as well as this file `appointment.service.ts`.

## How to use the calendar ?

#### Once you run the application using the `How to run this application ?` section.

1. You can add new appointments by choosing the date, and giving a name.
2. You can only have one appointment in one day. 
3. You can remove the appointment by choosing the date in which you've already made an appointment.
4. You can drag & drop the appointment to other dates, to change the appointment date and to update the previous appointment.

## How to build ?

#### Run the command `ng build` in your terminal, and it should build the application for you.

## If you happen to like this repository, feel free to give a star.
