
we utilize plugin db-search from NodeBB with nodebb-plugin-dbsearch
- npm install nodebb-plugin-dbsearch


The backend search follows a MVC structure without the implemented View:
 - model: src/searchBar
 - controller: src/controller/searchBarController
 - routes: src/routes/searchBar

Our business logic lies in our model. Where we leverage the given src/search.js file with its functions. 
Since the database defaults to Redis, we cannot use raw SQL queries. Therefore we index via dbsearch plugin to reindex our database, therefore updating both old and new posts. We trigger reindexing everytime nodebb is launched via webserver.js

middleware logic: 
 - we utilize middleware functionality to serve as a basic validation check for client requests and API calls to handle correct data. Combined with our controller logic, we are able to securely validate whether the information being passed can be handled via our script.

RBAC:
 - guests are given basic search access: titles, posts, titlesposts, categories; however they cannot search using tags, users, bookmarks.
 - Logged-in users are given full permission for search


to test if query is working format like this with query=<YOUR INPUT>
: curl -s "http://localhost:4567/api/search?query=demo&searchIn=titlesposts&page=1&itemsPerPage=5" | jq
