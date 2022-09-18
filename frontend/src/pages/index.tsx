import { MutableRefObject, useCallback, useRef, useState } from "react"
import dynamic from "next/dynamic"

import BeatController from "@components/BeatController"
import WavesurferController from "@components/WavesurferController"
import { RegionEffectEditor } from "@components/RegionEffectEditor"
import { SongLoadController } from "@components/SongLoadController"
import { useStore } from "@store"
import { Song } from "@type/store"
import api from "@api/web"
import { useEffect } from "react"
import { closeSocket } from "@api/socket"

const Preview = dynamic(() => import("../components/Preview"), {
  ssr: false
})

const WaveSurfer = dynamic(() => import("../components/Wavesurfer"), {
  ssr: false
})

let bezierChangeTimeout: any

function Dashboard() {
  const selectedSongId = useStore.use.selectedSongId()
  const selectedSong = useStore((state) => {
    const song = state.songs.find((song) => song.id === selectedSongId)

    if (!song) {
      return null
    }

    return song
  })

  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const wavesurferReady = useStore.use.wavesurferReady()

  const [musicCurrentTime, setMusicCurrentTime] = useState(0)

  const addSongs = useStore.use.addSongs()
  const resetStore = useStore.use.resetStore()

  useEffect(() => {
    const abortController = new AbortController()
    ;(async () => {
      const songs = await api.get<{ songs: Song[]; selectedSongId: number }>(
        "/songs",
        {},
        abortController
      )
      if (!songs || songs.songs.length === 0) {
        return
      }

      addSongs(songs)
    })()
    return () => {
      abortController.abort()
      closeSocket()
      resetStore()
    }
  }, [addSongs, resetStore])

  /*   useEffect(() => {
    if (selectedRegion?.id) {
      setBezierValues(selectedRegion.bezierValues)
    }
  }, [selectedRegion?.bezierValues]) */

  /*   const handleBezierUpdate = (values: [number, number, number, number]) => {
    setBezierValues(values)
    if (bezierChangeTimeout) {
      clearTimeout(bezierChangeTimeout)
    }

    bezierChangeTimeout = setTimeout(() => {
      updateRegion({ bezierValues: values })
    }, 350)
  } */

  return (
    <div>
      <div className="flex items-center flex-wrap px-2 py-3">
        <SongLoadController selectedSongId={selectedSong?.id} />

        {selectedSong && wavesurferReady && (
          <BeatController
            wavesurferRef={wavesurferRef as MutableRefObject<WaveSurfer>}
            bpm={selectedSong.bpm}
            beatAroundEnd={selectedSong.beatAroundEnd}
            beatOffset={selectedSong.beatOffset}
          />
        )}
      </div>

      {selectedSong && (
        <WaveSurfer
          wavesurferRef={wavesurferRef}
          setMusicCurrentTime={setMusicCurrentTime}
          selectedSongId={selectedSong.id}
        />
      )}

      {selectedSong && wavesurferReady && (
        <WavesurferController
          wavesurferRef={wavesurferRef as MutableRefObject<WaveSurfer>}
          musicCurrentTime={musicCurrentTime}
          volume={selectedSong.volume}
        />
      )}
      <div className="editorContainer">
        {/* <RegionEffectEditor /> */}
        <div>
          {/*  <h2>Led Preview</h2> */}
          {/* @ts-ignore */}
          {/* <Preview /> */}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
