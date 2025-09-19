# Search Bar MVC Testing Guide

This guide provides comprehensive instructions for testing the Search Bar MVC implementation to ensure all endpoints work correctly and return the expected data.

## 🚀 Quick Start Testing

### 1. Automated Test Runner (Recommended)

The easiest way to test all endpoints:

```bash
# Run the automated test suite
node test/runSearchBarTests.js
```

This will test all endpoints and provide a detailed report.

### 2. cURL Testing Script

For command-line testing:

```bash
# Make the script executable (if not already)
chmod +x test/searchBarCurlTests.sh

# Run the cURL tests
./test/searchBarCurlTests.sh
```

### 3. Postman Collection

Import the Postman collection for GUI testing:

1. Open Postman
2. Click "Import"
3. Select `test/SearchBarAPI.postman_collection.json`
4. Update the `base_url` variable to match your server
5. Run the collection

## 🔧 Prerequisites

Before testing, ensure:

1. **NodeBB Server is Running**
   ```bash
   # Check if server is running
   curl http://localhost:4567/api/config
   ```

2. **Redis is Running**
   ```bash
   # Test Redis connection
   redis-cli ping
   # Should return "PONG"
   ```

3. **Search Bar Routes are Registered**
   - Check that the routes are properly loaded in your NodeBB instance
   - Verify the controller is registered in `src/controllers/index.js`

## 📋 Manual Testing Commands

### Basic Search
```bash
curl "http://localhost:4567/api/search?term=javascript&in=titlesposts&page=1"
```

### Advanced Search
```bash
curl -X POST "http://localhost:4567/api/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "nodejs tutorial",
    "searchIn": "posts",
    "categories": ["1"],
    "hasTags": ["javascript"],
    "timeRange": 30,
    "timeFilter": "newer",
    "sortBy": "timestamp"
  }'
```

### Search Suggestions
```bash
curl "http://localhost:4567/api/search/suggestions?q=java"
```

### Quick Search
```bash
curl "http://localhost:4567/api/search/quick?q=javascript&limit=5"
```

### Search History
```bash
curl "http://localhost:4567/api/search/history?limit=10"
```

### Clear Search History
```bash
curl -X DELETE "http://localhost:4567/api/search/history"
```

## ✅ Expected Response Format

All endpoints should return responses in this format:

```json
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
    "query": "search term",
    "searchIn": "titlesposts",
    "filters": {
      "categories": [],
      "postedBy": [],
      "hasTags": [],
      "timeRange": 0,
      "timeFilter": "",
      "replies": 0,
      "repliesFilter": "",
      "sortBy": "relevance",
      "sortDirection": "desc"
    },
    "pagination": {
      "currentPage": 1,
      "pageCount": 3,
      "totalCount": 25,
      "itemsPerPage": 10
    },
    "searchTime": "0.045"
  }
}
```

## 🧪 Test Cases

### 1. Basic Functionality Tests

- ✅ **Basic Search**: Simple search with minimal parameters
- ✅ **Search Suggestions**: Get suggestions for partial queries
- ✅ **Quick Search**: Fast search for autocomplete
- ✅ **Search History**: Retrieve user's search history
- ✅ **Clear History**: Remove user's search history

### 2. Advanced Feature Tests

- ✅ **Filtered Search**: Search with categories, tags, users
- ✅ **Time-based Search**: Search within time ranges
- ✅ **Reply Count Filter**: Filter by number of replies
- ✅ **Sorting Options**: Different sort orders
- ✅ **Pagination**: Multiple pages of results

### 3. Error Handling Tests

- ✅ **Invalid Search Type**: Handle invalid search types gracefully
- ✅ **Empty Queries**: Handle empty or missing queries
- ✅ **Large Page Numbers**: Handle pagination edge cases
- ✅ **Malformed Requests**: Handle invalid JSON or parameters

### 4. Performance Tests

- ✅ **Response Time**: Ensure responses under 5 seconds
- ✅ **Large Result Sets**: Handle large numbers of results
- ✅ **Concurrent Requests**: Multiple simultaneous requests

