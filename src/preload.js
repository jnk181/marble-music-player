const testmgr = require("../models/testmgr");
var dbmgr = require("../models/dbmgr");
const fs = require('fs');

const os = require("os");
const glob = require("glob");
const { contextBridge, ipcRenderer } = require("electron");
let spawn = require("child_process").spawn;
const { exec } = require("child_process");

const directories_to_scan=[
  `/home/${os.userInfo().username}/Music`,
];

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

const cleanDeletedFiles = () => {
  return testmgr.cleanDeletedFiles();
};

const cleanRecentlyModified = () => {
  arr=[];
  directories_to_scan.forEach(path => {
     arr=arr.concat(testmgr.deleteRecentlyModifiedFromDB(path,30));
  })
  arr.forEach(recently_modified_file => {
      dbmgr.db.prepare(`DELETE FROM music_library WHERE file_path=?`).run(recently_modified_file);
  })
  //return arr;
};

const getTitles = () => {
  return testmgr.getTitles();
};

const getAlbumArtists = () => {
  return testmgr.getAlbumArtists().map((a) => a.album_artist);
};

const getGenres = () => {
    return testmgr.getGenres().map((a) => a.genre);
  };

const getAlbumsByKeyword = (keyword) => {
  return testmgr.getAlbumsByKeyword(keyword);
}

const getAlbumsByAlbumArtists = (artist_param) => {
  return testmgr.getAlbumsByAlbumArtists(artist_param);
};

const getAlbumsByGenre = (genre_param) => {
  return testmgr.getAlbumsByGenre(genre_param);
};

const getSongFilePath = (id) => {
  return testmgr.getSongFilePath(id);
};

const getSongId = (filepath) => {
    return testmgr.getSongId(filepath);
  };

const filePathImported = (file_path) => {
  return testmgr.filePathImported(file_path);
};

const getFileMetadataJSON = (filepath) => {
  let bat = spawn(`ffprobe`, [
    `-v`,
    `quiet`,
    `-of`,
    `json`,
    `-show_format`,
    `${filepath}`,
  ]);
  bat.on("exit", (code) => {
    src.src = `/home/${
      os.userInfo().username
    }/.local/share/marble_mp/thumbs/${id}.jpg`;
    console.log([src, id]);
  });
};

async function setAlbumCoverImage(src, id) {
    if(!fs.existsSync(`/home/${os.userInfo().username}/.local/share/marble_mp/thumbs/${id}.jpg`)) {
        mp3path = getSongFilePath(id);
        await executeCommand(`ffmpeg -i '${mp3path.replaceAll("'","'\\\''")}' -filter:v scale=-2:120 -an '/home/${os.userInfo().username}/.local/share/marble_mp/thumbs/${id}.jpg' -y`);
        src.src = `/home/${os.userInfo().username}/.local/share/marble_mp/thumbs/${id}.jpg`;
        console.log([src, id]);
    }
    else {
        src.src = `/home/${os.userInfo().username}/.local/share/marble_mp/thumbs/${id}.jpg`;
    }
};

async function setLyrics(src, id) {
    src.innerHTML="";
    mp3path = getSongFilePath(id);
    metadata_json = await executeCommand(`ffprobe -v quiet -print_format json -show_format -show_streams '${mp3path.replaceAll("'","'\\\''")}'`);
    metadata_json=JSON.parse(metadata_json);
    metadata_json=metadata_json.format.tags;
    console.log(metadata_json)
    lyrics = metadata_json["lyrics-xxx"] ?? metadata_json["lyrics-XXX"] ?? metadata_json["lyrics-und"] ?? metadata_json["lyrics-eng"];
    lyrics=lyrics.replaceAll("\n","<br>")
    src.innerHTML = lyrics;
};

