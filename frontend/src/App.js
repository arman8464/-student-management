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

  // ================= AUTH =================

  const register = () => {//function runs when user clicks register button
    fetch("https://student-backend-7a0d.onrender.com/register", {//call register API
      method: "POST",//sending data
      headers: {"Content-Type": "application/json"},//tell backend we are sending JSON data
      body: JSON.stringify({ username, password })//convert to json
    })
    .then(res => res.json())
    .then(data => alert(data.message));//show message from backend
  };

  const login = () => {
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
    }
  });
};

  const logout = () => {
  localStorage.removeItem("token"); // REMOVE saved token
  setToken("");//reset token state
  setStudents([]);//clear students data
};

  // ================= STUDENTS =================

  const getStudents = (tok = token) => {
    fetch("https://student-backend-7a0d.onrender.com/students", {
      headers: { "Authorization": tok }//send token in header
    })
    .then(res => res.json())
    .then(data => setStudents(data));//save data to state
  };

  const handleSubmit = () => {//runs when add/update button is clicked
    const student = { name, age, course };//create object

    if (editId !== null) {//if editId has value, we are updating existing student
      fetch(`https://student-backend-7a0d.onrender.com/students/${editId}`, {
        method: "PUT",
        headers: {//send token+data
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(student)
      }).then(() => {
        setEditId(null);//reset and refresh data
        clearFields();
        getStudents();
      });

    } else {
      fetch("https://student-backend-7a0d.onrender.com/students", {
        method: "POST",//add new student
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
    fetch(`https://student-backend-7a0d.onrender.com/students/${id}`, {
      method: "DELETE",
      headers: { "Authorization": token }
    }).then(() => getStudents());//refresh list
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
            <button className="btn btn-primary m-2" onClick={register}>{/*calls register function */}
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