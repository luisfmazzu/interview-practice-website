# Product Requirements Document (PRD)
## Question Insert Feature

**Version:** 1.0  
**Date:** January 2025  
**Author:** Development Team  
**Status:** Draft

---

## 1. Executive Summary

This PRD outlines the development of a question insertion feature for the Software Interview Practice website. The feature will allow authorized users to add new interview questions to the database through a web interface, ensuring content quality and system integrity while maintaining security through authentication.

## 2. Product Overview

### 2.1 Purpose
Enable authorized content creators to add new interview questions to the platform through a user-friendly web interface, expanding the question database and supporting content growth.

### 2.2 Goals
- Provide a secure, authenticated interface for adding questions
- Maintain data consistency and quality through validation
- Support both existing and new topic categories
- Ensure seamless integration with the existing MongoDB database
- Deliver an intuitive user experience for content creators

## 3. User Stories

### 3.1 Primary User Stories

**As a content creator, I want to:**
- Access a secure login page to authenticate my identity
- Select from existing topics or create new topics for my questions
- Upload questions in JSON format with validation feedback
- Receive confirmation when questions are successfully added
- Navigate easily between adding more questions and returning to the main site

**As a system administrator, I want to:**
- Ensure only authorized users can add content
- Maintain data integrity through validation
- Track who created each question for accountability
- Have new topics automatically integrated into the system

## 4. Feature Requirements

### 4.1 Authentication System

#### 4.1.1 Login Page (`/new`)
- **Route:** `/new`
- **Behavior:** Redirect to login if user not authenticated
- **Authentication Check:** Verify `localStorage` for valid user session

#### 4.1.2 User Credentials
**Hardcoded Users:**
- **User 1:** Username: `luis`, Password: `cadeado`
- **User 2:** Username: `henrique`, Password: `tartaruga`  
- **User 3:** Username: `erick`, Password: `ericklindo`

#### 4.1.3 Login Form
- **Fields:** Username and Password (text inputs)
- **Validation:** Match against hardcoded credentials
- **Storage:** Store authenticated user in `localStorage`
- **No Registration:** No account creation or password recovery features
- **Security:** Client-side authentication (acceptable for this use case)

### 4.2 Topic Selection

#### 4.2.1 Existing Topics Display
**Available Topics:**
- JavaScript
- TypeScript  
- React
- Next.js
- Node.js
- Express.js
- Nest.js
- Python
- Django
- Flask
- FastAPI
- CI/CD
- AWS
- Serverless
- PostgreSQL
- MongoDB
- Docker
- GraphQL
- APIs
- C#
- Rust
- Golang
- Gin
- Celery
- Databases
- Systems Design
- Behaviour

#### 4.2.2 Topic Selection Interface
- **Display:** Grid or dropdown of existing topics
- **Selection:** Single topic selection
- **General Category:** Option to select "General" with sub-topic creation
- **New Topic Creation:**
  - Input field for new topic name
  - Validation for unique topic names
  - Auto-creation of MongoDB collection

### 4.3 Question Input System

#### 4.3.1 JSON Structure Requirements
**Required Fields:**
- `tag` (string): Topic identifier
- `question` (string): Question text
- `answer` (string): Answer content  
- `keywords` (array of strings, optional): Key concepts
- `studyTopics` (array of strings, optional): Related study areas
- `difficulty` (string, optional): "easy", "medium", or "hard"

**Auto-Generated Fields:**
- `id`: UUID4 (system generated)
- `createdBy`: Username of authenticated user
- `createdAt`: Current timestamp
- `updatedAt`: Current timestamp

