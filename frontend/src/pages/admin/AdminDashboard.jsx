import DashboardLayout from "../../components/DashboardLayout"
import StatsCard from "../../components/admin/StatsCard"
import ActivityTable from "../../components/admin/ActivityTable"

import "../../assets/css/dashboard.css"

function AdminDashboard(){

return(

<DashboardLayout>

<div className="stats-container">

<StatsCard
title="Total Students"
value="1200"
color="#3B82F6"
/>

<StatsCard
title="Total Staff"
value="85"
color="#10B981"
/>

<StatsCard
title="Requests Pending"
value="12"
color="#F59E0B"
/>

<StatsCard
title="Complaints Open"
value="3"
color="#EF4444"
/>

</div>

<ActivityTable/>

</DashboardLayout>

)

}

export default AdminDashboard