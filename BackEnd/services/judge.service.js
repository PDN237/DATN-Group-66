const axios = require('axios');

// Judge0 API Configuration - Using free RapidAPI endpoint
const JUDGE_API_URL = process.env.JUDGE_API_URL || 'https://ce.judge0.com';
const JUDGE_API_KEY = process.env.JUDGE_API_KEY || '/submissions?base64_encoded=false&wait=true';

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
    'csharp': 51,  // C# (Mono)
    'c': 4,
    'cpp': 4,
    'java': 3,
    'javascript': 4,
    'python': 71,
    'python3': 71
};

/**
 * Submit code to Judge0 API
 * @param {string} sourceCode - User's source code
 * @param {string} language - Programming language (default: python3)
 * @param {string} stdin - Input for the code
 * @returns {Promise<Object>} - Submission token and details
 */
async function submitToJudge0(sourceCode, language = 'python3', stdin) {
    try {
        const languageId = LANGUAGE_IDS[language.toLowerCase()] || 71;

        const options = {
            method: 'POST',
            url: `${JUDGE_API_URL}/submissions`,
            params: {
                base64_encoded: 'false',
                wait: 'true'
            },
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': JUDGE_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: {
                source_code: sourceCode,
                language_id: languageId,
                stdin: stdin || '',
                expected_output: null
            }
        };

        const response = await axios(options);
        
        return {
            success: true,
            token: response.data.token || response.data.id,
            status: response.data.status,
            data: response.data
        };
    } catch (error) {
        console.error('Error submitting to Judge0:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            needsApiKey: error.response?.status === 403
        };
    }
}

/**
 * Get submission result from Judge0 API
 * @param {string} token - Submission token
 * @returns {Promise<Object>} - Submission result
 */
async function getSubmissionResult(token) {
    try {
        const options = {
            method: 'GET',
            url: `${JUDGE_API_URL}/submissions/${token}`,
            params: {
                base64_encoded: 'false'
            },
            headers: {
                'X-RapidAPI-Key': JUDGE_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        };

        const response = await axios(options);
        
        return {
            success: true,
            data: {
                status: response.data.status,
                stdout: response.data.stdout || '',
                stderr: response.data.stderr || '',
                compile_output: response.data.compile_output || '',
                time: response.data.time,
                memory: response.data.memory,
                message: response.data.message
            }
        };
    } catch (error) {
        console.error('Error getting Judge0 result:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Submit and wait for result (synchronous)
 * @param {string} sourceCode - User's source code
 * @param {string} language - Programming language
 * @param {string} stdin - Input for the code
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Object>} - Final result
 */
async function submitAndWait(sourceCode, language = 'csharp', stdin, maxRetries = 10) {
    // Submit code first
    const submitResult = await submitToJudge0(sourceCode, language, stdin);
    
    if (!submitResult.success) {
        return {
            success: false,
            error: submitResult.error,
            status: 'System Error'
        };
    }

    // Poll for result
    let retries = 0;
    while (retries < maxRetries) {
        const result = await getSubmissionResult(submitResult.token);
        
        if (!result.success) {
            return {
                success: false,
                error: result.error,
                status: 'System Error'
            };
        }

        const statusId = result.data.status.id;
        
        // Status 1-2: In Queue, In Progress - need to wait
        if (statusId === 1 || statusId === 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
            continue;
        }

        // Status 3: Accepted
        // Status 4-6: Wrong Answer, Time Limit Exceeded, Runtime Error
        // Status 7: Runtime Error (Python)
        // Status 11-12: Memory Limit Exceeded, System Error
        
        return {
            success: true,
            status: result.data.status,
            stdout: result.data.stdout,
            stderr: result.data.stderr,
            compile_output: result.data.compile_output,
            time: parseFloat(result.data.time) || 0,
            memory: result.data.memory || 0
        };
    }

    return {
        success: false,
        error: 'Timeout waiting for result',
        status: 'Timeout'
    };
}

module.exports = {
    submitToJudge0,
    getSubmissionResult,
    submitAndWait,
    LANGUAGE_IDS
};
