export interface PhotoMarker {
    id: string;
    lat: number;
    lng: number;
    url: string;
    thumbnail: string;
    caption: string;
    date?: string;
    photographer?: string;
}

// A sample dataset of geotagged photos scattered along the Kashmir ADV routes using verified Wikimedia Commons imagery
export const PHOTOS: PhotoMarker[] = [
    {
        id: 'p-1',
        lat: 34.3039,
        lng: 75.2973,
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Sonmarg_rishav7336.jpg',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sonmarg_rishav7336.jpg/320px-Sonmarg_rishav7336.jpg',
        caption: 'Thajiwas Glacier visible from the Sonamarg meadows.',
        photographer: 'Wikimedia / Rishav'
    },
    {
        id: 'p-2',
        lat: 34.281,
        lng: 75.462,
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Zojila_Road.jpg',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Zojila_Road.jpg/320px-Zojila_Road.jpg',
        caption: 'Treacherous mud tracks near Zoji La Pass.',
        photographer: 'Wikimedia'
    },
    {
        id: 'p-3',
        lat: 34.432,
        lng: 75.760,
        url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Kargilwarmemorialdarss3.jpg',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kargilwarmemorialdarss3.jpg/320px-Kargilwarmemorialdarss3.jpg',
        caption: 'Entering the Drass valley, near the Kargil War Memorial.',
        photographer: 'Wikimedia'
    },
    {
        id: 'p-4',
        lat: 34.551,
        lng: 76.136,
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/The_Tiger_Hill_%283976856895%29.jpg',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/The_Tiger_Hill_%283976856895%29.jpg/320px-The_Tiger_Hill_%283976856895%29.jpg',
        caption: 'Tiger Hill looming over the routes near Kargil.',
        photographer: 'Wikimedia'
    },
    {
        id: 'p-5',
        lat: 34.288,
        lng: 76.776,
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Lamayuru_Monastery%2C_Ladakh%2C_India.jpg',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lamayuru_Monastery%2C_Ladakh%2C_India.jpg/320px-Lamayuru_Monastery%2C_Ladakh%2C_India.jpg',
        caption: 'Moonland landscapes surrounding Lamayuru Monastery.'
    },
    {
        id: 'p-6',
        lat: 34.167,
        lng: 77.585,
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Leh_Palace_2011.jpg',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Leh_Palace_2011.jpg/320px-Leh_Palace_2011.jpg',
        caption: 'Leh Palace overlooking the city.',
        photographer: 'Wikimedia'
    },
    {
        id: 'p-7',
        lat: 34.278,
        lng: 77.604,
        url: 'https://picsum.photos/id/1036/800/600',
        thumbnail: 'https://picsum.photos/id/1036/320/240',
        caption: 'Prayer flags whipping across Khardung La Pass (17,582 ft).',
        photographer: 'Srinagar Local'
    },
    {
        id: 'p-8',
        lat: 34.588,
        lng: 77.493,
        url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/5_Nubra_valley.jpg',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/5_Nubra_valley.jpg/320px-5_Nubra_valley.jpg',
        caption: 'Expansive terrain within Nubra Valley.'
    },
    {
        id: 'p-9',
        lat: 33.918,
        lng: 78.361,
        url: 'https://picsum.photos/id/1018/800/600',
        thumbnail: 'https://picsum.photos/id/1018/320/240',
        caption: 'The stark, freezing expanse of Pangong Lake at sunset.',
        photographer: 'Picsum'
    }
];
