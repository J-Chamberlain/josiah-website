const https = require('https');

const titles = ["Sonamarg", "Zoji_La", "Tiger_Hill,_Kargil", "Kargil_War_Memorial", "Lamayuru_Monastery", "Leh_Palace", "Khardung_La", "Nubra_Valley", "Pangong_Tso"];

async function run() {
    for (const t of titles) {
        await new Promise(resolve => {
            const options = {
                hostname: 'en.wikipedia.org',
                path: `/api/rest_v1/page/summary/${t}`,
                headers: { 'User-Agent': 'AntigravityAgent/1.0' }
            };
            https.get(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const url = json.originalimage ? json.originalimage.source : (json.thumbnail ? json.thumbnail.source : 'NO IMAGE');
                        console.log(`${t}: ${url}`);
                    } catch (e) {
                        console.error(`${t} failed`);
                    }
                    resolve();
                });
            }).on('error', (e) => resolve());
        });
    }
}
run();
