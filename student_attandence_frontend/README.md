# Student Attendance Frontend – Setup Guide

## Prerequisites
Node.js v18+ must be installed. Download from: https://nodejs.org

## 1. Install dependencies
Open a terminal **in this folder** and run:
```bash
npm install
```

## 2. Start dev server
```bash
npm run dev
```
The app will open at: http://localhost:3000

## 3. Make sure your Flask backend is running at:
http://127.0.0.1:5000

---

## Phase 1 Folder Structure (created)
```
student_attandence_frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── Layout.jsx
    │   ├── Loader.jsx
    │   ├── Modal.jsx
    │   ├── Table.jsx
    │   ├── ConfirmDialog.jsx
    │   └── Toast.jsx
    ├── pages/
    │   ├── Dashboard.jsx   (stub – Phase 2)
    │   ├── Students.jsx    (stub – Phase 3)
    │   ├── Classes.jsx     (stub – Phase 4)
    │   ├── Subjects.jsx    (stub – Phase 5)
    │   ├── Teachers.jsx    (stub – Phase 6)
    │   ├── Attendance.jsx  (stub – Phase 7)
    │   ├── Search.jsx      (UI shell – awaiting endpoints)
    │   ├── Reports.jsx     (UI shell – awaiting endpoints)
    │   └── Export.jsx      (stub – Phase 10)
    ├── services/
    │   ├── api.js               ← single Axios instance
    │   ├── dashboardService.js
    │   ├── studentService.js
    │   ├── classService.js
    │   ├── subjectService.js
    │   ├── teacherService.js
    │   ├── attendanceService.js
    │   ├── searchService.js     ← TODO (endpoints awaited)
    │   ├── reportService.js     ← TODO (endpoints awaited)
    │   └── exportService.js
    ├── hooks/
    │   ├── useToast.js
    │   ├── useConfirm.js
    │   └── useFetch.js
    └── utils/
        └── helpers.js
```
