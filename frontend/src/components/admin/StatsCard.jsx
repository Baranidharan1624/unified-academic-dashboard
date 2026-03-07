function StatsCard({title,value,color}){

return(

<div className="stats-card">

<h3>{title}</h3>

<p style={{color:color}}>{value}</p>

</div>

)

}

export default StatsCard