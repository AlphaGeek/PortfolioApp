import { useState } from "react"
import "./SearchBox.scss"
import "./SearchResults"
import { InputText } from "primereact/inputtext"
import marketDataApi from "../../api/marketData"
import SearchResults from "./SearchResults"
import { useDispatch } from "react-redux"
import { setCompany } from "../../store/marketDataSlice"

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const dispatch = useDispatch()

  async function search() {
    const results = await marketDataApi.searchStocks(searchTerm)
    console.log("search results", results)
    setSearchResults(results)
  }

  function onSelected(event: any) {
    dispatch(setCompany(event))
    setSearchResults([])
  }

  function inputKeyPressed(key: any) {
    if (key.code === "Enter") {
      search()
    }
  }

  return (
    <div className="search-box">
      <div className="search-input-container">
        <div className="search-input">
          <InputText
            onKeyUp={(key) => inputKeyPressed(key)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
          />
        </div>
        <div className="search-button">
          <span onClick={search}>search</span>
        </div>
      </div>
      {searchResults && searchResults.length > 0 && (
        <div className="search-results">
          <SearchResults
            v-if="searchResults.length > 0"
            searchResults={searchResults}
            onSelected={onSelected}
          ></SearchResults>
        </div>
      )}
    </div>
  )
}

export default SearchBox
