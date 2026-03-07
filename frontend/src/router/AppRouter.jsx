import { BrowserRouter,Routes,Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentManagement from "../pages/admin/StudentManagement"
import StaffManagement from "../pages/admin/StaffManagement"

function AppRouter(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login/>} />

<Route path="/admin/dashboard" element={<AdminDashboard/>} />

<Route path="/admin/students" element={<StudentManagement />} />

<Route path="/admin/staff" element={<StaffManagement />} />

</Routes>

</BrowserRouter>

)

}

export default AppRouter