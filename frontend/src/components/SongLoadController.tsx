import { api } from "@api"
import { useCallback, ChangeEvent, PointerEvent } from "react"
import { useStore } from "@store"

export const SongLoadController = () => {
  const songs = useStore((state) => state.songs)
  const selectedSongId = useStore((state) => state.selectedSongId)

  const removeSong = useStore(useCallback((state) => state.removeSong, []))
  const updateSelectedSongId = useStore(useCallback((state) => state.updateSelectedSongId, []))
  const addSongs = useStore(useCallback((state) => state.addSongs, []))

  const handleSongChoose = useCallback(async (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== "") {
      const id = parseInt(event.target.value)
      updateSelectedSongId(id)
    }
  }, [])

  const handleSongRemove = useCallback(
    async (event: PointerEvent<HTMLButtonElement>) => {
      const deleteRes = await api.delete(`/api/song?id=${selectedSongId}`).catch((error) => {
        console.warn(error)
        return null
      })

      if (deleteRes?.data) {
        removeSong(selectedSongId)
      }
    },
    [selectedSongId]
  )

  const handleSongLoad = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const musicFile = event.target.files?.item(0)

    if (!musicFile) {
      console.warn("There is no music file from upload input", musicFile)
      return
    }

    const formData = new FormData()
    formData.append("file", musicFile)

    const uploadRes = await api.post("/api/upload-song", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })

    if (uploadRes.data.id) {
      addSongs([{ id: uploadRes.data.id, name: musicFile.name }])
      updateSelectedSongId(uploadRes.data.id)
    }
  }, [])

  return (
    <div
      style={{
        display: "flex",
        borderBottom: "solid 1px black"
      }}
    >
      {songs.length !== 0 && (
        <>
          <select onChange={handleSongChoose} value={selectedSongId}>
            {songs.map((song) => (
              <option value={song.id} key={song.id}>
                {song.name}
              </option>
            ))}
          </select>
          <button style={{ marginRight: "10px" }} onClick={handleSongRemove}>
            remove
          </button>
        </>
      )}
      <div>
        <input type="file" id="songFile" style={{ display: "none" }} onChange={handleSongLoad} />
        <label
          style={{
            display: "block",
            backgroundColor: "buttonface",
            border: "solid 1px buttonborder",
            fontSize: "13.3px",
            fontFamily: "Arial",
            padding: "1px",
            borderRadius: "2px"
          }}
          htmlFor="songFile"
        >
          upload
        </label>
      </div>
    </div>
  )
}
