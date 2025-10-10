<div class="search-page flex-fill">
	<div class="d-flex flex-column gap-4">
		<!-- Search Header -->
		<div class="d-flex align-items-center gap-3">
			<h1 class="fw-bold mb-0">[[global:search]]</h1>
		</div>

		<!-- Search Form -->
		<div class="search-form bg-light rounded-3 p-4">
			<form id="search-form" class="d-flex flex-column gap-3">
				<div class="row g-3">
					<div class="col-md-8">
						<input 
							id="search-input" 
							type="text" 
							class="form-control form-control-lg" 
							placeholder="Search posts, topics, and more..." 
							value="{query}"
							autocomplete="off"
						>
					</div>
					<div class="col-md-4">
						<button 
							type="submit" 
							class="btn btn-primary btn-lg w-100"
							id="search-button"
						>
							<i class="fa fa-search me-2"></i>[[global:search]]
						</button>
					</div>
				</div>

				<!-- Search Options -->
				<div class="row g-3">
					<div class="col-md-4">
						<label for="search-in" class="form-label small text-muted">Search in:</label>
						<select id="search-in" class="form-select">
							<option value="titlesposts">Titles and Posts</option>
							<option value="titles">Titles Only</option>
							<option value="posts">Posts Only</option>
							<option value="categories">Categories</option>
							{{{if privileges.search:users}}}
							<option value="users">Users</option>
							{{{end}}}
							{{{if privileges.search:tags}}}
							<option value="tags">Tags</option>
							{{{end}}}
							{{{if user.uid}}}
							<option value="bookmarks">My Bookmarks</option>
							{{{end}}}
						</select>
					</div>
					<div class="col-md-4">
						<label for="items-per-page" class="form-label small text-muted">Results per page:</label>
						<select id="items-per-page" class="form-select">
							<option value="10">10</option>
							<option value="20" selected>20</option>
							<option value="50">50</option>
						</select>
					</div>
					<div class="col-md-4">
						<label for="sort-by" class="form-label small text-muted">Sort by:</label>
						<select id="sort-by" class="form-select">
							<option value="relevance">Relevance</option>
							<option value="timestamp">Most Recent</option>
							<option value="votes">Most Votes</option>
						</select>
					</div>
				</div>
			</form>
		</div>

		<!-- Loading State -->
		<div id="search-loading" class="text-center py-4 d-none">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Searching...</span>
			</div>
			<p class="mt-2 text-muted">Searching...</p>
		</div>

		<!-- Search Results -->
		<div id="search-results-container" class="d-none">
			<!-- Results Header -->
			<div id="search-results-header" class="d-flex justify-content-between align-items-center mb-3">
				<h3 class="mb-0">Search Results</h3>
				<span id="search-results-count" class="badge bg-primary"></span>
			</div>

			<!-- Results List -->
			<div id="search-results" class="d-flex flex-column gap-3">
				<!-- Results will be inserted here dynamically -->
			</div>

			<!-- Pagination -->
			<nav id="search-pagination" class="mt-4 d-none">
				<ul class="pagination justify-content-center">
					<!-- Pagination will be inserted here dynamically -->
				</ul>
			</nav>
		</div>

		<!-- No Results -->
		<div id="no-results" class="text-center py-5 d-none">
			<i class="fa fa-search text-muted" style="font-size: 3rem;"></i>
			<h4 class="mt-3 text-muted">No results found</h4>
			<p class="text-muted">Try adjusting your search terms or filters.</p>
		</div>

		<!-- Error State -->
		<div id="search-error" class="alert alert-danger d-none">
			<i class="fa fa-exclamation-triangle me-2"></i>
			<span id="search-error-message">An error occurred while searching.</span>
		</div>

		<!-- Search History (for logged-in users) -->
		{{{if user.uid}}}
		<div id="search-history-container" class="mt-5">
			<div class="d-flex justify-content-between align-items-center mb-3">
				<h4 class="mb-0">Recent Searches</h4>
				<button id="clear-history-btn" class="btn btn-outline-secondary btn-sm">
					<i class="fa fa-trash me-1"></i>Clear History
				</button>
			</div>
			<div id="search-history" class="d-flex flex-wrap gap-2">
				<!-- Search history will be loaded here -->
			</div>
		</div>
		{{{end}}}
	</div>
</div>

<!-- Result Template (hidden) -->
<template id="search-result-template">
	<div class="search-result bg-white border rounded-3 p-3">
		<div class="d-flex justify-content-between align-items-start mb-2">
			<h5 class="mb-0">
				<a href="#" class="result-link text-decoration-none"></a>
			</h5>
			<span class="result-category badge bg-secondary"></span>
		</div>
		<div class="result-content text-muted mb-2"></div>
		<div class="d-flex justify-content-between align-items-center text-sm">
			<span class="result-author text-muted">
				by <strong class="result-username"></strong>
			</span>
			<span class="result-timestamp text-muted"></span>
		</div>
	</div>
</template>

<script>
	require(['client/searchbar'], function (searchbar) {
		// searchbar module loaded
	});
</script>