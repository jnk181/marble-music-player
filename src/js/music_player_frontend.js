cursor_move_delta = 0;
cursor_move_interval = 100;
perc = 0;
let seekbar_interval;
var preload_audio = new Audio();
preload_audio.preload = "auto";
lastFMUpdateIntervalSeconds=30;

var lastFMUpdateInterval=0;
var lastFMUpdateIntervalIdSet = new Set();

music_collections = [
    {
        name: "English Bossa Nova",
        search_syntax: `
                    {genre:English - Jazz - Bossa Nova}
                    `,
        cover: "/img/various/coffee.avif",
    },
    {
        name: "Chill House",
        search_syntax: `
                    {The Weekend .Michael Gray Sultra Extended Mix.}
                    ~{aa:Lunare Project,Always Summer,track=1}
                    `,
        cover: "https://cdn3d.iconscout.com/3d/premium/thumb/palm-tree-3d-icon-download-in-png-blend-fbx-gltf-file-formats--dates-date-coconut-eid-and-ramadan-pack-culture-religion-festivals-icons-4432209.png?f=webp",
    },
    {
        name: "Frutiger Aero - Instrumental",
        search_syntax: `
                    {阿保剛,Takeshi Abo KID Collection～My Merry May,!.*MusicBox,!.* mix}
                    ~{album:Nintendo Wii Music Collection}
                    ~{aa:Solar Fields,title:Introduction}
                    `,
        cover: "/img/various/frutigeraero.avif",
    },
    {
        name: "Nostalgic Instrumental Tech Music",
        search_syntax: `
                    {aa:bulb,title:absent}
                    ~{.*windows.*}
                    ~{drifting 2}
                    ~{kevin macleod,light electronic,{track<=4~track=9~track>=18}}
                    `,
        cover: "/img/various/windowslogo.avif",
    },
    {
        name: "1990s Pop",
        search_syntax: `date>1989,date<2000,genre:%pop%`,
        cover: "/img/various/musiccd_1990s.avif",
    },
    {
        name: "2000s Pop",
        search_syntax: `genre:english - pop,date>=2000,date<2010`,
        cover: "/img/various/windowsxp_musiccd.avif",
    },
    {
        name: "2010-2015 Pop",
        search_syntax: `{genre:english - pop~aa:Violetta Cast},date>=2010,date<2015-06-01`,
        cover: "/img/various/music_2012.avif",
    },
    {
        name: "2015-2017 Pop",
        search_syntax: `genre:english - pop,date>=2015-06-01,date<2017-09-01`,
        cover: "/img/various/music_2016.avif",
    },
    {
        name: "2017-2021 Pop",
        search_syntax: `genre:english - pop,date>=2017-09-01,date<2021-06-15`,
        cover: "/img/various/itunes_2016.avif",
    },
    {
        name: "1960s,70s,80s Rock",
        search_syntax: `date>=1960,date<1990,genre:%rock%`,
        cover: "/img/various/guitar_70s.avif",
    },
    {
        name: "1990s Rock",
        search_syntax: `date>=1990,date<2000,genre:%rock%`,
        cover: "/img/various/guitar_90s.avif",
    },
    {
        name: "2000s Rock",
        search_syntax: `date>=2000,date<2010,genre:%rock%,!Kate Alexa,!genre:%pop%`,
        cover: "/img/various/guitar_2000s.avif",
    },
    {
        name: "2021-2029 Pop",
        search_syntax: `date>=2021-06-15,date<2030,genre:english%pop%`,
        cover: "/img/various/music_2024.avif",
    },
    {
        name: "2020s Rock",
        search_syntax: `date>=2020,date<2030,genre:english%rock%`,
        cover: "/img/various/guitar_2020s.avif",
    },
    {
        name: "2010s Rock",
        search_syntax: `date>=2010,date<2020,genre:english%rock%`,
        cover: "/img/various/guitar_2010s.avif",
    },
    {
        name: "TikTok Music 2021-2023",
        search_syntax: `
        {aa:Lady Gaga,Bloody Mary}
        ~{aa:Block B,NalinA .Instrumental.}
        ~{STAY,aa:The Kid LAROI.*}
        ~{Life Goes On,aa:Oliver Tree}
        ~{Kiss Me More .feat. SZA.,aa:Doja Cat}
        ~{aa:Heat Waves,Glass Animals}
        ~{MONTERO .Call Me By Your Name.,aa:Lil Nas X}
        ~{INDUSTRY BABY,aa:Lil Nas X}
        ~{abcdefu,aa:GAYLE}
        ~{aa:Sales,Pope Is a Rockstar}
        ~{aa:Akon,Bananza .Belly Dancer.}
        ~{aa:Bella Poarch,Build a Bitch}
        ~{aa:Dua Lipa,Levitating}
        ~{good 4 u,aa:Olivia Rodrigo}
        ~{aa:PlayaPhonk,PHONKY TOWN}
        ~{aa:Gwen Stefani,Luxurious}
        ~{aa:Doja Cat,Streets}
        ~{aa:Pastel Ghost,Dark Beach}
        ~{aa:Mr.Kitty,After Dark}
        ~{aa:Saweetie.*,Best Friend .feat. Doja Cat.}
        ~{SexyBack.*,aa:Justin Timberlake}
        ~{Nicky Youre.*,Sunroof}
        ~{Sean Paul,Temperature}
        ~{Jaymes Young,Infinity}
        ~{Mine,Bazzi}
        ~{Sia,Snowman}
        ~{Tones And I,Dance Monkey}
        ~{hot girl bummer,blackbear}
        ~{34+35,Ariana Grande}
        ~{Justin Bieber.*,Peaches}
        ~{INFERNO,.*Bella Poarch.*}
        ~{Charlie Puth,Light Switch}
        ~{Watermelon Sugar,Harry Styles}
        ~{As It Was,Harry Styles}
        ~{Musical Youth,Pass The Dutchie.*}
        ~{Paint The Town Red,Doja Cat}
        ~{Need To Know,Doja Cat}
        ~{Måneskin,Beggin'}
        ~{Just Dance,aa:Lady Gaga}
        ~{Love You Like A Love Song,Selena Gomez.*}
        ~{Sicksick,Obsessed}
        ~{Pusher.*,Clear .Shawn Wasabi Remix.}
        ~{all I want is you,Rebzyyx.*}
        ~{Ezekiel,help_urself}
        ~{Siouxxie,masquerade}
        ~{Jenny (I Wanna Ruin Our Friendship),Studio Killers}
        ~{%And to Those I Love_ Thanks for Sticking Around,_uicideboy_}
        ~{Indila,Tourner dans le vide}
        `,
        cover: "/img/various/tiktok.avif",
    },
];

