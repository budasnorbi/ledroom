import { ChangeEvent, FC } from "react"
import { api } from "../api/web"
import { useStore } from "../store/store"
import type { UploadSongResponse } from "@ledroom2/types"
import { Methods } from "../types/api"
import { songs } from "@prisma/client"

interface Props {
  selectedSongId: songs["id"] | undefined
}

export const SongLoadController: FC<Props> = (props) => {
  const songs = useStore.use.songs()

  const removeSong = useStore.use.removeSong()
  const selectSong = useStore.use.selectSong()
  const addSong = useStore.use.addSong()

  const handleSongChoose = async (event: ChangeEvent<HTMLSelectElement>) => {
    selectSong(event.target.value)
  }

  const handleSongRemove = () => {
    removeSong(props.selectedSongId as string)
  }

  const handleSongLoad = async (event: ChangeEvent<HTMLInputElement>) => {
    const musicFile = event.target.files?.item(0)

    if (!musicFile) {
      return
    }

    const formData = new FormData()
    formData.append("file", musicFile)

    const response = await api<UploadSongResponse, FormData>("/song", {
      method: Methods.POST,
      body: formData,
      headers: {
        "Content-Type": "inherit"
      }
    })

    if (response.statusCode !== 201) {
      return
    }

    addSong(response.data)
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
      {props.selectedSongId && (
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
