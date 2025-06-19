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
        const { name, email, message } = data;

        // Basic validation: Check if required fields are present
        if (!name || !email || !message) {
            return new Response(JSON.stringify({ message: 'Missing required fields (name, email, message)' }), {
                status: 400, // Bad Request
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // --- In a real application, you would process this data here ---

        
        try {
            // const url = 'https://app.vecticum.com/api/crm/v1/new-lead';
            const url = 'https://crm-jz6p53srgq-ew.a.run.app/api/crm/v1/new-lead';
            const response = await fetch(url, {
              method: 'POST', // Uncomment for POST request
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data) // Uncomment for POST request body
            });
  
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            console.log('Data fetched successfully:', responseData);
            // Update your UI here with the fetched data, perhaps displaying it next to the form
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        // For example:
        // - Save to a database
        // - Send an email
        // - Perform some business logic
        // For this example, we'll just log it to the console.
        console.log('Received form submission:');
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Message: ${message}`);
        // ---------------------------------------------------------------

        // Send a success response
        return new Response(JSON.stringify({ message: 'Form submitted successfully!' }), {
            status: 200, // OK
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        // Handle errors during parsing or processing
        console.error('Error processing form submission:', error);
        return new Response(JSON.stringify({ message: 'Failed to process form submission.' }), {
            status: 500, // Internal Server Error
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};