#### 4.3.2 Example JSON Structure
```json
[
  {
    "tag": "javascript",
    "question": "What is the difference between `let`, `const`, and `var` in JavaScript?",
    "answer": "**var:**\n- Function-scoped or globally-scoped\n- Can be redeclared and updated\n- Hoisted with undefined initialization\n\n**let:**\n- Block-scoped\n- Can be updated but not redeclared in same scope\n- Hoisted but not initialized (temporal dead zone)\n\n**const:**\n- Block-scoped\n- Cannot be updated or redeclared\n- Must be initialized at declaration",
    "keywords": ["block scope", "function scope", "hoisting", "temporal dead zone"],
    "studyTopics": ["ES6 features", "variable declarations", "JavaScript fundamentals"],
    "difficulty": "easy"
  },
  {
    "tag": "javascript",
    "question": "Explain closures in JavaScript with an example.",
    "answer": "A closure is a function that has access to variables in its outer scope even after the outer function has returned.\n\nExample:\n```javascript\nfunction outerFunction(x) {\n  return function innerFunction(y) {\n    return x + y;\n  };\n}\n\nconst addFive = outerFunction(5);\nconsole.log(addFive(3)); // 8\n```",
    "keywords": ["closures", "lexical scoping", "functions"],
    "studyTopics": ["JavaScript functions", "scope and closures", "advanced JavaScript"],
    "difficulty": "medium"
  }
]
```

### 4.4 Validation System

#### 4.4.1 JSON Validation Rules
- **Format:** Valid JSON array structure
- **Required Fields:** Validate presence of `tag`, `question`, `answer`
- **Field Types:** Ensure correct data types for all fields
- **Content Length:** Minimum lengths for question (10 chars) and answer (20 chars)
- **Difficulty Values:** Must be "easy", "medium", "hard", or null
- **Array Fields:** Ensure `keywords` and `studyTopics` are arrays if present

#### 4.4.2 Validation Feedback
- **Success:** Green checkmarks and success messages
- **Errors:** Red error messages with specific field issues
- **Warnings:** Yellow warnings for optional field recommendations

### 4.5 Submission Process

#### 4.5.1 Question Insertion
- **API Integration:** Use existing `/api/questions` endpoint
- **Collection Selection:** Route to appropriate MongoDB collection
- **Batch Processing:** Insert all questions in the JSON array
- **Error Handling:** Rollback on any insertion failure
- **Success Tracking:** Count successful insertions

#### 4.5.2 New Topic Creation
- **Collection Creation:** Auto-create MongoDB collection for new topics
- **Collection Mapping:** Update system collection mappings
- **Index Creation:** Apply standard indexes to new collections

## 5. User Interface Specifications

### 5.1 Login Page
- **Layout:** Centered form with company branding
- **Form Fields:** Username and password inputs
- **Styling:** Consistent with existing site design
- **Error Handling:** Display authentication errors clearly

### 5.2 Topic Selection Page
- **Layout:** Grid display of available topics
- **New Topic:** Prominent "Create New Topic" option
- **Search:** Filter topics by name
- **Navigation:** Clear progress indicator

### 5.3 Question Input Page
- **Layout:** Split view - JSON input on left, preview on right
- **JSON Editor:** Syntax highlighting and validation
- **Download Link:** Sample JSON file download
- **Validation Display:** Real-time validation feedback
- **Progress:** Show upload and processing status

### 5.4 Success Page
- **Layout:** Centered success message with statistics
- **Navigation Options:** 
  - Left button: "Go to Home" (navigate to `/`)
  - Right button: "Add More Questions" (return to topic selection)
- **Summary:** Display count of questions added and topic

## 6. Technical Requirements

### 6.1 Frontend Requirements
- **Framework:** Next.js with React
- **Styling:** Tailwind CSS (consistent with existing design)
- **State Management:** React hooks for form state
- **Validation:** Client-side JSON validation
- **Storage:** localStorage for authentication

### 6.2 Backend Requirements
- **API Integration:** Extend existing question API endpoints
- **Database:** MongoDB with existing schema
- **Collection Management:** Dynamic collection creation
- **Error Handling:** Comprehensive error responses

### 6.3 Security Requirements
- **Authentication:** Client-side validation against hardcoded users
- **Input Sanitization:** Validate and sanitize all JSON input
- **Rate Limiting:** Prevent abuse of insertion endpoints
- **Authorization:** Verify user authentication on all protected routes

## 7. API Specifications

### 7.1 Authentication Endpoint
```
POST /api/auth/login
Body: { username: string, password: string }
Response: { success: boolean, user: string, token?: string }
```

### 7.2 Topic Management
```
GET /api/topics
Response: { topics: string[] }

