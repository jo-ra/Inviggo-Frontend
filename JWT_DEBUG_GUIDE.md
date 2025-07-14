# JWT Authentication Debugging Guide

## Problem
Getting "io.jsonwebtoken.UnsupportedJwtException: Unsigned Claims JWTs are not supported" error when making authenticated requests to the backend.

## Debugging Steps

### Step 1: Check if you're logged in and have a token
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Run this command:
```javascript
// Check if user is logged in and has a token
const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log('User data:', user);
console.log('Token:', user?.token);
```

### Step 2: Analyze the JWT token structure
1. Still in the console, run:
```javascript
// Analyze JWT token structure
function analyzeJWT(token) {
    if (!token) return 'No token';
    const parts = token.split('.');
    console.log('JWT Parts:', parts.length);
    console.log('Header:', parts[0]);
    console.log('Payload:', parts[1]); 
    console.log('Signature:', parts[2]);
    
    // Decode header and payload
    try {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        console.log('Decoded Header:', header);
        console.log('Decoded Payload:', payload);
        console.log('Is Signed:', parts[2] && parts[2].length > 0);
    } catch(e) {
        console.error('Error decoding:', e);
    }
}

analyzeJWT(user?.token);
```

### Step 3: Test the token with backend
1. In the console, run:
```javascript
// Test token with backend
async function testToken() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user?.token) {
        console.log('No token found');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/ad/getAll', {
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response:', responseText);
    } catch (error) {
        console.error('Error:', error);
    }
}

testToken();
```

## Common Issues and Solutions

### Issue 1: Token is not signed (empty signature part)
**Symptoms:** The third part of the JWT (after the second dot) is empty or very short
**Solution:** Backend JWT configuration issue - the secret key is not being used to sign tokens

### Issue 2: Token format is incorrect
**Symptoms:** Token doesn't have 3 parts separated by dots
**Solution:** Backend is not generating proper JWT tokens

### Issue 3: Backend doesn't accept signed tokens
**Symptoms:** Token appears correctly signed but backend rejects it
**Solution:** Backend JWT configuration mismatch - check secret key and algorithm

## Backend Configuration Check

Your backend should have JWT configuration similar to this:

```java
// In your JwtUtil or similar class
public String generateToken(String username) {
    return Jwts.builder()
        .setSubject(username)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
        .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // Make sure this line exists!
        .compact();
}
```

## Testing with the JWT Debugger Component

1. Start your React app: `npm run dev`
2. Open the app in your browser
3. You should see a "JWT Token Debugger" section at the top
4. Log in to your app
5. Click "Analyze Current Token" to see token details
6. Click "Test Token with Backend" to test if backend accepts it

## Next Steps

Based on the results:
1. If token is unsigned → Fix backend JWT signing
2. If token is malformed → Fix backend JWT generation  
3. If backend rejects signed token → Check backend JWT validation configuration
