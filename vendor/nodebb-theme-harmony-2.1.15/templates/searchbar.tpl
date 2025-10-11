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
					<div class="col-md-6">
						<label for="items-per-page" class="form-label small text-muted">Results per page:</label>
						<select id="items-per-page" class="form-select">
							<option value="10">10</option>
							<option value="20" selected>20</option>
							<option value="50">50</option>
						</select>
					</div>
					<div class="col-md-6">
						<label class="form-label small text-muted">Search in posts and topics</label>
						<div class="form-text">Searches through all post content and topic titles</div>
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
document.addEventListener('DOMContentLoaded', function() {
	// Wait for both DOM and jQuery to be ready
	function initializeSearch() {
		if (typeof $ === 'undefined' || typeof app === 'undefined' || typeof config === 'undefined') {
			setTimeout(initializeSearch, 100);
			return;
		}

		const SearchPage = {
			init: function () {
				console.log('Initializing search page...');
				this.bindEvents();
				this.loadSearchHistory();

				// If there's a query in the URL, perform search
				const urlParams = new URLSearchParams(window.location.search);
				const query = urlParams.get('q') || urlParams.get('term');
				if (query) {
					$('#search-input').val(query);
					this.performSearch(query);
				}
			},

			bindEvents: function () {
				console.log('Binding search events...');
				// Search form submission
				$('#search-form').on('submit', (e) => {
					e.preventDefault();
					const query = $('#search-input').val().trim();
					console.log('Form submitted with query:', query);
					if (query) {
						this.performSearch(query);
					} else {
						this.showError('Please enter a search term');
					}
				});

				// Search button click (backup)
				$('#search-button').on('click', (e) => {
					e.preventDefault();
					const query = $('#search-input').val().trim();
					console.log('Button clicked with query:', query);
					if (query) {
						this.performSearch(query);
					} else {
						this.showError('Please enter a search term');
					}
				});

				// Real-time search suggestions (debounced)
				let searchTimeout;
				$('#search-input').on('input', () => {
					clearTimeout(searchTimeout);
					const query = $('#search-input').val().trim();
					if (query.length >= 2) {
						searchTimeout = setTimeout(() => {
							this.getSuggestions(query);
						}, 300);
					}
				});

				// Clear history button
				$('#clear-history-btn').on('click', () => {
					this.clearSearchHistory();
				});

				// Search history click
				$(document).on('click', '.search-history-item', function() {
					const query = $(this).text();
					$('#search-input').val(query);
					SearchPage.performSearch(query);
				});
			},

			performSearch: function (query, page = 1) {
				console.log('Performing search for:', query);
				if (!query || query.trim().length < 2) {
					this.showError('Please enter at least 2 characters to search');
					return;
				}

				this.showLoading();

				const searchData = {
					term: query.trim(),
					page: page,
					itemsPerPage: parseInt($('#items-per-page').val()) || 20,
				};

				console.log('Search data:', searchData);

				$.ajax({
					url: config.relative_path + '/api/searchbar',
					type: 'GET',
					data: searchData,
					success: (response) => {
						console.log('Search response:', response);
						this.hideLoading();
						if (response.success && response.posts !== undefined) {
							this.displayResults(response, searchData);
							this.saveSearchHistory();
						} else {
							this.showError('Search failed: ' + (response.error || 'Unknown error'));
						}
					},
					error: (xhr) => {
						console.error('Search error:', xhr);
						this.hideLoading();
						let errorMessage = 'Search request failed';
						if (xhr.responseJSON && xhr.responseJSON.message) {
							errorMessage = xhr.responseJSON.message;
						}
						this.showError(errorMessage);
					},
				});
			},

			displayResults: function (data, searchData) {
				const posts = data.posts || [];
				const matchCount = data.matchCount || 0;

				console.log('Displaying results:', posts.length, 'posts found');

				// Update results count
				$('#search-results-count').text(matchCount + ' result' + (matchCount !== 1 ? 's' : ''));

				// Clear previous results
				$('#search-results').empty();

				if (posts.length === 0) {
					this.showNoResults();
					return;
				}

				// Show results container
				$('#search-results-container').removeClass('d-none');
				$('#no-results').addClass('d-none');
				$('#search-error').addClass('d-none');

				// Display each result
				posts.forEach((post) => {
					const resultHtml = this.createResultElement(post);
					$('#search-results').append(resultHtml);
				});

				// Scroll to results
				setTimeout(() => {
					if ($('#search-results-container')[0]) {
						$('#search-results-container')[0].scrollIntoView({ 
							behavior: 'smooth',
							block: 'start',
						});
					}
				}, 100);
			},

			createResultElement: function (post) {
				const template = $('#search-result-template').html();
				const $result = $(template);

				// Set values
				$result.find('.result-link')
					.attr('href', post.url || '#')
					.text(post.title || 'Untitled');

				$result.find('.result-content')
					.text(post.content ? (post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '')) : '');

				$result.find('.result-username').text(post.username || 'Unknown');
				$result.find('.result-category').text(post.category || 'General');
				$result.find('.result-timestamp').text(this.formatTimestamp(post.timestamp));

				return $result;
			},

			showLoading: function () {
				$('#search-loading').removeClass('d-none');
				$('#search-results-container').addClass('d-none');
				$('#no-results').addClass('d-none');
				$('#search-error').addClass('d-none');
			},

			hideLoading: function () {
				$('#search-loading').addClass('d-none');
			},

			showNoResults: function () {
				$('#no-results').removeClass('d-none');
				$('#search-results-container').addClass('d-none');
				$('#search-error').addClass('d-none');
			},

			showError: function (message) {
				console.error('Search error:', message);
				$('#search-error-message').text(message);
				$('#search-error').removeClass('d-none');
				$('#search-results-container').addClass('d-none');
				$('#no-results').addClass('d-none');
			},

			saveSearchHistory: function () {
				if (!app.user || !app.user.uid) return;

				// The backend automatically saves search history, so we just reload it
				setTimeout(() => {
					this.loadSearchHistory();
				}, 1000);
			},

			loadSearchHistory: function () {
				if (!app.user || !app.user.uid) return;

				$.ajax({
					url: config.relative_path + '/api/search/history',
					type: 'GET',
					success: (response) => {
						if (response.success && response.data) {
							this.displaySearchHistory(response.data);
						}
					},
					error: () => {
						// Silently fail for history
					},
				});
			},

			displaySearchHistory: function (history) {
				const $container = $('#search-history');
				if (!$container.length) return;
				
				$container.empty();

				if (history.length === 0) {
					$container.append('<span class="text-muted">No recent searches</span>');
					return;
				}

				history.slice(0, 10).forEach((query) => {
					const $item = $('<span>')
						.addClass('badge bg-light text-dark search-history-item me-2 mb-2')
						.text(query)
						.css('cursor', 'pointer');
					$container.append($item);
				});
			},

			clearSearchHistory: function () {
				if (!app.user || !app.user.uid) return;

				$.ajax({
					url: config.relative_path + '/api/search/history',
					type: 'DELETE',
					success: () => {
						this.loadSearchHistory();
						if (app.alertSuccess) {
							app.alertSuccess('Search history cleared');
						}
					},
					error: () => {
						if (app.alertError) {
							app.alertError('Failed to clear search history');
						}
					},
				});
			},

			getSuggestions: function (query) {
				// This could be implemented later if needed
			},

			formatTimestamp: function (timestamp) {
				const date = new Date(timestamp);
				return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
			},
		};

		// Initialize the search page
		try {
			SearchPage.init();
			console.log('Search page initialized successfully');
		} catch (error) {
			console.error('Error initializing search page:', error);
		}
	}

	// Start initialization
	initializeSearch();
});
</script>