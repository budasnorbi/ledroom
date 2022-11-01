import { MutableRefObject, useRef, useState, useEffect } from "react"
import shallow from "zustand/shallow"

import BeatController from "./components/BeatController"
import WavesurferController from "./components/WavesurferController"
import { RegionEffectController } from "./components/RegionEffectController"
import { SongLoadController } from "./components/SongLoadController"
import { useStore } from "./store/store"
import { api } from "./api/web"
import { closeSocket } from "./api/socket"
import WaveSurfer from "./components/Wavesurfer"
import { GetSongsResponse } from "@ledroom2/types"

enum Methods {
  POST = "POST",
  GET = "GET",
  PATCH = "PATCH",
  DELETE = "DELETE"
}

function Dashboard() {
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)

  const { addSongs, resetStore, selectedSongId, wavesurferReady } = useStore(
    (state) => ({
      addSongs: state.addSongs,
      resetStore: state.resetStore,
      wavesurferReady: state.wavesurferReady,
      selectedSongId: state.selectedSongId
    }),
    shallow
  )

  const selectedSong = useStore((state) => {
    const [song] = state.songs.filter((song) => song.id === selectedSongId)
    return song ?? null
  })

  useEffect(() => {
    const abortController = new AbortController()
    api<GetSongsResponse>("/song", {
      method: Methods.GET,
      signal: abortController.signal
    }).then((response) => {
      if (response.statusCode !== 200) {
        return
      }

      addSongs(response.data)
    })

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
            selectedSongId={selectedSong?.id}
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

      {selectedSong && selectedSong.selectedRegionId && wavesurferReady && (
        <RegionEffectController
          wavesurferRef={wavesurferRef as MutableRefObject<WaveSurfer>}
          selectRegionId={selectedSong.selectedRegionId}
        />
      )}
    </div>
  )
}

export default Dashboard
