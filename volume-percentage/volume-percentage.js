(function init() {
    const volumeBar = document.querySelector('.main-nowPlayingBar-volumeBar')

    if (
        !volumeBar ||
        !Spicetify.Player ||
        !Spicetify.Platform?.PlaybackAPI
    ) {
        setTimeout(init, 200)
        return
    }

    const ele = document.createElement('input')
    ele.classList.add('volume-percent')
    ele.style = `
        field-sizing: content;

        appearance: none;
        border: none;
        background: none;
        color: inherit;
        font-size: 14px;
        
        padding: 0;
        padding-left: 10px;
        margin: 0;
    `
    ele.type = 'text'
    ele.value = Math.round(Spicetify.Player.getVolume() * 100)
    ele.addEventListener('change', ev => {
        const newVolume = Number(ev.target.value)
        
        if (!ev.target.value || Number.isNaN(newVolume) || newVolume < 0)
            ele.value = Math.round(Spicetify.Player.getVolume() * 100)
        else
            Spicetify.Player.setVolume(newVolume / 100)
    })

    volumeBar.append(ele)
    volumeBar.style.flex = '0 1 180px'

    Spicetify.Platform.PlaybackAPI._events.addListener(
        'volume',
        () => ele.value = Math.round(Spicetify.Player.getVolume() * 100)
    )
})();