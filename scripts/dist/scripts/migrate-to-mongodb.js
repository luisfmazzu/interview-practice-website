"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const Question_1 = require("../src/models/Question");
const MONGODB_URI = 'mongodb+srv://luisfmazzu:cadeado@cluster0.awncth9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'interview-practice';
async function migrateData() {
    const client = new mongodb_1.MongoClient(MONGODB_URI);
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
        const questionsDir = (0, path_1.join)(process.cwd(), 'public', 'data', 'questions');
        const generalDir = (0, path_1.join)(questionsDir, 'general');
        // Process general technology questions
        const generalFiles = (0, fs_1.readdirSync)(generalDir).filter(file => file.endsWith('.json'));
        for (const file of generalFiles) {
            const filePath = (0, path_1.join)(generalDir, file);
            const collectionName = Question_1.COLLECTION_MAPPINGS[file];
            if (!collectionName) {
                console.warn(`No collection mapping found for file: ${file}`);
                continue;
            }
            const rawData = (0, fs_1.readFileSync)(filePath, 'utf8');
            const jsonData = JSON.parse(rawData);
            // Handle both direct array and object with questions property
            let data;
            if (Array.isArray(jsonData)) {
                data = jsonData;
            }
            else if (jsonData.questions && Array.isArray(jsonData.questions)) {
                data = jsonData.questions;
            }
            else {
                console.warn(`Invalid data format in file: ${file} - expected array or object with questions property`);
                continue;
            }
            const questions = data.map(q => ({
                id: (0, uuid_1.v4)(),
                tag: q.tag,
                question: q.question,
                answer: q.answer,
                keywords: q.keywords || [],
                difficulty: q.difficulty,
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
            const filePath = (0, path_1.join)(questionsDir, file);
            const collectionName = Question_1.COLLECTION_MAPPINGS[file];
            if (!collectionName) {
                console.warn(`No collection mapping found for file: ${file}`);
                continue;
            }
            try {
                const rawData = (0, fs_1.readFileSync)(filePath, 'utf8');
                const jsonData = JSON.parse(rawData);
                // Handle both direct array and object with questions property
                let data;
                if (Array.isArray(jsonData)) {
                    data = jsonData;
                }
                else if (jsonData.questions && Array.isArray(jsonData.questions)) {
                    data = jsonData.questions;
                }
                else {
                    console.warn(`Invalid data format in file: ${file} - expected array or object with questions property`);
                    continue;
                }
                const questions = data.map(q => ({
                    id: (0, uuid_1.v4)(),
                    tag: q.tag,
                    question: q.question,
                    answer: q.answer,
                    keywords: q.keywords || [],
                    difficulty: q.difficulty,
                    createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
                    updatedAt: new Date()
                }));
                if (questions.length > 0) {
                    const collection = db.collection(collectionName);
                    await collection.insertMany(questions);
                    console.log(`Inserted ${questions.length} questions into ${collectionName} collection`);
                }
            }
            catch (error) {
                console.warn(`Could not process ${file}:`, error instanceof Error ? error.message : 'Unknown error');
            }
        }
        // Create indexes for better performance
        const allCollections = Object.values(Question_1.COLLECTION_MAPPINGS);
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
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    finally {
        await client.close();
    }
}
// Run migration if this script is executed directly
if (require.main === module) {
    migrateData().catch(console.error);
}
exports.default = migrateData;
