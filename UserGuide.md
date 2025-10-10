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

**Anonymous Posting Backend & Frontend**
Usage

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

  --Backend hooks for topic and topics rendering.

  --Client-side display masking.

  --Edge cases for anonymous vs. non-anonymous posts.

Ensures front-end and back-end alignment: masked posts appear correctly in the UI.

Confirms data integrity: original post fields are not corrupted, non-anonymous posts remain visible.

**How to Run Tests**

Automated:

# Run mocha test suite with coverage
npx nyc --reporter=text --check-coverage --lines 100 mocha test/anonymousbox.js


Manual Testing:

# Compose an anonymous post via API
curl -X POST "http://127.0.0.1:4567/api/post" \
  -d '{"content":"Test anonymous post","anonymous":true}' \
  -b cookies.txt

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

4. Repeat without checking the box to ensure normal posts are unaffected.

**Why this is sufficient:**

These steps cover the critical functionality of the feature: proper masking of user information.

We verified both anonymous and non-anonymous replies, confirming correct behavior in all expected scenarios.

The feature is only available when replying, so testing in this context ensures proper usage conditions.

Note:

Frontend automated tests can be added in the future using Jest + Puppeteer or Cypress for end-to-end UI testing.