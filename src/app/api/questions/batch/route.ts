import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Question } from '@/models/Question';
import { v4 as uuidv4 } from 'uuid';

interface QuestionInput {
  question: string;
  answer: string;
  keywords?: string[];
  studyTopics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection, questions, createdBy } = body;

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection parameter is required' },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Questions array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!createdBy) {
      return NextResponse.json(
        { success: false, error: 'CreatedBy parameter is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const questionCollection = db.collection<Question>(collection);

    // Process and validate each question
    const processedQuestions: Omit<Question, '_id'>[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i] as QuestionInput;
      const questionNum = i + 1;

      // Check for forbidden tag field (should be auto-set from collection parameter)
      if ((q as any).tag !== undefined) {
        validationErrors.push(`Question ${questionNum}: 'tag' field is not allowed (automatically set from selected topic)`);
        continue;
      }
      if (!q.question || typeof q.question !== 'string' || q.question.length < 10) {
        validationErrors.push(`Question ${questionNum}: 'question' field is required and must be at least 10 characters`);
        continue;
      }
      if (!q.answer || typeof q.answer !== 'string' || q.answer.length < 20) {
        validationErrors.push(`Question ${questionNum}: 'answer' field is required and must be at least 20 characters`);
        continue;
      }

      // Validate optional fields
      if (q.keywords && !Array.isArray(q.keywords)) {
        validationErrors.push(`Question ${questionNum}: 'keywords' must be an array`);
        continue;
      }
      if (q.studyTopics && !Array.isArray(q.studyTopics)) {
        validationErrors.push(`Question ${questionNum}: 'studyTopics' must be an array`);
        continue;
      }
      if (q.difficulty && !['easy', 'medium', 'hard'].includes(q.difficulty)) {
        validationErrors.push(`Question ${questionNum}: 'difficulty' must be 'easy', 'medium', or 'hard'`);
        continue;
      }

      // Create processed question with tag from collection parameter
      const processedQuestion: Omit<Question, '_id'> = {
        id: uuidv4(),
        tag: collection, // Set tag to the selected collection/topic
        question: q.question,
        answer: q.answer,
        keywords: q.keywords || [],
        studyTopics: q.studyTopics || [],
        difficulty: q.difficulty,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      processedQuestions.push(processedQuestion);
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validationErrors,
        insertedCount: 0
      }, { status: 400 });
    }

    // Insert all questions
    try {
      const result = await questionCollection.insertMany(processedQuestions);
      const insertedCount = result.insertedCount;

      console.log(`Successfully inserted ${insertedCount} questions into ${collection} collection by ${createdBy}`);

      return NextResponse.json({
        success: true,
        insertedCount,
        collection,
        message: `Successfully inserted ${insertedCount} questions`
      });

    } catch (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert questions into database',
        insertedCount: 0
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Batch questions API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      insertedCount: 0
    }, { status: 500 });
  }
}