import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './component/Header';
import Login from './pages/Login';
import SignupPage from './pages/Signup';
import PermitsTable from './pages/PermitsTable';
import Search from './pages/Search';
import AddPermitForm from './pages/AddPermitForm';
import HomePage from './pages/Home';
import Footer from './component/Footer';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/permit" element={<PermitsTable />} />
        <Route path="/search" element={<Search />} />
        <Route path="/add-permit" element={<AddPermitForm />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