function selectHighlight(elem) {
    if (elem.parentElement.querySelector(".selected"))
        elem.parentElement
            .querySelector(".selected")
            .classList.remove("selected");
    elem.classList.add("selected");
}

function setPauseIcon() {

    document.querySelectorAll(".button-play img").forEach(item=>item.src="./img/music_player/pause.png")
    document.querySelector(".ymp-nowplaying-cont").dataset.playingState =
        "playing";
}

function setPlayIcon() {
    document.querySelectorAll(".button-play img").forEach(item=>item.src="./img/music_player/play.png")
    document.querySelector(".ymp-nowplaying-cont").dataset.playingState =
        "paused";
}

function seekbarCursorForward() {
    // cursor_move_delta=cursor_move_interval / music_agent.currentLength();
    // perc=document.querySelector(".seekbar .cursor").style.left.replace("%","");
    // if(perc=="") perc=0
    // else perc=parseFloat(perc)
    // perc=perc+cursor_move_delta*100;
    if (playingMusicVideo()) {
        music_video_elem = document.querySelector(
            ".ymp-nowplaying-artwork video"
        );
        perc = (music_video_elem.currentTime / music_video_elem.duration) * 100;
    } else {
        perc =
            (music_agent.currentPosition() / music_agent.currentLength()) * 100;
    }
    document.querySelectorAll(".seekbar .cursor").forEach(item => {
        item.style.left = perc + "%";
    })

    document.querySelectorAll(".seekbar .progress-coverage").forEach(item => {
        item.style.width =perc + "%";
    })

    if (perc > 100) window.clearInterval(seekbar_interval);

    if (!playingMusicVideo()) {
        var cur_seconds = Math.floor(music_agent.currentPosition() / 1000);
        var cur_minutes = Math.floor(cur_seconds / 60);
        cur_seconds = cur_seconds % 60;
        var cur_seconds = ("0000" + cur_seconds).slice(-2);
    } else {
        mv_elem = document.querySelector(".ymp-nowplaying-artwork video");
        var cur_seconds = Math.floor(mv_elem.currentTime);
        var cur_minutes = Math.floor(cur_seconds / 60);
        cur_seconds = cur_seconds % 60;
        var cur_seconds = ("0000" + cur_seconds).slice(-2);
    }

    document.querySelectorAll(".ymp-nowplaying-details .time").forEach(item => {
        item.innerHTML = `${cur_minutes}:${cur_seconds}`;
    })
}

function seekTrack(e) {
    //console.log(e)
    clicked_width = e.srcElement.getBoundingClientRect().width;
    clicked_dest = e.clientX - e.srcElement.getBoundingClientRect().left;

    if (!playingMusicVideo())
        music_agent.setPosition(
            music_agent.currentLength() * (clicked_dest / clicked_width)
        );
    mv_elem = document.querySelector(".ymp-nowplaying-artwork video");
    if (playingMusicVideo())
        document.querySelector(".ymp-nowplaying-artwork video").currentTime =
            mv_elem.duration * (clicked_dest / clicked_width);
    //console.log((music_agent.currentLength() * (clicked_dest / clicked_width)))

    document.querySelectorAll(".seekbar .cursor").forEach(item => {
        item.style.left = (clicked_dest / clicked_width) * 100 + "%";
    });

    document.querySelectorAll(".seekbar .progress-coverage").forEach(item => {
        item.style.width = perc + "%";
    })
}

function preloadSound(src) {
    var sound = document.createElement("audio");
    if ("src" in sound) {
        sound.autoPlay = false;
    } else {
        sound = document.createElement("bgsound");
        sound.volume = -10000;
        sound.play = function () {
            this.src = src;
            this.volume = 0;
        };
    }
    sound.src = src;
    document.body.appendChild(sound);
    return sound;
}

track_started_playing_at_timestamp=""

