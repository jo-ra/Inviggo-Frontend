import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { VALID_CATEGORIES } from './constants/categories';
import { useAds } from './services/AdsContext';


interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  city: string;
  category: string;
  imageUrl: string;
  sellerName: string;
  sellerPhone: string;
}

const AdsHomepage = () => {
  // Use AdsContext instead of local state
  const {
    ads,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    fetchFilteredAds,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage
  } = useAds();

  // Filter states for comprehensive filtering
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories = VALID_CATEGORIES;

  // Use filters to fetch filtered ads from backend
  useEffect(() => {
    // Since we now load all ads upfront, we don't need to fetch on filter change
    // The filtering will happen on the frontend for better performance
    console.log('🔍 Filter changed, frontend filtering will apply automatically');
  }, [searchName, selectedCategory, minPrice, maxPrice]);

  // Frontend filtering with all ads loaded
  const filteredAds = useMemo(() => {
    console.log('🔍 Filtering ads...');
    console.log('🔍 Filter criteria:', { searchName, selectedCategory, minPrice, maxPrice });
    console.log('🔍 Total ads before filtering:', ads.length);

    let filtered = ads.filter(ad => {
      const nameMatch = ad.title.toLowerCase().includes(searchName.toLowerCase());
      const categoryMatch = selectedCategory === '' || ad.category === selectedCategory;
      const minPriceMatch = minPrice === '' || ad.price >= parseFloat(minPrice);
      const maxPriceMatch = maxPrice === '' || ad.price <= parseFloat(maxPrice);

      const matches = nameMatch && categoryMatch && minPriceMatch && maxPriceMatch;

      return matches;
    });

    console.log('🔍 Filtered ads count:', filtered.length);
    return filtered;
  }, [ads, searchName, selectedCategory, minPrice, maxPrice]);

  // Frontend pagination
  const adsPerPage = 20;
  const [currentPageLocal, setCurrentPageLocal] = useState(1);
  const totalPagesLocal = Math.ceil(filteredAds.length / adsPerPage);
  const indexOfLastAd = currentPageLocal * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = filteredAds.slice(indexOfFirstAd, indexOfLastAd);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPageLocal(pageNumber);
  };

  const handleEdit = (adId) => {
    alert(`Edit ad ${adId}`);
  };

  const handleDelete = (adId) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      alert(`Delete ad ${adId}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchName('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPageLocal(1); // Reset to first page when clearing filters
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace Ads</h1>
        <p className="text-gray-600">Browse and manage classified advertisements</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Name Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Title</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter ad title..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="$0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="$∞"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {indexOfFirstAd + 1}-{Math.min(indexOfLastAd, filteredAds.length)} of {filteredAds.length} ads
        </p>
      </div>

      {/* Ads Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">${ad.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ad.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ad.category}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(ad.postedDate)}</div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="text-gray-400">-</span>
                  </td>
                </tr>
              ))}
              {currentAds.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No ads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPagesLocal > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
          {loading && (
            <div className="bg-blue-100 p-2 rounded mb-4 text-sm">
              <strong>Loading...</strong> Fetching ads...
            </div>
          )}

          <div className="bg-yellow-100 p-2 rounded mb-4 text-sm">
            <strong>Debug Info:</strong> Total Pages: {totalPagesLocal}, Current Page: {currentPageLocal}, Filtered Ads: {filteredAds.length}, Total Ads: {ads.length}
          </div>

          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPageLocal - 1))}
              disabled={currentPageLocal === 1 || loading}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPagesLocal, currentPageLocal + 1))}
              disabled={currentPageLocal >= totalPagesLocal || loading}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{indexOfFirstAd + 1}</span>
                {' '}to{' '}
                <span className="font-medium">{Math.min(indexOfLastAd, filteredAds.length)}</span>
                {' '}of{' '}
                <span className="font-medium">{filteredAds.length}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPageLocal - 1))}
                  disabled={currentPageLocal === 1 || loading}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Show page numbers (max 5 visible) */}
                {(() => {
                  const maxVisible = 5;
                  const startPage = Math.max(1, Math.min(currentPageLocal - 2, totalPagesLocal - maxVisible + 1));
                  const endPage = Math.min(totalPagesLocal, startPage + maxVisible - 1);

                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                    const pageNum = startPage + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pageNum === currentPageLocal
                          ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        disabled={loading}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => handlePageChange(Math.min(totalPagesLocal, currentPageLocal + 1))}
                  disabled={currentPageLocal >= totalPagesLocal || loading}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdsHomepage;