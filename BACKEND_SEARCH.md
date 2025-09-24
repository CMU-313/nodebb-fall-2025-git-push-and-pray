Backend Search Implementation

We implemented backend search functionality using NodeBB’s plugin nodebb-plugin-dbsearch.
Installed via:
    npm install nodebb-plugin-dbsearch

Architecture (MVC without View):
    Model: src/searchBar/ – contains business logic and integrates with src/search.js functions.
    Controller: src/controller/searchBarController.js – orchestrates requests between routes and the model.
    Routes: src/routes/searchBar.js – exposes search endpoints to the client.
The model layer contains the core logic. Since NodeBB defaults to Redis as the database, raw SQL queries cannot be used. Instead, we rely on the dbsearch plugin to index and reindex posts. Reindexing occurs each time webserver.js is launched, ensuring both existing and new posts are searchable.

Middleware:

Middleware provides lightweight validation for client requests and API calls. It ensures incoming data is well-formed before it reaches the controller, helping protect the system and streamline error handling.

Role-Based Access Control (RBAC):
    Guests:
        Limited search access: titles, posts, titlesposts, categories
        Restricted from using: tags, users, bookmarks

    Logged-in Users:
        Full search capabilities enabled

Testing:
Search queries can be tested with cURL as follows:

# Example query in titles + posts
curl -s "http://localhost:4567/api/search?query=demo&searchIn=titlesposts&page=1&itemsPerPage=5" | jq

# Example query for 'javascript'
curl -s "http://localhost:4567/api/search?query=javascript&searchIn=titlesposts&page=1&itemsPerPage=5" | jq
