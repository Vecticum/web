export const prerender = false;

// In-memory duplicate tracking (simple solution for development)
const recentSubmissions = new Map();
const DUPLICATE_WINDOW_MS = 30000; // 30 seconds window to detect duplicates

// Rate limiting per IP
const ipSubmissions = new Map();
const RATE_LIMIT_WINDOW_MS = 300000; // 5 minutes
const MAX_SUBMISSIONS_PER_IP = 5; // Max 5 submissions per IP per 5 minutes

// src/pages/api/crm.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    // Check if the request method is POST
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Allow': 'POST' // Inform the client which methods are allowed
            },
        });
    }

    try {
        // Parse the request body as JSON
        const data = await request.json();

        // Get reCAPTCHA token from header
        const recaptchaToken = request.headers.get('x-recaptcha-token');
        
        // Check if running in development mode (localhost)
        const requestUrl = new URL(request.url);
        const isDevelopment = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1' || requestUrl.port === '4321' || requestUrl.port === '4322' || requestUrl.port === '4323';
        
        console.log(`Request from: ${requestUrl.hostname}:${requestUrl.port}, isDevelopment: ${isDevelopment}`);
        
        // Skip reCAPTCHA validation entirely in development
        if (isDevelopment) {
            console.log('Development mode: skipping reCAPTCHA validation entirely');
        } else {
            // Validate reCAPTCHA token in production - STRICT MODE
            if (!recaptchaToken) {
                console.log('Missing reCAPTCHA token in production - blocking request');
                return new Response(JSON.stringify({ message: 'Saugumo patikrinimas nepavyko' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }

            // Verify reCAPTCHA with Google
            const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=6LcP6_ArAAAAAPA4CJEflmfPHfXt0FleWbZILiU6&response=${recaptchaToken}`
            });

            const recaptchaResult = await recaptchaResponse.json();
            
            // Balanced validation for production - moderate score threshold
            if (!recaptchaResult.success || recaptchaResult.score < 0.3) {
                console.log('reCAPTCHA validation failed in production:', {
                    success: recaptchaResult.success,
                    score: recaptchaResult.score,
                    'error-codes': recaptchaResult['error-codes'],
                    action: recaptchaResult.action,
                    challenge_ts: recaptchaResult.challenge_ts,
                    hostname: recaptchaResult.hostname,
                    userAgent: request.headers.get('user-agent'),
                    ip: request.headers.get('x-forwarded-for') || 'unknown'
                });
                return new Response(JSON.stringify({ 
                    message: 'Saugumo patikrinimas nepavyko'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }

            console.log('reCAPTCHA validation passed in production:', {
                success: recaptchaResult.success,
                score: recaptchaResult.score,
                action: recaptchaResult.action,
                hostname: recaptchaResult.hostname
            });
        }

        // Extract the fields from the parsed data
        // const { name, email, message } = data;

        // Basic validation: Check if required fields are present
        if (!data.name || !data.email) {
            return new Response(JSON.stringify({ message: 'Trūksta būtinų laukų (vardas ir el. paštas)' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Validate form_source - reject submissions without valid form source (likely bots)
        if (!data.form_source || typeof data.form_source !== 'string' || data.form_source.trim() === '') {
            console.log('Rejected submission without form_source:', {
                name: data.name,
                email: data.email,
                timestamp: new Date().toISOString(),
                userAgent: request.headers.get('user-agent'),
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            });
            
            // Return a generic error that doesn't reveal it's bot detection
            return new Response(JSON.stringify({ message: 'Įvyko sistemos klaida. Bandykite dar kartą.' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Honeypot check - if website field is filled, it's a bot
        if (data.website && data.website.trim() !== '') {
            console.log('Honeypot triggered - bot detected:', {
                name: data.name,
                email: data.email,
                website: data.website,
                timestamp: new Date().toISOString()
            });
            
            // Return success to not alert the bot
            return new Response(JSON.stringify({ message: 'Užklausa sėkmingai pateikta!' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Rate limiting check (not in development)
        if (!isDevelopment) {
            const clientIP = request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 
                           'unknown';
            
            const currentTime = Date.now();
            
            // Clean old IP submission records
            for (const [ip, submissions] of ipSubmissions.entries()) {
                const filteredSubmissions = submissions.filter((time: number) => currentTime - time < RATE_LIMIT_WINDOW_MS);
                if (filteredSubmissions.length === 0) {
                    ipSubmissions.delete(ip);
                } else {
                    ipSubmissions.set(ip, filteredSubmissions);
                }
            }
            
            // Check current IP submission count
            const currentIPSubmissions = ipSubmissions.get(clientIP) || [];
            if (currentIPSubmissions.length >= MAX_SUBMISSIONS_PER_IP) {
                console.log(`Rate limit exceeded for IP: ${clientIP}, submissions: ${currentIPSubmissions.length}`);
                return new Response(JSON.stringify({ message: 'Per daug užklausų. Bandykite vėliau.' }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }
            
            // Record this submission
            currentIPSubmissions.push(currentTime);
            ipSubmissions.set(clientIP, currentIPSubmissions);
        }

        // Advanced spam detection (focused on obvious bot patterns)
        const spamPatterns = [
            /^[A-Z]{2}[a-z]{2}[A-Z]{2}[a-z]{2}[A-Z]{2}[a-z]{2}[A-Z]{2}[a-z]{2}/, // Pattern like OVviAMbQwKvU
            /^[A-Z]+[a-z]+[A-Z]+[a-z]+[A-Z]+/, // Alternating caps pattern
            /^[0-9]+[A-Za-z]+[0-9]+/, // Mixed numbers and letters
            /^[a-zA-Z]{15,}$/, // Very long single words (like tZtzKrZkyEztsbLZfPs)
            /^[tT][A-Za-z]*[zZ][A-Za-z]*[kK][A-Za-z]*/, // Pattern starting with t, containing z and k (like tZtzKrZky...)
        ];

        const suspiciousNames = [
            'test', 'testing', 'bot', 'spam', 'fake', 'demo',
            'qwerty', 'asdfgh', 'zxcvbn', 'admin', 'user'
        ];

        // Check name for spam patterns (only obvious spam patterns)
        // Use word boundaries to match whole words only, not parts of words
        const nameWords = data.name.toLowerCase().split(/\s+/);
        const nameSpamCheck = spamPatterns.some(pattern => pattern.test(data.name)) ||
                             suspiciousNames.some(word => nameWords.includes(word));

        // Check email for basic validity and suspicious patterns        
        const emailSpamCheck = !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email) ||
                              data.email.includes('test@') ||
                              data.email.includes('fake@') ||
                              data.email.includes('spam@') ||
                              data.email.includes('@test.') ||
                              data.email.length > 100;

        // Check message for spam (if provided) - only obvious spam patterns
        let messageSpamCheck = false;
        if (data.message) {
            messageSpamCheck = spamPatterns.some(pattern => pattern.test(data.message));
        }

        if (nameSpamCheck || emailSpamCheck || messageSpamCheck) {
            console.log('Spam detected:', {
                name: data.name,
                email: data.email,
                nameSpam: nameSpamCheck,
                emailSpam: emailSpamCheck,
                messageSpam: messageSpamCheck,
                timestamp: new Date().toISOString()
            });
            
            return new Response(JSON.stringify({ message: 'Netinkama duomenų forma' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Log received data for debugging
        const timestamp = new Date().toLocaleString('lt-LT', { timeZone: 'Europe/Vilnius' });
        console.log(`[${timestamp}] Received form data:`, {
            name: data.name,
            email: data.email,
            company: data.company || 'N/A',
            form_source: data.form_source || 'Unknown',
            submission_id: data.submission_id || 'No ID'
        });

        // Duplicate detection based on email and timestamp
        const submissionKey = `${data.email}_${data.name}`;
        const currentTime = Date.now();
        
        // Clean old submissions from memory
        for (const [key, time] of recentSubmissions.entries()) {
            if (currentTime - time > DUPLICATE_WINDOW_MS) {
                recentSubmissions.delete(key);
            }
        }
        
        // Check for recent duplicate submission
        if (recentSubmissions.has(submissionKey)) {
            const lastSubmissionTime = recentSubmissions.get(submissionKey);
            const timeDiff = currentTime - lastSubmissionTime;
            console.log(`[${timestamp}] Duplicate submission detected for ${data.email} (${timeDiff}ms ago), ignoring...`);
            
            // Return success to avoid user confusion, but don't send to CRM
            return new Response(JSON.stringify({ message: 'Užklausa sėkmingai pateikta!' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        
        // Record this submission
        recentSubmissions.set(submissionKey, currentTime);

        // Ensure message field has content for CRM API (even if optional on frontend)
        if (!data.message || data.message.trim() === '') {
            data.message = 'Užklausa pateikta be papildomo pranešimo.';
        }

        // Send data to external CRM API
        const url = 'https://crm-jz6p53srgq-ew.a.run.app/api/crm/v1/new-lead';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`CRM API error! status: ${response.status}`);
        }
        
        // Handle empty response or non-JSON response from CRM
        const contentType = response.headers.get('content-type');
        let responseData;
        
        try {
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                // If response is empty or not JSON, treat as success
                const text = await response.text();
                responseData = text ? { message: text } : { success: true };
            }
        } catch (parseError) {
            // If JSON parsing fails, treat as success since CRM returned 200
            console.log('CRM returned non-JSON response, treating as success');
            responseData = { success: true };
        }
        
        console.log(`[${timestamp}] Data sent to CRM successfully for ${data.email}:`, responseData);
        
        // Send a success response back to the frontend
        return new Response(JSON.stringify({ message: 'Užklausa sėkmingai pateikta!' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        // Handle errors during parsing or processing
        console.error('Error processing form submission:', error);
        return new Response(JSON.stringify({ 
            message: 'Klaida apdorojant užklausą.',
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};