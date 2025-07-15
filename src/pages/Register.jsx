import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../services/AuthContext.jsx';
import '../css/Auth.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        // Check if passwords match before making API call
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match! Please make sure both password fields are identical.');
            setLoading(false);
            return;
        }
        
        // Check password strength (optional - you can remove this if not needed)
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }
        
        try {
            const result = await register(formData.username, formData.password, formData.phoneNumber);
            setSuccess(result.message || 'Account created successfully! Redirecting to home page...');
            // Redirect to login after successful registration
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            // Handle specific error messages from the backend
            let errorMessage = error.message;
            
            // Provide more user-friendly error messages
            if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('taken')) {
                errorMessage = 'Username is taken. Please choose a different username.';
            } else if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('exists')) {
                errorMessage = 'Username is taken. Please choose a different username.';
            } else if (errorMessage.toLowerCase().includes('user') && errorMessage.toLowerCase().includes('already')) {
                errorMessage = 'Username is taken. Please choose a different username.';
            } else if (errorMessage === 'Registration failed') {
                // Since backend returns generic "Registration failed" for username conflicts,
                // we'll assume it's likely a username issue and provide helpful guidance
                errorMessage = 'Username is taken. Please choose a different username.';
            } else if (errorMessage === 'Network error') {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else {
                // For any other errors, provide a helpful message
                errorMessage = 'Registration failed. This username might be taken or there was an issue with your information. Please try a different username.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
        
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join us and start exploring</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
