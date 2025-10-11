# User Guide – Sprint 2 Deliverables

This guide explains how to use and test the new features delivered in **Sprint 2**:  
- **Searchbar (Frontend & Backend)**  
- **Anonymous Posting (Frontend & Backend)**  

Each section includes usage instruAnonymous posts mask the author's identity:
- Username, displayname, fullname, and userslug ar1. Navigate to the post composer when replying to a discussion post (the Anonymous option is only available in replies)

2. Check the "Anonymous" swipe box when creating a new reply Submit the post and verify the following:
   - The post appears with the username displayed as "Anonymous"
   - The display name, full name, and user avatar are hidden
   - Anonymous posts include the anonymous-post CSS class and the data-anonymous="true" attribute in the DOMed with "Anonymous"
- Profile picture is hidden
- anonymousClass and anonymousDataAttr are added for front-end styling and client-side handling

Non-anonymous posts are unaffected.

**Parameters / Inputs:**
- `anonymous` (boolean) – true to post anonymously, false otherwisecoverage, and links to automated tests.

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

---

## Searchbar Frontend

### Usage
The searchbar frontend provides a dedicated search interface accessible through the navigation sidebar, offering enhanced search capabilities for finding posts across the forum.

**User Interface:**
- **Access Point:** Click "Search Posts" in the left navigation sidebar (user-circle icon)
- **Search Page:** Dedicated `/searchbar` route with clean, focused interface
- **Real-time Search:** AJAX-powered search without page reloads
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices
- **Loading States:** Visual feedback during search operations

**Key Features:**
- **Instant Search Results:** Real-time search as you type with debouncing
- **Rich Post Display:** Shows post content, author, category, and timestamps
- **Pagination:** Navigate through large result sets efficiently
- **Empty State Handling:** Clear messaging when no results found
- **Error Handling:** Graceful degradation when search fails
- **Theme Integration:** Seamlessly integrated with Harmony theme styling

### How to Use

**Basic Search:**
1. **Navigate to Search:** Click "Search Posts" in the left sidebar navigation
2. **Enter Search Term:** Type your keyword(s) in the search input field
3. **View Results:** Results appear automatically as you type (after 300ms delay)
4. **Browse Results:** Scroll through paginated results showing post content, author, and metadata
5. **Navigate to Post:** Click "View Post" button to go directly to the full post

**Advanced Features:**
- **Search Filters:** Use the search input to find posts by content, title, or keywords
- **Pagination Controls:** Use "Previous" and "Next" buttons to navigate large result sets
- **Loading Indicators:** Visual spinners show when search is in progress
- **Empty States:** Clear messaging when search returns no results

### User Testing Steps

**Test Case 1: Basic Search Functionality**
1. Navigate to the homepage and ensure you're logged in
2. Click "Search Posts" in the left sidebar navigation
3. Enter a common word like "welcome" or "test" in the search field
4. Wait for results to load (should be < 1 second)
5. **Expected:** Search results appear showing relevant posts with content snippets, author names, and timestamps

**Test Case 2: Empty Search Results**
1. Access the search page as in Test Case 1
2. Enter a very specific term unlikely to exist (e.g., "xyznonexistentterm123")
3. Wait for search to complete
4. **Expected:** "No posts found" message displays with suggestion to try different terms

**Test Case 3: Pagination Testing**
1. Search for a common term that returns many results (e.g., "the")
2. Verify initial results show (up to 10 posts per page)
3. Click "Next" button at bottom of results
4. Verify new set of results loads on page 2
5. Click "Previous" to return to page 1
6. **Expected:** Pagination works smoothly with correct result counts and navigation

**Test Case 4: Search Input Validation**
1. Access the search page
2. Enter a single character (e.g., "a")
3. Verify search doesn't trigger immediately
4. Enter 2+ characters
5. **Expected:** Search only triggers with meaningful input (2+ characters)

**Test Case 5: Real-time Search (Debouncing)**
1. Access the search page
2. Type quickly: "hello world"
3. Observe search behavior - should not search after each keystroke
4. Stop typing and wait 300ms
5. **Expected:** Search triggers only after you stop typing, not on every keystroke

