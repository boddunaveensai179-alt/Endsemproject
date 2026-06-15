# Component Architecture & Coding Patterns

This document explains the architecture and coding patterns used in the Digital Library Management System frontend.

## Project Architecture

### Layered Architecture

```
┌─────────────────────────────────┐
│      Pages (UI/Views)           │
│  - Login, Dashboard, etc.       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Components (Reusable UI)     │
│  - Navbar                       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Services (Business Logic)     │
│  - API Communication            │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   External APIs                 │
│  - FastAPI Backend              │
└─────────────────────────────────┘
```

### Directory Structure

```
src/
├── pages/              # Full page components
├── components/         # Reusable components
├── services/          # API and business logic
├── styles/            # CSS files
├── App.js             # Main routing
└── index.js           # Entry point
```

## Component Hierarchy

```
App (Root with Routes)
├── Navbar (Visible on all pages)
└── Routes
    ├── /login → Login
    ├── /dashboard → Dashboard
    ├── /books → BookListing
    ├── /add-book → AddBook
    └── /search → Search
```

## File Organization Rules

### Pages
- Large, complete page components
- Handle data fetching and state
- Connected to routing
- One file per page

**File Structure**:
```javascript
import React, { useState, useEffect } from 'react';
import { /* dependencies */ } from '...';
import '../styles/PageName.css';

const PageName = () => {
  const [state, setState] = useState('');
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div className="page-container">
      {/* Content */}
    </div>
  );
};

export default PageName;
```

### Components
- Small, reusable UI pieces
- Props for configuration
- Can be used in multiple places
- Focused single responsibility

**File Structure**:
```javascript
import React from 'react';
import '../styles/ComponentName.css';

const ComponentName = ({ prop1, prop2, onAction }) => {
  return (
    <div className="component-container">
      {/* Content */}
    </div>
  );
};

export default ComponentName;
```

### Services
- No React component code
- Pure JavaScript functions
- API communication
- Data transformation

**File Structure**:
```javascript
import axios from 'axios';

export const serviceModule = {
  function1: (params) => apiClient.get('...'),
  function2: (data) => apiClient.post('...'),
};
```

## React Patterns Used

### 1. Functional Components with Hooks
All components use modern React Hooks instead of class components.

```javascript
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Run side effects
  }, [dependencies]);
  
  return <div>Content</div>;
};
```

### 2. Custom Hooks (Pattern for Reuse)
For API calls across multiple pages:

```javascript
// Example: useBooks.js
const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch books
  }, []);
  
  return { books, loading };
};
```

### 3. Props Pattern
Components receive configuration through props:

```javascript
// Usage
<StatCard title="Total Books" value={150} icon="📚" color="blue" />

// Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <p>{icon} {title}</p>
    <p>{value}</p>
  </div>
);
```

### 4. Conditional Rendering
Handle different UI states:

```javascript
return (
  <>
    {loading && <div>Loading...</div>}
    {error && <div className="error">{error}</div>}
    {!loading && !error && <div>Content</div>}
  </>
);
```

### 5. Form Handling Pattern
Consistent form handling across all forms:

```javascript
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  // Clear error on change
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  // Submit
};
```

## State Management Pattern

### Local State
Used for component-specific state:
```javascript
const [isOpen, setIsOpen] = useState(false);
```

### Lifting State Up
When multiple components need same state:
```javascript
// In parent
const [selectedBook, setSelectedBook] = useState(null);
<Child book={selectedBook} onSelect={setSelectedBook} />
```

### API Response State
Consistent pattern for API calls:
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await apiCall();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## Error Handling Patterns

### Try-Catch Pattern
```javascript
try {
  const response = await apiService.call();
  setData(response.data);
} catch (error) {
  const message = error.response?.data?.detail || 'An error occurred';
  setError(message);
}
```

### Form Validation Pattern
```javascript
const validateForm = () => {
  const errors = {};
  if (!data.field1) errors.field1 = 'Required';
  if (data.field2.length < 10) errors.field2 = 'Too short';
  return errors;
};
```

