import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Question } from '@/models/Question';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const questionCollection = db.collection<Question>(collection);
    
    const question = await questionCollection.findOne({ id: params.id });
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(question);
    
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }

    const body = await request.json();
    const { tag, question, answer, keywords, studyTopics, difficulty, createdBy } = body;

    const db = await getDatabase();
    const questionCollection = db.collection<Question>(collection);
    
    const updateData: Partial<Question> = {
      updatedAt: new Date()
    };
    
    if (tag) updateData.tag = tag;
    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (studyTopics !== undefined) updateData.studyTopics = studyTopics;
    if (difficulty) updateData.difficulty = difficulty;
    if (createdBy !== undefined) updateData.createdBy = createdBy;
    
    const result = await questionCollection.findOneAndUpdate(
      { id: params.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const questionCollection = db.collection<Question>(collection);
    
    const result = await questionCollection.deleteOne({ id: params.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}