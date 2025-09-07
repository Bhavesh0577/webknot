# Campus Event Management Platform

A simple system for colleges to post events and for students to browse, register, check in, and leave feedback. It includes basic reports for popularity, participation, attendance, and feedback.

Quick start:

- Requirements: Node.js 14+ and npm
- Install: npm install
- Setup sample data: npm run setup
- Run: npm run dev
- API: http://localhost:3000/api/v1 (health: /health)

Backend:

- In root directory
- npm install
- npm start

- It will start the backend server on port 3000 and show the health endpoint; see the screenshot below:
  ![Backend server running on port 3000](./output/backend.png)

Frontend:

- Admin-portal:

- In this go to admin-portal directory
- cd frontend
- cd admin-portal
- npm install
- npm start

- now it will start the admin-portal for the adminstration in the port 3001
- below are the some screentshots of how it will look

![Dashboard](./output/admin-portal/dashboard.png)
![Events Management](./output/admin-portal/events.png)
![Students](./output/admin-portal/students.png)
![Colleges Management](./output/admin-portal/colleges.png)
![Add New College](./output/admin-portal/addnewclg.png)
![Reports](./output/admin-portal/report.png)

- student-app:

- In this go to student-app and run

- cd frontend
- cd student-app
- npm install
- npm start

- now it will start the student-app for the students in the port 3002
- below are the some screentshots of how it will look

![Welcome Page](./output/student-app/welcomepage.png)
![Login](./output/student-app/login.png)
![Events](./output/student-app/events.png)
![Registration](./output/student-app/regi.png)
