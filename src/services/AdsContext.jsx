import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdsContext = createContext();

export const useAds = () => {
    const context = useContext(AdsContext);
    if (!context) {
        throw new Error('useAds must be used within an AdsProvider');
    }
    return context;
};

export const AdsProvider = ({ children }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchAds = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
            console.log(`🔄 Fetching ads from API... Page: ${page}`);
            
            const response = await fetch(`http://localhost:8080/ad/getAll?page=${page}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📥 Raw API response:', data);
            
            const adsArray = data.content ?? data ?? [];
            console.log('📋 Setting ads array:', adsArray);
            console.log('📊 Number of ads:', adsArray.length);
            
            setAds(adsArray);
            setCurrentPage(data.number || 0);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || adsArray.length);
        } catch (err) {
            console.error('❌ Error fetching ads:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch ads on component mount
    useEffect(() => {
        fetchAds();
    }, []);

    // Function to refresh ads after creating/updating/deleting
    const refreshAds = useCallback(async () => {
        console.log('🔄 refreshAds called - fetching latest data...');
        await fetchAds(currentPage);
        console.log('✅ refreshAds completed');
    }, [fetchAds, currentPage]);

    // Navigation functions
    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages - 1) {
            fetchAds(currentPage + 1);
        }
    }, [currentPage, totalPages, fetchAds]);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 0) {
            fetchAds(currentPage - 1);
        }
    }, [currentPage, fetchAds]);

    const goToFirstPage = useCallback(async () => {
        await fetchAds(0);
    }, [fetchAds]);

    const goToLastPage = useCallback(async () => {
        await fetchAds(totalPages - 1);
    }, [fetchAds, totalPages]);

    // Function to add a new ad optimistically (without refetching)
    const addAd = (newAd) => {
        setAds(prevAds => [newAd, ...prevAds]);
    };

    // Function to update an ad
    const updateAd = (updatedAd) => {
        setAds(prevAds => 
            prevAds.map(ad => ad.id === updatedAd.id ? updatedAd : ad)
        );
    };

    // Function to delete an ad
    const deleteAd = (adId) => {
        setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
    };

    // Function to delete an ad from backend
    const deleteAdFromBackend = async (adId, userToken) => {
        try {
            const response = await fetch(`http://localhost:8080/ad/delete/${adId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.ok) {
                console.log('✅ Ad deleted successfully!');
                // Remove the ad from the local state immediately
                deleteAd(adId);
                return true;
            } else {
                console.error('❌ Failed to delete ad:', response.status);
                return false;
            }
        } catch (err) {
            console.error('❌ Error deleting ad:', err);
            return false;
        }
    };

     // Function to fetch all ads for a specific user
    const fetchUserAds = async (username, userToken) => {
        try {
            console.log(`🔄 Fetching all ads for user: ${username}`);
            
            const response = await fetch(`http://localhost:8080/ad/user/${username}`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📥 User ads raw response:', data);
            
            // Extract the ads array from the response (handle both paginated and direct array responses)
            const userAds = data.content ?? data ?? [];
            console.log('📋 User ads array:', userAds);
            console.log('📊 Number of user ads:', userAds.length);
            
            return userAds;
        } catch (err) {
            console.error('❌ Error fetching user ads:', err);
            return [];
        }
    };

    // Function to fetch ads by price range from backend
    const fetchAdsByPriceRange = useCallback(async (minPrice, maxPrice, page = 0) => {
        try {
            setLoading(true);
            setError(null);
            console.log(`🔄 Fetching ads by price range... Min: ${minPrice}, Max: ${maxPrice}, Page: ${page}`);
            
            // Build URL with only the parameters that are provided (now that backend supports optional params)
            let url = `http://localhost:8080/ad/filterByPrice?page=${page}&size=20`;
            
            if (minPrice !== null && minPrice !== undefined) {
                url += `&minPrice=${minPrice}`;
            }
            if (maxPrice !== null && maxPrice !== undefined) {
                url += `&maxPrice=${maxPrice}`;
            }
            
            console.log(`📡 API URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📥 Price range filtered ads response:', data);
            
            const adsArray = data.content ?? data ?? [];
            console.log('📋 Setting price filtered ads array:', adsArray);
            
            setAds(adsArray);
            setCurrentPage(data.number || 0);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || adsArray.length);
            
            return adsArray;
        } catch (err) {
            console.error('❌ Error fetching ads by price range:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        ads,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        refreshAds,
        addAd,
        updateAd,
        deleteAd,
        deleteAdFromBackend,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        fetchUserAds,
        fetchAdsByPriceRange,
        fetchAds
    };

    return (
        <AdsContext.Provider value={value}>
            {children}
        </AdsContext.Provider>
    );
};
