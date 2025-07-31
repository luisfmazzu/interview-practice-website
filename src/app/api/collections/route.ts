import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    
    // Filter and validate collections
    const validCollections = [];
    
    for (const collection of collections) {
      const name = collection.name;
      
      // Skip system collections and special ones
      if (
        name.startsWith('system.') ||
        name === 'admin' ||
        name === 'config' ||
        name === 'local' ||
        name === 'behaviour' ||
        name === 'systems_design'
      ) {
        continue;
      }
      
      // Check if collection has any documents
      try {
        const count = await db.collection(name).countDocuments({}, { limit: 1 });
        if (count > 0) {
          validCollections.push({
            id: name,
            label: formatCollectionName(name)
          });
        }
      } catch (error) {
        console.warn(`Error checking collection ${name}:`, error);
        // Skip collections that can't be accessed
        continue;
      }
    }
    
    // Sort collections alphabetically
    validCollections.sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json({ 
      success: true, 
      collections: validCollections 
    });

  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to format collection names into display labels
function formatCollectionName(name: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'nextjs': 'Next.js',
    'nodejs': 'Node.js',
    'expressjs': 'Express.js',
    'nestjs': 'Nest.js',
    'fastapi': 'FastAPI',
    'cicd': 'CI/CD',
    'aws': 'AWS',
    'postgresql': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'graphql': 'GraphQL',
    'apis': 'APIs',
    'csharp': 'C#',
    'golang': 'Golang', // Keep as Golang to distinguish from Gin framework
    'gin': 'Gin'        // Gin framework for Go
  };

  if (specialCases[name]) {
    return specialCases[name];
  }

  // Default formatting: capitalize first letter and replace underscores/hyphens with spaces
  return name
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}