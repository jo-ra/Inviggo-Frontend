// Valid categories that match backend validation
// This list should be kept in sync with the backend Category enum
export const VALID_CATEGORIES = [
    "Clothing",
    "Tools", 
    "Sports",
    "Accessories",
    "Furniture",
    "Pets",
    "Games",
    "Books",
    "Technology"
];

// Utility function to validate a category
export const isValidCategory = (category) => {
    return VALID_CATEGORIES.includes(category);
};

// Get categories for dropdown (with "All Categories" option)
export const getCategoriesForDropdown = () => {
    return ["All Categories", ...VALID_CATEGORIES];
};

// Map invalid categories to valid ones or return a fallback
export const sanitizeCategory = (category) => {
    if (!category) return "Technology"; // Default fallback
    
    // If it's already valid, return as-is
    if (isValidCategory(category)) return category;
    
    // Map common invalid categories to valid backend categories
    const categoryMappings = {
        "Electronics": "Technology",
        "Home": "Furniture",
        "Toys": "Games",
        "Beauty": "Accessories",
        "Automotive": "Tools",
        "Music": "Technology",
        "Garden": "Tools",
        "Food": "Accessories",
        "Travel": "Accessories",
        "Services": "Tools",
        "Real Estate": "Furniture",
        "Vehicles": "Tools",
        "Jobs": "Tools"
    };
    
    return categoryMappings[category] || "Technology"; // Default to Technology if no mapping found
};