## 🔍 Debugging Common Issues

### Issue: "Cannot GET /api/search"
**Solution**: Check that routes are properly registered in `src/routes/api.js`

### Issue: "Search failed" errors
**Solution**: 
1. Check Redis connection: `redis-cli ping`
2. Verify database is accessible
3. Check NodeBB logs for errors

### Issue: Empty results
**Solution**:
1. Ensure you have test data in your database
2. Check if search terms match existing content
3. Verify user permissions for search

### Issue: Slow response times
**Solution**:
1. Check Redis performance
2. Optimize database queries
3. Consider adding caching

## 📊 Performance Benchmarks

Expected performance metrics:

- **Basic Search**: < 500ms
- **Advanced Search**: < 1000ms
- **Search Suggestions**: < 200ms
- **Quick Search**: < 300ms
- **Search History**: < 100ms

## 🛠️ Integration Testing

### Test with Frontend

1. **Create a simple HTML page** to test the API:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Search Bar Test</title>
</head>
<body>
    <input type="text" id="searchInput" placeholder="Search...">
    <button onclick="search()">Search</button>
    <div id="results"></div>

    <script>
        async function search() {
            const query = document.getElementById('searchInput').value;
            const response = await fetch(`/api/search?term=${query}&in=titlesposts`);
            const data = await response.json();
            document.getElementById('results').innerHTML = JSON.stringify(data, null, 2);
        }
    </script>
</body>
</html>
```

2. **Test with JavaScript fetch**:
```javascript
// Test basic search
fetch('/api/search?term=javascript&in=titlesposts')
  .then(response => response.json())
  .then(data => console.log(data));

// Test advanced search
fetch('/api/search/advanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'nodejs tutorial',
    searchIn: 'posts',
    categories: ['1']
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 📈 Monitoring and Analytics

### Redis Monitoring

Check search analytics in Redis:

```bash
# View popular searches
redis-cli ZREVRANGE searches:all 0 9 WITHSCORES

# View daily searches
redis-cli ZREVRANGE searches:$(date +%s) 0 9 WITHSCORES

# View user search history
redis-cli ZREVRANGE user:1:searches 0 9
```

### Log Monitoring

Monitor NodeBB logs for search-related errors:

```bash
# Watch logs in real-time
tail -f logs/output.log | grep -i search

# Check for errors
grep -i "search.*error" logs/output.log
```

## 🎯 Success Criteria

Your search bar implementation is working correctly if:

- ✅ All endpoints return HTTP 200 status
- ✅ All responses include `success: true`
- ✅ All responses include a `data` object
- ✅ Search results are returned in expected format
- ✅ Pagination works correctly
- ✅ Filters are applied properly
- ✅ Response times are under 5 seconds
- ✅ Error handling works gracefully
- ✅ Redis integration is functional

## 🚨 Troubleshooting Checklist

If tests fail, check:

1. **Server Status**
   - [ ] NodeBB server is running
   - [ ] Server is accessible on correct port
   - [ ] No firewall blocking requests

2. **Database**
   - [ ] Redis is running
   - [ ] Redis is accessible
   - [ ] Database has test data

3. **Code Integration**
   - [ ] Routes are registered in `src/routes/api.js`
   - [ ] Controller is registered in `src/controllers/index.js`
   - [ ] Model is accessible
   - [ ] No syntax errors in code

4. **Permissions**
   - [ ] User has search permissions
   - [ ] Database access permissions
   - [ ] File system permissions

5. **Configuration**
   - [ ] Base URL is correct
   - [ ] API endpoints are properly configured
   - [ ] Middleware is properly set up

## 📞 Getting Help

If you encounter issues:

1. Check the NodeBB logs for detailed error messages
2. Verify Redis connectivity and data
3. Test with simple curl commands first
4. Use the automated test suite to identify specific failures
5. Check the browser developer tools for network errors

The search bar MVC implementation should provide a robust, scalable solution for search functionality in your NodeBB application!