POST /api/topics
Body: { name: string }
Response: { success: boolean, collection: string }
```

### 7.3 Question Insertion
```
POST /api/questions/batch
Body: { collection: string, questions: Question[] }
Response: { success: boolean, inserted: number, errors?: string[] }
```

## 8. Success Metrics

### 8.1 User Experience Metrics
- **Authentication Success Rate:** >95% successful logins
- **Validation Error Rate:** <10% of submissions with validation errors
- **Completion Rate:** >90% of users who start the process complete it

### 8.2 Technical Metrics
- **System Performance:** <2 second response time for question insertion
- **Data Integrity:** 100% successful data insertion without corruption
- **Error Handling:** <1% unhandled errors

## 9. Acceptance Criteria

### 9.1 Authentication
- ✅ User can access `/new` route
- ✅ Unauthenticated users see login form
- ✅ Valid credentials store user in localStorage
- ✅ Invalid credentials show error message
- ✅ Authenticated users bypass login

### 9.2 Topic Selection
- ✅ All existing topics are displayed
- ✅ User can select existing topic
- ✅ User can create new topic
- ✅ New topic validation works correctly
- ✅ Selection advances to question input

### 9.3 Question Input
- ✅ JSON editor accepts valid JSON
- ✅ Sample JSON file can be downloaded
- ✅ Validation catches all error types
- ✅ Valid JSON can be submitted
- ✅ Questions are inserted with correct metadata

### 9.4 Success Flow
- ✅ Success page shows insertion results
- ✅ "Go to Home" button navigates to `/`
- ✅ "Add More Questions" returns to topic selection
- ✅ New questions appear in practice mode

## 10. Risk Assessment

### 10.1 Technical Risks
- **Database Performance:** Large JSON uploads may impact performance
- **Data Validation:** Complex validation logic may have edge cases
- **Collection Creation:** Dynamic collection creation could fail

### 10.2 Mitigation Strategies
- **Performance:** Implement batch size limits and progress indicators
- **Validation:** Comprehensive testing of validation logic
- **Error Handling:** Robust error handling and rollback mechanisms

## 11. Implementation Timeline

### Phase 1: Authentication & Navigation (Week 1)
- Login page implementation
- localStorage authentication
- Route protection

### Phase 2: Topic Selection (Week 1)
- Topic display interface
- New topic creation
- Collection management

### Phase 3: Question Input & Validation (Week 2)
- JSON editor implementation
- Validation system
- Sample file generation

### Phase 4: Submission & Success (Week 2)
- Question insertion logic
- Success page implementation
- Navigation flow completion

### Phase 5: Testing & Polish (Week 3)
- Comprehensive testing
- UI/UX improvements
- Performance optimization

## 12. Future Enhancements

### 12.1 Potential Improvements
- **Rich Text Editor:** WYSIWYG editor for question/answer content
- **Image Support:** Allow image uploads for questions
- **Bulk Import:** CSV or Excel file import support
- **Preview Mode:** Preview questions before submission
- **Edit Mode:** Edit existing questions
- **User Management:** More sophisticated user roles and permissions

### 12.2 Analytics Integration
- **Usage Tracking:** Track question creation statistics
- **Quality Metrics:** Monitor question usage and effectiveness
- **User Activity:** Dashboard for content creator activity

---

**Document Status:** Ready for Development  
**Next Steps:** Begin Phase 1 implementation  
**Stakeholder Review:** Pending approval