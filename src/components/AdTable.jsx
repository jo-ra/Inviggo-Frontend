import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../services/AdsContext';
import { useAuth } from '../services/AuthContext';
import { VALID_CATEGORIES, isValidCategory, sanitizeCategory } from '../constants/categories';
import '../css/AdTable.css';

function AdTable({ads}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const navigate = useNavigate();
    const [showMineOnly, setShowMineOnly] = useState(false);
    const [userAds, setUserAds] = useState([]);
    const { currentPage, totalPages, goToNextPage, goToPreviousPage, deleteAdFromBackend, fetchFilteredAds, fetchAds, fetchUserAds } = useAds();
    const { user, isAuthenticated } = useAuth();

    const handleCategoryChange = async (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        
        // Validate category before filtering
        if (newCategory !== "All Categories" && !isValidCategory(newCategory)) {
            console.warn(`⚠️ Invalid category selected: ${newCategory}`);
            alert(`Invalid category: ${newCategory}. Please select a valid category.`);
            return;
        }
        
        // No need for backend call - filtering is done in filteredAds computed property
        console.log(`🔍 Category changed to: ${newCategory} - filtering will be applied automatically`);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // No backend call needed - filtering is done automatically in filteredAds
        console.log(`🔍 Search triggered: "${searchQuery}" - filtering will be applied automatically`);
    };

    const clearFilters = useCallback(() => {
        setSearchQuery("");
        setSelectedCategory("All Categories");
        setMinPrice("");
        setMaxPrice("");
        setShowMineOnly(false);
        setUserAds([]);
        // No need to fetch - filtering is done automatically
        console.log('🧹 All filters cleared - showing all ads');
    }, []);

    // Handle Enter key press on price inputs - no backend call needed
    const handlePriceKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            console.log(`🔍 Price filter applied: Min: "${minPrice}", Max: "${maxPrice}"`);
            // Filtering happens automatically in filteredAds computed property
        }
    }, [minPrice, maxPrice]);

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
            if (success) {
                // Clear "Show Mine Only" filter to show all ads after deletion
                setShowMineOnly(false);
                // Clear other filters as well to ensure user sees all ads
                clearFilters();
                // Redirect to simple ads page after successful deletion
                navigate('/ads');
            } else {
                alert('Failed to delete the ad. Please try again.');
            }
        }
    };

    // Use predefined valid categories instead of dynamic generation to avoid backend validation errors
    const categories = VALID_CATEGORIES;

    // Use all ads from backend, or user-specific ads when "Show Mine Only" is active
    const adsToFilter = showMineOnly ? userAds : ads;
    const safeAdsToDisplay = Array.isArray(adsToFilter) ? adsToFilter : [];

    // Apply all filtering on the frontend
    const filteredAds = safeAdsToDisplay.filter(ad => {
        // Search filter - check if title contains search query
        const matchesSearch = searchQuery === "" || 
            (ad.title && ad.title.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Category filter
        const matchesCategory = selectedCategory === "All Categories" || 
            (ad.category && ad.category.toLowerCase() === selectedCategory.toLowerCase());
        
        // Price range filter
        let matchesPrice = true;
        if (minPrice !== "" || maxPrice !== "") {
            const adPrice = parseFloat(ad.price) || 0;
            const min = minPrice === "" ? 0 : parseFloat(minPrice) || 0;
            const max = maxPrice === "" ? Infinity : parseFloat(maxPrice) || Infinity;
            matchesPrice = adPrice >= min && adPrice <= max;
        }
        
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    // Simple pagination for frontend-filtered results
    const resultsPerPage = 20;
    const totalFilteredPages = Math.ceil(filteredAds.length / resultsPerPage);
    const [currentFilteredPage, setCurrentFilteredPage] = useState(0);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentFilteredPage(0);
    }, [searchQuery, selectedCategory, minPrice, maxPrice, showMineOnly]);
    
    // Get current page of filtered results
    const startIndex = currentFilteredPage * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedAds = filteredAds.slice(startIndex, endIndex);

    const handleNextPage = useCallback(() => {
        if (currentFilteredPage < totalFilteredPages - 1) {
            setCurrentFilteredPage(prev => prev + 1);
        }
    }, [currentFilteredPage, totalFilteredPages]);

    const handlePreviousPage = useCallback(() => {
        if (currentFilteredPage > 0) {
            setCurrentFilteredPage(prev => prev - 1);
        }
    }, [currentFilteredPage]);
    const handleShowMineOnlyChange = async (e) => {
        const checked = e.target.checked;
        setShowMineOnly(checked);
        setCurrentFilteredPage(0); // Reset to first page when toggling
        
        if (checked && isAuthenticated && user) {
            console.log('🔐 Fetching user ads for:', user.username);
            
            try {
                const userAdsResult = await fetchUserAds(user.username, user.token);
                console.log('✅ Got user ads:', userAdsResult.length);
                setUserAds(userAdsResult);
            } catch (error) {
                console.error('❌ Error fetching user ads:', error);
                alert('Unable to load your ads. Please check your authentication and try again.');
                setShowMineOnly(false);
                setUserAds([]);
            }
        } else if (checked && !isAuthenticated) {
            alert('Please log in to view your ads.');
            setShowMineOnly(false);
        } else {
            // If unchecked, clear user ads - filtering will automatically show all ads
            setUserAds([]);
        }
    };

    return (
        <div className="ad-table-container">
            <div className="table-controls">
                <select 
                    className="category-filter"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
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
                    {(searchQuery !== "" || selectedCategory !== "All Categories" || minPrice !== "" || maxPrice !== "" || showMineOnly) && (
                        <span className="backend-filter-indicator" title="Using frontend filtering">
                            {filteredAds.length} results
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
                {paginatedAds.length === 0 && showMineOnly ? (
                    <div className="no-ads-message">You haven't posted any ads yet.</div>
                ) : paginatedAds.length === 0 ? (
                    <div className="no-ads-message">No ads found matching your criteria.</div>
                ) : (
                    paginatedAds.map(ad => (
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
            
            {/* Frontend pagination for filtered results */}
            {totalFilteredPages > 1 && (
                <div className="table-pagination">
                    <button 
                        className="prev-btn" 
                        onClick={handlePreviousPage}
                        disabled={currentFilteredPage === 0}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {currentFilteredPage + 1} of {totalFilteredPages} 
                        ({filteredAds.length} total results)
                    </span>
                    <button 
                        className="next-btn"
                        onClick={handleNextPage}
                        disabled={currentFilteredPage >= totalFilteredPages - 1}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default AdTable;
