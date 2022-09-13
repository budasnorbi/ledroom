import { useCallback, ChangeEvent, PointerEvent } from "react"
import { api } from "../api/instance"
import { useStore } from "@store"
import * as style from "@styles/shared"
import * as btnStyle from "@styles/buttons"

export const SongLoadController = () => {
  const songs = useStore.use.songs()
  const selectedSongId = useStore.use.selectedSongId()

  const removeSong = useStore.use.removeSong()
  const selectSong = useStore.use.selectSong()
  const addSongs = useStore.use.addSongs()

  const handleSongChoose = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      if (event.target.value !== "") {
        const id = parseInt(event.target.value)
        selectSong(id)
      }
    },
    [selectSong]
  )

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
    <div css={[style.dFlex]}>
      <div>
        <input type="file" id="songFile" css={[style.dNone]} onChange={handleSongLoad} />
        <label css={[btnStyle.defaultButton]} htmlFor="songFile">
          upload
        </label>
      </div>
      {songs.length !== 0 && selectedSongId && (
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
