import React, { useState } from "react";

function App() {

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
    <div className="container mt-5">

      {!token ? (
        <div className="card p-4 text-center">
          <h3 className="mb-3">🔐 Login / Register</h3>

          <input 
            className="form-control mb-2 w-50 mx-auto"
            placeholder="Username"
            onChange={(e)=>setUsername(e.target.value)}
          />

          <input 
            className="form-control mb-3 w-50 mx-auto"
            type="password"
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
          />

          <div className="d-flex justify-content-center">
            <button className="btn btn-primary m-2" onClick={register}>
              Register
            </button>

            <button className="btn btn-success m-2" onClick={login}>
              Login
            </button>
          </div>
        </div>

      ) : (
        <div className="card p-4 text-center">
          <h3 className="mb-3">🎓 Student Dashboard</h3>

          <div className="d-flex justify-content-end">
  <button className="btn btn-dark btn-sm mb-3" onClick={logout}>
    Logout
  </button>
</div>

          <input 
            className="form-control mb-2 w-50 mx-auto"
            placeholder="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input 
            className="form-control mb-2 w-50 mx-auto"
            placeholder="Age"
            value={age}
            onChange={(e)=>setAge(e.target.value)}
          />

          <input 
            className="form-control mb-3 w-50 mx-auto"
            placeholder="Course"
            value={course}
            onChange={(e)=>setCourse(e.target.value)}
          />

          <div className="text-center">
            <button 
              className={`btn ${editId !== null ? "btn-warning" : "btn-success"} mb-3`}
              onClick={handleSubmit}
            >
              {editId !== null ? "Update Student" : "Add Student"}
            </button>
          </div>

          <table className="table table-bordered table-striped mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.age}</td>
                  <td>{s.course}</td>
                  <td>
                    <button className="btn btn-info me-2" onClick={() => editStudent(s)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => deleteStudent(s.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}

export default App;