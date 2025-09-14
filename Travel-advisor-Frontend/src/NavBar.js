import React from 'react'
import {Link} from 'react-router-dom';
import './App.css';

function NavBar() {
  return (
    <div className='navbar'>

      <div> <Link to="/Login">Login</Link></div>
        
    </div>
  )
}

export default NavBar