function playSongAtIndex(index) {
    clearInterval(lastFMUpdateInterval)
    track_started_playing_at_timestamp=parseInt(Date.now()/1000);

    music_agent.setVolume(1);

    document.querySelectorAll(".seekbar").forEach(item => { item.style.backgroundImage = ""; })

    window.clearInterval(seekbar_interval);

    document.querySelectorAll(".seekbar .cursor").forEach(item => { item.style.left = "0%"; })
    document.querySelectorAll(".seekbar .progress-coverage").forEach(item => { item.style.width = ""; })
    //post_id = document.querySelector(`*[data-orderindex='${index}']`).dataset.postid;
    post_id=window.api.getSongId(music_agent.tracks[index])

    music_agent.gotoTrack(index);
    if (playingMusicVideo()) {
        music_agent.setVolume(0);
        music_agent.stop();
        document.querySelector(
            ".ymp-nowplaying-artwork video"
        ).src = `./php/endpoints/music_fetch.php?action_type=get_musicvideo&post_id=${post_id}`;
        document.querySelector(".ymp-nowplaying-artwork video").currentTime = 0;
        document.querySelector(".ymp-nowplaying-artwork video").play();
    } else {
        music_agent.setVolume(1);
        document.querySelector(".ymp-nowplaying-artwork video").src = ``;
    }

    if (music_agent.tracks[music_agent.currentIndex + 1] != null) {
        setTimeout(() => {
            preloadSound(music_agent.tracks[music_agent.currentIndex + 1]);
            //preload_audio.src=(music_agent.tracks[music_agent.currentIndex+1]);
            //preload_audio.play()
        }, "200");
    }

    document.querySelectorAll(`.symbol-space .playing`).forEach((item) => {
        item.classList.add("opacity0");
    });
    //console.log(post_id);
    document.querySelector(`*[data-postid='${post_id}'] .symbol-space .playing`)
        .classList.remove("opacity0");
    document
        .querySelector(`*[data-postid='${post_id}']`)
        .parentElement.parentElement.classList.remove("closed");

    if (document.querySelector(`body`).dataset.shuffleMode == "1") {
        document.querySelector(`*[data-postid='${post_id}']`).scrollIntoView();
        document
            .querySelector(`*[data-postid='${post_id}']`)
            .parentElement.parentElement.scrollIntoView();
    }

    document.querySelector(`.ymp-nowplaying-cont`).dataset.title =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.title;
    document.querySelector(`.ymp-nowplaying-cont`).dataset.albumArtist =
        document.querySelector(
            `*[data-postid='${post_id}']`
        ).dataset.albumArtist;
    document.querySelector(`.ymp-nowplaying-cont`).dataset.album =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.album;

    document.querySelector(`.ymp-nowplaying-info span.artist`).innerHTML =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.artist;
    document.querySelector(`.ymp-nowplaying-mobile-bottom-flyout .info .text .artist`).innerHTML =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.artist;
    document.querySelector(`.ymp-nowplaying-info span.title`).innerHTML =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.title;
    document.querySelector(`.ymp-nowplaying-mobile-bottom-flyout .info .text .title`).innerHTML =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.title;
    document.querySelector(`.ymp-nowplaying-info span.album`).innerHTML =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.album;
    document.querySelector(`.ymp-nowplaying-mobile-bottom-flyout .info .text .album`).innerHTML =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.album;
    document.querySelector(`.ymp-nowplaying-info span.genre`).innerHTML =
        document.querySelector(`*[data-postid='${post_id}']`).dataset.genre;

    document.querySelectorAll(`.ymp-nowplaying-details .postid`).forEach(item=>item.innerHTML = document.querySelector(`*[data-postid='${post_id}']`).dataset.postid);

    // fetch(
    //     `./php/endpoints/music_fetch.php?action_type=get_songinfo&post_id=${post_id}`
    // )
    //     .then((response) => response.json())
    //     .then((data) => {
    //         data["lyrics"] = data["lyrics"].replaceAll("\n", "<br>");
    //         document.querySelector(`.ymp-library-lyrics span`).innerHTML =
    //             data["lyrics"];
    //     });

    if (!artworkHidden()) {
        window.api.setAlbumCoverNowPlaying(document.querySelector(".ymp-nowplaying-artwork img"),post_id);
        window.api.setAlbumCoverNowPlaying(document.querySelector(".ymp-nowplaying-mobile-bottom-flyout img.cover"),post_id);
    }
    if (!artworkHidden())
        document.querySelector(
            ".ymp-nowplaying-artwork .background"
        ).style.background = `linear-gradient(#000000aa,#000000aa), url(./php/endpoints/music_fetch.php?action_type=get_album_cover&post_id=${post_id})`;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: document.querySelector(`*[data-postid='${post_id}']`).dataset
            .title, //the title of the media
        artist: document.querySelector(`*[data-postid='${post_id}']`).dataset
            .artist, //the artist of the media
        album: document.querySelector(`*[data-postid='${post_id}']`).dataset
            .album, //the album name of the media
        artwork: (!artworkHidden()) 
        ? [{ src: "https://"+document.querySelector(".ymp-nowplaying-artwork img").src.split('?')[0].split("file://")[1], sizes: '800x800', type: 'image/png' }] 
        : [], //the album art associated with the media
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
    navigator.mediaSession.setActionHandler("play", () => playButton());
    navigator.mediaSession.setActionHandler("pause", () => playButton());
    navigator.mediaSession.setActionHandler("stop", () => stopButton());

    //document.querySelector('.seekbar').style.backgroundImage=`url(/php/endpoints/get_waveform_from_audio.php?post_id=${post_id})`;
        if (!artworkHidden())
            document.querySelectorAll(".seekbar").forEach(item => {
                window.api.setWaveformImage(item,post_id);
                // item.style.backgroundImage = `url(./php/endpoints/get_waveform_from_audio.php?post_id=${post_id}&musicvideo=${
                //     playingMusicVideo() ? 1 : 0
                // })`;
            })
    seekbar_interval = window.setInterval(
        seekbarCursorForward,
        cursor_move_interval
    );
    if (music_agent.isPlaying) {
        setPauseIcon();
    }

    window.api.setLyrics(document.querySelector(`.ymp-library-lyrics span`),post_id)

    window.api.lastfmUpdateNowPlaying(
        document.querySelector('.ymp-nowplaying-cont').dataset.title,
        document.querySelector('.ymp-nowplaying-cont').dataset.album,
        document.querySelector('.ymp-nowplaying-cont').dataset.albumArtist,
        track_started_playing_at_timestamp
    );
}

