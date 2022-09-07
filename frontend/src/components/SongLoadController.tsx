import { api } from "../api/instance"
import { useCallback, ChangeEvent, PointerEvent } from "react"
import { useStore } from "@store"

export const SongLoadController = () => {
  const songs = useStore.use.songs()
  const selectedSongId = useStore.use.selectedSongId()

  const removeSong = useStore.use.removeSong()
  const updateSelectedSongId = useStore.use.updateSelectedSongId()
  const addSong = useStore.use.addSong()

  const handleSongChoose = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      if (event.target.value !== "") {
        const id = parseInt(event.target.value)
        updateSelectedSongId(id)
      }
    },
    [updateSelectedSongId]
  )

  const handleSongRemove = useCallback(
    async (event: PointerEvent<HTMLButtonElement>) => {
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
        addSong(uploadRes.data)
      }
    },
    [addSong]
  )

  return (
    <div
      style={{
        display: "flex"
      }}
    >
      <div>
        <input type="file" id="songFile" style={{ display: "none" }} onChange={handleSongLoad} />
        <label
          style={{
            display: "block",
            backgroundColor: "buttonface",
            border: "solid 1.1px rgba(0,0,0,.5)",
            fontSize: "13.3px",
            fontFamily: "Arial",
            padding: "1.1px",
            borderRadius: "2px"
          }}
          htmlFor="songFile"
        >
          upload
        </label>
      </div>
      {songs.length !== 0 && (
        <>
          <select onChange={handleSongChoose} value={selectedSongId}>
            {songs.map((song) => (
              <option value={song.id} key={song.id}>
                {song.name}
              </option>
            ))}
          </select>
          <button onClick={handleSongRemove}>remove</button>
        </>
      )}
    </div>
  )
}