### User Feedback Pattern
```javascript
// Loading
{loading && <div className="loading">Loading...</div>}

// Error
{error && <div className="error-message">{error}</div>}

// Success
{success && <div className="success-message">{success}</div>}

// Empty State
{!loading && data.length === 0 && <div>No data found</div>}
```

## CSS Organization

### Global Styles (Global.css)
- CSS variables for colors
- Reset styles
- Common classes

### Component Styles (ComponentName.css)
- One CSS file per component/page
- Scoped class names
- No external dependencies

### Naming Convention
```css
/* Container class */
.page-name-container

/* Element classes */
.page-name-title
.page-name-content

/* Modifier classes */
.status-badge.available
.status-badge.unavailable

/* State classes */
.btn:disabled
.form-input:focus
```

## Navigation Pattern

### Using React Router
```javascript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/path');  // Navigate to path
    navigate(-1);       // Go back
  };
};
```

### Protected Routes
```javascript
<Route
  path="/dashboard"
  element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
/>
```

## API Communication Pattern

### Service Layer
```javascript
// services/api.js
export const bookService = {
  getAllBooks: () => apiClient.get('/books'),
  addBook: (data) => apiClient.post('/books', data),
  deleteBook: (id) => apiClient.delete(`/books/${id}`),
};
```

### Usage in Components
```javascript
import { bookService } from '../services/api';

useEffect(() => {
  const fetchBooks = async () => {
    try {
      const response = await bookService.getAllBooks();
      setBooks(response.data);
    } catch (error) {
      setError('Failed to fetch books');
    }
  };
  fetchBooks();
}, []);
```

## Best Practices Used

### 1. Single Responsibility
Each component does one thing well.

### 2. DRY (Don't Repeat Yourself)
Common logic in services, shared styles in Global.css.

### 3. Consistent Naming
- Components: PascalCase
- Functions/variables: camelCase
- CSS classes: kebab-case

### 4. Error Boundaries (Pattern)
Every async operation has error handling.

### 5. Loading States
Every async operation shows loading state.

### 6. Input Validation
All forms validate before submission.

### 7. Accessibility
- Semantic HTML
- Form labels
- Button types
- ARIA attributes

### 8. Performance
- useEffect dependencies
- Prevent unnecessary re-renders
- Efficient CSS selectors

## Code Examples

### Example 1: Data Fetching Page
```javascript
import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import '../styles/Example.css';

const ExamplePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookService.getAllBooks();
      setBooks(response.data);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="example-container">
      {books.map(book => (
        <div key={book.id} className="book-item">
          {book.title}
        </div>
      ))}
    </div>
  );
};

export default ExamplePage;
```

### Example 2: Form Component
```javascript
import React, { useState } from 'react';
import '../styles/Form.css';

const FormComponent = () => {
  const [data, setData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!data.name) newErrors.name = 'Name is required';
    if (!data.email) newErrors.email = 'Email is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      // Submit
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={data.name}
        onChange={handleChange}
        placeholder="Name"
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};

export default FormComponent;
```

## Testing Patterns

### Manual Testing
1. Test each page individually
2. Test form validation
3. Test API integration
4. Test error states
5. Test responsive design

### Debug Tips
```javascript
// Log state changes
console.log('State updated:', newState);

// Check API response
console.log('API Response:', response.data);

// Monitor render
console.log('Component rendered');
```

## Summary of Patterns

| Pattern | Usage | Location |
|---------|-------|----------|
| Custom Hooks | Reusable logic | services/ or hooks/ |
| Props | Component config | components/ |
| State | Component data | useState |
| Effects | Side effects | useEffect |
| Services | API calls | services/ |
| Protected Routes | Auth check | App.js |
| Error Handling | Try-catch | Every async |
| Validation | Form checks | Form components |
| Conditional Render | UI states | All components |
| Lifting State | Data sharing | Parent-child |

This architecture and these patterns keep the code organized, maintainable, and easy to understand for beginners!
