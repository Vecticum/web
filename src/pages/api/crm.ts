export const prerender = false;

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

        // Extract the fields from the parsed data
        // const { name, email, message } = data;

        // Basic validation: Check if required fields are present
        if (!data.name || !data.email || !data.message) {
            return new Response(JSON.stringify({ message: 'Trūksta būtinų laukų' }), {
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
            form_source: data.form_source || 'Unknown'
        });

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