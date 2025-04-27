import "./SideMenu.scss"
import { Outlet, Link } from "react-router-dom";

function SideMenu() {
  return (
    <div className="side-menu">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/marketData">Market Data</Link>
          </li>
          <li>
            <Link to="/nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>

      <hr />

      <Outlet />
    </div>  
  )
}

export default SideMenu