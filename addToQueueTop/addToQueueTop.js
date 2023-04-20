(async function addToQueueTop(started) {
  if (!started) console.time('addToQueueTop loaded successfully');

  if (!(Spicetify.Platform && Spicetify.CosmosAsync)) {
    setTimeout(() => addToQueueTop(true), 300);
    return;
  }

  const { Type } = Spicetify.URI;
  const shouldShowOption = (uris) =>
    uris.every((uri) =>
      [
        Type.TRACK,
        Type.PLAYLIST,
        Type.PLAYLIST_V2,
        Type.ALBUM,
        Type.LOCAL,
        Type.EPISODE,
      ].includes(Spicetify.URI.fromString(uri).type),
    );

  new Spicetify.ContextMenu.Item(
    "Add to queue's top",
    async (uris) => {
      if ([Type.PLAYLIST, Type.PLAYLIST_V2].includes(Spicetify.URI.fromString(uris[0]).type))
        uris = (await Spicetify.Platform.PlaylistAPI.getContents(uris[0])).items.map(
          (item) => item.uri,
        );
      const before = (Spicetify.Queue.nextTracks || []).filter(
        (track) => track.provider !== 'context',
      ).length;
      await Spicetify.addToQueue(uris.map((uri) => ({ uri })));
      const difference = Spicetify.Queue.nextTracks
        .filter((track) => track.provider !== 'context')
        .filter((_, index) => index >= before);
      if (before)
        await Spicetify.Platform.PlayerAPI.reorderQueue(
          difference.map((track) => track.contextTrack),
          { before: Spicetify.Queue.nextTracks[0].contextTrack },
        );
      Spicetify.showNotification('Added to top of Queue');
    },
    shouldShowOption,
  ).register();

  console.timeEnd('addToQueueTop loaded successfully');
})();
