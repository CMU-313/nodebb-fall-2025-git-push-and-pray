# Custom Search Backend for NodeBB

This implementation provides a flexible search backend for NodeBB that supports both PostgreSQL and MongoDB databases. The search functionality is based on SQL LIKE pattern matching logic.

## Features

- **Database Agnostic**: Supports both PostgreSQL and MongoDB
- **SQL LIKE Pattern Matching**: Implements case-insensitive search with wildcard support
- **Input Validation**: Comprehensive validation and sanitization to prevent SQL injection
- **Pagination**: Built-in pagination support
- **Multiple Search Types**: Generic search, company search, user search, post search
- **Suggestions**: Autocomplete/suggestion functionality
- **Advanced Search**: Multi-criteria search capabilities
- **API Endpoints**: RESTful API for frontend integration

## Files Created

- `src/custom-search.js` - Core search functionality
- `src/api/custom-search.js` - API endpoints
- `src/controllers/custom-search.js` - Web controllers
- `src/routes/custom-search.js` - Route definitions
- `test/custom-search.js` - Test suite and examples

## SQL Query Logic

The search is based on your original SQL query pattern:

```sql
SELECT * 
FROM company_daily_stock_price
WHERE (LOWER(ticker) LIKE CONCAT('%',LOWER('AAPL'),'%'));
```

This translates to our implementation as:

```javascript
const searchQuery = `
    SELECT * 
    FROM "${table}"
    WHERE LOWER("${column}") LIKE LOWER($1)
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $2 OFFSET $3
`;
```

## Usage Examples

### 1. Generic Search

```javascript
const customSearch = require('./src/custom-search');

const results = await customSearch.search({
    query: 'AAPL',
    table: 'company_daily_stock_price',
    column: 'ticker',
    limit: 20,
    offset: 0,
    sortBy: 'ticker',
    sortDirection: 'ASC'
});
```

### 2. Company Search (Specific Implementation)

```javascript
const results = await customSearch.searchCompanies({
    ticker: 'AAPL',
    limit: 10,
    offset: 0
});
```

### 3. User Search

```javascript
const results = await customSearch.searchUsers({
    username: 'john',
    limit: 20,
    offset: 0
});
```

### 4. Get Suggestions

```javascript
const suggestions = await customSearch.getSuggestions({
    query: 'aa',
    table: 'company_daily_stock_price',
    column: 'ticker',
    limit: 5
});
```

## API Endpoints

### Generic Search
```
POST /api/v3/custom-search
Content-Type: application/json

{
    "query": "AAPL",
    "table": "company_daily_stock_price",
    "column": "ticker",
    "limit": 20,
    "offset": 0,
    "sortBy": "ticker",
    "sortDirection": "ASC"
}
```

### Company Search
```
GET /api/v3/custom-search/companies?ticker=AAPL&limit=10&offset=0
```

### User Search
```
GET /api/v3/custom-search/users?username=john&limit=10&offset=0
```

### Post Search
```
GET /api/v3/custom-search/posts?content=javascript&limit=10&offset=0
```

### Suggestions
```
GET /api/v3/custom-search/suggestions?query=aa&table=company_daily_stock_price&column=ticker&limit=5
```

### Advanced Search
```
POST /api/v3/custom-search/advanced
Content-Type: application/json

{
    "queries": ["AAPL", "MSFT"],
    "table": "company_daily_stock_price",
    "columns": ["ticker", "company_name"],
    "limit": 20,
    "offset": 0,
    "sortBy": "ticker",
    "sortDirection": "ASC"
}
```

## Web Pages

- `GET /custom-search` - Generic search page
- `GET /custom-search/companies` - Company search page
- `GET /custom-search/users` - User search page

## Response Format

All API endpoints return data in this format:

```json
{
    "results": [...],
    "totalCount": 150,
    "hasMore": true,
    "searchTime": "0.045",
    "query": "AAPL",
    "table": "company_daily_stock_price",
    "column": "ticker"
}
```

## Security Features

- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries and input validation
- **Authentication**: All endpoints require authentication
- **Rate Limiting**: Built-in pagination limits
- **Error Handling**: Comprehensive error handling and logging

## Database Support

### PostgreSQL
- Uses parameterized queries with `$1`, `$2`, etc.
- Supports `LOWER()` function for case-insensitive search
- Uses `LIKE` with `%` wildcards

### MongoDB
- Uses regex patterns for case-insensitive search
- Supports `$regex` operator
- Uses collection.find() with proper filtering

## Testing

Run the test suite:

```bash
npm test test/custom-search.js
```

Or run the demonstration:

```bash
node test/custom-search.js
```

## Integration with NodeBB

To integrate this with your NodeBB installation:

1. **Add Routes**: Include the routes in your main routing configuration
2. **Add Templates**: Create corresponding template files for the web pages
3. **Configure Database**: Ensure your database tables exist
4. **Set Permissions**: Configure user permissions for search access

## Example Frontend Integration

```javascript
// AJAX search example
async function searchCompanies(ticker) {
    try {
        const response = await fetch(`/api/v3/custom-search/companies?ticker=${ticker}&limit=10`);
        const data = await response.json();
        
        if (data.results) {
            console.log(`Found ${data.totalCount} companies`);
            return data.results;
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Autocomplete example
async function getSuggestions(query) {
    try {
        const response = await fetch(`/api/v3/custom-search/suggestions?query=${query}&table=company_daily_stock_price&column=ticker&limit=5`);
        const data = await response.json();
        
        return data.suggestions || [];
    } catch (error) {
        console.error('Suggestions error:', error);
        return [];
    }
}
```

## Performance Considerations

- **Indexing**: Ensure proper database indexes on search columns
- **Pagination**: Use pagination to limit result sets
- **Caching**: Consider implementing result caching for frequently searched terms
- **Query Optimization**: Monitor query performance and optimize as needed

## Error Handling

The search function handles various error scenarios:

- Invalid input parameters
- Database connection errors
- Table/column not found errors
- Permission errors
- Query timeout errors

All errors are logged and return appropriate HTTP status codes and error messages.
