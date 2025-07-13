import { useParams, useNavigate } from 'react-router-dom';
import { useAds } from '../services/AdsContext';
import { useAuth } from '../services/AuthContext';
import '../css/AdDetails.css';

function AdDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { ads, deleteAdFromBackend, currentPage, totalPages } = useAds();
    const { user, isAuthenticated } = useAuth();
    
    // Find the ad by ID
    const ad = ads?.find(ad => ad.id === parseInt(id));
    
    // Check if current user owns this ad
    // Use seller name since it's the same as username
    const isOwner = isAuthenticated && user && ad.sellerName === user.username;
    
    // Debug logging to help troubleshoot ownership
    console.log('🔍 AdDetails Ownership Check:', {
        isAuthenticated,
        hasUser: !!user,
        sellerName: ad.sellerName,
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
        // For now, just show an alert. Later you can navigate to edit page
        alert('Edit functionality coming soon!');
        // navigate(`/edit-ad/${ad.id}`);
    };
    
    if (!ad) {
        return (
            <div className="ad-details-container">
                <div className="ad-not-found">
                    <h2>Ad not found</h2>
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