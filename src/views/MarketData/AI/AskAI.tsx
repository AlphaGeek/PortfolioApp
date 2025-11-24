import { useState } from "react"
import Widget from "@/components/Widget/Widget"
import { RadioButton } from "primereact/radiobutton"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { InputTextarea } from "primereact/inputtextarea"

import AI from "@/api/ai"

export default function AskAI() {
  const [aiModel, setAIModel] = useState("Claude")
  const [placeholder, setPlaceholder] = useState("Ask Claude a question...")
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")

  function askAI() {
    if (query.trim().length > 0) {
      if (aiModel === "ChatGPT") {
        AI.askOpenAI(query)
          .then((response: any) => {
            setAnswer(response.answer)
          })
          .catch((error: any) => {
            console.error("Error asking OpenAI:", error)
          })
      } else if (aiModel === "Claude") {
        AI.askClaude(query).then((response: any) => {
          setAnswer(response)
        })
        .catch((error: any) => {
          console.error("Error asking Claude:", error)
        })
      }
    }
  }

  const content = (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-row items-center justify-center w-full mb-4">
        <InputText
          value={query}
          placeholder={placeholder}
          className="w-full mb-4 mr-2"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askAI()
            }
          }}
        />
        <Button label="Ask" className="w-[100px] ml-4 !bg-blue-500" onClick={askAI} />
      </div>
      <div className="mt-4 w-full">
        <InputTextarea value={answer} rows={10} className="w-full" readOnly />
      </div>
    </div>
  )

  const settings = [
    {
      template: () => {
        return (
          <div className="flex flex-col items-start justify-center h-full p-[10px]">
            <div className="font-bold mb-2">AI Model</div>
            <div
              className="flex mb-3 ml-4"
              style={{ alignItems: "anchor-center" }}
            >
              <RadioButton
                inputId="claude"
                name="aiModel"
                value="Claude"
                onChange={(e: any) => {
                  setAIModel(e.value)
                  setPlaceholder("Ask Claude a question...")
                  setAnswer("")
                }}
                checked={aiModel === "Claude"}
              />
              <label htmlFor="ingredient2" className="ml-2">
                Claude
              </label>
            </div>
            <div
              className="flex mb-3 ml-4"
              style={{ alignItems: "anchor-center" }}
            >
              <RadioButton
                inputId="chatgpt"
                name="aiModel"
                value="ChatGPT"
                onChange={(e: any) => {
                  setAIModel(e.value)
                  setPlaceholder("Ask ChatGPT a question...")
                  setAnswer("")
                }}
                checked={aiModel === "ChatGPT"}
              />
              <label htmlFor="ingredient1" className="ml-2">
                ChatGPT
              </label>
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <Widget
      headerLeft="Ask AI"
      content={content}
      minWidth="33vw"
      maxWidth="33vw"
      minHeight="300px"
      maxHeight="1000px"
      settings={settings}
    ></Widget>
  )
}
