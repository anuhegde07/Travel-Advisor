import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
// import NavBar from './NavBar';
import  {SearchBar}  from './SearchBar';
import { Login } from './Login';
import { Home } from './Home';

function App() {
  return (
    <>
       <BrowserRouter>
       {/* <NavBar /> */}
       <Home />
      <SearchBar />
        <Routes>
          
          <Route exact path="/" />
          <Route exact path="/Login" element={<Login />}/>
        </Routes>
      </BrowserRouter>
    </>
    
  );
}

export default App;
