const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// DB CONNECTION
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123", 
    database: "studentdb"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// MIDDLEWARE
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) return res.send("Access denied");

    try {
        const verified = jwt.verify(token, "secretkey");
        req.user = verified;
        next();
    } catch {
        res.send("Invalid token");
    }
};


// ================= AUTH =================

// REGISTER
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

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

        if (result.length === 0) {
            return res.json({ message: "User not found" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id }, "secretkey", {
            expiresIn: "1h"
        });

        res.json({ message: "Login successful", token });
    });
});


// ================= STUDENT CRUD =================

// GET
app.get("/students", verifyToken, (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
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

app.listen(3001, () => {
    console.log("Server running on port 3001");
});