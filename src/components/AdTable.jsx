import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../services/AdsContext';
import { useAuth } from '../services/AuthContext';
import '../css/AdTable.css';

function AdTable({ads}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const navigate = useNavigate();
    const [showMineOnly, setShowMineOnly] = useState(false);
    const [userAds, setUserAds] = useState([]);
    const [loadingUserAds, setLoadingUserAds] = useState(false);
    const { currentPage, totalPages, goToNextPage, goToPreviousPage, deleteAdFromBackend, fetchUserAds, fetchAdsByPriceRange, fetchAds } = useAds();
    const { user, isAuthenticated } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled by the filtering below
    };

    const clearFilters = useCallback(() => {
        setSearchQuery("");
        setSelectedCategory("All Categories");
        setMinPrice("");
        setMaxPrice("");
        // Reset to show all ads only if not showing "mine only"
        if (!showMineOnly) {
            fetchAds(0);
        }
    }, [showMineOnly, fetchAds]);

    // Effect to handle backend price filtering only on Enter key
    const handlePriceFilter = useCallback(async () => {
        console.log(`🔍 Before API call - Min: "${minPrice}", Max: "${maxPrice}"`);
        
        // Apply backend filtering if we have price values and not showing "mine only"
        if ((minPrice !== "" || maxPrice !== "") && !showMineOnly) {
            const min = minPrice === "" ? null : parseFloat(minPrice);
            const max = maxPrice === "" ? null : parseFloat(maxPrice);
            
            console.log(`🔍 Price filter values - Min: ${min}, Max: ${max}`);
            
            // Only proceed if we have valid numbers (or null for empty values)
            if ((min === null || !isNaN(min)) && (max === null || !isNaN(max))) {
                console.log(`📡 Making backend API call with Min: ${min}, Max: ${max}`);
                await fetchAdsByPriceRange(min, max, 0);
                console.log(`✅ After API call - Min: "${minPrice}", Max: "${maxPrice}"`);
            }
        }
    }, [minPrice, maxPrice, showMineOnly, fetchAdsByPriceRange]);

    // Handle Enter key press on price inputs
    const handlePriceKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handlePriceFilter();
        }
    }, [handlePriceFilter]);

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
        
        // Backend filtering is active when either min OR max price is provided and we're not showing "mine only"
        const isBackendFiltering = (minPrice !== "" || maxPrice !== "") && !showMineOnly;
        let matchesPrice = true;
        
        if (!isBackendFiltering) {
            // Apply client-side price filtering
            const adPrice = parseFloat(ad.price) || 0;
            const min = minPrice === "" ? 0 : parseFloat(minPrice) || 0;
            const max = maxPrice === "" ? Infinity : parseFloat(maxPrice) || Infinity;
            matchesPrice = adPrice >= min && adPrice <= max;
        }
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Calculate pagination for filtered results
    const filteredTotalPages = filteredAds.length > 0 ? Math.ceil(filteredAds.length / 20) : 0;
    const shouldShowPagination = !showMineOnly; // Only show backend pagination when not filtering by "mine only"
    
    // Enhanced pagination handlers that respect price filtering
    const handleNextPage = useCallback(() => {
        const isBackendFiltering = (minPrice !== "" || maxPrice !== "") && !showMineOnly;
        if (isBackendFiltering) {
            const min = minPrice === "" ? null : parseFloat(minPrice);
            const max = maxPrice === "" ? null : parseFloat(maxPrice);
            
            // Validate the values
            if ((min === null || !isNaN(min)) && (max === null || !isNaN(max))) {
                // Ensure min <= max if both are provided
                if (min === null || max === null || min <= max) {
                    if (currentPage < totalPages - 1) {
                        fetchAdsByPriceRange(min, max, currentPage + 1);
                    }
                }
            }
        } else {
            goToNextPage();
        }
    }, [minPrice, maxPrice, showMineOnly, currentPage, totalPages, fetchAdsByPriceRange, goToNextPage]);

    const handlePreviousPage = useCallback(() => {
        const isBackendFiltering = (minPrice !== "" || maxPrice !== "") && !showMineOnly;
        if (isBackendFiltering) {
            const min = minPrice === "" ? null : parseFloat(minPrice);
            const max = maxPrice === "" ? null : parseFloat(maxPrice);
            
            // Validate the values
            if ((min === null || !isNaN(min)) && (max === null || !isNaN(max))) {
                // Ensure min <= max if both are provided
                if (min === null || max === null || min <= max) {
                    if (currentPage > 0) {
                        fetchAdsByPriceRange(min, max, currentPage - 1);
                    }
                }
            }
        } else {
            goToPreviousPage();
        }
    }, [minPrice, maxPrice, showMineOnly, currentPage, fetchAdsByPriceRange, goToPreviousPage]);
    const handleShowMineOnlyChange = async (e) => {
        const checked = e.target.checked;
        setShowMineOnly(checked);
        
        if (checked && isAuthenticated && user && fetchUserAds) {
            try {
                setLoadingUserAds(true);
                const myAds = await fetchUserAds(user.username, user.token);
                setUserAds(myAds || []); // Ensure we always set an array
                setLoadingUserAds(false);
            } catch (error) {
                console.error('Error fetching user ads:', error);
                setUserAds([]);
                setLoadingUserAds(false);
                alert('Failed to load your ads. Please try again.');
            }
        } else {
            setUserAds([]);
        }
    };

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
                
                <div className="price-range-filter">
                    <input 
                        type="number" 
                        placeholder="Min price" 
                        className="price-input"
                        value={minPrice}
                        onChange={(e) => {
                            const value = e.target.value;
                            console.log(`📝 Setting minPrice to: "${value}"`);
                            setMinPrice(value);
                        }}
                        onKeyPress={handlePriceKeyPress}
                        min="0"
                        step="0.01"
                        title="Press Enter to apply filter"
                    />
                    <span className="price-separator">-</span>
                    <input 
                        type="number" 
                        placeholder="Max price" 
                        className="price-input"
                        value={maxPrice}
                        onChange={(e) => {
                            const value = e.target.value;
                            console.log(`📝 Setting maxPrice to: "${value}"`);
                            setMaxPrice(value);
                        }}
                        onKeyPress={handlePriceKeyPress}
                        min="0"
                        step="0.01"
                        title="Press Enter to apply filter"
                    />
                    {(minPrice !== "" || maxPrice !== "") && !showMineOnly && (
                        <span className="backend-filter-indicator" title="Using backend filtering">
                            🔍
                        </span>
                    )}
                </div>
                
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
                
                <button 
                    type="button" 
                    className="clear-filters-btn"
                    onClick={clearFilters}
                    title="Clear all filters"
                >
                    Clear Filters
                </button>
                {isAuthenticated && (
                    <div className="show-mine">
                        <input 
                            type="checkbox" 
                            id="show-mine" 
                            checked={showMineOnly}
                            onChange={handleShowMineOnlyChange}
                        />
                        <label htmlFor="show-mine">Show mine only</label>
                    </div>
                )}
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
                                {isAuthenticated && user && ad.sellerName === user.username && (
                                    <div className="ad-actions" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            className="edit-btn"
                                            onClick={() => navigate(`/edit-ad/${ad.id}`)}
                                        >
                                            Edit
                                        </button>
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
            
            {/* Only show pagination when NOT filtering by "mine only" and there are ads to paginate */}
            {!showMineOnly && (
                <div className="table-pagination">
                    <button 
                        className="prev-btn" 
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <button 
                        className="next-btn"
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default AdTable;
