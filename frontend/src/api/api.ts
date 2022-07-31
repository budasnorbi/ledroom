import { api } from "./instance"

export const fetchSongNames = (): Promise<{ id: number; name: string }[] | null> => {
  return api
    .get("/api/all-song-name")
    .then((res) => res.data)
    .catch((error) => {
      console.log(error)
      return null
    })
}
