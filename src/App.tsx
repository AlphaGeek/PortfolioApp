import "./App.css"
import Router from "./routing/Router"
import AI from "@/api/ai"

AI.askClaude(
  "Hello, Claude! Can you explain quantum computing in simple terms?"
)
  .then((response) => {
    console.log("Claude response: ", response.data)
  })
  .catch((error) => {
    console.error(
      "An error occurred while fetching the search results: ",
      error
    )
  })

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
    <div className="app bg-[#f5f5f5]">
      <div className="app-content">
        <Router />
      </div>
    </div>
  )
}

export default App
