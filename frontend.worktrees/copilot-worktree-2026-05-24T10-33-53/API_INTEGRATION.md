# API Integration Guide

This guide explains how the frontend communicates with the FastAPI backend.

## API Service Layer

All API calls go through `/src/services/api.js`. This provides a centralized place to:
- Configure the backend URL
- Handle authentication tokens
- Make consistent API requests
- Handle errors uniformly

## Authentication

### Login Endpoint
**Endpoint**: `POST /auth/login`

**Request**:
```javascript
{
  username: "user123",
  password: "pass123"
}
```

**Response**:
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIs...",  // JWT token
  user: {
    id: 1,
    username: "user123",
    email: "user@example.com"
  }
}
```

**Frontend Usage**:
```javascript
import { authService } from '../services/api';

const handleLogin = async () => {
  try {
    const response = await authService.login(username, password);
    localStorage.setItem('token', response.data.token);
    // Redirect to dashboard
  } catch (error) {
    // Show error message
  }
};
```

## Book Management

### Get All Books
**Endpoint**: `GET /books`

**Response**:
```javascript
[
  {
    id: 1,
    title: "Python Basics",
    author: "John Doe",
    category: "Programming",
    isbn: "978-0134692883",
    available: true,
    created_at: "2026-05-23T10:00:00",
    updated_at: "2026-05-23T10:00:00"
  },
  // ... more books
]
```

**Frontend Usage**:
```javascript
import { bookService } from '../services/api';

