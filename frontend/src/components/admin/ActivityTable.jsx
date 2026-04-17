function ActivityTable(){

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
<tr>
<td colSpan="2" style={{textAlign: 'center', padding: '20px', color: '#999'}}>No recent activities</td>
</tr>
</tbody>

</table>

</div>

)

}

export default ActivityTable