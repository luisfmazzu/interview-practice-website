import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Question, COLLECTIONS } from '@/models/Question';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const collections = searchParams.get('collections')?.split(',') || Object.values(COLLECTIONS);
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const studyTopics = searchParams.get('studyTopics')?.split(',').filter(Boolean);
    const createdBy = searchParams.get('createdBy');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Search query must be at least 2 characters long' 
      }, { status: 400 });
    }

    const db = await getDatabase();
    const results: Array<Question & { collection: string }> = [];

    // Build base filter
    const baseFilter: any = {
      $or: [
        { question: { $regex: query, $options: 'i' } },
        { answer: { $regex: query, $options: 'i' } },
        { keywords: { $in: [new RegExp(query, 'i')] } },
        { studyTopics: { $in: [new RegExp(query, 'i')] } },
        { tag: { $regex: query, $options: 'i' } }
      ]
    };

    if (difficulty) {
      baseFilter.difficulty = difficulty;
    }
    
    if (studyTopics && studyTopics.length > 0) {
      baseFilter.studyTopics = { $in: studyTopics };
    }
    
    if (createdBy) {
      baseFilter.createdBy = createdBy;
    }

    // Search across specified collections
    for (const collectionName of collections) {
      if (!Object.values(COLLECTIONS).includes(collectionName as any)) {
        continue;
      }

      const collection = db.collection<Question>(collectionName);
      const questions = await collection
        .find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / collections.length))
        .toArray();

      // Add collection name to each result
      const questionsWithCollection = questions.map(q => ({
        ...q,
        collection: collectionName
      }));

      results.push(...questionsWithCollection);
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExactMatch = a.question.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bExactMatch = b.question.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      
      if (aExactMatch !== bExactMatch) {
        return bExactMatch - aExactMatch;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Apply pagination
    const paginatedResults = sortedResults.slice(skip, skip + limit);

    return NextResponse.json({
      questions: paginatedResults,
      pagination: {
        total: sortedResults.length,
        skip,
        limit,
        hasMore: skip + limit < sortedResults.length
      },
      query
    });

  } catch (error) {
    console.error('Error searching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}