function prevTrack() {
    if (music_agent.tracks[music_agent.currentIndex - 1] != null) {
        playSongAtIndex(music_agent.currentIndex - 1);
    } else {
        music_agent.stop();
        music_agent.currentIndex = 0;
    }
}

function nextTrack() {
    if (music_agent.tracks[music_agent.currentIndex + 1] != null) {
        playSongAtIndex(music_agent.currentIndex + 1);
    } else if (
        document.querySelector(`body`).dataset.repeatMode == "repeat-playlist"
    ) {
        if (document.querySelector(`body`).dataset.shuffleMode == "1")
            shuffle(music_agent.tracks);
        playSongAtIndex(0);
    } else {
        music_agent.stop();
        music_agent.currentIndex = 0;
    }
}

function YBR_openAlbum(elem) {
    if (elem.parentElement.classList.contains("closed")) {
        elem.parentElement.classList.remove("closed");
    } else {
        elem.parentElement.classList.add("closed");
    }
}

function loadArtists() {
    document.querySelectorAll(".ymp-library-list-item:not(.template)").forEach(item => item.remove())

    window.api.getAlbumArtists().forEach(artist => {
                temp_node = document
                    .querySelector(".ymp-library-list-item.template")
                    .cloneNode(true);
                temp_node.classList.remove("template");
                temp_node.dataset.itemName = artist.replace(/ \(\d+曲\)$/, "");
                temp_node.querySelector("span").innerHTML = artist;
                temp_node.onclick = function () {
                    loadAlbums(artist.replace(/ \(\d+曲\)$/, ""));
                    selectHighlight(this);
                };
                document
                    .querySelector(".ymp-library-artists-list")
                    .appendChild(temp_node);
    })
}

function loadGenres() {
    document.querySelectorAll(".ymp-library-list-item:not(.template)").forEach(item => item.remove())

    window.api.getGenres().forEach(genre => {
        temp_node = document
                    .querySelector(".ymp-library-list-item.template")
                    .cloneNode(true);
                temp_node.classList.remove("template");
                temp_node.dataset.itemName = genre.replace(/ \(\d+曲\)$/, "");
                temp_node.querySelector("span").innerHTML = genre;
                temp_node.onclick = function () {
                    loadAlbumsByGenre(genre.replace(/ \(\d+曲\)$/, ""));
                    selectHighlight(this);
                };
                document
                    .querySelector(".ymp-library-genres-list")
                    .appendChild(temp_node);
    })
}

function loadCollections() {
    music_collections.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
    music_collections.forEach((collection) => {
        collection.search_syntax = collection.search_syntax
            .replaceAll("\n", "")
            .replaceAll(/ {3,}/g, "");
        temp_node = document
            .querySelector(".ymp-library-collections-item.template")
            .cloneNode(true);
        temp_node.classList.remove("template");
        temp_node.dataset.itemName = collection.name;
        temp_node.querySelector("span").innerHTML = collection.name;
        if (collection.cover != "")
            temp_node.querySelector("img").src = collection.cover;
        temp_node.onclick = function () {
            document
                .querySelectorAll(`.ymp-library-collections-item.selected`)
                .forEach((item) => item.classList.remove("selected"));
            this.classList.add("selected");
            loadAlbumsByKeyword(collection.search_syntax);
        };
        document
            .querySelector(".ymp-library-collections-list")
            .appendChild(temp_node);
    });
}

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
}

