import { useCallback } from 'react';
import {
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
} from 'react-router-dom';

import PlaylistsNav from '../components/PlaylistsNav/PlaylistsNav';
import * as ViewMessage from '../elements/ViewMessage/ViewMessage';
import database from '../lib/database';
import PlaylistsAPI from '../stores/PlaylistsAPI';

import appStyles from './Root.module.css';
import styles from './ViewPlaylists.module.css';
import type { LoaderData } from './router';

export default function ViewPlaylists() {
  const { playlists } = useLoaderData() as PlaylistsLoaderData;

  const createPlaylist = useCallback(async () => {
    await PlaylistsAPI.create('New playlist', [], false);
  }, []);

  let playlistContent;

  if (playlists.length === 0) {
    playlistContent = (
      <ViewMessage.Notice>
        <p>You haven{"'"}t created any playlist yet</p>
        <ViewMessage.Sub>
          <button
            type="button"
            onClick={createPlaylist}
            className="reset"
            tabIndex={0}
          >
            create one now
          </button>
        </ViewMessage.Sub>
      </ViewMessage.Notice>
    );
  } else {
    playlistContent = <Outlet />;
  }

  return (
    <div className={`${appStyles.view} ${styles.viewPlaylists}`}>
      <PlaylistsNav playlists={playlists} />
      <div className={styles.playlist}>{playlistContent}</div>
    </div>
  );
}

export type PlaylistsLoaderData = LoaderData<typeof ViewPlaylists.loader>;

ViewPlaylists.loader = async ({ params }: LoaderFunctionArgs) => {
  const playlists = await database.getAllPlaylists();
  const [firstPlaylist] = playlists;
  const { playlistID } = params;

  if (
    // If landing page, redirect to the first playlist
    playlistID === undefined ||
    // If playlist ID does not exist, redirect to the first playlist
    (playlistID !== undefined &&
      !playlists.map((playlist) => playlist._id).includes(playlistID))
  ) {
    if (firstPlaylist !== undefined) {
      return redirect(`/playlists/${firstPlaylist._id}`);
    }
  }

  return { playlists };
};
