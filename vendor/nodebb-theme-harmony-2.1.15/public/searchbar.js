'use strict';

$(document).ready(function () {
	const SearchPage = {
		init: function () {
			this.bindEvents();
			this.loadSearchHistory();
			
			// If there's a query parameter, perform search immediately
			const urlParams = new URLSearchParams(window.location.search);
			const query = urlParams.get('q');
			if (query) {
				$('#search-input').val(query);
				this.performSearch();
			}
		},

		bindEvents: function () {
			// Search form submission
			$('#search-form').on('submit', (e) => {
				e.preventDefault();
				this.performSearch();
			});

			// Real-time search suggestions (debounced)
			let searchTimeout;
			$('#search-input').on('input', function () {
				clearTimeout(searchTimeout);
				const query = $(this).val().trim();
				
				if (query.length >= 2) {
					searchTimeout = setTimeout(() => {
						SearchPage.showSuggestions(query);
					}, 300);
				} else {
					SearchPage.hideSuggestions();
				}
			});

			// Clear search history
			$('#clear-history-btn').on('click', () => {
				this.clearSearchHistory();
			});

			// Handle pagination clicks
			$(document).on('click', '.search-pagination a', (e) => {
				e.preventDefault();
				const page = $(e.target).data('page');
				if (page) {
					this.performSearch(page);
				}
			});

			// Handle search history clicks
			$(document).on('click', '.search-history-item', function (e) {
				e.preventDefault();
				const query = $(this).text();
				$('#search-input').val(query);
				SearchPage.performSearch();
			});
		},

		performSearch: function (page = 1) {
			const query = $('#search-input').val().trim();
			
			if (!query) {
				app.alertError('Please enter a search query');
				return;
			}

			const searchData = {
				query: query,
				searchIn: $('#search-in').val() || 'titlesposts',
				page: page,
				itemsPerPage: parseInt($('#items-per-page').val()) || 20,
				sortBy: $('#sort-by').val() || 'relevance',
			};

			this.showLoading();
			this.hideResults();
			this.hideError();

			// Update URL with search query
			const newUrl = new URL(window.location);
			newUrl.searchParams.set('q', query);
			window.history.replaceState({}, '', newUrl);

			// Make API request to your backend
			$.ajax({
				url: config.relative_path + '/api/search',
				type: 'GET',
				data: searchData,
				success: (response) => {
					this.hideLoading();
					
					if (response.success && response.data) {
						this.displayResults(response.data, searchData);
						this.saveSearchHistory();
					} else {
						this.showError(response.error || 'Search failed');
					}
				},
				error: (xhr) => {
					this.hideLoading();
					let errorMessage = 'Search failed';
					
					try {
						const response = JSON.parse(xhr.responseText);
						errorMessage = response.error || errorMessage;
					} catch (e) {
						// Use default error message
					}
					
					this.showError(errorMessage);
				},
			});
		},

		displayResults: function (data, searchData) {
			const { posts, matchCount, pageCount } = data;
			
			if (!posts || posts.length === 0) {
				this.showNoResults();
				return;
			}

			// Update results count
			$('#search-results-count').text(`${matchCount} result${matchCount !== 1 ? 's' : ''}`);
			
			// Clear previous results
			$('#search-results').empty();
			
			// Create result elements
			posts.forEach(post => {
				const resultElement = this.createResultElement(post);
				$('#search-results').append(resultElement);
			});

			// Show results container
			$('#search-results-container').removeClass('d-none');

			// Handle pagination
			if (pageCount > 1) {
				this.createPagination(searchData.page, pageCount);
			}

			// Scroll to results
			$('#search-results-container')[0].scrollIntoView({ 
				behavior: 'smooth',
				block: 'start',
			});
		},

		createResultElement: function (post) {
			const template = document.getElementById('search-result-template');
			const clone = template.content.cloneNode(true);
			
			// Populate the result
			const link = clone.querySelector('.result-link');
			link.href = config.relative_path + post.url;
			link.textContent = post.title || 'Post';
			
			const content = clone.querySelector('.result-content');
			content.textContent = this.truncateText(post.content || '', 150);
			
			const username = clone.querySelector('.result-username');
			username.textContent = post.username || 'Anonymous';
			
			const category = clone.querySelector('.result-category');
			category.textContent = post.category || 'General';
			
			const timestamp = clone.querySelector('.result-timestamp');
			if (post.timestamp) {
				timestamp.textContent = this.formatTimestamp(post.timestamp);
			}

			return clone;
		},

		createPagination: function (currentPage, totalPages) {
			const pagination = $('#search-pagination ul');
			pagination.empty();

			// Previous button
			if (currentPage > 1) {
				pagination.append(`
					<li class="page-item">
						<a class="page-link search-pagination" href="#" data-page="${currentPage - 1}">Previous</a>
					</li>
				`);
			}

			// Page numbers
			const startPage = Math.max(1, currentPage - 2);
			const endPage = Math.min(totalPages, currentPage + 2);

			if (startPage > 1) {
				pagination.append(`
					<li class="page-item">
						<a class="page-link search-pagination" href="#" data-page="1">1</a>
					</li>
				`);
				if (startPage > 2) {
					pagination.append('<li class="page-item disabled"><span class="page-link">...</span></li>');
				}
			}

			for (let i = startPage; i <= endPage; i++) {
				pagination.append(`
					<li class="page-item ${i === currentPage ? 'active' : ''}">
						<a class="page-link search-pagination" href="#" data-page="${i}">${i}</a>
					</li>
				`);
			}

			if (endPage < totalPages) {
				if (endPage < totalPages - 1) {
					pagination.append('<li class="page-item disabled"><span class="page-link">...</span></li>');
				}
				pagination.append(`
					<li class="page-item">
						<a class="page-link search-pagination" href="#" data-page="${totalPages}">${totalPages}</a>
					</li>
				`);
			}

			// Next button
			if (currentPage < totalPages) {
				pagination.append(`
					<li class="page-item">
						<a class="page-link search-pagination" href="#" data-page="${currentPage + 1}">Next</a>
					</li>
				`);
			}

			$('#search-pagination').removeClass('d-none');
		},

		showSuggestions: function (query) {
			// Get search suggestions from backend
			$.ajax({
				url: config.relative_path + '/api/search/suggestions',
				type: 'GET',
				data: { q: query },
				success: (response) => {
					if (response.success && response.data && response.data.suggestions) {
						this.displaySuggestions(response.data.suggestions);
					}
				},
				error: () => {
					// Silently fail for suggestions
				},
			});
		},

		displaySuggestions: function () {
			// This could be implemented as a dropdown with suggestions
			// For now, we'll skip this to keep the implementation simpler
		},

		hideSuggestions: function () {
			// Hide suggestions dropdown
		},

		loadSearchHistory: function () {
			if (!app.user.uid) return;

			$.ajax({
				url: config.relative_path + '/api/search/history',
				type: 'GET',
				success: (response) => {
					if (response.success && response.data && response.data.length > 0) {
						this.displaySearchHistory(response.data);
					}
				},
				error: () => {
					// Silently fail for history
				},
			});
		},

		displaySearchHistory: function (history) {
			const container = $('#search-history');
			container.empty();

			history.forEach(query => {
				container.append(`
					<span class="badge bg-light text-dark search-history-item" style="cursor: pointer;">
						${utils.escapeHTML(query)}
					</span>
				`);
			});
		},

		saveSearchHistory: function () {
			if (!app.user.uid) return;

			// The backend automatically saves search history, so we just reload it
			setTimeout(() => {
				this.loadSearchHistory();
			}, 1000);
		},

		clearSearchHistory: function () {
			if (!app.user.uid) return;

			$.ajax({
				url: config.relative_path + '/api/search/history',
				type: 'DELETE',
				success: (response) => {
					if (response.success) {
						$('#search-history').empty();
						app.alertSuccess('Search history cleared');
					}
				},
				error: () => {
					app.alertError('Failed to clear search history');
				},
			});
		},

		showLoading: function () {
			$('#search-loading').removeClass('d-none');
		},

		hideLoading: function () {
			$('#search-loading').addClass('d-none');
		},

		showResults: function () {
			$('#search-results-container').removeClass('d-none');
		},

		hideResults: function () {
			$('#search-results-container').addClass('d-none');
			$('#no-results').addClass('d-none');
		},

		showNoResults: function () {
			$('#no-results').removeClass('d-none');
		},

		showError: function (message) {
			$('#search-error-message').text(message);
			$('#search-error').removeClass('d-none');
		},

		hideError: function () {
			$('#search-error').addClass('d-none');
		},

		truncateText: function (text, maxLength) {
			if (text.length <= maxLength) return text;
			return text.substring(0, maxLength) + '...';
		},

		formatTimestamp: function (timestamp) {
			const date = new Date(timestamp);
			return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
		},
	};

	// Initialize search page if we're on the search page
	if (document.location.pathname.includes('/searchbar')) {
		SearchPage.init();
	}

	// Export for global access
	window.SearchPage = SearchPage;
});