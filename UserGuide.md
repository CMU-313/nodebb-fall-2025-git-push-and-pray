# User Guide – Sprint 2 Deliverables

This guide explains how to use and test the new features delivered in **Sprint 2**:  
- **Searchbar (Frontend & Backend)**  
- **Anonymous Posting (Frontend & Backend)**  

Each section includes usage instructions, test coverage, and links to automated tests.

---

## Searchbar Backend

### Usage
- **Route:** `GET /api/searchbar`  
- **Params:**  
  - `term` *(required)*: keyword(s) to search  
  - `page` *(optional)*: pagination page (default 1)  
  - `itemsPerPage` *(optional)*: items per page (default 10)  


### Automated Tests – Searchbar Backend
- **File:** `test/searchbar-backend.js`
- **Links** (https://github.com/CMU-313/nodebb-fall-2025-git-push-and-pray/pull/45)

**What’s tested:**
- **Empty/missing terms** – ensures requests with no `term` or too-short terms return empty results.  
- **Empty/null DB responses** – covers cases where no posts exist or DB returns `null`.  
- **Matching posts + pagination** – validates keyword matching, page slicing, and correct `matchCount`/`pageCount`.  
- **Hydration of related fields** – confirms topics, categories, and users are correctly included in results.  
- **Fallback URLs** – ensures URLs are generated from `tid` when `pid` is missing.  
- **HTML stripping vs. sourceContent** – verifies safe content display while preserving original HTML.  
- **Null content handling** – covers posts with missing fields (pid, tid, title, etc.) and still returns valid JSON.  
- **Error path (500)** – tests behavior when DB throws (returns structured error payload with `success: false`).  

**Why sufficient:**  
This suite covers **all functional branches** of the controller:  
- Success paths (normal search with results).  
- Edge cases (null/empty DB, missing fields).  
- Defensive paths (invalid input, errors thrown).  
- Guest vs. logged-in usage scenarios.  
- Compliance with the **OpenAPI schema** (`/api/searchbar` request/response contract).  

**How to run tests (Automated):**  
```bash
# Run mocha test suite with coverage
npx nyc --reporter=text --check-coverage --lines 100 mocha test/searchbar-backend.js
```
**How to run tests (Manual):**  
```bash
# Guest search
curl "http://127.0.0.1:4567/api/searchbar?term=demo"

# Logged-in search (with cookies)
curl -b cookies.txt "http://127.0.0.1:4567/api/searchbar?term=demo&page=1&itemsPerPage=5"
```

With these tests, we achieve **100% statement, branch, function, and line coverage** and ensure the feature works reliably across all expected scenarios.


