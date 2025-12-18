import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const logFilePath = path.join(process.cwd(), 'server', 'logs', 'conversations.jsonl');
    
    // Check if file exists
    try {
      await fs.access(logFilePath);
    } catch {
      // File doesn't exist, return empty array
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Read file
    const fileContent = await fs.readFile(logFilePath, 'utf-8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim());
    
    // Parse JSON lines
    const conversations = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error('Failed to parse line:', line, e);
        return null;
      }
    }).filter(Boolean);

    return new Response(JSON.stringify(conversations), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error reading conversations:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch conversations' }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
