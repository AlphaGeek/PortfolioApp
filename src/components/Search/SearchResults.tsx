function SearchResults(props: any) {
  return (
    <div>
      <div>
        {Array.isArray(props.searchResults) &&
          props.searchResults.map((result: any) => (
            <div
              key={result.symbol}
              className="search-results-item"
              onClick={() => props.onSelected(result)}
            >
              <div>{result.name}</div>
              <div>
                <span>{result.symbol}</span>&nbsp;:&nbsp;
                <span>{result.region}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default SearchResults
