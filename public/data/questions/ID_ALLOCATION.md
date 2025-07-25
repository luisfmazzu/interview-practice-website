# Question ID Allocation Scheme

This document defines the ID ranges for different question categories to avoid conflicts and support future scaling.

## ID Ranges (1000 IDs per category)

| Technology/Category | ID Range | Current Count | Available IDs |
|-------------------|----------|---------------|---------------|
| **JavaScript**    | 0-999    | 5             | 995           |
| **TypeScript**    | 1000-1999| 3             | 997           |
| **React**         | 2000-2999| 5             | 995           |
| **Systems Design**| 3000-3999| 3             | 997           |
| **Behavioral**    | 4000-4999| 5             | 995           |

## New Technology Allocation

| Technology/Category | ID Range     | Target Count |
|-------------------|--------------|--------------|
| **Next.js**       | 5000-5999    | 20           |
| **Node.js**       | 6000-6999    | 20           |
| **Nest.js**       | 7000-7999    | 20           |
| **Express.js**    | 8000-8999    | 20           |
| **Python**        | 9000-9999    | 20           |
| **Django**        | 10000-10999  | 20           |
| **Flask**         | 11000-11999  | 20           |
| **FastAPI**       | 12000-12999  | 20           |
| **MongoDB**       | 13000-13999  | 20           |
| **PostgreSQL**    | 14000-14999  | 20           |
| **AWS**           | 15000-15999  | 20           |
| **APIs**          | 16000-16999  | 20           |
| **Docker**        | 17000-17999  | 20           |
| **Serverless**    | 18000-18999  | 20           |
| **Celery**        | 23000-23999  | 10           |

## Future Expansion

| Technology/Category | Reserved ID Range |
|-------------------|------------------|
| **Security**      | 19000-19999      |
| **Algorithms**    | 20000-20999      |
| **DevOps**        | 21000-21999      |
| **Microservices** | 22000-22999      |

## Current Question Distribution

### JavaScript (0-999)
- ID 0: `let`, `const`, `var` differences
- ID 1: Closures
- ID 2: Event bubbling and capturing
- ID 3: `==` vs `===`
- ID 4: Hoisting

### TypeScript (1000-1999)
- ID 1000: TypeScript benefits
- ID 1001: Interfaces vs types
- ID 1002: Generics

### React (2000-2999)
- ID 2000: Functional vs class components
- ID 2001: useState hook
- ID 2002: useEffect hook
- ID 2003: Virtual DOM
- ID 2004: React keys

### Systems Design (3000-3999)
- ID 3000: URL shortening service
- ID 3001: Chat application
- ID 3002: Distributed cache system

### Behavioral (4000-4999)
- ID 4000: Technical challenge
- ID 4001: Team disagreement
- ID 4002: Production mistake
- ID 4003: Learning new technology
- ID 4004: Competing deadlines

## Guidelines

1. **Always check this file** before adding new questions
2. **Use sequential IDs** within each category (e.g., 0, 1, 2, 3...)
3. **Reserve full 1000-ID blocks** even for small categories
4. **Update this file** when adding new questions or categories
5. **Each category can support up to 1000 questions** before needing expansion

## Notes

- This scheme supports up to 1000 questions per technology/category
- Each category is completely isolated from others
- Easy to identify question source by ID range
- Supports future scaling without conflicts
- IDs within each category start from the base (e.g., JS starts at 0, TS starts at 1000)