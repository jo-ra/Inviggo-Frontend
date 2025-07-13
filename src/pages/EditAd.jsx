import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAds } from '../services/AdsContext';
import { useAuth } from '../services/AuthContext';
import '../css/AddAd.css'; // Reuse the same styles as AddAd

function EditAd() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ads, updateAd } = useAds();
    const { user, isAuthenticated } = useAuth();
    
    // State for the ad being edited
    const [adToEdit, setAdToEdit] = useState(null);
    const [adLoading, setAdLoading] = useState(true);
    const [adError, setAdError] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        city: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch the ad to edit
    useEffect(() => {
        const fetchAdToEdit = async () => {
            // First, try to find the ad in the current context
            const contextAd = ads?.find(ad => ad.id === parseInt(id));
            
            if (contextAd) {
                console.log('✅ Found ad to edit in context:', contextAd);
                setAdToEdit(contextAd);
                setAdLoading(false);
            } else {
                // If not found in context, fetch it directly from the backend
                console.log('🔍 Ad to edit not in context, fetching from backend...');
                try {
                    setAdLoading(true);
                    const response = await fetch(`http://localhost:8080/ad/${id}`);
                    
                    if (!response.ok) {
                        if (response.status === 404) {
                            setAdError('Ad not found');
                        } else {
                            setAdError(`Failed to load ad: ${response.status}`);
                        }
                        setAdLoading(false);
                        return;
                    }
                    
                    const fetchedAd = await response.json();
                    console.log('📥 Fetched ad to edit from backend:', fetchedAd);
                    setAdToEdit(fetchedAd);
                } catch (err) {
                    console.error('❌ Error fetching ad to edit:', err);
                    setAdError('Failed to load ad');
                } finally {
                    setAdLoading(false);
                }
            }
        };

        fetchAdToEdit();
    }, [id, ads]);

    // Pre-populate form with existing ad data
    useEffect(() => {
        if (adToEdit) {
            // Check if user owns this ad
            if (!isAuthenticated || !user || adToEdit.sellerName !== user.username) {
                navigate('/ads'); // Redirect if not owner
                return;
            }
            
            // Only update form data if it's not already populated
            if (!formData.title) {
                console.log('📋 Pre-populating form with ad data:', adToEdit);
                setFormData({
                    title: adToEdit.title || '',
                    description: adToEdit.description || '',
                    price: adToEdit.price?.toString() || '',
                    category: adToEdit.category || '',
                    city: adToEdit.city || '',
                    imageUrl: adToEdit.imageUrl || ''
                });
            }
        }
    }, [adToEdit, isAuthenticated, user, navigate]);

    // If ad loading, show loading state
    if (adLoading) {
        return (
            <div className="add-ad-container">
                <div className="add-ad-header">
                    <button onClick={() => navigate('/ads')} className="back-btn">
                        ← Back to Ads
                    </button>
                    <h1>Loading...</h1>
                </div>
                <div className="loading-message">
                    <p>Loading ad details...</p>
                </div>
            </div>
        );
    }

    // If ad not found or error, show error
    if (adError || !adToEdit) {
        return (
            <div className="add-ad-container">
                <div className="add-ad-header">
                    <button onClick={() => navigate('/ads')} className="back-btn">
                        ← Back to Ads
                    </button>
                    <h1>Ad Not Found</h1>
                </div>
                <div className="error-message">
                    <p>{adError || 'The ad you\'re trying to edit could not be found.'}</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`📝 Input change - ${name}: ${value}`);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }
        if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            setError('Please enter a valid price');
            setLoading(false);
            return;
        }
        if (!formData.category.trim()) {
            setError('Category is required');
            setLoading(false);
            return;
        }
        if (!formData.city.trim()) {
            setError('City is required');
            setLoading(false);
            return;
        }

        try {
            const updatedAdData = {
                title: formData.title,
                description: formData.description,
                city: formData.city,
                category: formData.category,
                price: parseFloat(formData.price),
                imageUrl: formData.imageUrl
            };

            console.log('📝 Updating ad with data:', updatedAdData);

            const response = await fetch(`http://localhost:8080/ad/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(updatedAdData)
            });

            if (response.ok) {
                const updatedAd = await response.json();
                console.log('✅ Ad updated successfully:', updatedAd);
                
                // Update the ad in local state
                updateAd(updatedAd);
                
                navigate(`/ad/${id}`); // Navigate back to ad details
            } else {
                const errorData = await response.text();
                console.error('❌ Failed to update ad:', response.status, errorData);
                setError('Failed to update ad. Please try again.');
            }
        } catch (err) {
            console.error('❌ Error updating ad:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="add-ad-container">
            <div className="add-ad-header">
                <button onClick={() => navigate(`/ad/${id}`)} className="back-btn">
                    ← Back to Ad
                </button>
                <h1>Edit Ad</h1>
            </div>

            <div className="add-ad-content">
                <form onSubmit={handleSubmit} className="add-ad-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

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
                            placeholder="Describe your item..."
                            rows="4"
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
                                min="0"
                                step="0.01"
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

                    {formData.imageUrl && (
                        <div className="image-preview">
                            <label>Image Preview:</label>
                            <img 
                                src={formData.imageUrl} 
                                alt="Preview" 
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                                onLoad={(e) => {
                                    e.target.style.display = 'block';
                                }}
                            />
                        </div>
                    )}

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => navigate(`/ad/${id}`)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Ad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAd;