function loadAlbums(album_artist) {
    music_agent.stop();
    music_agent.removeAllTracks();
    document.querySelectorAll(".ymp-playlist-list >*:not(.template)").forEach((elem) => elem.remove());
    
    document.querySelectorAll(".ymp-playlist-list >*:not(.template)").forEach((elem) => elem.remove());
    song_cnt = 0;
    window.api.getAlbumsByAlbumArtists(album_artist).forEach(album=>{
        temp_node = document
            .querySelector(".ymp-playlist-list-album.template")
            .cloneNode(true);
        temp_node.classList.remove("template");
        //temp_node.id=`album-num-${albm_cnt}`
        temp_node.querySelector(
            ".cover"
        ).src = `./thumbnail.php?id=${album["first_post_id"]}`;
        
        window.api.setAlbumCoverImage(temp_node.querySelector(".cover"), album["first_post_id"]);

        temp_node.querySelector(
            ".info span.album"
        ).innerHTML = `${album["album"]}`;
        temp_node.querySelector(
            ".info span.artist"
        ).innerHTML = `${album["album_artist"]}`;
        temp_node.querySelector(
            ".info span.rdate"
        ).innerHTML = `${album["rdate"]}`;
        var minutes = Math.floor(album["length"] / 60);
        var seconds = album["length"] % 60;
        seconds = ("0000" + seconds).slice(-2);
        temp_node.querySelector(".info span.tracks").innerHTML = `${
            album["count"]
        } ${
            parseInt(album["count"]) > 1 ? "tracks" : "track"
        } (${minutes}:${seconds})`;

        temp_node.querySelector(
            ".info span.genre"
        ).innerHTML = `${album["genre"]}`;

        disc_diff_counter = 0;
        prev_disc = -1;
        current_disc = -1;

        album["songs"].forEach((song) => {
            current_disc = song["disc_num"];
            if (current_disc != prev_disc) {
                temp_node3 = document
                    .querySelector(
                        ".ymp-playlist-list-album-bottom-discnum-header.template"
                    )
                    .cloneNode(true);
                temp_node3.classList.remove("template");
                disc_diff_counter++;
                temp_node3.querySelector(
                    "span"
                ).innerHTML = `Disc ${current_disc}`;
                temp_node
                    .querySelector(".ymp-playlist-list-album-bottom")
                    .appendChild(temp_node3);
                prev_disc = current_disc;
            }
            music_agent.addTrack(
                `${song["file_path"]}`
            );
            temp_node2 = document
                .querySelector(
                    ".ymp-playlist-list-album-bottom-item.template"
                )
                .cloneNode(true);
            temp_node2.classList.remove("template");
            temp_node2.querySelector(
                ".track"
            ).innerHTML = `${song["track"]}`;
            temp_node2.querySelector(".title .main").innerHTML = `${song["title"]}`;
            var minutes = Math.floor(song["duration"] / 60);
            seconds = song["duration"] % 60;
            var seconds = ("0000" + seconds).slice(-2);
            temp_node2.querySelector(".duration").innerHTML = `${minutes}:${seconds}`;
            temp_node2.dataset.title = song["title"];
            temp_node2.dataset.albumArtist = song["album_artist"];
            temp_node2.dataset.artist = song["artist"];
            song["other_artists"]=song["artist"].replace(RegExp(`[;/, ]{0,}${song["album_artist"]}[;/, ]{0,}`),"");
            if(song["other_artists"]!="") {
                temp_node2.querySelector(".other-artists").innerHTML+=`・${song["other_artists"]}`;
            }
            temp_node2.dataset.album = song["album"];
            temp_node2.dataset.genre = song["rdate"];
            temp_node2.dataset.postid = song["id"];
            temp_node2.dataset.hasMusicVideo = song["has_music_video"];
            temp_node2.dataset.orderindex = song_cnt;
            song_cnt++;
            temp_node2.onclick = function () {playSongAtIndex(this.dataset.orderindex);};

            temp_node
                .querySelector(".ymp-playlist-list-album-bottom")
                .appendChild(temp_node2);
        });

        if (disc_diff_counter == 1) {
            disc_diff_counter = 0;
            temp_node
                .querySelectorAll(
                    ".ymp-playlist-list-album-bottom-discnum-header"
                )
                .forEach((dh) => dh.remove());
        }

        document
            .querySelector(".ymp-playlist-list")
            .appendChild(temp_node);
        temp_node.style.maxHeight = `${
            70 + album["songs"].length * 28 + disc_diff_counter * 24
        }px`;
    })

    if (document.querySelector(`body`).dataset.shuffleMode == "1")
        shuffle(music_agent.tracks);
}

function loadAlbumsByGenre(genre) {
    music_agent.stop();
    music_agent.removeAllTracks();
    document.querySelectorAll(".ymp-playlist-list >*:not(.template)").forEach((elem) => elem.remove());

    document.querySelectorAll(".ymp-playlist-list >*:not(.template)").forEach((elem) => elem.remove());
    song_cnt = 0;
    window.api.getAlbumsByGenre(genre).forEach(album => {
        temp_node = document
                    .querySelector(".ymp-playlist-list-album.template")
                    .cloneNode(true);
                temp_node.classList.remove("template");
                //temp_node.id=`album-num-${albm_cnt}`
                
                if(!artworkHidden()) window.api.setAlbumCoverImage(temp_node.querySelector(".cover"), album["first_post_id"]);

                temp_node.querySelector(
                    ".info span.album"
                ).innerHTML = `${album["album"]}`;
                temp_node.querySelector(
                    ".info span.artist"
                ).innerHTML = `${album["album_artist"]}`;
                temp_node.querySelector(
                    ".info span.rdate"
                ).innerHTML = `${album["rdate"]}`;

                var minutes = Math.floor(album["length"] / 60);
                var seconds = album["length"] % 60;
                seconds = ("0000" + seconds).slice(-2);
                temp_node.querySelector(".info span.tracks").innerHTML = `${
                    album["count"]
                } ${
                    parseInt(album["count"]) > 1 ? "tracks" : "track"
                } (${minutes}:${seconds})`;

                temp_node.querySelector(
                    ".info span.genre"
                ).innerHTML = `${album["genre"]}`;

                album["songs"].forEach((song) => {
                    music_agent.addTrack(
                        `${song["file_path"]}`
                    );
                    temp_node2 = document
                        .querySelector(
                            ".ymp-playlist-list-album-bottom-item.template"
                        )
                        .cloneNode(true);
                    temp_node2.classList.remove("template");
                    temp_node2.querySelector(
                        ".track"
                    ).innerHTML = `${song["track"]}`;
                    temp_node2.querySelector(
                        ".title"
                    ).innerHTML = `${song["title"]}`;
                    var minutes = Math.floor(song["duration"] / 60);
                    seconds = song["duration"] % 60;
                    var seconds = ("0000" + seconds).slice(-2);
                    temp_node2.querySelector(
                        ".duration"
                    ).innerHTML = `${minutes}:${seconds}`;
                    temp_node2.dataset.title = song["title"];
                    temp_node2.dataset.albumArtist = song["album_artist"];
                    temp_node2.dataset.artist = song["artist"];
                    temp_node2.dataset.album = song["album"];
                    temp_node2.dataset.genre = song["rdate"];
                    temp_node2.dataset.postid = song["id"];
                    temp_node2.dataset.hasMusicVideo = song["has_music_video"];
                    temp_node2.dataset.orderindex = song_cnt;
                    song_cnt++;
                    temp_node2.onclick = function () {
                        playSongAtIndex(this.dataset.orderindex);
                    };

                    temp_node
                        .querySelector(".ymp-playlist-list-album-bottom")
                        .appendChild(temp_node2);
                });

                document
                    .querySelector(".ymp-playlist-list")
                    .appendChild(temp_node);
                temp_node.style.maxHeight = `${
                    70 + album["songs"].length * 28
                }px`;
    })

    if (document.querySelector(`body`).dataset.shuffleMode == "1")
        shuffle(music_agent.tracks);
}

