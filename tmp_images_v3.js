const https = require('https');

async function getImageUrl(pageTitle) {
    return new Promise(resolve => {
        https.get(`https://en.wikipedia.org/w/api.php?action=query&titles=${pageTitle}&prop=pageimages&format=json&pithumbsize=800`, { headers: { 'User-Agent': 'Agent/1.0' } }, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                const json = JSON.parse(data);
                const pages = json.query.pages;
                const id = Object.keys(pages)[0];
                const url = pages[id].thumbnail ? pages[id].thumbnail.source : 'NOT_FOUND';
                resolve(url);
            });
        });
    });
}

(async () => {
    console.log("Khardung_La:", await getImageUrl("Khardung_La"));
    console.log("Khardung_La_(pass):", await getImageUrl("Khardung_La_(pass)"));
    console.log("Pangong_Tso:", await getImageUrl("Pangong_Tso"));
    console.log("Pangong_Lake:", await getImageUrl("Pangong_Lake"));
})();
