import React, { useState } from 'react';
import { debugCurrentToken, testTokenWithBackend } from '../utils/jwtDebug';

const JWTDebugger = () => {
    const [debugInfo, setDebugInfo] = useState(null);
    const [testResult, setTestResult] = useState(null);

    const analyzeToken = () => {
        const info = debugCurrentToken();
        setDebugInfo(info);
    };

    const testToken = async () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            const result = await testTokenWithBackend(userData.token);
            setTestResult(result);
        }
    };

    return (
        <div style={{ 
            padding: '20px', 
            border: '2px solid #ccc', 
            margin: '10px', 
            backgroundColor: '#f9f9f9',
            fontFamily: 'monospace'
        }}>
            <h3>JWT Token Debugger</h3>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={analyzeToken} style={{ marginRight: '10px' }}>
                    Analyze Current Token
                </button>
                <button onClick={testToken}>
                    Test Token with Backend
                </button>
            </div>

            {debugInfo && (
                <div style={{ 
                    backgroundColor: '#fff', 
                    padding: '10px', 
                    border: '1px solid #ddd',
                    marginBottom: '10px'
                }}>
                    <h4>Token Analysis:</h4>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
            )}

            {testResult && (
                <div style={{ 
                    backgroundColor: testResult.success ? '#d4edda' : '#f8d7da', 
                    padding: '10px', 
                    border: '1px solid #ddd'
                }}>
                    <h4>Backend Test Result:</h4>
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default JWTDebugger;