function loadAlbumsByKeyword(myKeyword) {
    music_agent.stop();
    music_agent.removeAllTracks();
    document.querySelectorAll(".ymp-playlist-list >*:not(.template)").forEach((elem) => elem.remove());

    data=window.api.getAlbumsByKeyword(myKeyword);

    song_cnt = 0;
    data.forEach((album) => {
    temp_node = document
        .querySelector(".ymp-playlist-list-album.template")
        .cloneNode(true);
    temp_node.classList.remove("template");
    //temp_node.id=`album-num-${albm_cnt}`
    temp_node.querySelector(
        ".cover"
    ).src = `./thumbnail.php?id=${album["first_post_id"]}`;

    window.api.setAlbumCoverImage(temp_node.querySelector(".cover"), album["first_post_id"]);

    temp_node.querySelector(
        ".info span.album"
    ).innerHTML = `${album["album"]}`;
    temp_node.querySelector(
        ".info span.artist"
    ).innerHTML = `${album["album_artist"]}`;
    temp_node.querySelector(
        ".info span.rdate"
    ).innerHTML = `${album["rdate"]}`;
    temp_node.querySelector(".info span.tracks").innerHTML = `${
        album["count"]
    } ${parseInt(album["count"]) > 1 ? "tracks" : "track"}`;
    temp_node.querySelector(
        ".info span.genre"
    ).innerHTML = `${album["genre"]}`;

    album["songs"].forEach((song) => {
        music_agent.addTrack(
            `${song["file_path"]}`
        );
        temp_node2 = document
            .querySelector(
                ".ymp-playlist-list-album-bottom-item.template"
            )
            .cloneNode(true);
        temp_node2.classList.remove("template");
        temp_node2.querySelector(
            ".track"
        ).innerHTML = `${song["track"]}`;
        temp_node2.querySelector(
            ".title"
        ).innerHTML = `${song["title"]}`;
        var minutes = Math.floor(song["duration"] / 60);
        seconds = song["duration"] % 60;
        var seconds = ("0000" + seconds).slice(-2);
        temp_node2.querySelector(
            ".duration"
        ).innerHTML = `${minutes}:${seconds}`;
        temp_node2.dataset.title = song["title"];
        temp_node2.dataset.albumArtist = song["album_artist"];
        temp_node2.dataset.artist = song["artist"];
        temp_node2.dataset.album = song["album"];
        temp_node2.dataset.genre = song["rdate"];
        temp_node2.dataset.postid = song["id"];
        temp_node2.dataset.filePath=song["file_path"];
        temp_node2.dataset.hasMusicVideo = song["has_music_video"];
        temp_node2.dataset.orderindex = song_cnt;
        song_cnt++;
        temp_node2.onclick = function () {
            playSongAtIndex(this.dataset.orderindex);
        };

        temp_node.querySelector(".ymp-playlist-list-album-bottom").appendChild(temp_node2);
    });

    document.querySelector(".ymp-playlist-list").appendChild(temp_node);
    temp_node.style.maxHeight = `${
        70 + album["songs"].length * 28
    }px`;
    });
    if (document.querySelector(`body`).dataset.shuffleMode == "1")
        shuffle(music_agent.tracks);
    playSongAtIndex(0);
}

function switchTab(elm) {
    document
        .querySelectorAll(".ymp-tabbed-content >*")
        .forEach((item) => (item.style.display = "none"));
    //console.log(elm.dataset.tabname);
    document.querySelector("." + elm.dataset.tabname).style.display = "";
    //console.log(elm.parentElement);
    if (elm.parentElement.querySelector(".selected"))
        elm.parentElement
            .querySelector(".selected")
            .classList.remove("selected");
    elm.classList.add("selected");
    
    if(elm.dataset.tabname=="ymp-library-artists") {
        loadArtists();
    }

    if(elm.dataset.tabname=="ymp-library-genres") {
        loadGenres();
    }
}

function stopButton() {
    music_agent.stop();
    document.querySelector(`.ymp-nowplaying-cont`).dataset.musicVideo = "0";
    document.querySelector(`.ymp-nowplaying-cont video`).src = "";
    document.querySelectorAll(`.symbol-space .playing`).forEach((item) => {
        item.classList.add("opacity0");
    });
}

function playButton() {
    if (
        document.querySelector(`.ymp-nowplaying-cont`).dataset.playingState ==
        "stopped"
    ) {
        playSongAtIndex(0);
    } else if (playingMusicVideo()) {
        if (document.querySelector(".ymp-nowplaying-artwork video").paused) {
            document.querySelector(".ymp-nowplaying-artwork video").play();
            setPauseIcon();
        } else {
            document.querySelector(".ymp-nowplaying-artwork video").pause();
            setPlayIcon();
        }
    } else {
        music_agent.playpause();
        if (music_agent.isPlaying) {
            track_started_playing_at_timestamp=parseInt(Date.now()/1000);
            setPauseIcon();
            seekbar_interval = window.setInterval(
                seekbarCursorForward,
                cursor_move_interval
            );
        } else {
            setPlayIcon();
            window.clearInterval(seekbar_interval);
        }
    }
}

