import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/models/Question';

export async function GET() {
  try {
    // Return all available topics
    const topics = Object.entries(COLLECTIONS).map(([key, value]) => ({
      key: key.toLowerCase(),
      value,
      displayName: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
    }));

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName } = body;

    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Topic name and display name are required' },
        { status: 400 }
      );
    }

    // Validate topic name format
    const topicKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (topicKey.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Topic name must contain at least 2 letters' },
        { status: 400 }
      );
    }

    // Check if topic already exists
    if (Object.values(COLLECTIONS).includes(topicKey)) {
      return NextResponse.json(
        { success: false, error: 'Topic already exists' },
        { status: 409 }
      );
    }

    const db = await getDatabase();
    
    // Create the collection (MongoDB creates it automatically when first document is inserted)
    const collection = db.collection(topicKey);
    
    // Create indexes for the new collection (same as other collections)
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ tag: 1 });
    await collection.createIndex({ difficulty: 1 });
    await collection.createIndex({ keywords: 1 });
    await collection.createIndex({ studyTopics: 1 });
    await collection.createIndex({ createdBy: 1 });
    await collection.createIndex({ createdAt: -1 });

    console.log(`Created new collection: ${topicKey} with display name: ${displayName}`);

    return NextResponse.json({
      success: true,
      collection: topicKey,
      displayName,
      message: 'Topic created successfully'
    });

  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}