import { useState } from "react";
import "../../assets/css/dashboard.css";

function StudentManagement() {

const [showForm,setShowForm] = useState(false)

return(

<div className="page-container">

<h2>Student Management</h2>

<div className="page-actions">

<button onClick={()=>setShowForm(true)} className="primary-btn">
Create Student
</button>

<button className="secondary-btn">
Upload CSV
</button>

</div>

{showForm && (

<div className="form-card">

<h3>Create Student Account</h3>

<form className="form-grid">

<input placeholder="Student ID" />

<input placeholder="Full Name" />

<input placeholder="Email" />

<input placeholder="Department" />

<input placeholder="Year" />

<input placeholder="Password" />

<button className="primary-btn">
Create Account
</button>

</form>

</div>

)}

</div>

)

}

export default StudentManagement