# 🎓 Student Management System (Full Stack)

A full-stack **Student Management System** built using **React, Node.js, Express, and MySQL** with secure authentication.

---

## 🚀 Features

- 🔐 User Authentication (Register & Login)
- 🔑 JWT-based Authorization
- 🔒 Password Hashing using bcrypt
- 📚 Student CRUD Operations
  - Add Student
  - View Students
  - Update Student
  - Delete Student
- 💾 Data stored in MySQL (persistent storage)
- 🌐 REST API architecture

---

## 🛠️ Tech Stack

### Frontend
- React.js
- CSS

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Authentication
- JWT (JSON Web Token)
- bcrypt

---

## 📂 Project Structure
student-management/
│
├── backend/
│   ├── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│
└── README.md
---

## ⚙️ Installation & Setup

### 1️.Clone Repository

```bash
git clone <your-repo-link>
cd student-management

2.Setup Backend--
cd backend
npm install
npm install express cors mysql2 bcrypt jsonwebtoken

3️⃣ Setup Database (MySQL)

Run the following queries in MySQL Workbench:
CREATE DATABASE studentdb;
USE studentdb;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    course VARCHAR(100)
);

4️⃣ Configure Database

Update in backend/server.js:
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_PASSWORD",
    database: "studentdb"
});

5️⃣ Run Backend
node server.js
cd ../frontend
npm install
npm start

🔐 Authentication Flow
	1.	User registers → password is hashed
	2.	User logs in → JWT token generated
	3.	Token is sent with every request
	4.	Protected routes verify token

⸻

📌 API Endpoints

Auth
	•	POST /register
	•	POST /login

Students (Protected)
	•	GET /students
	•	POST /students
	•	PUT /students/:id
	•	DELETE /students/:id

⸻

🧠 Learning Highlights
	•	Full-stack integration (React + Node + MySQL)
	•	REST API development
	•	Authentication & Authorization
	•	Secure password handling
	•	Database operations (CRUD)

⸻

🚀 Future Improvements
	•	🌟 UI enhancement (Material UI / Tailwind)
	•	🔐 Role-based access (Admin/User)
	•	🌍 Deployment (Render / Vercel)
	•	📦 Use environment variables (.env)

⸻

👨‍💻 Author

Arman Khan
