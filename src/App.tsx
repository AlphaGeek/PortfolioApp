import "./App.css"
import Router from "./routing/Router"
import AI from "@/api/ai"

/*AI.askClaude("Provide an analysis of AAPL 2024 4th quarter earnings report")
  .then((response) => {
    console.log("Claude response: ", response.data)
  })
  .catch((error) => {
    console.error(
      "An error occurred while fetching the search results: ",
      error
    )
  })*/

/*AI.askOpenAI(
  "Hello, Open AI! Can you explain quantum computing in simple terms?"
)
  .then((response) => {
    console.log("Open AI response: ", response.data)
  })
  .catch((error) => {
    console.error(
      "An error occurred while fetching the search results: ",
      error
    )
  })
*/

function App() {
  return (
    <div className="app bg-stone-50">
      <div className="app-content">
        <Router />
      </div>
    </div>
  )
}

export default App
