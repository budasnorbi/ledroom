import { useCallback, ChangeEvent, PointerEvent } from "react"
import api from "@api/web"
import { useStore } from "@store"
import { Song } from "@type/song"
import { FC } from "react"

interface Props {
  selectedSongId: number | undefined
}

export const SongLoadController: FC<Props> = (props) => {
  const songs = useStore.use.songs()

  const removeSong = useStore.use.removeSong()
  const selectSong = useStore.use.selectSong()
  const addSongs = useStore.use.addSongs()

  const handleSongChoose = async (event: ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(event.target.value)
    selectSong(id)
  }

  const handleSongRemove = () => {
    removeSong(props.selectedSongId as number)
  }

  const handleSongLoad = async (event: ChangeEvent<HTMLInputElement>) => {
    const musicFile = event.target.files?.item(0)

    if (!musicFile) {
      console.warn("There is no music file from upload input", musicFile)
      return
    }

    const formData = new FormData()
    formData.append("file", musicFile)

    const songData = await api.uploadFile<Song>("/upload-song", formData)

    if (!songData) {
      return
    }

    addSongs({ songs: [songData], selectedSongId: songData.id })
  }

  return (
    <div className="flex">
      <div>
        <input className="hidden" type="file" id="songFile" onChange={handleSongLoad} />
        <label
          className="inline-block p-2 text-blue-600/100 hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-md"
          htmlFor="songFile"
        >
          Upload
        </label>
      </div>
      {props.selectedSongId !== undefined && (
        <>
          <select
            onChange={handleSongChoose}
            value={props.selectedSongId}
            className="border-solid rounded-md border-4 bg-slate-100 mx-2"
          >
            {songs.map((song) => (
              <option value={song.id} key={song.id}>
                {song.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSongRemove}
            className="inline-block p-2 text-blue-600/100 hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-md"
          >
            Remove
          </button>
        </>
      )}
    </div>
  )
}
