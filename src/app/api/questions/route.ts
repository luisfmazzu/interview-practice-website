import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Question, QuestionFilter, COLLECTIONS } from '@/models/Question';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const tag = searchParams.get('tag');
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
    const keywords = searchParams.get('keywords')?.split(',').filter(Boolean);
    const studyTopics = searchParams.get('studyTopics')?.split(',').filter(Boolean);
    const createdBy = searchParams.get('createdBy');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const questionCollection = db.collection<Question>(collection);

    // Build filter
    const filter: any = {};
    if (tag) filter.tag = tag;
    if (difficulty) filter.difficulty = difficulty;
    if (keywords && keywords.length > 0) {
      filter.keywords = { $in: keywords };
    }
    if (studyTopics && studyTopics.length > 0) {
      filter.studyTopics = { $in: studyTopics };
    }
    if (createdBy) filter.createdBy = createdBy;

    // Get questions with pagination
    const questions = await questionCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await questionCollection.countDocuments(filter);

    return NextResponse.json({
      questions,
      pagination: {
        total,
        skip,
        limit,
        hasMore: skip + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }

    const body = await request.json();
    const { tag, question, answer, keywords, studyTopics, difficulty, createdBy } = body;

    if (!tag || !question || !answer) {
      return NextResponse.json({ 
        error: 'Tag, question, and answer are required' 
      }, { status: 400 });
    }

    const db = await getDatabase();
    const questionCollection = db.collection<Question>(collection);

    const newQuestion: Omit<Question, '_id'> = {
      id: crypto.randomUUID(),
      tag,
      question,
      answer,
      keywords: keywords || [],
      studyTopics: studyTopics || [],
      difficulty,
      createdBy: createdBy || 'Anonymous', // Default to 'Anonymous' if not provided
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await questionCollection.insertOne(newQuestion);
    const insertedQuestion = await questionCollection.findOne({ _id: result.insertedId });

    return NextResponse.json(insertedQuestion, { status: 201 });

  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}