# Searchbar Backend

This document summarizes the backend work completed to implement a dedicated **searchbar** feature in NodeBB.

---

##  Controller

**File:** `controllers/searchbarController.js`

- Implements a **lightweight search** for posts/topics only.  
- **Guests**: limited access (`titles`, `posts`, `titlesposts`).  
- **Logged-in users**: full post search with extra metadata.  
- **Response fields**:  
  - `posts[]` (hydrated with topic, category, and user info)  
  - `matchCount`  
  - `pageCount`  
  - `searchTime`  

---

##  API Route

**File:** `routes/api.js`

Added route:

```js
- router.get('/searchbar', searchbarController.search);

##  OpenAI YAML:

- read/searchbar.yaml → defines schema for /api/searchbar.  
- Request params: term, page, itemsPerPage.
- Response fields: posts, matchCount, pageCount, searchTime.
- openapi.yaml updated to reference /api/searchbar.

##  Testing
Curl Examples:

# Guest search
curl "http://127.0.0.1:4567/api/searchbar?term=demo"

# Logged-in search (with cookie)
curl -b cookies.txt "http://127.0.0.1:4567/api/searchbar?term=demo&page=1&itemsPerPage=5"

npm Test Results
 - All schema tests now pass with /api/searchbar defined.
 - npm test confirms the new endpoint integrates without regressions.
