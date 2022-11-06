import { SongsWithRelation } from "./db-response";
import { DBSong } from "./db-entities";

export type UploadSongResponse = DBSong;

export interface GetSongsResponse {
  songs: SongsWithRelation[];
  selectedRegionId: number | null;
}

export type DeleteSongResponse = void;
export type UpdateRegiongResponse = void;
export type PatchSongResponse = void;
export type AddRegionResponse = { id: string };
export type DeleteRegionResponse = void;
export type SelectRegiongResponse = void;

export type AddStepEffect = { id: string };
