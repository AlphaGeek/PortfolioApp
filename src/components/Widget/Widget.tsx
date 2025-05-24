import { ReactNode } from "react"
import WidgetBar from "./WidgetBar"
import { MenuItem } from "primereact/menuitem"

interface WidgetProps {
  headerLeft?: ReactNode
  headerCenter?: ReactNode
  headerRight?: ReactNode
  content: ReactNode
  footer?: ReactNode
  minWidth?: string
  maxWidth?: string
  minHeight?: string
  maxHeight?: string
  settings?: MenuItem[]
}

export default function Widget({
  headerLeft,
  headerCenter,
  headerRight,
  content,
  footer,
  minWidth = "33vw",
  maxWidth = "100vw",
  minHeight = "300px",
  maxHeight = "600px",
  settings,
}: WidgetProps) {
  return (
    <div
      className="widget bg-white shadow-lg rounded-lg p-0"
      style={{ minWidth, maxWidth, minHeight, maxHeight }}
    >
      <WidgetBar
        left={headerLeft || <div></div>}
        center={headerCenter || <div></div>}
        right={headerRight || <div></div>}
        settings={settings || undefined}
      ></WidgetBar>
      <div className="p-4 mb-4">{content}</div>
      <div className="widget-footer">{footer || <div></div>}</div>
    </div>
  )
}