async function setWaveformImage (src, id) {
  mp3path = getSongFilePath(id);
  if(!fs.existsSync(`/home/${os.userInfo().username}/.local/share/marble_mp/waveforms/${id}.avif`)) {
    await executeCommand(`ffmpeg -y -hide_banner -i "${mp3path}" -f lavfi -i color=c=black:s=640x640 -filter_complex "compand=gain=10,aformat=channel_layouts=mono,showwavespic=s=1100x140:colors=#ffffff" -frames:v 1 -f image2pipe -vcodec png '/tmp/marble_tmpwaveform.png'`);
    await executeCommand(`magick '/tmp/marble_tmpwaveform.png' '/home/${os.userInfo().username}/.local/share/marble_mp/waveforms/${id}.avif'`);
  }

  src.style.backgroundImage=`url(/home/${os.userInfo().username}/.local/share/marble_mp/waveforms/${id}.avif)`;
  console.log(`/home/${os.userInfo().username}/.local/share/marble_mp/waveforms/${id}.avif`)
  console.log(src,src.style.backgroundImage)
};

async function setAlbumCoverNowPlaying (src, id) {
  await executeCommand(`rm /tmp/marble_*`);
  const timestamp = Date.now();
  mp3path = getSongFilePath(id);
  await executeCommand(`ffmpeg -hide_banner -loglevel error -y -i "${mp3path}" -an "/tmp/marble_${os.userInfo().username}_albumcovernowplaying_${timestamp}.jpg"`);
  src.src=`/tmp/marble_${os.userInfo().username}_albumcovernowplaying_${timestamp}.jpg?=${Date.now()}`;
};

function sqlEscape(str) {
  if(str!=undefined) {
    return str.replaceAll("'","''");
  }
  else return "";
}

function appendCSS(customCSS) {
    var style = document.createElement('style');
    style.innerHTML = customCSS;
    document.head.appendChild(style);
}

function pasteCustomRootCSS() {
    if(fs.existsSync(`/home/${os.userInfo().username}/.local/share/marble_mp/css/paste_at_root.css`)) {
        console.log("yes")
        var cssToPaste=(fs.readFileSync(`/home/${os.userInfo().username}/.local/share/marble_mp/css/paste_at_root.css`).toString())
        appendCSS(cssToPaste)
    }

    if(fs.existsSync(`/home/${os.userInfo().username}/.local/share/marble_mp/css/custom.css`)) {
        appendCSS(`@import url("/home/${os.userInfo().username}/.local/share/marble_mp/css/custom.css");`);
    }
}

function discsCSS() {
    const glob = require("glob");
    var getDirectories = function (src, callback) {
        glob(src + '/**/*.avif', callback);
    };
    getDirectories(`/home/${os.userInfo().username}/.local/share/marble_mp/img/discs/`, async function (err, res) {
        if (err) {
            console.log('Error', err);
        } else {
            var prog_cnt=0;
            css_to_append="";
            for (let index = 0; index < res.length; index++) {
                var element = res[index];
                element=element.split('/').reverse()[0]
                artist=element.split("---")[0]
                album=element.split("---")[1].substr(0, element.split("---")[1].length-5);
                css_to_append+=`
                    .ymp-playlist-list-album:has(.ymp-playlist-list-album-bottom-item[data-album-artist='${artist.replaceAll("'","\\'")}'][data-album='${album.replaceAll("'","\\'")}']) img.vinyl {
    content:url('${res[index].replaceAll("'","\\'")}');
}
                `;
                //console.log(css_to_append)
            }
            appendCSS(css_to_append)
        }
    });
}

