function SearchResults(props: any) {
  return (
    <div>
      <div>
        {Array.isArray(props.searchResults) &&
          props.searchResults.map((result: any) => (
            <div
              key={result["1. symbol"]}
              className="search-results-item"
              onClick={() => props.onSelected(result)}
            >
              <div>{result["2. name"]}</div>
              <div>
                <span>{result["1. symbol"]}</span>&nbsp;:&nbsp;
                <span>{result["4. region"]}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default SearchResults
