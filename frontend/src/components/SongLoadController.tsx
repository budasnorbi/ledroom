import { useCallback, ChangeEvent, PointerEvent } from "react"
import api from "@api/web"
import { useStore } from "@store"
import type { UploadSongResponse } from "@backend/endpoints"
import { FC } from "react"

interface Props {
  selectedSongId: number | undefined
}

export const SongLoadController: FC<Props> = (props) => {
  const songs = useStore.use.songs()

  const removeSong = useStore.use.removeSong()
  const selectSong = useStore.use.selectSong()
  const addSong = useStore.use.addSong()

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
      return
    }

    const formData = new FormData()
    formData.append("file", musicFile)

    const uploadSongRes = await api.uploadFile<UploadSongResponse>("/song", formData)

    if (!uploadSongRes) {
      return
    }

    addSong(uploadSongRes)
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
