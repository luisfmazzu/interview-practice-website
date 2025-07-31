import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/models/Question';

export async function GET() {
  try {
    const db = await getDatabase();
    const collections = [];

    // Get stats for each collection
    for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      
      if (count > 0) {
        collections.push({
          name: collectionName,
          key: key.toLowerCase(),
          count,
          category: collectionName === 'systems_design' || collectionName === 'behaviour' 
            ? collectionName 
            : 'general'
        });
      }
    }

    return NextResponse.json({
      collections,
      total: collections.reduce((sum, col) => sum + col.count, 0)
    });

  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}