import { StrictMode } from "react"
import * as ReactDOM from "react-dom/client"
import "./app/styles/globals.css"
import "./app/styles/wavesurfer-custom.css"
import "./app/styles/resets.css"
import "./app/styles/color-picker-custom.css"

import App from "./app/App"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
