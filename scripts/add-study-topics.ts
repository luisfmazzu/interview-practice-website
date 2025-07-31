import { MongoClient } from 'mongodb';
import { COLLECTIONS } from '../src/models/Question';

const MONGODB_URI = 'mongodb+srv://luisfmazzu:cadeado@cluster0.awncth9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'interview-practice';

async function addStudyTopicsField() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
  });
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Get all collection names from our COLLECTIONS constant
    const allCollections = Object.values(COLLECTIONS);
    
    let totalUpdated = 0;
    
    for (const collectionName of allCollections) {
      try {
        const collection = db.collection(collectionName);
        
        // Check if collection exists and has documents
        const count = await collection.countDocuments();
        if (count === 0) {
          console.log(`Skipping empty collection: ${collectionName}`);
          continue;
        }
        
        // Add studyTopics field as empty array to all documents that don't have it
        const result = await collection.updateMany(
          { studyTopics: { $exists: false } }, // Only update documents without studyTopics field
          { $set: { studyTopics: [] } }
        );
        
        console.log(`Updated ${result.modifiedCount} documents in ${collectionName} collection`);
        totalUpdated += result.modifiedCount;
        
        // Create index on studyTopics field for better query performance
        await collection.createIndex({ studyTopics: 1 });
        console.log(`Created index on studyTopics field for ${collectionName} collection`);
        
      } catch (error) {
        console.error(`Error updating collection ${collectionName}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Total documents updated: ${totalUpdated}`);
    console.log(`Collections processed: ${allCollections.length}`);
    console.log('Successfully added studyTopics field to all collections!');
    
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run script if this file is executed directly
if (require.main === module) {
  addStudyTopicsField().catch(console.error);
}

export default addStudyTopicsField;