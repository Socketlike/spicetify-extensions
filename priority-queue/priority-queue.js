(function init() {
    if (!Spicetify.Platform || !Spicetify.CosmosAsync) {
        setTimeout(init, 100)
        return
    }

    new Spicetify.ContextMenu.Item(
        "Add to queue (prioritized)",

        async (uris) => {
            const containerType = Spicetify.URI.fromString(uris[0]).type

            switch (containerType) {
                case 'playlist':
                case 'playlist-v2':
                    uris = await Spicetify.Platform.PlaylistAPI
                        .getContents(uris[0])
                        .then(({ items }) => items.map(item => item.uri))
                        .catch((e) => {
                            console.error(e)
                            Spicetify.showNotification('Playlist content fetching failed (check Console)', true)

                            return []
                        })
                    break
                
                case 'album':
                    uris = await Spicetify.GraphQL
                        .Request(
                            Spicetify.GraphQL.Definitions.getAlbum,
                            { uri: uris[0], locale: Spicetify.Locale.getLocale(), offset: 0, limit: 100 }
                        )
                        .then(({ data }) => data
                            ? data.albumUnion.tracksV2.items.map(({ track }) => track.uri)
                            : []
                        )
                        .catch((e) => {
                            console.error(e)
                            Spicetify.showNotification('Album content fetching failed (check Console)', true)

                            return []
                        })
                    break
            }

            if (!uris.length)
                return

            const before = Spicetify.Queue.nextTracks
                ?.filter(track => track.provider === 'queue')
                ?.length
            
            await Spicetify.addToQueue(
                uris.map(uri => ({ uri }))
            );

            const difference = Spicetify.Queue.nextTracks
                .filter(track => track.provider === 'queue')
                .slice(before || 0)
            
            if (before)
                Spicetify.Platform.PlayerAPI
                    .reorderQueue(
                        difference.map(track => track.contextTrack),
                        { before: Spicetify.Queue.nextTracks[0].contextTrack }
                    )
                    .catch((e) => {
                        console.error(e)
                        Spicetify.showNotification('Reordering failed (check Console)', true)
                    })
        },
    
        (uris) =>
            uris.every((uri) =>
                Spicetify.URI.fromString(uri).type === 'track'
                || Spicetify.URI.fromString(uri).type === 'playlist'
                || Spicetify.URI.fromString(uri).type === 'playlist-v2'
                || Spicetify.URI.fromString(uri).type === 'album'
                || Spicetify.URI.fromString(uri).type === 'local'
                || Spicetify.URI.fromString(uri).type === 'episode'
            ),
        
        'queue'
    ).register()
})()
