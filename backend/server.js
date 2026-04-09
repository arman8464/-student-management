require("dotenv").config();// .env file into process.env
const express = require("express");//for building web applications
const cors = require("cors");//allowing frontend to communicate with backend
const mysql = require("mysql2");//connect and interact with MySQL database
const bcrypt = require("bcrypt");//import bcrypt library for hashing passwords securely
const jwt = require("jsonwebtoken");//creates and verifies jwts for authentication 

const app = express();//crerates server 

app.use(cors({
  origin: "*",//allow all frontend apps
  methods: ["GET", "POST", "PUT", "DELETE"],//http methods
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());//converts incoming JSON requests into JavaScript objects, making it easier to access data in request body

// DB CONNECTION
const db = mysql.createConnection({//creates connection
    host: process.env.MYSQLHOST,//db should not be hardcoded, use env variables
    user: process.env.MYSQLUSER,//
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// MIDDLEWARE
const verifyToken = (req, res, next) => {//to protect routes
    const token = req.headers["authorization"];//get token from request header

    if (!token) return res.send("Access denied");//if no token provided, reject request

    try {
        const verified = jwt.verify(token, "secretkey");//checks if token valid?,expired?
        req.user = verified;//attach user info to request
        next();
    } catch {
        res.send("Invalid token");
    }
};


// ================= AUTH =================

// REGISTER
app.post("/register", async (req, res) => {//post->send data
    const { username, password } = req.body;//extract input

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], (err) => {
        if (err) return res.send(err);
        res.json({ message: "User registered" });
    });
});

// LOGIN
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username=?";
    db.query(sql, [username], async (err, result) => {
        if (err) return res.send(err);

        if (result.length === 0) {//no user found
            return res.json({ message: "User not found" });
        }

        const user = result[0];//get user data

        const isMatch = await bcrypt.compare(password, user.password);//compare passwords

        if (!isMatch) {
            return res.json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id }, "secretkey", {
            expiresIn: "1h"//token expires in 1 hour
        });

        res.json({ message: "Login successful", token });
    });
});


// ================= STUDENT CRUD =================

// GET
app.get("/students", verifyToken, (req, res) => {//verifytoken->only loggedin users allowed
    db.query("SELECT * FROM students", (err, result) => {//fetch all students from database
        if (err) return res.send(err);
        res.json(result);
    });
});

// ADD
app.post("/students", verifyToken, (req, res) => {
    const { name, age, course } = req.body;

    const sql = "INSERT INTO students (name, age, course) VALUES (?, ?, ?)";
    db.query(sql, [name, age, course], (err) => {
        if (err) return res.send(err);
        res.json({ message: "Student added" });
    });
});

// UPDATE
app.put("/students/:id", verifyToken, (req, res) => {
    const id = req.params.id;
    const { name, age, course } = req.body;

    const sql = "UPDATE students SET name=?, age=?, course=? WHERE id=?";
    db.query(sql, [name, age, course, id], (err) => {
        if (err) return res.send(err);
        res.json({ message: "Student updated" });
    });
});

// DELETE
app.delete("/students/:id", verifyToken, (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM students WHERE id=?";
    db.query(sql, [id], (err) => {
        if (err) return res.send(err);
        res.json({ message: "Student deleted" });
    });
});
app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Server running on port 3001");
});