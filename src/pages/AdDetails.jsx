import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAds } from '../services/AdsContext';
import { useAuth } from '../services/AuthContext';
import '../css/AdDetails.css';

function AdDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ads, deleteAdFromBackend, currentPage, totalPages } = useAds();
    const { user, isAuthenticated } = useAuth();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        // First, try to find the ad in the current context
        const contextAd = ads?.find(ad => ad.id === parseInt(id));
        
        if (contextAd) {
            console.log('✅ Found ad in context:', contextAd);
            setAd(contextAd);
            setLoading(false);
        } else {
            // If not found in context, fetch it directly from the backend
            console.log('🔍 Ad not in context, fetching from backend...');
            fetchAdFromBackend();
        }
    }, [id, ads]);

    const fetchAdFromBackend = async () => {
        try {
            setLoading(true);
            console.log(`🔄 Fetching ad ${id} from backend...`);
            
            const response = await fetch(`http://localhost:8080/ad/${id}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    setError('Ad not found');
                } else {
                    setError(`Failed to load ad: ${response.status}`);
                }
                setLoading(false);
                return;
            }
            
            const fetchedAd = await response.json();
            console.log('📥 Fetched ad from backend:', fetchedAd);
            setAd(fetchedAd);
        } catch (err) {
            console.error('❌ Error fetching ad:', err);
            setError('Failed to load ad');
        } finally {
            setLoading(false);
        }
    };
    
    // Check if current user owns this ad
    // Use seller name since it's the same as username
    const isOwner = isAuthenticated && user && ad && ad.sellerName === user.username;
    
    // Debug logging to help troubleshoot ownership
    console.log('🔍 AdDetails Ownership Check:', {
        isAuthenticated,
        hasUser: !!user,
        adExists: !!ad,
        sellerName: ad?.sellerName,
        currentUsername: user?.username,
        isOwner
    });
    
    const handleDeleteAd = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${ad.title}"?\n\nThis action cannot be undone.`
        );
        
        if (confirmed) {
            const success = await deleteAdFromBackend(ad.id, user.token);
            if (success) {
                // Navigate back to ads list after successful deletion
                navigate('/ads');
            } else {
                alert('Failed to delete the ad. Please try again.');
            }
        }
    };
    
    const handleEditAd = () => {
        navigate(`/edit-ad/${ad.id}`);
    };
    
    if (loading) {
        return (
            <div className="ad-details-container">
                <div className="ad-loading">
                    <h2>Loading ad...</h2>
                </div>
            </div>
        );
    }

    if (error || !ad) {
        return (
            <div className="ad-details-container">
                <div className="ad-not-found">
                    <h2>{error || 'Ad not found'}</h2>
                    <p>The ad you're looking for might have been deleted or doesn't exist.</p>
                    <button onClick={() => navigate('/ads')} className="back-btn">
                        Back to Ads
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ad-details-container">
            <div className="ad-details-header">
                <button onClick={() => navigate('/ads')} className="back-btn">
                    ← Back to Ads
                </button>
            </div>
            
            <div className="ad-details-content">
                <div className="ad-image-section">
                    <img src={ad.imageUrl} alt={ad.title} className="ad-main-image" />
                    
                    {/* Owner actions - Edit and Delete buttons */}
                    {isOwner && (
                        <div className="owner-actions">
                            <button 
                                className="owner-edit-btn"
                                onClick={handleEditAd}
                            >
                                Edit Ad
                            </button>
                            <button 
                                className="owner-delete-btn"
                                onClick={handleDeleteAd}
                            >
                                Delete Ad
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="ad-info-section">
                    <div className="ad-header">
                        <h1 className="ad-title">{ad.title}</h1>
                        <p className="ad-price">${ad.price}</p>
                    </div>
                    
                    <div className="ad-meta">
                        <div className="ad-category-badge">
                            <span className="category-label">Category:</span>
                            <span className="category-value">{ad.category}</span>
                        </div>
                        <div className="ad-location">
                            <span className="location-label">📍 Location:</span>
                            <span className="location-value">{ad.city}</span>
                        </div>
                    </div>
                    
                    <div className="ad-description">
                        <h3>Description</h3>
                        <p>{ad.description || 'No description available for this item.'}</p>
                    </div>
                    
                    {ad.createdAt && (
                        <div className="ad-posted-date">
                            <span className="posted-label">Posted at: </span>
                            <span className="posted-value">
                                {new Date(ad.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    )}
                    
                    <div className="seller-info">
                        <h3>Seller Information</h3>
                        <div className="seller-card">
                            <div className="seller-avatar">
                                {ad.sellerName ? ad.sellerName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="seller-details">
                                <p className="seller-name">{ad.sellerName || 'Anonymous User'}</p>
                                <p className="seller-phone">{ad.sellerPhone || 'Phone not available'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdDetails;