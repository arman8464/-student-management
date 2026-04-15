import React, { useState } from "react";//hook to store and update data

function App() {//component starts here

  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");//these stores input value from UI
  const [age, setAge] = useState("");
  const [course, setCourse] = useState("");

  const [username, setUsername] = useState("");//used for login and registration
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token") || "");//Get token from browser storage

  const [editId, setEditId] = useState(null);//to check if student is edited or added
  const [loading, setLoading] = useState(false); // To handle render cold start delay

  // ================= AUTH =================

  const register = () => {//function runs when user clicks register button
    setLoading(true);
    fetch("https://student-backend-7a0d.onrender.com/register", {//call register API
      method: "POST",//sending data
      headers: {"Content-Type": "application/json"},//tell backend we are sending JSON data
      body: JSON.stringify({ username, password })//convert to json
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);//show message from backend
      setLoading(false);
    })
    .catch(() => setLoading(false));
  };

  const login = () => {
  setLoading(true);
  fetch("https://student-backend-7a0d.onrender.com/login", {//call login API
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token); //  if login success SAVE token to browser
      setToken(data.token);//update token state
      getStudents(data.token);//fetch students data
    } else {
      alert(data.message);
      setLoading(false);
    }
  })
  .catch(() => setLoading(false));
};

  const logout = () => {
  localStorage.removeItem("token"); // REMOVE saved token
  setToken("");//reset token state
  setStudents([]);//clear students data
};

  // ================= STUDENTS =================

  const getStudents = async (tok = token) => {
  setLoading(true);
  try {
    const res = await fetch("https://student-backend-7a0d.onrender.com/students", {
      headers: { Authorization: tok }
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    setStudents(data);

  } catch (err) {
    console.error(err);
    alert("Server waking up... try again");
  } finally {
    setLoading(false);
  }
};
  const handleSubmit = async () => {
  const student = { name, age, course };

  try {
    let url = "https://student-backend-7a0d.onrender.com/students";
    let method = "POST";

    if (editId !== null) {
      url = `https://student-backend-7a0d.onrender.com/students/${editId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify(student)
    });

    if (!res.ok) throw new Error("Failed");

    setEditId(null);
    clearFields();
    getStudents();

  } catch (err) {
    console.error(err);
    alert("Server error, try again");
  }
};

  const deleteStudent = async (id) => {
  try {
    const res = await fetch(`https://student-backend-7a0d.onrender.com/students/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });

    if (!res.ok) throw new Error("Delete failed");

    getStudents();

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};

  const editStudent = (s) => {
    setName(s.name);
    setAge(s.age);
    setCourse(s.course);
    setEditId(s.id);//switch to update mode
  };

  const clearFields = () => {//reset input fields
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
            onChange={(e)=>setUsername(e.target.value)}//When user types → update state
          />

          <input 
            className="form-control mb-3 w-50 mx-auto"
            type="password"
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
          />

          <div className="d-flex justify-content-center">
            <button className="btn btn-primary m-2" onClick={register} disabled={loading}>{/*calls register function */}
              Register
            </button>

            <button className="btn btn-success m-2" onClick={login} disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
          </div>
          {loading && <div className="mt-3 text-info">Connecting to server... (This might take ~50s to wake up on Render as it's a free instance)</div>}
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
              {editId !== null ? "Update Student" : "Add Student"}{/*dynamic button text*/}
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
                  <td>{s.name}</td>{/*display student name*/}
                  <td>{s.age}</td>
                  <td>{s.course}</td>
                  <td>
                    <button className="btn btn-info me-2" onClick={() => editStudent(s)}>
                      Edit{/*action buttons*/}
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

export default App;//makes component available to other files