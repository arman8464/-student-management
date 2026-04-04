import React, { useState } from "react";
import "./App.css";

function App() {

  // ================= STATES =================
  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");

  const [editId, setEditId] = useState(null);


  // ================= AUTH =================

  const register = () => {
    fetch("http://127.0.0.1:3001/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
  };

  const login = () => {
    fetch("http://127.0.0.1:3001/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        setToken(data.token);
        alert("Login successful");
        getStudents(data.token);
      } else {
        alert(data.message);
      }
    });
  };

  const logout = () => {
    setToken("");
    setStudents([]);
  };


  // ================= STUDENTS =================

  const getStudents = (tok = token) => {
    fetch("http://127.0.0.1:3001/students", {
      headers: { "Authorization": tok }
    })
    .then(res => res.json())
    .then(data => setStudents(data));
  };

  const handleSubmit = () => {
    const student = { name, age, course };

    if (editId !== null) {
      fetch(`http://127.0.0.1:3001/students/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(student)
      }).then(() => {
        setEditId(null);
        clearFields();
        getStudents();
      });

    } else {
      fetch("http://127.0.0.1:3001/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(student)
      }).then(() => {
        clearFields();
        getStudents();
      });
    }
  };

  const deleteStudent = (id) => {
    fetch(`http://127.0.0.1:3001/students/${id}`, {
      method: "DELETE",
      headers: { "Authorization": token }
    }).then(() => getStudents());
  };

  const editStudent = (s) => {
    setName(s.name);
    setAge(s.age);
    setCourse(s.course);
    setEditId(s.id);
  };

  const clearFields = () => {
    setName("");
    setAge("");
    setCourse("");
  };


  // ================= UI =================

  return (
    <div className="container">

      {!token ? (
        <>
          <h2>🔐 Login / Register</h2>

          <input 
            placeholder="Username" 
            onChange={(e)=>setUsername(e.target.value)} 
          />

          <input 
            placeholder="Password" 
            type="password"
            onChange={(e)=>setPassword(e.target.value)} 
          />

          <div className="auth-buttons">
            <button onClick={register}>Register</button>
            <button onClick={login}>Login</button>
          </div>
        </>
      ) : (
        <>
          <h2>🎓 Student Dashboard</h2>

          <button onClick={logout} style={{background:"#333"}}>
            Logout
          </button>

          <input 
            placeholder="Name" 
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
          />

          <input 
            placeholder="Age" 
            value={age} 
            onChange={(e)=>setAge(e.target.value)} 
          />

          <input 
            placeholder="Course" 
            value={course} 
            onChange={(e)=>setCourse(e.target.value)} 
          />

          <button 
            className={editId !== null ? "update-btn" : "add-btn"}
            onClick={handleSubmit}
          >
            {editId !== null ? "Update Student" : "Add Student"}
          </button>

          <ul>
            {students.map((s) => (
              <li key={s.id}>
                <span>
                  <strong>{s.name}</strong> | {s.age} yrs | {s.course}
                </span>

                <div className="card-actions">
                  <button className="edit" onClick={() => editStudent(s)}>Edit</button>
                  <button className="delete" onClick={() => deleteStudent(s.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

    </div>
  );
}

export default App;