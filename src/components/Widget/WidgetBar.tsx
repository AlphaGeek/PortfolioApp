import { ReactNode, useRef } from "react"
import { Menu } from "primereact/menu"
import { MenuItem } from "primereact/menuitem"

interface WidgetBarProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
  settings?: MenuItem[]
}

export default function Widget({
  left,
  center,
  right,
  settings,
}: WidgetBarProps) {
  const menu = useRef<Menu>(null)
  return (
    <div className="flex content-center justify-between bg-stone-50 min-h-[25px] p-2 rounded-tl-md rounded-tr-md rounded-br-none rounded-bl-none">
      <div className="inline-flex justify-start pl-2">{left}</div>
      <div className="inline-flex justify-center">{center}</div>
      <div className="inline-flex justify-end pr-2 content-center">
        {right}
        {settings && (
          <div
            id="chartSettingsContainer"
            className="inline-flex justify-end pr-2"
          >
            <i
              className="pi pi-cog ml-[15px] cursor-pointer content-center"
              onClick={(event) => menu.current?.toggle(event)}
            ></i>
            <Menu
              id="chartSettingsMenu"
              popup
              style={{ marginLeft: "-165px" }}
              appendTo={document.getElementById("chartSettingsContainer")}
              model={settings}
              ref={menu}
            />
          </div>
        )}
      </div>
    </div>
  )
}
