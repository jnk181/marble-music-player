const os = require ('os');
var sqlite3 = require('better-sqlite3');
var db = new sqlite3(`/home/${os.userInfo().username}/.local/share/marble_mp/database.db`);
exports.db=db;

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