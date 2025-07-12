import { useParams, useNavigate } from 'react-router-dom';
import '../css/AdDetails.css';

function AdDetails({ ads }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Find the ad by ID
    const ad = ads?.find(ad => ad.id === parseInt(id));
    
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
                    
                    <div className="contact-actions">
                        <button className="contact-btn primary">Contact Seller</button>
                        <button className="contact-btn secondary">Save Ad</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdDetails;