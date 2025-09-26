
<div class="searchbar-page">
  <h2>Search</h2>
  <form id="searchbar-form" action="/searchbar" method="get">
    <input type="text" name="q" placeholder="Search..." required value="{query}" />
    <button type="submit">Search</button>
  </form>

  <!-- Show error if present -->
  {{{ if error }}}
    <div class="alert alert-danger mt-3">{error}</div>
  {{{ end }}}

  <!-- Show results if present -->
  {{{ if results && results.posts && results.posts.length }}}
    <div class="search-results mt-4">
      <h3>Results</h3>
      <ul class="list-group">
        {{{ each results.posts }}}
          <li class="list-group-item">
            <a href="/post/{results.posts.pid}"><strong>{results.posts.content}</strong></a>
            <div class="text-muted small">in topic: <a href="/topic/{results.posts.tid}">{results.posts.topic && results.posts.topic.title}</a></div>
          </li>
        {{{ end }}}
      </ul>
    </div>
  {{{ else if results && query }}}
    <div class="mt-4">No results found.</div>
  {{{ end }}}
</div>