async function handleArgs() {
    const args = await window.api.getArgs();
    console.log("My args:", args);
    
    if (args.includes('--playalbum')) {
        window.api.playAlbum(args[1],args[2]);
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    document
        .getElementById("ymp-library-searchbox")
        .addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                document.getElementById("ymp-library-searchbox-button").click();
            }
        });

    post_ids_with_musicvideo = [];

    document.querySelectorAll(".seekbar").forEach(item=>item.addEventListener("click", function (e) {
        seekTrack(e);
    }));

    document.querySelectorAll(".seekbar").forEach(item => {
        item.addEventListener("mousemove", function (e) {
            clicked_width = e.target.getBoundingClientRect().width;
            clicked_dest = e.clientX - e.target.getBoundingClientRect().left;
            e.target.querySelector(".cursor-hover").style.left =
                (clicked_dest / clicked_width) * 100 + "%";
        });
    })

    music_agent = new YumbooruMusicPlayerJS();
    music_agent.setVolume(0);

    music_agent.audioPlayback.addEventListener("ended", () => {
        if (document.querySelector(`body`).dataset.repeatMode == "repeat-song") {
            
        }
        else nextTrack();
    });

    document
        .querySelector(`.ymp-nowplaying-cont video`)
        .addEventListener("ended", () => {
            if (
                document.querySelector(`body`).dataset.repeatMode ==
                "repeat-song"
            )
                console.log("repeat song");
            else nextTrack();
            nextTrack();
        });

    music_agent.onstop = function () {
        resetInfo();
        setPlayIcon();
        clearInterval(seekbar_interval);
        clearInterval(lastFMUpdateInterval)
        document.querySelector(".ymp-nowplaying-cont").dataset.playingState =
            "stopped";
        document.querySelectorAll(".seekbar .cursor").forEach(item => {
            item.style.left = "";
        })
        document.querySelectorAll(".seekbar .progress-coverage").forEach(item => {
            item.style.width = "";
        })
        document.querySelector(`.ymp-nowplaying-cont`).dataset.musicVideo = "0";
        document.querySelector(`.ymp-nowplaying-cont video`).src = "";
    };

    music_agent.onloop = function() {
        track_started_playing_at_timestamp=parseInt(Date.now()/1000);
    }

    music_agent.onplay = function (tn) {
        //clearInterval(lastFMUpdateInterval)
        lastFMUpdateIntervalIdSet.forEach(id => clearInterval(id))
        //console.log(parseInt(music_agent.audioPlayback.duration / 2))
        
        setTimeout(() => {
            lastFMUpdateIntervalSeconds=Math.min(parseInt(music_agent.audioPlayback.duration / 2),2 * 60)
            if(!isNaN(lastFMUpdateIntervalSeconds)) {
                console.log(lastFMUpdateIntervalSeconds)
                lastFMUpdateIntervalIdSet.add(setInterval(lastFMUpdate, lastFMUpdateIntervalSeconds * 1000))
            }
        }, 900);

        res = /id=(?<post_id>\d+)/g.exec(tn);
        if (res) post_id = res[1];

        if (post_ids_with_musicvideo.includes(post_id) && !artworkHidden()) {
            document.querySelector(`.ymp-nowplaying-cont`).dataset.musicVideo =
                "1";
        } else {
            document.querySelector(`.ymp-nowplaying-cont`).dataset.musicVideo =
                "0";
        }
    };

    loadArtists();
    loadCollections();
    handleArgs();
});

function playingMusicVideo() {
    return (
        document.querySelector(`.ymp-nowplaying-cont`).dataset.musicVideo == "1"
    );
}

function resetInfo() {
    document.querySelector(".ymp-nowplaying-artwork img").src = "./img/music_player/disc.png";
    document.querySelector(`.ymp-nowplaying-info span.artist`).innerHTML = "";
    document.querySelector(`.ymp-nowplaying-info span.title`).innerHTML = "";
    document.querySelector(`.ymp-nowplaying-info span.album`).innerHTML = "";
    document.querySelector(`.ymp-nowplaying-info span.genre`).innerHTML = "";
    document.querySelector(`.seekbar`).style.backgroundImage = "";
    document.querySelector(`.ymp-nowplaying-cont`).dataset.albumArtist = "";
    document.querySelector(`.ymp-nowplaying-cont`).dataset.album = "";
    document.querySelector(`.ymp-nowplaying-cont`).dataset.title = "";

    document.querySelector(".ymp-nowplaying-mobile-bottom-flyout img.cover").src = "./img/music_player/disc.png";
    document.querySelector(`.ymp-nowplaying-mobile-bottom-flyout span.artist`).innerHTML = "";
    document.querySelector(`.ymp-nowplaying-mobile-bottom-flyout span.title`).innerHTML = "";
    document.querySelector(`.ymp-nowplaying-mobile-bottom-flyout span.album`).innerHTML = "";
}

function gotoTab(elem) {
    document
        .querySelectorAll("#ymp-cont >*")
        .forEach((item) => item.classList.remove("mobile-visible"));
    document
        .querySelector(`.ymp-${elem.dataset.tabContent}-cont`)
        .classList.add("mobile-visible");
    document
        .querySelector(".mobile-tabber.selected")
        .classList.remove("selected");
    elem.classList.add("selected");
}

function hideShowArtwork() {
    document.querySelector("body").dataset.artworkHidden = !parseInt(
        document.querySelector("body").dataset.artworkHidden
    )
        ? "1"
        : "0";
}

function artworkHidden() {
    return document.querySelector("body").dataset.artworkHidden == "1";
}

function toggleShuffle() {
    document.querySelector(`body`).dataset.shuffleMode =
        document.querySelector(`body`).dataset.shuffleMode == "1" ? "0" : "1";
}

