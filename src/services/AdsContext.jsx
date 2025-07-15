import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sanitizeCategory } from '../constants/categories';

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

    // Function to sanitize ads data - fix invalid categories
    const sanitizeAds = (adsArray) => {
        return adsArray.map(ad => ({
            ...ad,
            category: sanitizeCategory(ad.category)
        }));
    };

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
            console.log('📋 Raw ads array:', adsArray);
            console.log('📊 Number of ads:', adsArray.length);
            
            // Sanitize ads data to fix invalid categories
            const sanitizedAds = sanitizeAds(adsArray);
            console.log('🧹 Sanitized ads array:', sanitizedAds);
            
            setAds(sanitizedAds);
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

    // Function to fetch all ads (for comprehensive filtering)
    const fetchAllAds = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 Fetching ALL ads from API...');
            
            let allAds = [];
            let currentPageNum = 0;
            let hasMorePages = true;
            
            while (hasMorePages) {
                console.log(`🔄 Fetching page ${currentPageNum}...`);
                const response = await fetch(`http://localhost:8080/ad/getAll?page=${currentPageNum}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log(`📥 Page ${currentPageNum} response:`, data);
                
                const pageAds = data.content ?? [];
                allAds = [...allAds, ...pageAds];
                
                // Check if there are more pages
                hasMorePages = !data.last && pageAds.length > 0;
                currentPageNum++;
                
                console.log(`📋 Page ${currentPageNum - 1} ads: ${pageAds.length}, Total so far: ${allAds.length}`);
            }
            
            console.log('📊 Total ads fetched from all pages:', allAds.length);
            
            // Sanitize all ads data to fix invalid categories
            const sanitizedAds = sanitizeAds(allAds);
            console.log('🧹 Sanitized all ads array:', sanitizedAds);
            
            setAds(sanitizedAds);
            setCurrentPage(0);
            setTotalPages(Math.ceil(sanitizedAds.length / 20)); // Frontend pagination
            setTotalElements(sanitizedAds.length);
        } catch (err) {
            console.error('❌ Error fetching all ads:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch ads on component mount
    useEffect(() => {
        fetchAllAds(); // Fetch all ads instead of just first page
    }, [fetchAllAds]);

    // Function to refresh ads after creating/updating/deleting
    const refreshAds = useCallback(async () => {
        console.log('🔄 refreshAds called - fetching ALL latest data...');
        await fetchAllAds(); // Use fetchAllAds instead of fetchAds
        console.log('✅ refreshAds completed - all ads reloaded');
    }, [fetchAllAds]);

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
            console.log('📋 Raw user ads array:', userAds);
            console.log('📊 Number of user ads:', userAds.length);
            
            // Sanitize user ads data to fix invalid categories
            const sanitizedUserAds = sanitizeAds(userAds);
            console.log('🧹 Sanitized user ads array:', sanitizedUserAds);
            
            return sanitizedUserAds;
        } catch (err) {
            console.error('❌ Error fetching user ads:', err);
            return [];
        }
    };

    // Function to fetch filtered ads using the comprehensive backend endpoint
    const fetchFilteredAds = useCallback(async (filters = {}, page = 0, userToken = null) => {
        try {
            setLoading(true);
            setError(null);
            
            const { category, title, minPrice, maxPrice, showMineOnly } = filters;
            
            console.log(`🔄 Fetching filtered ads...`, filters, `Page: ${page}`);
            console.log(`🔑 User token provided:`, userToken ? 'Yes (length: ' + userToken.length + ')' : 'No');
            console.log(`🔑 Token preview:`, userToken ? userToken.substring(0, 20) + '...' : 'N/A');
            
            // If showMineOnly is requested but no token provided, handle gracefully
            if (showMineOnly && !userToken) {
                console.warn('⚠️ showMineOnly requested but no user token provided');
                setAds([]);
                setCurrentPage(0);
                setTotalPages(0);
                setTotalElements(0);
                return [];
            }
            
            // Build URL with all the filter parameters
            let url = `http://localhost:8080/ad/filter?page=${page}&size=20`;
            
            if (category && category !== "All Categories") {
                url += `&category=${encodeURIComponent(category)}`;
            }
            if (title && title.trim() !== "") {
                url += `&title=${encodeURIComponent(title.trim())}`;
            }
            if (minPrice !== null && minPrice !== undefined && minPrice !== "") {
                url += `&minPrice=${minPrice}`;
            }
            if (maxPrice !== null && maxPrice !== undefined && maxPrice !== "") {
                url += `&maxPrice=${maxPrice}`;
            }
            if (showMineOnly && userToken) {
                url += `&showMineOnly=true`;
            }
            
            console.log(`📡 Comprehensive filter API URL: ${url}`);
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add authorization header if user token is provided
            if (userToken) {
                headers['Authorization'] = `Bearer ${userToken}`;
                console.log(`🔐 Added Authorization header with token`);
            }
            
            console.log(`📤 Making request with headers:`, headers);
            
            const response = await fetch(url, { headers });
            
            console.log(`📥 Response status: ${response.status}`);
            
            if (!response.ok) {
                if (response.status === 403) {
                    console.error('❌ 403 Forbidden - Authentication failed');
                    if (showMineOnly) {
                        // If this was a "show mine only" request, fall back to showing empty results
                        setAds([]);
                        setCurrentPage(0);
                        setTotalPages(0);
                        setTotalElements(0);
                        return [];
                    }
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📥 Comprehensive filtered ads response:', data);
            
            const adsArray = data.content ?? data ?? [];
            console.log('📋 Raw comprehensive filtered ads array:', adsArray);
            
            // Sanitize ads data to fix invalid categories
            const sanitizedAds = sanitizeAds(adsArray);
            console.log('🧹 Sanitized comprehensive filtered ads array:', sanitizedAds);
            
            setAds(sanitizedAds);
            setCurrentPage(data.number || 0);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || adsArray.length);
            
            return adsArray;
        } catch (err) {
            console.error('❌ Error fetching filtered ads:', err);
            
            // If this was a "show mine only" request that failed, show user-friendly message
            if (filters.showMineOnly) {
                console.log('🏠 "Show mine only" request failed, setting empty results');
                setAds([]);
                setCurrentPage(0);
                setTotalPages(0);
                setTotalElements(0);
                setError('Unable to load your ads. Please check your authentication.');
                return [];
            }
            
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Function to fetch ads by price range from backend (keeping for backward compatibility)
    const fetchAdsByPriceRange = useCallback(async (minPrice, maxPrice, page = 0) => {
        return await fetchFilteredAds({
            minPrice,
            maxPrice
        }, page);
    }, [fetchFilteredAds]);

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
        fetchFilteredAds,
        fetchAds,
        fetchAllAds
    };

    return (
        <AdsContext.Provider value={value}>
            {children}
        </AdsContext.Provider>
    );
};
