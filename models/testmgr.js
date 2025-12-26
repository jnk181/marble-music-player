var dbmgr = require("./dbmgr");
var db=dbmgr.db;
db.function('regexp', { deterministic: true }, (regex, text) => {
    return new RegExp(regex).test(text) ? 1 : 0;
  });

const fs = require('fs');
const path = require('path');
const glob = require("glob");

exports.deleteRecentlyModifiedFromDB = function(scanPath,maxTimeDiff) {
    function findRecentFilesSync(dirPath, minutes) {
        try {
            const files = glob.sync(path.join(dirPath, '**/*.mp3'));
            const recentFiles = [];
            const now = new Date();
        
            for (const file of files) {
                const filePath = file;
                const stats = fs.statSync(filePath);
        
                if (stats.isFile()) {
                    const modifiedTime = stats.mtime;
                    const diff = (now.getTime() - modifiedTime.getTime()) / (1000 * 60);
                    console.log(filePath,stats,diff)
            
                    if (diff < minutes) {
                        recentFiles.push(filePath);
                    }
                }
            }
        
            return recentFiles;
        } catch (err) {
            console.error('Error:', err);
            return [];
        }
    }

    return findRecentFilesSync(scanPath,maxTimeDiff);
}

exports.cleanDeletedFiles = function() {
    const sql = `SELECT id,file_path FROM music_library`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    res.forEach(item => {
        if(!fs.existsSync(item['file_path'])) {
            db.prepare(`DELETE FROM music_library WHERE id=${item['id']}`).run();
        }
    })
}

exports.getAllSongs = () => {
    const sql = `SELECT * FROM music_library`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    return res;
}

exports.getAlbumArtists = () => {
    const sql = `SELECT (album_artist || ' (' || song_count || '曲)') 'album_artist' FROM (
    SELECT album_artist, COUNT(*) 'song_count' FROM music_library GROUP BY album_artist ORDER BY song_count DESC
)`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    return res;
}

exports.getGenres = () => {
    const sql = `SELECT (genre || ' (' || song_count || '曲)') 'genre' FROM (SELECT genre, COUNT(*) 'song_count' FROM music_library GROUP BY genre ORDER BY song_count DESC)`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    return res;
}

function sqlEscape(str) {
    if(str!=undefined) {
      return str.replaceAll("'","''");
    }
    else return "";
  }

