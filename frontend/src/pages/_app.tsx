import React from "react"
import { AppProps } from "next/app"
import "../styles/globals.css"
import "../styles/wavesurfer-custom.css"
import "../styles/resets.css"

const MyApp: React.FC<AppProps> = (props) => {
  const { Component, pageProps } = props
  /* @ts-ignore */
  return <Component {...pageProps} />
}

export default MyApp
