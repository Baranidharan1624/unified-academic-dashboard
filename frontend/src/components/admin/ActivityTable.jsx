function ActivityTable(){

const activities = [

{action:"New student account created",time:"2 minutes ago"},
{action:"Staff member added",time:"10 minutes ago"},
{action:"Complaint submitted",time:"1 hour ago"},
{action:"Announcement posted",time:"Today"}

]

return(

<div className="activity-table">

<h2>Recent Activities</h2>

<table>

<thead>
<tr>
<th>Activity</th>
<th>Time</th>
</tr>
</thead>

<tbody>

{activities.map((item,index)=>(
<tr key={index}>
<td>{item.action}</td>
<td>{item.time}</td>
</tr>
))}

</tbody>

</table>

</div>

)

}

export default ActivityTable