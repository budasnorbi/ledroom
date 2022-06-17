import React, { useEffect, useState } from "react"
import { AppProps } from "next/app"
import { CacheProvider, EmotionCache } from "@emotion/react"
import { createEmotionCache } from "@utils/createEmtionCache"
import "../styles/customhandle.css"
import "../styles/effectBuilder.css"
import "../styles/editorContainer.css"
import "../styles/preview.css"

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

const MyApp: React.FC<MyAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <CacheProvider value={emotionCache}>
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </CacheProvider>
  )
}

export default MyApp
