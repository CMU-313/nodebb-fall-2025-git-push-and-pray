# Search Bar MVC Implementation

This document describes the MVC (Model-View-Controller) implementation for the search bar functionality in the NodeBB application.

## Overview

The Search Bar MVC implementation provides a clean, structured approach to handling search functionality with Redis database integration. It consists of three main components:

- **Model** (`src/models/searchBar.js`): Handles business logic and data processing
- **Controller** (`src/controllers/searchBar.js`): Manages HTTP requests and responses
- **Routes** (`src/routes/api/searchBar.js`): Defines API endpoints

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Controller    │    │     Model       │
│   (Client)      │───▶│  searchBar.js   │───▶│  searchBar.js   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   API Routes    │    │   Redis DB       │
                       │ searchBar.js    │    │   Integration    │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## Components

### 1. Model (`src/models/searchBar.js`)

The model handles all business logic for search functionality:

#### Key Functions:
- `createSearchFilters(queryData)`: Creates structured filters from raw input
- `searchPosts(filters)`: Performs search with structured filters
- `getSearchSuggestions(query, uid)`: Provides search suggestions
- `validateFilters(filters)`: Validates and sanitizes search parameters

#### Features:
- Input validation and sanitization
- Support for multiple search types (posts, users, categories, tags)
- Advanced filtering (time range, replies, tags, categories)
- Sorting options (relevance, timestamp, votes, etc.)
- Pagination support
- Redis database integration

### 2. Controller (`src/controllers/searchBar.js`)

The controller handles HTTP requests and returns JSON responses:

#### API Endpoints:
- `GET /api/search`: Main search endpoint
- `GET /api/search/suggestions`: Search suggestions
- `POST /api/search/advanced`: Advanced search with filters
- `GET /api/search/quick`: Quick search for autocomplete
- `GET /api/search/history`: User search history
- `DELETE /api/search/history`: Clear search history

#### Features:
- JSON response format
- Error handling and validation
- User privilege checking
- Search analytics recording
- Consistent API structure

### 3. Routes (`src/routes/api/searchBar.js`)

Defines the API routes and middleware:

#### Route Structure:
```javascript
// Main search endpoint
GET /api/search

// Search suggestions
GET /api/search/suggestions

// Advanced search
POST /api/search/advanced

// Quick search
GET /api/search/quick

// Search history
GET /api/search/history
DELETE /api/search/history
```

## Redis Database Integration

The implementation uses Redis for:

### Data Storage:
- Search analytics (`searches:all`)
- Daily search data (`searches:{timestamp}`)
- User search history (`user:{uid}:searches`)
- Popular searches tracking

### Operations:
- `sortedSetIncrBy()`: Increment search counts
- `sortedSetAdd()`: Add to user history
- `getSortedSetRevRange()`: Retrieve search data
- `delete()`: Clear user history

## API Usage Examples

### Basic Search
```javascript
GET /api/search?term=javascript&in=titlesposts&page=1

Response:
{
  "success": true,
  "data": {
    "results": {
      "posts": [...],
      "totalCount": 25,
      "pageCount": 3,
      "currentPage": 1,
      "itemsPerPage": 10
    },
    "query": "javascript",
    "searchIn": "titlesposts",
    "pagination": {...},
    "searchTime": "0.045"
  }
}
```

### Advanced Search
```javascript
POST /api/search/advanced
Content-Type: application/json

{
  "query": "nodejs tutorial",
  "searchIn": "posts",
  "categories": ["1", "2"],
  "hasTags": ["javascript"],
  "timeRange": 7,
  "timeFilter": "newer",
  "sortBy": "timestamp",
  "page": 1,
  "itemsPerPage": 20
}
```

### Search Suggestions
```javascript
GET /api/search/suggestions?q=java

Response:
{
  "success": true,
  "data": {
    "suggestions": {
      "recent": ["javascript", "java tutorial"],
      "popular": ["java", "javascript", "nodejs"],
      "users": [...],
      "categories": [...]
    }
  }
}
```

## Search Types

The implementation supports multiple search types:

1. **Posts** (`posts`): Search in post content
2. **Titles** (`titles`): Search in topic titles
3. **Titles + Posts** (`titlesposts`): Search in both titles and content
4. **Users** (`users`): Search for users
5. **Categories** (`categories`): Search for categories
6. **Tags** (`tags`): Search for tags
7. **Bookmarks** (`bookmarks`): Search in user bookmarks

## Filtering Options

### Time Filters:
- `timeRange`: Time range in days
- `timeFilter`: "newer" or "older"

### Reply Filters:
- `replies`: Minimum/maximum reply count
- `repliesFilter`: "atleast" or "atmost"

### Content Filters:
- `categories`: Array of category IDs
- `postedBy`: Array of usernames
- `hasTags`: Array of required tags
- `matchWords`: "all" or "any"

### Sorting Options:
- `sortBy`: "relevance", "timestamp", "votes", "postcount", "title"
- `sortDirection`: "asc" or "desc"

## Error Handling

The implementation includes comprehensive error handling:

### Error Types:
- `INSUFFICIENT_PRIVILEGES`: User lacks search permissions
- `SEARCH_ERROR`: General search failure
- `SUGGESTIONS_ERROR`: Suggestions retrieval failure
- `ADVANCED_SEARCH_ERROR`: Advanced search failure
- `QUICK_SEARCH_ERROR`: Quick search failure
- `SEARCH_HISTORY_ERROR`: History retrieval failure
- `CLEAR_HISTORY_ERROR`: History clearing failure

### Error Response Format:
```javascript
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

## Security Features

- Input validation and sanitization
- User privilege checking
- CSRF protection (via middleware)
- SQL injection prevention
- XSS protection through input escaping

## Performance Considerations

- Redis caching for search analytics
- Pagination to limit result sets
- Efficient database queries
- Search time tracking
- Result limiting (max 100 items per page)

## Testing

Run the example usage file to test the implementation:

```bash
node src/examples/searchBarUsage.js
```

## Integration with Existing NodeBB

The Search Bar MVC implementation integrates seamlessly with the existing NodeBB architecture:

- Uses existing database modules (`src/database/redis.js`)
- Leverages existing privilege system (`src/privileges`)
- Follows NodeBB coding patterns and conventions
- Compatible with existing search functionality
- Extends the current API structure

## Future Enhancements

Potential improvements for the search bar implementation:

1. **Full-text Search**: Integration with Elasticsearch or similar
2. **Search Analytics**: Advanced analytics dashboard
3. **Search Caching**: Redis-based result caching
4. **Auto-complete**: Real-time search suggestions
5. **Search Filters UI**: Frontend filter interface
6. **Search Export**: Export search results
7. **Search Alerts**: Notify users of new matching content

## Conclusion

The Search Bar MVC implementation provides a robust, scalable, and maintainable solution for search functionality in NodeBB. It follows best practices for MVC architecture, includes comprehensive error handling, and integrates seamlessly with the existing Redis database infrastructure.
