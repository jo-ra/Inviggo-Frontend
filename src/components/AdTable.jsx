import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../services/AdsContext';
import { useAuth } from '../services/AuthContext';
import '../css/AdTable.css';

function AdTable({ads}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const navigate = useNavigate();
    const { currentPage, totalPages, goToNextPage, goToPreviousPage } = useAds();
    const { user, isAuthenticated } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled by the filtering below
    };

    const handleAdClick = (adId) => {
        navigate(`/ad/${adId}`);
    };

    // Dynamically get unique categories from the ads data
    const categories = [...new Set(ads.map(ad => ad.category))].sort();

    const filteredAds = ads.filter(ad => {
        const matchesSearch = searchQuery === "" || 
            ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All Categories" || 
            ad.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    console.log('🎯 AdTable - Total ads:', ads.length);
    console.log('🎯 AdTable - Filtered ads:', filteredAds.length);
    console.log('🎯 AdTable - Current page:', currentPage);
    console.log('🎯 AdTable - Total pages:', totalPages);

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
                    <input type="checkbox" id="show-mine" />
                    <label htmlFor="show-mine">Show mine only</label>
                </div>
            </div>

            <div className="ads-grid">
                {filteredAds.map(ad => (
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
                            {isAuthenticated && user && ad.user && ad.user.username === user.username && (
                                <div className="ad-actions" onClick={(e) => e.stopPropagation()}>
                                    <button className="edit-btn">Edit</button>
                                    <button className="delete-btn">Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
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
