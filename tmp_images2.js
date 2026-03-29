const https = require('https');
const crypto = require('crypto');

function getWikiUrl(filename) {
    const filenameNoSpaces = filename.replace(/ /g, '_');
    const md5 = crypto.createHash('md5').update(filenameNoSpaces).digest('hex');
    const url = `https://upload.wikimedia.org/wikipedia/commons/${md5.substring(0, 1)}/${md5.substring(0, 2)}/${filenameNoSpaces}`;
    return url;
}

const files = [
    "Khardungla Pass.JPG",
    "Pangong Lake view.jpg"
];

for (const f of files) {
    console.log(f + ": " + getWikiUrl(f));
}
