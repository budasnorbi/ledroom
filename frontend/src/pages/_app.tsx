import React from "react"
import { AppProps } from "next/app"
import "../styles/globals.css"
import "../styles/wavesurfer-custom.css"
// import "../styles/editorContainer.css"
// import "../styles/preview.css"

interface MyAppProps extends AppProps {}

const MyApp: React.FC<MyAppProps> = (props) => {
  const { Component, pageProps } = props
  /* @ts-ignore */
  return <Component {...pageProps} />
}

export default MyApp
