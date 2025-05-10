import { useState } from "react"
import "./SearchBox.scss"
import "./SearchResults"
import { InputText } from "primereact/inputtext"
import marketDataApi from "../../api/marketData"
import SearchResults from "./SearchResults"
import { useDispatch } from "react-redux"
import { setCompany } from "../../store/marketDataSlice"
import { useNavigate } from "react-router-dom"

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function search() {
    const results = await marketDataApi.searchStocks(searchTerm)
    setSearchResults(results)
  }

  async function onSelected(event: any) {
    await dispatch(setCompany(event))
    setSearchResults([])
    navigate("/market-data")
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
