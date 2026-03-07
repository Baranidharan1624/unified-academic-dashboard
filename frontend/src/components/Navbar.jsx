import logo from "../assets/images/logo.png"

function Navbar(){

return(

<div className="navbar">

<div className="navbar-left">

<img src={logo} alt="logo"/>

<span className="logo-text">CampusOne</span>

</div>

<div className="navbar-right">

<span className="nav-icon">🔔</span>

<span className="nav-icon">👤</span>

</div>

</div>

)

}

export default Navbar