**Test Case 6: Mobile/Responsive Testing**
1. Access search page on mobile device or narrow browser window
2. Verify search input is accessible and properly sized
3. Confirm results display correctly on smaller screens
4. Test pagination controls work on touch devices
5. **Expected:** Full functionality maintained across all screen sizes

**Test Case 7: Error Handling**
1. Access search page
2. Disconnect internet connection (or use browser dev tools to simulate network failure)
3. Attempt to search
4. **Expected:** Error message displays gracefully without breaking the interface

**Test Case 8: Navigation Integration**
1. From search results, click "View Post" on any result
2. Verify it navigates to the correct post/topic
3. Use browser back button to return to search
4. **Expected:** Seamless navigation between search and content, search state preserved

### Frontend Implementation Details

**Files Created/Modified:**
- **Template:** `vendor/nodebb-theme-harmony-2.1.15/templates/searchbar.tpl` - Main search page template with embedded JavaScript
- **Styling:** `vendor/nodebb-theme-harmony-2.1.15/scss/search.scss` - Responsive styling for search interface
- **Controller:** `src/controllers/searchbar-page.js` - Page controller for rendering search interface
- **Navigation:** `vendor/nodebb-theme-harmony-2.1.15/templates/partials/sidebar-left.tpl` - Added search link to sidebar
- **Theme Config:** `vendor/nodebb-theme-harmony-2.1.15/plugin.json` - Registered templates and modules

**Technical Architecture:**
- **AJAX Communication:** Uses jQuery for API calls to `/api/searchbar` endpoint
- **Responsive Design:** Mobile-first CSS with Bootstrap integration
- **Template Integration:** Embedded JavaScript in template for optimal performance
- **Error Handling:** Comprehensive error states with user-friendly messaging
- **Performance Optimization:** Debounced search (300ms delay) to reduce API calls

### Automated Tests – Searchbar Frontend
- **File:** `test/searchbar-frontend.js`
- **Location:** `/test/searchbar-frontend.js` in repository root
- **GitHub Link:** Available in repository test directory

**What's tested:**

**Template Validation:**
- **File Existence:** Confirms `searchbar.tpl` template exists in Harmony theme directory
- **Template Structure:** Validates template contains required elements (search form, results container, pagination)
- **JavaScript Integration:** Ensures embedded JavaScript is properly included and syntactically valid
- **Styling Verification:** Confirms `search.scss` stylesheet exists and is properly linked

**Controller Testing:**
- **File Existence:** Validates `searchbar-page.js` controller exists
- **Function Exports:** Confirms controller exports required `searchbar` function
- **Route Integration:** Verifies search routes are properly configured
- **Error Handling:** Tests controller error handling and fallback behaviors

**Plugin Integration:**
- **Theme Configuration:** Validates `plugin.json` includes templates configuration
- **Module Registration:** Confirms search modules are properly registered
- **Navigation Integration:** Tests sidebar navigation includes search link
- **Asset Loading:** Verifies required CSS and JavaScript assets are loaded

**Integration Testing:**
- **API Connectivity:** Tests frontend can communicate with `/api/searchbar` backend
- **Data Flow:** Validates search requests and response handling
- **Error States:** Tests behavior when backend is unavailable or returns errors
- **User Experience:** Validates loading states, empty results, and success scenarios

**Why Frontend Tests Are Sufficient:**

The frontend test suite provides comprehensive coverage through:

1. **Static Analysis:** Validates all required files exist and have correct structure
2. **Integration Testing:** Confirms frontend-backend communication works correctly
3. **User Experience Testing:** Ensures proper handling of all user interaction scenarios
4. **Cross-platform Validation:** Tests responsive design and mobile compatibility
5. **Error Resilience:** Validates graceful degradation when things go wrong

**Combined with Manual Testing:** The automated tests focus on technical integration while the manual test cases cover user experience scenarios. Together, they ensure:
- Technical functionality works correctly
- User interface is intuitive and responsive
- Edge cases are handled gracefully
- Performance is acceptable across devices
- Integration with existing NodeBB features is seamless

