require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ================= DB CONNECTION (POOL) =================
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB connection
db.getConnection((err, connection) => {
    if (err) {
        console.log("DB Connection Failed:", err);
    } else {
        console.log("Connected to MySQL Pool");
        connection.release();
    }
});

// ================= MIDDLEWARE =================
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

// ================= AUTH =================

// REGISTER
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(sql, [username, hashedPassword], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "User registered" });
        });

    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username=?";
    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length === 0) {
            return res.json({ message: "User not found" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    });
});

// ================= STUDENTS =================

// GET
app.get("/students", verifyToken, (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// ADD
app.post("/students", verifyToken, (req, res) => {
    const { name, age, course } = req.body;

    const sql = "INSERT INTO students (name, age, course) VALUES (?, ?, ?)";
    db.query(sql, [name, age, course], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Student added" });
    });
});

// UPDATE
app.put("/students/:id", verifyToken, (req, res) => {
    const id = req.params.id;
    const { name, age, course } = req.body;

    const sql = "UPDATE students SET name=?, age=?, course=? WHERE id=?";
    db.query(sql, [name, age, course, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Student updated" });
    });
});

// DELETE
app.delete("/students/:id", verifyToken, (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM students WHERE id=?";
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Student deleted" });
    });
});

// TEST
app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Server running...");
});