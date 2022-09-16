import { useCallback, ChangeEvent, PointerEvent } from "react"
import { api } from "../api/instance"
import { useStore } from "@store"

export const SongLoadController = () => {
  const songs = useStore.use.songs()
  const selectedSongId = useStore.use.selectedSongId()

  const removeSong = useStore.use.removeSong()
  const selectSong = useStore.use.selectSong()
  const addSongs = useStore.use.addSongs()

  const handleSongChoose = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== "") {
      const id = parseInt(event.target.value)
      selectSong(id)
    }
  }

  const handleSongRemove = useCallback(
    async (event: PointerEvent<HTMLButtonElement>) => {
      if (selectedSongId == null) {
        return
      }

      const deleteRes = await api.delete(`/song?id=${selectedSongId}`).catch((error) => {
        console.warn(error)
        return null
      })

      if (deleteRes?.data) {
        removeSong(selectedSongId)
      }
    },
    [removeSong, selectedSongId]
  )

  const handleSongLoad = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const musicFile = event.target.files?.item(0)

      if (!musicFile) {
        console.warn("There is no music file from upload input", musicFile)
        return
      }

      const formData = new FormData()
      formData.append("file", musicFile)

      const uploadRes = await api.post("/upload-song", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      if (uploadRes.data.id) {
        addSongs([uploadRes.data])
      }
    },
    [addSongs]
  )

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
      {songs.length !== 0 && selectedSongId && (
        <>
          <select
            onChange={handleSongChoose}
            value={selectedSongId}
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
