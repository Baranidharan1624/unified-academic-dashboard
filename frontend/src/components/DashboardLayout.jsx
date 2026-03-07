import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

function DashboardLayout({children}){

return(

<div className="dashboard-layout">

<Navbar/>

<div className="dashboard-body">

<Sidebar/>

<div className="dashboard-content">

{children}

</div>

</div>

</div>

)

}

export default DashboardLayout