import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import '../css/NavBar.css';

function NavBar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        // Optionally redirect to home page
        // navigate('/');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };
    return <nav className="navbar">
                <div className = "navbar-brand">
                    <Link to="/">Inviggo</Link>
                </div>
                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <Link to="/ads">Ads</Link>  
                </div>
                 {isAuthenticated ? (
                <div className="auth-section">
                    <span>Welcome, {user.username}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            ) : (
                <div className="auth-section">
                    <button onClick={handleLogin} className="auth-btn">Login</button>
                    <button onClick={handleRegister} className="auth-btn">Register</button>
                </div>
            )}
            </nav>
}

export default NavBar;