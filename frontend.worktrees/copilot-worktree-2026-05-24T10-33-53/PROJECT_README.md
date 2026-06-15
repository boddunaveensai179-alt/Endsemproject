# Digital Library Management System - Frontend

A beginner-friendly React frontend for a Digital Library Management System with a clean, responsive design using a blue, white, and gray color palette.

## Features

- **Login Page**: User authentication with error handling
- **Dashboard**: Display statistics (Total Books, Available Books, Categories)
- **Book Listing**: View all books in a table format with availability status
- **Add Book Form**: Form validation for adding new books to the library
- **Semantic Search**: Search books using intelligent semantic search
- **Responsive Design**: Works on desktop and mobile devices
- **Clean UI**: Minimal animations with professional styling

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Navbar.js       # Navigation bar with links
├── pages/              # Page components
│   ├── Login.js        # Login page
│   ├── Dashboard.js    # Dashboard with stats
│   ├── BookListing.js  # Books table view
│   ├── AddBook.js      # Add book form
│   └── Search.js       # Semantic search page
├── services/           # API communication
│   └── api.js          # API client and service functions
├── styles/             # CSS files
│   ├── Global.css      # Global styles
│   ├── Navbar.css      # Navbar styles
│   ├── Login.css       # Login page styles
│   ├── Dashboard.css   # Dashboard styles
│   ├── BookListing.css # Book listing styles
│   ├── AddBook.css     # Add book form styles
│   └── Search.css      # Search page styles
├── App.js              # Main app component with routing
├── App.css             # App-level styles
└── index.js            # React entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create a `.env.local` file to configure the API URL:
```
REACT_APP_API_URL=http://localhost:8000
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Building for Production

Create a production build:
```bash
npm run build
```

## How to Use

1. **Login**: Navigate to the login page and enter credentials
   - Demo: You can use any username/password combination for testing

2. **Dashboard**: View library statistics after logging in

3. **Browse Books**: Click "Books" to view all books in the library
   - See title, author, category, and availability status
   - Delete books if needed

4. **Add Books**: Click "Add Book" to add new books
   - Fill in title, author, category, ISBN
   - Mark as available/unavailable
   - Form validates all required fields

5. **Search**: Click "Search" to find books using semantic search
   - Enter keywords related to books you're looking for
   - View matching results with relevance scores

## API Integration

The app communicates with a FastAPI backend. Key endpoints:

- `POST /auth/login` - User authentication
- `GET /books` - Fetch all books
- `POST /books` - Add a new book
- `DELETE /books/{id}` - Delete a book
- `POST /search/semantic` - Semantic search
- `GET /dashboard/stats` - Dashboard statistics

## Technologies Used

- **React 18**: Frontend framework
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Styling

## Styling

The application uses:
- **Color Palette**: Blue (#2c3e50, #3498db), White, Gray (#ecf0f1, #bdc3c7)
- **Fonts**: Segoe UI and system fonts
- **Responsive Design**: Mobile-first approach with CSS media queries
- **No animations**: Simple and clean transitions

## Features for Beginners

- Simple, readable code structure
- Clear component separation
- Basic form validation
- Error handling with user-friendly messages
- Loading states for API calls
- Mock data for testing without backend

## Troubleshooting

### Cannot connect to backend?
- Ensure the FastAPI backend is running on `http://localhost:8000`
- Check the `REACT_APP_API_URL` environment variable
- Use mock data that's provided in the code

### Form validation not working?
- All form fields have built-in validation
- Error messages appear below each field
- Check browser console for detailed errors

### Pages not loading?
- Make sure you're logged in (token stored in localStorage)
- Check network tab in browser DevTools for API errors
- Verify the backend is responding correctly

## Future Enhancements

- Add book editing functionality
- User profile management
- Book ratings and reviews
- Advanced filtering options
- Dark mode support
- Book borrowing system

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to the code comments and React documentation.