function toggleRepeat() {
    if (document.querySelector(`body`).dataset.repeatMode == "no-repeat") {
        document.querySelector(`body`).dataset.repeatMode = "repeat-playlist";
        music_agent.loop_audio = false;
    } else if (
        document.querySelector(`body`).dataset.repeatMode == "repeat-playlist"
    ) {
        document.querySelector(`body`).dataset.repeatMode = "repeat-song";
        music_agent.loop_audio = true;
    } else if (
        document.querySelector(`body`).dataset.repeatMode == "repeat-song"
    ) {
        document.querySelector(`body`).dataset.repeatMode = "no-repeat";
        music_agent.loop_audio = false;
    }
}

function showAbout() {
    console.log("hi")
}

function exitApp() {
    window.close()
}

function filterLibraryList(elem) {
    Array.from(
        elem.parentElement.parentElement.getElementsByClassName(
            `ymp-library-list-item hidden`
        )
    ).forEach((item) => {
        item.classList.remove("hidden");
    });

    Array.from(
        elem.parentElement.parentElement.getElementsByClassName(
            `ymp-library-collections-item hidden`
        )
    ).forEach((item) => {
        item.classList.remove("hidden");
    });

    console.log(elem.value);
    if (elem.value != "") {
        elem.parentElement.parentElement
            .querySelectorAll(
                `div[class^="ymp-library-"][class$="-item"]:not(div[class^="ymp-library-"][class$="-item"][data-item-name*='${elem.value.replaceAll(
                    "'",
                    "'"
                )}' i])`
            )
            .forEach((element) => {
                element.classList.add("hidden");
            });
    }
}

function refreshCSS() {
    document.querySelector('head style').innerHTML=document.querySelector('head style').innerHTML.replaceAll(/(@import url\(')(.*?)('\))/g,'$1 $2 $3');
}

function openMenuBarOptions(field_name) {
    menubar_options=[
        {
            name:"file",
            options: [
                {
                    img:"./img/music_player/exit.avif",
                    label:"Exit",
                    action:exitApp,
                    id:"exit"
                }
            ]
        },
        {
            name:"options",
            options: [
                {
                    img:"",
                    label:"artwork", // Show / Hide artwork
                    action:hideShowArtwork,
                    id:"showhideartwork"
                },
                {
                    img:"",
                    label:"Import music", // Show / Hide artwork
                    action:openWidgetImport,
                    id:"refreshcss"
                },
                {
                    img:"",
                    label:"Refresh CSS", // Show / Hide artwork
                    action:refreshCSS,
                    id:"refreshcss"
                }
            ]
        },
        {
            name:"help",
            options: [
                {
                    img:"",
                    label:"About", // Show / Hide artwork
                    action:showAbout,
                    id:"showabout"
                }
            ]
        }
    ]

    if(document.querySelector(`.ymp-menu-bar-option-menu`).dataset.open==field_name) {
        if(document.querySelector(`.ymp-menu-bar-option-menu`).style.display!="none") {
            document.querySelector(`.ymp-menu-bar-option-menu`).style.display="none";
        } else {
            document.querySelector(`.ymp-menu-bar-option-menu`).style.display="";
        }
    } else {
        document.querySelector(`.ymp-menu-bar-option-menu`).style.display="";
    }

    document.querySelector(`.ymp-menu-bar-option-menu`).dataset.open=field_name;

    menubar_option_template=document.querySelector(`.ymp-menu-bar-option-menu .option.template`)
    document.querySelectorAll(`.ymp-menu-bar-option-menu .option:not(.template)`).forEach(item => {
        item.remove();
    })
    menubar_options.find(x => x.name==field_name).options.forEach(option => {
        console.log(option)
        var temp_node4=menubar_option_template.cloneNode(true);
        console.log(temp_node4)
        temp_node4.querySelector('img').src=option.img;
        temp_node4.querySelector('span').innerHTML=option.label;
        temp_node4.id=`menubaroption-${option.id}`;
        temp_node4.onclick=option.action;
        temp_node4.classList.remove("template");
        menubar_option_template=document.querySelector(`.ymp-menu-bar-option-menu`).appendChild(temp_node4);
    })
}

function lastFMUpdate() {
    if(music_agent.isPlaying) {
        window.api.lastfmUpdateNowPlaying(
            document.querySelector('.ymp-nowplaying-cont').dataset.title,
            document.querySelector('.ymp-nowplaying-cont').dataset.album,
            document.querySelector('.ymp-nowplaying-cont').dataset.albumArtist,
            track_started_playing_at_timestamp
        );
        window.api.lastfmScrobble(
            document.querySelector('.ymp-nowplaying-cont').dataset.title,
            document.querySelector('.ymp-nowplaying-cont').dataset.album,
            document.querySelector('.ymp-nowplaying-cont').dataset.albumArtist,
            track_started_playing_at_timestamp
        );
        console.log("LASTFM scrobbled")
    }
}

function playSound(audiosrc) {
    var audio = new Audio(audiosrc);
    audio.play();
}

async function importMusicGUI() {
    await window.api.cleanDeletedFiles(); 
    await window.api.cleanRecentlyModified(); 
    await window.api.scanForFiles( function() {playSound("./sounds/dialog-warning.ogg")} );
}

function closeWidgets() {
    document.querySelector(`.widget-area`).style.display="none";
    document.querySelectorAll(`.widget-area .widget`).forEach(item => {item.style.display="none"})
}

function openWidget(widgname) {
    document.querySelector(`.widget-area`).style.display="";
    document.querySelector(`.widget-area .${widgname}`).style.display="";
}

function openWidgetImport() {
    openWidget('widget-import');
}