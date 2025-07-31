import { MongoClient } from 'mongodb';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { COLLECTION_MAPPINGS, Question } from '../src/models/Question';

const MONGODB_URI = 'mongodb+srv://luisfmazzu:cadeado@cluster0.awncth9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'interview-practice';

interface LegacyQuestion {
  id: number;
  tag: string;
  question: string;
  answer: string;
  keywords?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt?: string;
}

async function migrateData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Get all existing collections and drop them for clean migration
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped existing collection: ${collection.name}`);
    }
    
    const questionsDir = join(process.cwd(), 'public', 'data', 'questions');
    const generalDir = join(questionsDir, 'general');
    
    // Process general technology questions
    const generalFiles = readdirSync(generalDir).filter(file => file.endsWith('.json'));
    
    for (const file of generalFiles) {
      const filePath = join(generalDir, file);
      const collectionName = COLLECTION_MAPPINGS[file];
      
      if (!collectionName) {
        console.warn(`No collection mapping found for file: ${file}`);
        continue;
      }
      
      const rawData = readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);
      
      // Handle both direct array and object with questions property
      let data: LegacyQuestion[];
      if (Array.isArray(jsonData)) {
        data = jsonData;
      } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
        data = jsonData.questions;
      } else {
        console.warn(`Invalid data format in file: ${file} - expected array or object with questions property`);
        continue;
      }
      
      const questions: Question[] = data.map(q => ({
        id: uuidv4(),
        tag: q.tag,
        question: q.question,
        answer: q.answer,
        keywords: q.keywords || [],
        studyTopics: [], // Will be added later
        difficulty: q.difficulty,
        createdBy: 'migration', // Set default for migrated questions
        createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
        updatedAt: new Date()
      }));
      
      if (questions.length > 0) {
        const collection = db.collection(collectionName);
        await collection.insertMany(questions);
        console.log(`Inserted ${questions.length} questions into ${collectionName} collection`);
      }
    }
    
    // Process category-specific questions (systems_design, behaviour)
    const categoryFiles = ['systems_design.json', 'behaviour.json'];
    
    for (const file of categoryFiles) {
      const filePath = join(questionsDir, file);
      const collectionName = COLLECTION_MAPPINGS[file];
      
      if (!collectionName) {
        console.warn(`No collection mapping found for file: ${file}`);
        continue;
      }
      
      try {
        const rawData = readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);
        
        // Handle both direct array and object with questions property
        let data: LegacyQuestion[];
        if (Array.isArray(jsonData)) {
          data = jsonData;
        } else if (jsonData.questions && Array.isArray(jsonData.questions)) {
          data = jsonData.questions;
        } else {
          console.warn(`Invalid data format in file: ${file} - expected array or object with questions property`);
          continue;
        }
        
        const questions: Question[] = data.map(q => ({
          id: uuidv4(),
          tag: q.tag,
          question: q.question,
          answer: q.answer,
          keywords: q.keywords || [],
          studyTopics: [], // Will be added later
          difficulty: q.difficulty,
          createdBy: 'migration', // Set default for migrated questions
          createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
          updatedAt: new Date()
        }));
        
        if (questions.length > 0) {
          const collection = db.collection(collectionName);
          await collection.insertMany(questions);
          console.log(`Inserted ${questions.length} questions into ${collectionName} collection`);
        }
      } catch (error) {
        console.warn(`Could not process ${file}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // Create indexes for better performance
    const allCollections = Object.values(COLLECTION_MAPPINGS);
    for (const collectionName of allCollections) {
      const collection = db.collection(collectionName);
      
      // Create indexes
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ tag: 1 });
      await collection.createIndex({ difficulty: 1 });
      await collection.createIndex({ keywords: 1 });
      await collection.createIndex({ createdAt: -1 });
      
      console.log(`Created indexes for ${collectionName} collection`);
    }
    
    // Print summary
    console.log('\n=== Migration Summary ===');
    for (const collectionName of allCollections) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      if (count > 0) {
        console.log(`${collectionName}: ${count} questions`);
      }
    }
    
    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData().catch(console.error);
}

export default migrateData;