import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../services/AdsContext';
import { useAuth } from '../services/AuthContext';
import '../css/AdTable.css';

function AdTable({ads}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const navigate = useNavigate();
    const [showMineOnly, setShowMineOnly] = useState(false);
    const [userAds, setUserAds] = useState([]);
    const [loadingUserAds, setLoadingUserAds] = useState(false);
    const { currentPage, totalPages, goToNextPage, goToPreviousPage, deleteAdFromBackend, fetchUserAds } = useAds();
    const { user, isAuthenticated } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled by the filtering below
    };

    const handleAdClick = (adId) => {
        navigate(`/ad/${adId}`);
    };

    const handleDeleteAd = async (adId, adTitle) => {
        // Show confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete "${adTitle}"?\n\nThis action cannot be undone.`
        );
        
        if (confirmed) {
            const success = await deleteAdFromBackend(adId, user.token);
            if (!success) {
                alert('Failed to delete the ad. Please try again.');
            }
        }
    };

    // Dynamically get unique categories from the ads data
    const categories = [...new Set(ads.map(ad => ad.category))].sort();

    const adsToDisplay = showMineOnly ? userAds : (ads || []);

    // Ensure adsToDisplay is always an array
    const safeAdsToDisplay = Array.isArray(adsToDisplay) ? adsToDisplay : [];

    const filteredAds = safeAdsToDisplay.filter(ad => {
        const matchesSearch = searchQuery === "" || 
            (ad.title && ad.title.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "All Categories" || 
            (ad.category && ad.category.toLowerCase() === selectedCategory.toLowerCase());
        return matchesSearch && matchesCategory;
    });

      // Calculate pagination for filtered results
    const filteredTotalPages = filteredAds.length > 0 ? Math.ceil(filteredAds.length / 20) : 0;
    const shouldShowPagination = !showMineOnly; // Only show backend pagination when not filtering by "mine only"


    console.log('🎯 AdTable - Total ads:', ads.length);
    console.log('🎯 AdTable - Show mine only:', showMineOnly);
    console.log('🎯 AdTable - User ads:', userAds);
    console.log('🎯 AdTable - Ads to display:', adsToDisplay);
    console.log('🎯 AdTable - Safe ads to display:', safeAdsToDisplay);
    console.log('🎯 AdTable - Filtered ads:', filteredAds.length);
    console.log('🎯 AdTable - Current page:', currentPage);
    console.log('🎯 AdTable - Total pages:', totalPages);
    console.log('🔐 AdTable - Is authenticated:', isAuthenticated);
    console.log('👤 AdTable - Current user:', user);
    
    // Log first few ads to see their user data
    const handleShowMineOnlyChange = async (e) => {
        const checked = e.target.checked;
        setShowMineOnly(checked);
        
        if (checked && isAuthenticated && user && fetchUserAds) {
            try {
                setLoadingUserAds(true);
                console.log(`🔄 Fetching ads for user: ${user.username}`);
                const myAds = await fetchUserAds(user.username, user.token);
                console.log('📥 Received user ads:', myAds);
                setUserAds(myAds || []); // Ensure we always set an array
                setLoadingUserAds(false);
            } catch (error) {
                console.error('Error fetching user ads:', error);
                setUserAds([]);
                setLoadingUserAds(false);
                // Optionally show an error message to the user
                alert('Failed to load your ads. Please try again.');
            }
        } else {
            console.log('🔄 Unchecking show mine only, clearing user ads');
            setUserAds([]);
        }
    };

    // Add useEffect to log changes in userAds
    useEffect(() => {
        console.log('🔄 UserAds state changed:', userAds);
        console.log('📊 UserAds length:', userAds.length);
        console.log('📊 Is userAds array?', Array.isArray(userAds));
    }, [userAds]);

    return (
        <div className="ad-table-container">
            <div className="table-controls">
                <select 
                    className="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option>All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <form onSubmit={handleSearch} className="search-form">
                    <input 
                        type="text" 
                        placeholder="Search by name" 
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-btn">Search</button>
                </form>
                <div className="show-mine">
                    <input 
                        type="checkbox" 
                        id="show-mine" 
                        checked={showMineOnly}
                        onChange={handleShowMineOnlyChange}
                    />
                    <label htmlFor="show-mine">Show mine only</label>
                </div>
            </div>

            <div className="ads-grid">
                {loadingUserAds ? (
                    <div className="loading-message">Loading your ads...</div>
                ) : filteredAds.length === 0 && showMineOnly ? (
                    <div className="no-ads-message">You haven't posted any ads yet.</div>
                ) : filteredAds.length === 0 ? (
                    <div className="no-ads-message">No ads found matching your criteria.</div>
                ) : (
                    filteredAds.map(ad => (
                        <div key={ad.id} className="ad-card" onClick={() => handleAdClick(ad.id)}>
                            <div className="ad-card-image">
                                <img src={ad.imageUrl} alt={ad.title} className="ad-image" />
                            </div>
                            <div className="ad-card-content">
                                <h3 className="ad-title">{ad.title}</h3>
                                <p className="ad-price">${ad.price}</p>
                                <div className="ad-details">
                                    <span className="ad-category">{ad.category}</span>
                                </div>
                                {/* Only show edit/delete buttons for current user's ads */}
                                {(() => {
                                    // Use seller name since it's the same as username
                                    const showButtons = isAuthenticated && user && ad.sellerName === user.username;
                                    
                                    if (ad.id === filteredAds[0]?.id) { // Debug first ad only
                                        console.log(`🔍 Ad "${ad.title}" button check:`, {
                                            isAuthenticated,
                                            hasUser: !!user,
                                            sellerName: ad.sellerName,
                                            currentUsername: user?.username,
                                            showButtons
                                        });
                                    }
                                    return showButtons;
                                })() && (
                                    <div className="ad-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="edit-btn">Edit</button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteAd(ad.id, ad.title)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="table-pagination">
                <button 
                    className="prev-btn" 
                    onClick={goToPreviousPage}
                    disabled={currentPage === 0}
                >
                    Previous
                </button>
                <span className="page-info">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <button 
                    className="next-btn"
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default AdTable;
