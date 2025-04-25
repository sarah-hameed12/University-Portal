import "./Navbar.css";
function Navbar({Navitems = []}){
    console.log("nav items", Navitems)
    return(
        <nav className="navbar">
            <ul className="navbar-list">
                {Navitems.map((item, index) => (
                    <li key={index} className="navbar-item">
                        <button className="navbar-button" onClick={item.onClick}>
                            {item.label}
                        </button>
                        {item.not && <span className="notification-badge"></span>}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
export default Navbar;