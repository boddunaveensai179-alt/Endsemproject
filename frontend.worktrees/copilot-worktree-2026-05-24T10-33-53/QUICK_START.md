# Quick Start Guide - Digital Library Management System

## Overview
This is a complete, production-ready React frontend for a Digital Library Management System. The application is beginner-friendly with clean, simple code that's perfect for first-year students to learn from.

## What Has Been Built

### ✅ Components Created
- **Navbar**: Navigation bar with links and logout button
- **Login Page**: User authentication with form validation
- **Dashboard**: Statistics cards showing library metrics
- **Book Listing**: Table view of all books with delete functionality
- **Add Book Form**: Form for adding new books with validation
- **Semantic Search**: Search page with intelligent book search

### ✅ Features Implemented
- React Router for page navigation
- Form validation and error handling
- API service layer with Axios
- Responsive design (mobile-friendly)
- Loading states and error messages
- Mock data for testing without backend
- Protected routes (login required)
- Token-based authentication

### ✅ Styling
- Blue, white, and gray color palette
- Clean, minimal UI without animations
- Responsive CSS Grid layouts
- Mobile-first responsive design
- Professional form styling

### ✅ Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── BookListing.js
│   │   ├── AddBook.js
│   │   └── Search.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   ├── Global.css
│   │   ├── Navbar.css
│   │   ├── Login.css
│   │   ├── Dashboard.css
│   │   ├── BookListing.css
│   │   ├── AddBook.css
│   │   └── Search.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
├── .env.example
└── PROJECT_README.md
```

## Installation & Running

### Step 1: Install Dependencies
```bash
cd c:\DBS_DBE\Endsem_project\frontend
npm install
```

### Step 2: Configure Backend URL (Optional)
Create `.env.local` file:
```
REACT_APP_API_URL=http://localhost:8000
```

### Step 3: Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### Step 4: Test the Application
1. Go to Login page
2. Enter any username/password (for demo)
3. Browse the Dashboard, Books, Add Book, and Search pages

## How Each Page Works

### Login Page
- Simple form with username and password
- Stores authentication token in localStorage
- Redirects to dashboard on successful login
- Shows error messages for failed attempts

### Dashboard
- Displays 3 main statistics:
  - Total Books count
  - Available Books count
  - Number of Categories
- Shows quick guide with tips
- Fetches data from `/dashboard/stats` endpoint

### Book Listing
- Displays all books in a table
- Shows: Title, Author, Category, Availability Status
- Delete button to remove books
- Mock data available if backend is unavailable
- Responsive table that works on mobile

### Add Book Form
- Form fields:
  - Title (required)
  - Author (required)
  - Category dropdown (required)
  - ISBN (required, min 10 characters)
  - Availability checkbox
- Client-side validation
- Error messages for each field
- Success message on book addition

### Semantic Search
- Search bar for entering queries
- Sends request to `/search/semantic` endpoint
- Displays results as cards
- Shows relevance score and category
- Mock results for demo without backend

## Code Structure Explained

### services/api.js
- Centralized API communication
- Axios instance with authorization headers
- Service functions for each API operation:
  - `authService.login()` - User login
  - `bookService.getAllBooks()` - Fetch books
  - `bookService.addBook()` - Add new book
  - `searchService.semanticSearch()` - Search books
  - `dashboardService.getDashboardStats()` - Get stats

### React Hooks Used
- `useState` - For managing component state
- `useEffect` - For side effects like API calls
- `useNavigate` - For programmatic navigation

### Important Patterns
- Form validation before submission
- Loading states during API calls
- Error handling with user messages
- Protected routes requiring authentication
- Token stored in localStorage

## Connecting to Backend

### Required API Endpoints
Your FastAPI backend should have these endpoints:

```
POST /auth/login
- Input: {username, password}
- Output: {token: "...", user: {...}}

GET /books
- Output: [{id, title, author, category, available}, ...]

POST /books
- Input: {title, author, category, isbn, available}
- Output: {id, ...}

DELETE /books/{id}
- Output: {success: true}

POST /search/semantic
- Input: {query}
- Output: {results: [{id, title, author, category, relevance}, ...]}

GET /dashboard/stats
- Output: {total_books, available_books, categories}
```

## Customization Guide

### Change Colors
Edit `/src/styles/Global.css` and modify CSS variables:
```css
:root {
  --primary-blue: #2c3e50;      /* Change main color */
  --light-blue: #3498db;        /* Change accent color */
  --error-red: #e74c3c;         /* Change error color */
}
```

### Add New Page
1. Create new file in `/src/pages/YourPage.js`
2. Add route in `App.js`
3. Create CSS file in `/src/styles/YourPage.css`
4. Add navigation link in `Navbar.js`

### Change API Base URL
Set environment variable:
```
REACT_APP_API_URL=http://your-api-url.com
```

## Troubleshooting

### "Cannot connect to backend"
- Ensure FastAPI server is running on port 8000
- Check network tab in browser DevTools
- Verify the API URL in `.env.local`

### "Form fields not validating"
- Check browser console for errors
- Verify form field names match API requirements
- Check validation logic in page component

### "Login not working"
- Ensure backend returns token in response
- Check localStorage for token storage
- Verify /auth/login endpoint exists

### "Pages not loading"
- Clear browser cache and reload
- Check if you're authenticated (token in localStorage)
- Verify route path matches in App.js

## Next Steps for Learning

1. **Modify the UI**: Change colors, add new fields, customize components
2. **Add Features**: Try adding book edit functionality
3. **Improve Forms**: Add more validation rules or fields
4. **Connect Backend**: Replace mock data with real API calls
5. **Add State Management**: Learn Redux for complex state
6. **Deploy**: Build and deploy to production

## File Descriptions

### components/Navbar.js
- Navigation bar visible on all pages
- Shows different links based on login status
- Logout button removes token and redirects to login

### pages/Login.js
- Handles user authentication
- Form validation for username and password
- Stores JWT token in localStorage
- Redirects to dashboard on success

### pages/Dashboard.js
- Welcome page after login
- Displays library statistics
- Fetches stats from backend
- Shows mock data if backend unavailable

### pages/BookListing.js
- Lists all books in a table
- Shows book details and availability
- Allows book deletion
- Responsive table layout

### pages/AddBook.js
- Form to add new books
- Validates all required fields
- Shows error messages
- Success notification after adding

### pages/Search.js
- Semantic search functionality
- Search bar for queries
- Displays results as cards
- Shows relevance scores

## Dependencies

- **react-router-dom**: Client-side routing
- **axios**: HTTP client for API calls
- **react**: UI framework
- **react-dom**: React rendering

## Building for Production

```bash
npm run build
```

Creates optimized production build in `/build` folder.

## Environment Setup

### Windows
```powershell
# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install dependencies
npm install

# Run development server
npm start
```

### macOS/Linux
```bash
npm install
npm start
```

---

**Happy Learning! 🚀**

For questions or issues, refer to the inline code comments and the PROJECT_README.md file.
