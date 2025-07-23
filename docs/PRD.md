# Product Requirements Document (PRD)
# Interview Practice Website

## 1. Project Overview

### 1.1 Purpose
A web-based platform designed for software engineers to practice technical interview questions across different categories and technologies.

### 1.2 Target Audience
- Software engineers preparing for technical interviews
- Developers looking to refresh knowledge in specific technologies
- Job seekers practicing behavioral and systems design questions

### 1.3 Technology Stack
- **Frontend Framework**: Next.js
- **Styling**: TailwindCSS
- **Data Storage**: JSON files + localStorage
- **State Management**: Browser localStorage

## 2. Core Features

### 2.1 Study Category Selection
**Requirement**: Users can select from three main categories:
- **General**: Technology-specific technical questions
- **Systems Design**: Architecture and design questions
- **Behaviour**: Behavioral interview questions

### 2.2 Technology Filtering (General Category Only)
**Requirement**: When selecting "General", users can choose multiple technologies from:
- JavaScript, TypeScript, React, Next.js, Node.js, Express.js, Nest.js
- Python, Django, Flask, FastAPI
- CI/CD, AWS, Serverless
- PostgreSQL, MongoDB, Docker, GraphQL, APIs
- C#, Rust, Golang, Gin

**Constraints**:
- Users must select at least one technology
- Multiple selections allowed
- Other categories (Systems Design, Behaviour) proceed directly without technology selection

### 2.3 Practice Session Management
**Requirement**: Session persistence and question tracking
- Store selected preferences in localStorage
- Track accessed question IDs to prevent repetition
- Maintain session state across page reloads

### 2.4 Question Interface
**Features**:
- Display random questions based on user selection
- Built-in timer for practice timing (visual only, no enforcement)
- "Show Answer" button to reveal answer
- "Next Question" button to proceed (resets timer)
- "Clear Session" button to reset localStorage and return to selection page

## 3. User Stories

### 3.1 Category Selection Flow
```
As a user preparing for interviews,
I want to select what type of questions I want to practice,
So that I can focus on specific areas of improvement.
```

### 3.2 Technology Filtering
```
As a developer with specific tech stack experience,
I want to filter questions by technologies I'm familiar with,
So that I can practice relevant questions for my target roles.
```

### 3.3 Practice Session
```
As a user practicing questions,
I want to see random questions without repetition and track my time,
So that I can simulate real interview conditions.
```

### 3.4 Session Management
```
As a user taking breaks during practice,
I want my progress and preferences to be saved,
So that I can continue where I left off.
```

## 4. Technical Requirements

### 4.1 Performance Requirements
- Fast question randomization algorithm
- Efficient filtering of questions by selected criteria
- Minimal load times between questions

### 4.2 Data Requirements
- JSON-based question storage
- Question structure: ID, tag, question text, answer
- Tag-based filtering system
- Prevention of question repetition within sessions

### 4.3 Browser Compatibility
- Modern browsers with localStorage support
- Responsive design for desktop and mobile devices

### 4.4 Local Storage Schema
```javascript
{
  selectedCategory: string,           // "general" | "systems_design" | "behaviour"
  selectedTechnologies: string[],     // Array of selected tech tags (only for general)
  accessedQuestionIds: number[],      // IDs of questions already shown
  sessionStartTime: timestamp         // When current session began
}
```

## 5. User Interface Requirements

### 5.1 Selection Page (/)
**Layout**:
- Page title: "Interview Practice"
- Category selection (3 radio buttons)
- Technology multi-select (visible only when "General" selected)
- "Start Practice" button (disabled until valid selection made)

**Interactions**:
- Selecting non-General categories hides technology options
- Selecting General shows technology checklist
- Form validation ensures at least one technology selected for General
- Submit redirects to practice page

### 5.2 Practice Page (/practice)
**Layout**:
- Timer display (MM:SS format) at top
- Question text in centered card
- Answer text (hidden by default)
- Three action buttons: "Show Answer", "Next Question", "End Session"

**Interactions**:
- Timer starts automatically when page loads
- "Show Answer" reveals answer text, button becomes disabled
- "Next Question" loads new question, resets timer, hides answer
- "End Session" clears localStorage, redirects to selection page
- Direct access without localStorage redirects to selection page

## 6. Navigation Flow

```
Selection Page (/)
    ↓ (valid selection + submit)
Practice Page (/practice)
    ↓ (End Session button)
Selection Page (/) [localStorage cleared]
```

## 7. Data Structure Requirements

### 7.1 Question Object
```javascript
{
  id: number,
  tag: string,        // Maps to category/technology selection
  question: string,   // Question text
  answer: string      // Answer content
}
```

### 7.2 Tag Taxonomy
- **Systems Design**: "systems_design"
- **Behaviour**: "behaviour"  
- **General Technologies**: Exact match to technology list in 2.2

## 8. Success Criteria

### 8.1 Functional Success
- Users can successfully select categories and technologies
- Questions display without repetition within sessions
- Timer functions correctly
- Session persistence works across page reloads
- All buttons and navigation work as specified

### 8.2 Performance Success
- Page load times under 2 seconds
- Question transitions under 1 second
- No memory leaks from localStorage usage

### 8.3 User Experience Success
- Intuitive selection process
- Clear visual feedback for all interactions
- Responsive design works on mobile and desktop
- Clean, professional interface appropriate for technical audience

## 9. Future Considerations
- Question difficulty levels
- Progress tracking and statistics
- Question bookmarking
- Custom question sets
- Collaborative features
- Integration with job boards or company-specific question sets