exports.getAlbumsByKeyword = function(keywords) {
    keywords=keywords.replace("\n","").trim();
    keywords=keywords.toLowerCase();
    console.log(keywords.split(/(!|~|,|\{|\})/))
    var tmp='';
    var sql_clauses=[];
    keywords.split(/(!|~|,|\{|\})/).forEach(keyword => {
        if(keyword.startsWith("aa:")) {
            tmp=keyword.replace("aa:","");
            tmp=sqlEscape(tmp);
            sql_clauses.push(`(LOWER(album_artist)='${tmp}')`);
        }
        else if(keyword.startsWith("artist:")) {
            tmp=keyword.replace("aartist:","");
            tmp=sqlEscape(tmp);
            sql_clauses.push(`(LOWER(artist) LIKE '${tmp}')`);
        }
        else if(keyword.startsWith("album:")) {
            tmp=keyword.replace("album:","");
            tmp=sqlEscape(tmp);
            sql_clauses.push(`(LOWER(album) LIKE '${tmp}')`);
        }
        else if(keyword.startsWith("genre:")) {
            tmp=keyword.replace("genre:","");
            tmp=sqlEscape(tmp);
            sql_clauses.push(`(LOWER(genre) LIKE '%${tmp}%')`);
        }
        else if(keyword.startsWith("title:")) {
            tmp=keyword.replace("title:","");
            tmp=sqlEscape(tmp);
            sql_clauses.push(`(LOWER(title) LIKE '${tmp}')`);
        }
        else if(keyword.startsWith("track")) {
            tmp=keyword.replace("track","");
            tmp=sqlEscape(tmp);
            sql_clauses.push(`(track ${tmp})`);
        }
        else if(keyword.startsWith("date")) {
            tmp=keyword.replace("date","");
            tmp=sqlEscape(tmp);
            if(tmp.startsWith('>=')) {
                tmp=tmp.split(`>=`)[1];
                sql_clauses.push(`(rdate >= '${tmp}')`);
            }
            else if(tmp.startsWith('>')) {
                tmp=tmp.split(`>`)[1];
                sql_clauses.push(`(rdate > '${tmp}')`);
            }
            else if(tmp.startsWith('<=')) {
                tmp=tmp.split(`<=`)[1];
                sql_clauses.push(`(rdate <= '${tmp}')`);
            }
            else if(tmp.startsWith('<')) {
                tmp=tmp.split(`<`)[1];
                sql_clauses.push(`(rdate < '${tmp}')`);
            }
            else if(tmp.startsWith(':')) {
                tmp=tmp.split(`:`)[1];
                sql_clauses.push(`(rdate LIKE '${tmp}%')`);
            }
        }
        else if(keyword=="{") {
            sql_clauses.push(`(`);
        }
        else if(keyword=="}") {
            sql_clauses.push(`)`);
        }
        else if(keyword==",") {
            sql_clauses.push(`AND`);
        }
        else if(keyword=="~") {
            sql_clauses.push(`OR`);
        }
        else if(keyword=="!") {
            sql_clauses.push(`NOT`);
        }
        else if(keyword.length>0) {
            keyword=sqlEscape(keyword);
            sql_clauses.push(`((LOWER(artist) REGEXP '${keyword}') OR (LOWER(album_artist) REGEXP '${keyword}') OR (LOWER(album) REGEXP '${keyword}') OR (LOWER(title) REGEXP '${keyword}'))`);
        }
    })

    const filter_words=sql_clauses.join(" ");
    const sql = `SELECT album_artist,album,SUBSTR(MAX(rdate),1,10) 'rdate',MIN(id) 'first_post_id',MIN(genre) 'genre',COUNT(*) 'count',SUM(duration) 'length' FROM music_library WHERE (${filter_words}) GROUP BY album_artist,album ORDER BY rdate,album_artist,album,first_post_id;`;
    console.log(sql);
    const stmt = db.prepare(sql);
    let res=stmt.all();
    res.forEach(item => {
        item['songs']=db.prepare(`SELECT * FROM music_library WHERE album_artist='${sqlEscape(item['album_artist'])}' AND album='${sqlEscape(item['album'])}' AND (${filter_words}) ORDER BY disc_num, track`).all();
        item['songs'].forEach(song => {
            song['has_music_video']=false;
        })
    })
    return res;
}

exports.getAlbumsByAlbumArtists = function(artist_param) {
    const sql = `SELECT album_artist,album,SUBSTR(MAX(rdate),1,10) 'rdate',MIN(id) 'first_post_id',MIN(genre) 'genre',COUNT(*) 'count',SUM(duration) 'length' FROM music_library GROUP BY album_artist,album HAVING (album_artist='${sqlEscape(artist_param)}') ORDER BY album_artist,rdate,album,first_post_id;`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    res.forEach(item => {
        item['songs']=db.prepare(`SELECT * FROM music_library WHERE album_artist='${sqlEscape(item['album_artist'])}' AND album='${sqlEscape(item['album'])}' ORDER BY disc_num, track`).all();
        item['songs'].forEach(song => {
            song['has_music_video']=false;
        })
    })
    return res;
}

exports.getAlbumsByGenre = function(genre_param) {
    const sql = `SELECT album_artist,album,SUBSTR(MAX(rdate),1,10) 'rdate',MIN(id) 'first_post_id',MIN(genre) 'genre',COUNT(*) 'count',SUM(duration) 'length' FROM music_library GROUP BY genre,album HAVING (genre='${sqlEscape(genre_param)}') ORDER BY rdate,album_artist,album,first_post_id;`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    res.forEach(item => {
        aartist=sqlEscape(item['album_artist']);
        albumn=sqlEscape(item['album']);
        item['songs']=db.prepare(`SELECT * FROM music_library WHERE genre='${genre_param}' AND album_artist='${aartist}' AND album='${albumn}' ORDER BY disc_num,track`).all();
        item['songs'].forEach(song => {
            song['has_music_video']=false;
        })
    })
    return res;
}

exports.getSongFilePath = function(id_param) {
    const sql = `SELECT file_path FROM music_library WHERE id=${id_param};`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    return res[0]['file_path'];
}

exports.getSongId = function(file_path) {
    const sql = `SELECT id FROM music_library WHERE file_path='${sqlEscape(file_path)}';`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    return res[0]['id'];
}

exports.filePathImported = function(file_path) {
    const sql = `SELECT ('${file_path.replaceAll("'","''")}' IN (SELECT file_path FROM music_library)) 'isit'`;
    const stmt = db.prepare(sql);
    let res=stmt.all();
    return res[0]['isit']=='1';
}