import type { SectionId } from './data';

export function isValidYouTubeUrl(url: string | undefined): boolean {
    if (!url) return false;
    return /^https:\/\/(www\.youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}/.test(url);
}

export function getYouTubeThumbnail(url: string | undefined): string | null {
    if (!url) return null;
    const match = url.match(/(?:v=|embed\/|youtu\.be\/)([\w-]{11})/);
    if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
    return null;
}

export interface KashmirMedia {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    sectionId: SectionId;
    tags?: string[];
    channelName: string;
    shortDescription?: string;
}

const STATIC_MEDIA: KashmirMedia[] = [
    // Section 1: Srinagar to Sonamarg
    {
        id: 's1-v1',
        title: 'The Most Scenic Road Trip in India😍 | Srinagar to Sonamarg',
        url: 'https://www.youtube.com/watch?v=869ky8vNoxY',
        thumbnail: '',
        sectionId: 1,
        tags: ['Vlog', 'Overview'],
        channelName: 'MG ZONE',
        shortDescription: 'Explicitly covers the exact ride from the start of the valley to the Sonamarg alpine gateway.'
    },
    {
        id: 's1-v2',
        title: 'Snowfall Ride 😍 Srinagar to Sonmarg on Himalayan 450',
        url: 'https://www.youtube.com/watch?v=jJwxJhD1t3w',
        thumbnail: '',
        sectionId: 1,
        tags: ['Ride Footage', 'Risk'],
        channelName: 'MOTO YATRI',
        shortDescription: 'Perfect severe-weather ride footage demonstrating climate risk factors.'
    },

    // Section 2: Sonamarg to Drass (Zoji La)
    {
        id: 's2-v1',
        title: 'Zoji La Pass Ride | Sonamarg to Dras – The Gateway to Ladakh',
        url: 'https://www.youtube.com/watch?v=QcpfshJL13w',
        thumbnail: '',
        sectionId: 2,
        tags: ['Ride Footage', 'Risk'],
        channelName: 'Joyboy',
        shortDescription: 'Traversing the dangerous Zoji La pass from Sonamarg into the Drass valley.'
    },
    {
        id: 's2-v2',
        title: 'Sonmarg to Drass via Zero Point & Kargil',
        url: 'https://www.youtube.com/watch?v=kucZHwdSw6E',
        thumbnail: '',
        sectionId: 2,
        tags: ['Overview', 'Scenic'],
        channelName: 'The Motorized Man',
        shortDescription: 'Overviews extreme high-altitude points like Zero Point before descending into Drass.'
    },

    // Section 3: Drass to Kargil
    {
        id: 's3-v1',
        title: 'Drass Pahuchne Me Sabki Halat Kharab Ho Gyi | Kargil To Drass',
        url: 'https://www.youtube.com/watch?v=UVE3quIJG1U',
        thumbnail: '',
        sectionId: 3,
        tags: ['Vlog', 'Logistics'],
        channelName: 'Deep Ranjan Sachan',
        shortDescription: 'Highlights the brutal cold of Drass and the highway connected to Kargil.'
    },
    {
        id: 's3-v2',
        title: 'Kashmir To Ladakh - Sonmarg to Kargil Bike Trip & War Memorials',
        url: 'https://www.youtube.com/watch?v=ygTLwkgLcOw',
        thumbnail: '',
        sectionId: 3,
        tags: ['History', 'Overview'],
        channelName: 'The Fearless Traveller',
        shortDescription: 'Covers the important Drass War Memorial along the border highway to Kargil.'
    },

    // Section 4: Kargil to Leh
    {
        id: 's4-v1',
        title: 'Day 6 – KARGIL to LEH: The Dream Road Ride on NH 1',
        url: 'https://www.youtube.com/watch?v=2qGQK1NLXYc&t=600s',
        thumbnail: '',
        sectionId: 4,
        tags: ['Ride Footage', 'Scenic'],
        channelName: 'Young Rides',
        shortDescription: 'Showcases the exceptionally smooth BRO tarmac and sweeping high desert passes like Fotu La. (Segment starts at 10:00)'
    },
    {
        id: 's4-v2',
        title: 'Finally Reached LEH ⛰️ | Kargil To Leh | Dream Ride',
        url: 'https://www.youtube.com/watch?v=nRhVVDBvIYk',
        thumbnail: '',
        sectionId: 4,
        tags: ['Vlog', 'Overview'],
        channelName: 'MG ZONE',
        shortDescription: 'Classic arrival vlog finishing the western approach to Ladakh and entering Leh.'
    },

    // Section 5: Leh to Nubra Valley
    {
        id: 's5-v1',
        title: 'Leh to Diskit via Khardung La | Nubra Valley',
        url: 'https://www.youtube.com/watch?v=qZu9YpaXSvM',
        thumbnail: '',
        sectionId: 5,
        tags: ['Ride Footage', 'Risk'],
        channelName: 'Goplaces Venkat',
        shortDescription: 'Directly maps out the Leh to Diskit trajectory via the treacherous Khardung La pass.'
    },
    {
        id: 's5-v2',
        title: 'The World’s Highest Road on 125cc Motorcycle! | Nubra to Leh',
        url: 'https://www.youtube.com/watch?v=wXDqUY0RLa0',
        thumbnail: '',
        sectionId: 5,
        tags: ['Vlog', 'Risk'],
        channelName: 'Travel with Shubhrox',
        shortDescription: 'Detailed view of carbureted/small displacement power loss at severe altitude.'
    },

    // Section 6: Leh to Pangong Lake
    {
        id: 's6-v1',
        title: 'Ladakh Bike Trip | Leh to Pangong | Chang La Pass',
        url: 'https://www.youtube.com/watch?v=QBe_hlkUJmE',
        thumbnail: '',
        sectionId: 6,
        tags: ['Overview', 'Scenic'],
        channelName: 'GearUp Nomad',
        shortDescription: 'Explicitly matches the final ascent segment encompassing both the lake and the pass.'
    },
    {
        id: 's6-v2',
        title: 'PANGONG LAKE To CHANG LA | Motorcycle Ride',
        url: 'https://www.youtube.com/watch?v=J-ShM7-U2k4',
        thumbnail: '',
        sectionId: 6,
        tags: ['Ride Footage', 'Risk'],
        channelName: 'MyWheelStories',
        shortDescription: 'Focuses heavily on escaping the lake via Chang La pass and the severe glacial melts.'
    }
];

/**
 * PHASE 2 PREPARATION Hook:
 * 
 * Future implementation:
 * - Replace static filtering with an API call: `fetch('/api/youtube-kashmir?section=' + sectionId)`
 * - The backend API route will:
 *    1. Query the YouTube Data API using section keywords (e.g. "Khardung La motorcycle ride vlog").
 *    2. Extract video IDs and metadata.
 *    3. Optionally run the transcripts through OpenAI to rank relevance based on route safety/logistics.
 *    4. Cache the results in Supabase or Redis to minimize YouTube API quota usage.
 */
export async function getVideosForSection(sectionId: SectionId): Promise<KashmirMedia[]> {
    // Simulate network delay to mimic future dynamic loading behavior
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(STATIC_MEDIA.filter(m => m.sectionId === sectionId));
        }, 400);
    });
}