async function scanForFiles(myCallback) {
    var getDirectories = function (src, callback) {
        glob(src + '/**/*.mp3', callback);
    };

    function coalesce() {
        return [].find.call(arguments, x => x !== null && x !== undefined);
    }

    directories_to_scan.forEach(directory => {
      getDirectories(`${directory}`, async function (err, res) {
        if (err) {
            console.log('Error', err);
        } else {
            var prog_cnt=0;
            for (let index = 0; index < res.length; index++) {
                var element = res[index];
                prog_cnt++;
                console.log(`${prog_cnt} / ${res.length} - ${element}`);
                document.querySelector(`.widget-import .progress`).style.width=`${(prog_cnt / res.length) * 100}%`
                console.log(`${(prog_cnt / res.length) * 100}%`)
                //console.log(element,index)
                if(!filePathImported(element)) {
                  var result = await executeCommand(`ffprobe -v quiet -of json -show_format '${element.replaceAll("'","'\\\''")}'`);
                  //console.log(String(result))
                  var result=JSON.parse(String(result));
                  if(result.format.tags) {
                  stmt = dbmgr.db.prepare(`INSERT INTO music_library(album_artist,artist,album,title,rdate,genre,disc_num,track,duration,lyrics,file_path) 
                      VALUES(
                      '${sqlEscape(result.format.tags.album_artist)}',
                      '${sqlEscape(result.format.tags.artist)}',
                      '${sqlEscape(result.format.tags.album)}',
                      '${sqlEscape(result.format.tags.title)}',
                      '${coalesce(result.format.tags.date,result.format.tags.TYER)}',
                      '${sqlEscape(result.format.tags.genre)}',
                      '${parseInt(result.format.tags.disc)}',
                      '${parseInt(result.format.tags.track)}',
                      '${parseInt(result.format.duration)}',
                      '',
                      '${sqlEscape(element)}'
                      )`);
                  stmt.run();
                  }
                }
            }
        }
        myCallback();
    });
    })
}

async function lastfmUpdateNowPlaying(title,album,artist,timestamp) {
  await executeCommand(`python ~/Documents/Scripts/lastfm_scrobble.py "${title.replaceAll('"','\\"')}" "${album.replaceAll('"','\\"')}" "${artist.replaceAll('"','\\"')}" "${timestamp}" "nowplayingupdate"`);
}

async function lastfmScrobble(title,album,artist,timestamp) {
  await executeCommand(`python ~/Documents/Scripts/lastfm_scrobble.py "${title.replaceAll('"','\\"')}" "${album.replaceAll('"','\\"')}" "${artist.replaceAll('"','\\"')}" "${timestamp}" "scrobble"`);
}

async function playAlbum(album_artist, album_name) {
    var artist_element=document.querySelector(`.ymp-library-artists-list .ymp-library-list-item[data-item-name="${album_artist}"]`);
    if(artist_element) {
        artist_element.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        var song_element=document.querySelector(`.ymp-playlist-list-album-bottom-item[data-album="${album_name}"]`);
        if(song_element) {
          song_element.click();
          await new Promise(resolve => setTimeout(resolve, 260));
          song_element.scrollIntoView();
        }
    }
}

track_started_playing_at_timestamp=0



contextBridge.exposeInMainWorld("api", {
    getTitles: getTitles,
    getAlbumArtists: getAlbumArtists,
    getGenres: getGenres,
    getAlbumsByAlbumArtists: getAlbumsByAlbumArtists,
    getAlbumsByKeyword:getAlbumsByKeyword,
    setLyrics:setLyrics,
    getSongFilePath: getSongFilePath,
    setAlbumCoverImage: setAlbumCoverImage,
    scanForFiles: scanForFiles,
    filePathImported: filePathImported,
    setWaveformImage: setWaveformImage,
    setAlbumCoverNowPlaying: setAlbumCoverNowPlaying,
    pasteCustomRootCSS:pasteCustomRootCSS,
    discsCSS:discsCSS,
    getAlbumsByGenre:getAlbumsByGenre,
    getSongId:getSongId,
    cleanDeletedFiles:cleanDeletedFiles,
    track_started_playing_at_timestamp:track_started_playing_at_timestamp,
    lastfmUpdateNowPlaying:lastfmUpdateNowPlaying,
    lastfmScrobble:lastfmScrobble,
    cleanRecentlyModified:cleanRecentlyModified,
    playAlbum:playAlbum,
    getArgs: () => ipcRenderer.invoke('get-app-args'),
});