useEffect(() => {
  const fetchBooks = async () => {
    const response = await bookService.getAllBooks();
    setBooks(response.data);
  };
  fetchBooks();
}, []);
```

### Add Book
**Endpoint**: `POST /books`

**Request**:
```javascript
{
  title: "Web Development",
  author: "Jane Smith",
  category: "Web",
  isbn: "978-0123456789",
  available: true
}
```

**Response**:
```javascript
{
  id: 2,
  title: "Web Development",
  author: "Jane Smith",
  category: "Web",
  isbn: "978-0123456789",
  available: true,
  created_at: "2026-05-23T11:00:00"
}
```

**Frontend Usage**:
```javascript
const handleAddBook = async (formData) => {
  try {
    const response = await bookService.addBook(formData);
    console.log('Book added:', response.data);
    // Redirect or refresh list
  } catch (error) {
    console.error('Failed to add book:', error.response.data);
  }
};
```

### Get Single Book
**Endpoint**: `GET /books/{id}`

**Response**:
```javascript
{
  id: 1,
  title: "Python Basics",
  author: "John Doe",
  category: "Programming",
  isbn: "978-0134692883",
  available: true,
  created_at: "2026-05-23T10:00:00"
}
```

### Update Book
**Endpoint**: `PUT /books/{id}`

**Request**:
```javascript
{
  title: "Python Advanced",
  author: "John Doe",
  category: "Programming",
  available: false
}
```

### Delete Book
**Endpoint**: `DELETE /books/{id}`

**Response**:
```javascript
{
  success: true,
  message: "Book deleted successfully"
}
```

**Frontend Usage**:
```javascript
const handleDelete = async (bookId) => {
  try {
    await bookService.deleteBook(bookId);
    // Remove from list
    setBooks(books.filter(b => b.id !== bookId));
  } catch (error) {
    alert('Failed to delete book');
  }
};
```

## Search

### Semantic Search
**Endpoint**: `POST /search/semantic`

**Request**:
```javascript
{
  query: "python programming"
}
```

**Response**:
```javascript
{
  results: [
    {
      id: 1,
      title: "Python Basics",
      author: "John Doe",
      category: "Programming",
      relevance: 0.95
    },
    {
      id: 3,
      title: "Advanced Python",
      author: "Mike Johnson",
      category: "Programming",
      relevance: 0.87
    }
  ]
}
```

**Frontend Usage**:
```javascript
const handleSearch = async (query) => {
  try {
    const response = await searchService.semanticSearch(query);
    setResults(response.data.results);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

## Dashboard

### Get Dashboard Stats
**Endpoint**: `GET /dashboard/stats`

**Response**:
```javascript
{
  total_books: 150,
  available_books: 120,
  categories: 12,
  recent_additions: 5
}
```

**Frontend Usage**:
```javascript
useEffect(() => {
  const fetchStats = async () => {
    const response = await dashboardService.getDashboardStats();
    setStats(response.data);
  };
  fetchStats();
}, []);
```

## Authentication Header

All requests automatically include the authentication token:

```javascript
// Automatically added by axios interceptor
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
}
```

## Error Handling

### Backend Error Response
```javascript
{
  detail: "Invalid credentials",
  status: 401
}
```

### Frontend Error Handling
```javascript
try {
  const response = await bookService.addBook(data);
  // Success
} catch (error) {
  // Access error details
  const errorMessage = error.response?.data?.detail || 'Unknown error';
  setError(errorMessage);
}
```

## Request/Response Flow

### Step 1: Create Request
```javascript
const data = {
  title: "New Book",
  author: "Author Name",
  category: "Category",
  isbn: "1234567890"
};
```

### Step 2: Send Request
```javascript
const response = await bookService.addBook(data);
```

### Step 3: Interceptor Adds Token
```javascript
// Automatically adds:
// Authorization: Bearer <token>
```

### Step 4: Backend Processes
- Validates token
- Processes request
- Returns response

### Step 5: Frontend Handles Response
```javascript
setBooks([...books, response.data]);
```

## Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Book retrieved successfully |
| 201 | Created | New book added successfully |
| 204 | No Content | Book deleted successfully |
| 400 | Bad Request | Invalid form data |
| 401 | Unauthorized | Invalid or missing token |
| 404 | Not Found | Book ID doesn't exist |
| 500 | Server Error | Backend error |

## Mock Data for Testing

When the backend is unavailable, the frontend uses mock data:

```javascript
// In BookListing.js
catch (err) {
  setBooks([
    {
      id: 1,
      title: 'Python Basics',
      author: 'John Doe',
      category: 'Programming',
      available: true,
    },
    // ... more mock books
  ]);
}
```

## Building Backend Integration

### Step 1: Ensure Backend is Running
```bash
python -m uvicorn main:app --reload
```

Backend should be at: `http://localhost:8000`

### Step 2: Verify Endpoints
Test each endpoint with Postman or curl:
```bash
curl -X GET http://localhost:8000/books
```

### Step 3: Check Frontend Configuration
Verify `.env.local` has correct API URL:
```
REACT_APP_API_URL=http://localhost:8000
```

### Step 4: Check Browser Console
- Open DevTools (F12)
- Go to Network tab
- Make API calls
- Verify requests and responses

### Step 5: Test Each Page
1. Try logging in
2. View dashboard
3. Browse books
4. Add a book
5. Search for books

## Debugging Tips

### Check Request Headers
```javascript
// In browser DevTools > Network tab
// Look for Authorization header
```

### Log API Responses
```javascript
const response = await bookService.getAllBooks();
console.log('Response:', response.data);
```

### Monitor Network Activity
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions
4. Check request/response details

### Common Issues

**"401 Unauthorized"**
- Token missing or expired
- Re-login to get new token

**"CORS Error"**
- Backend CORS configuration issue
- Verify backend allows requests from frontend

**"Network Error"**
- Backend not running
- Wrong API URL
- Check REACT_APP_API_URL

## Example: Adding a Complete Feature

Here's how to add a "Recently Added Books" feature:

### 1. Add Backend Endpoint
```python
@app.get("/books/recent")
def get_recent_books(limit: int = 5):
    return books[-limit:]
```

### 2. Add API Service Function
```javascript
// In services/api.js
export const bookService = {
  // ... existing functions
  getRecentBooks: (limit = 5) =>
    apiClient.get(`/books/recent?limit=${limit}`),
};
```

### 3. Use in Component
```javascript
// In Dashboard.js
useEffect(() => {
  const fetchRecent = async () => {
    const response = await bookService.getRecentBooks();
    setRecentBooks(response.data);
  };
  fetchRecent();
}, []);
```

### 4. Display Results
```javascript
<div className="recent-books">
  {recentBooks.map(book => (
    <div key={book.id}>{book.title}</div>
  ))}
</div>
```

## Summary

- All API calls use the `axios` client in `services/api.js`
- Authentication token automatically included in headers
- Error handling and mock data built-in
- Easy to extend with new endpoints
- Frontend ready for backend integration

For more details on specific pages, check the individual component files and their comments.
