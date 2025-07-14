// JWT Debug Utility
// This utility helps debug JWT token issues

export const analyzeJWT = (token) => {
    try {
        if (!token) {
            return { error: 'No token provided' };
        }

        // JWT tokens have 3 parts separated by dots
        const parts = token.split('.');
        
        if (parts.length !== 3) {
            return { error: 'Invalid JWT format - should have 3 parts separated by dots' };
        }

        const [header, payload, signature] = parts;

        // Decode header
        let decodedHeader;
        try {
            decodedHeader = JSON.parse(atob(header));
        } catch (e) {
            return { error: 'Invalid JWT header - cannot decode' };
        }

        // Decode payload
        let decodedPayload;
        try {
            decodedPayload = JSON.parse(atob(payload));
        } catch (e) {
            return { error: 'Invalid JWT payload - cannot decode' };
        }

        // Check if token is signed (signature part should not be empty)
        const isSigned = signature && signature.length > 0;

        return {
            isValid: true,
            isSigned,
            header: decodedHeader,
            payload: decodedPayload,
            signature: signature || 'No signature',
            parts: {
                headerLength: header.length,
                payloadLength: payload.length,
                signatureLength: signature.length
            }
        };
    } catch (error) {
        return { error: error.message };
    }
};

export const debugCurrentToken = () => {
    const user = localStorage.getItem('user');
    if (!user) {
        console.log('🔍 JWT Debug: No user found in localStorage');
        return null;
    }

    try {
        const userData = JSON.parse(user);
        const token = userData.token;
        
        console.log('🔍 JWT Debug: Raw token:', token);
        console.log('🔍 JWT Debug: Token length:', token?.length);
        
        const analysis = analyzeJWT(token);
        console.log('🔍 JWT Debug: Analysis:', analysis);
        
        return analysis;
    } catch (error) {
        console.error('🔍 JWT Debug: Error analyzing token:', error);
        return { error: error.message };
    }
};

// Function to test if backend accepts the token
export const testTokenWithBackend = async (token) => {
    try {
        console.log('🧪 Testing token with backend...');
        
        const response = await fetch('http://localhost:8080/ad/getAll', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('🧪 Backend response status:', response.status);
        
        if (response.ok) {
            console.log('✅ Token accepted by backend');
            return { success: true };
        } else {
            const errorText = await response.text();
            console.log('❌ Backend rejected token:', errorText);
            return { success: false, error: errorText };
        }
    } catch (error) {
        console.error('🧪 Error testing token:', error);
        return { success: false, error: error.message };
    }
};
