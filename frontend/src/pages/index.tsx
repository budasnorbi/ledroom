import { MutableRefObject, useCallback, useRef, useState } from "react"
import dynamic from "next/dynamic"

import BeatController from "@components/BeatController"
import WavesurferController from "@components/WavesurferController"
import { RegionEffectEditor } from "@components/RegionEffectEditor"
import { SongLoadController } from "@components/SongLoadController"
import { useStore } from "@store"
import api from "@api/web"
import { useEffect } from "react"
import { closeSocket } from "@api/socket"
import type { GetSongsData } from "@backend/endpoints"

const Preview = dynamic(() => import("../components/Preview"), {
  ssr: false
})

const WaveSurfer = dynamic(() => import("../components/Wavesurfer"), {
  ssr: false
})

let bezierChangeTimeout: any

function Dashboard() {
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)
  const addSongs = useStore.use.addSongs()
  const resetStore = useStore.use.resetStore()

  const wavesurferReady = useStore.use.wavesurferReady()
  const selectedSongId = useStore.use.selectedSongId()

  const selectedSong = useStore((state) => {
    const [song] = state.songs.filter((song) => song.id === selectedSongId)
    return song ?? null
  })

  useEffect(() => {
    const abortController = new AbortController()
    ;(async () => {
      const response = await api.get<GetSongsData>("/songs", {}, abortController)

      if (!response) {
        return
      }

      addSongs(response)
    })()
    return () => {
      abortController.abort()
      closeSocket()
      resetStore()
    }
  }, [addSongs, resetStore])

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

      {selectedSong && selectedSong.selectedRegionId && <RegionEffectEditor />}
    </div>
  )
}

export default Dashboard