**How to run tests (Automated):**
```bash
# Run the frontend test suite
npm test test/searchbar-frontend.js

# Run with coverage reporting
npx nyc mocha test/searchbar-frontend.js
```

**How to run tests (Manual):**
Follow the User Testing Steps outlined above to verify all functionality works as expected in a real browser environment.

The combination of automated technical validation and comprehensive manual testing ensures the searchbar frontend feature is robust, user-friendly, and ready for production use.

---

## Anonymous Posting Backend & Frontend

### Usage

Feature: Anonymous posts

Backend Hook: filter:render.topic / filter:render.topics

Frontend: Checkbox in composer toolbar labeled "Anonymous"

**How it works:**

Users can mark a post as anonymous by checking the Anonymous checkbox when composing a post.

Anonymous posts mask the author’s identity:

  --username, displayname, fullname, and userslug are replaced with "Anonymous".

  --Profile picture is hidden.

  --anonymousClass and anonymousDataAttr are added for front-end styling and client-side handling.

Non-anonymous posts are unaffected.

**Parameters / Inputs:**

anonymous (boolean) – true to post anonymously, false otherwise.

Automated Tests – Anonymous Posting

File: test/anonymousbox.js

Plugin Location: nodebb-plugin-anonymous-checkbox

Link / PR: Pull request / repo link

**What’s tested:**

filterRenderTopics / filterRenderTopic

  --Confirms anonymous posts are masked in topic lists and single topics.

  --Validates that anonymousClass and anonymousDataAttr are correctly applied to anonymous posts.

  --Ensures non-anonymous posts remain unchanged.

maskDisplay / Client-Side Masking

  --Simulates front-end masking of posts.

  --Checks that all user fields are correctly replaced or removed for anonymous posts.

  --Verifies CSS class and data attributes for UI consistency.

Edge Cases

  --Anonymous = false posts are not modified.

  --Validates that isAnonymousDisplay flag is correctly set.

**Why sufficient:**

Covers all functional branches of the anonymous post feature:
- Backend hooks for topic and topics rendering
- Client-side display masking
- Edge cases for anonymous vs. non-anonymous posts

Ensures front-end and back-end alignment: masked posts appear correctly in the UI.

Confirms data integrity: original post fields are not corrupted, non-anonymous posts remain visible.

**How to Run Tests**

**Automated:**
```bash
# Run mocha test suite with coverage
npx nyc --reporter=text --check-coverage --lines 100 mocha test/anonymousbox.js
```

**Manual Testing:**
```bash
# Compose an anonymous post via API
curl -X POST "http://127.0.0.1:4567/api/post" \
  -d '{"content":"Test anonymous post","anonymous":true}' \
  -b cookies.txt
```

**Outcome:**
These tests ensure 100% coverage of the anonymous posting feature across all expected scenarios: anonymous, non-anonymous, and UI masking. They verify both correct data transformation and front-end presentation, making the feature reliable and predictable.


**Automated / Manual Tests – Anonymous Posting (Frontend)**

Since the frontend feature (Anonymous Posting UI) does not yet have automated tests, we performed manual verification to ensure the feature works as expected.

**How we tested manually:**

1. Navigate to the post composer when replying to a discussion post (the Anonymous option is only available in replies).

2. Check the “Anonymous” swipe box when creating a new reply.

3. Submit the post and verify the following:

  --The post appears with the username displayed as “Anonymous”.

  --The display name, full name, and user avatar are hidden.

  --Anonymous posts include the anonymous-post CSS class and the data-anonymous="true" attribute in the DOM.

4. Repeat without checking the box to ensure normal posts are unaffected

**Why this is sufficient:**

These steps cover the critical functionality of the feature: proper masking of user information.

We verified both anonymous and non-anonymous replies, confirming correct behavior in all expected scenarios.

The feature is only available when replying, so testing in this context ensures proper usage conditions.

**Note:**

Frontend automated tests can be added in the future using Jest + Puppeteer or Cypress for end-to-end UI testing.