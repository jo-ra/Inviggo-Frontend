import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useAds } from '../services/AdsContext';
import '../css/AddAd.css';

function AddAd() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { refreshAds, addAd, goToLastPage } = useAds();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        price: '',
        category: '',
        city: ''
    });

    const categories = [
        'Clothing',
        'Tools', 
        'Sports',
        'Accessories',
        'Furniture',
        'Pets',
        'Games',
        'Books',
        'Technology'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.title || !formData.price || !formData.category || !formData.city) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            // Match the backend expected format
            const requestBody = {
                title: formData.title,
                description: formData.description,
                city: formData.city,
                category: formData.category,
                price: parseFloat(formData.price),
                imageUrl: formData.imageUrl
            };

            const response = await fetch('http://localhost:8080/ad/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                console.log('✅ Ad created successfully!');
                
                // Navigate to last page to see the new ad (new ads are added at the end)
                await goToLastPage();
                
                console.log('🚀 Navigating to /ads');
                navigate('/ads');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to create ad');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error creating ad:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-ad-container">
            <div className="add-ad-header">
                <button onClick={() => navigate('/ads')} className="back-btn">
                    ← Back to Ads
                </button>
                <h1>Add New Ad</h1>
            </div>

            <form onSubmit={handleSubmit} className="add-ad-form">
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter ad title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your item"
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="price">Price *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        required
                    />
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate('/ads')} 
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Ad...' : 'Create Ad'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddAd;
