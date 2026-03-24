export type SectionId = 1 | 2 | 3 | 4 | 5 | 6 | null;

export interface KashmirSection {
    id: SectionId;
    title: string;
    startLocation: string;
    endLocation: string;
    anchors: [number, number][]; // [lat, lng]
    description: string;
    highlights: string[];
    risks: {
        weather: string;
        altitude: string;
        political: string;
        roadConditions: string;
    };
    logistics: {
        fuel: string;
        lodging: string;
        supplies: string;
        permits: string;
    };
    notes: string;
}

export type MarkerType = 'town' | 'pass' | 'fuel' | 'lodging' | 'checkpoint' | 'scenic' | 'risk';

export interface KashmirMarker {
    id: string;
    name: string;
    lat: number;
    lng: number;
    sectionId: SectionId | null; // null if an isolated POI
    type: MarkerType;
    shortDescription: string;
}

export const SECTIONS: KashmirSection[] = [
    {
        id: 1,
        title: 'The Valley Ascent',
        startLocation: 'Srinagar',
        endLocation: 'Sonamarg',
        anchors: [
            [34.0837, 74.7973], // Srinagar
            [34.2185, 74.9000], // Ganderbal
            [34.2690, 75.1430], // Kangan
            [34.3000, 75.3000], // Sonamarg
        ],
        description: 'Departing the fraught but beautiful Kashmir valley, this section follows the Sindh River upward towards the imposing Himalayan barrier. Expect heavy military presence and beautiful alpine meadows.',
        highlights: ['Dal Lake departure', 'Sindh River Gorge', 'Meadow of Gold (Sonamarg)'],
        risks: {
            weather: 'Sudden rain in the valley, unpredictable alpine shifts near Sonamarg.',
            altitude: 'Climbing to 2,740m (8,990 ft) - mostly mild acclimatization.',
            political: 'High militarization. Frequent patrols and checkpoints leaving Srinagar.',
            roadConditions: 'Mostly paved, but intense localized traffic and erratic driving overheads.'
        },
        logistics: {
            fuel: 'Plentiful in Srinagar, last reliable major pumps in Wayil/Kangan before the pass.',
            lodging: 'Excellent options in Srinagar and Sonamarg.',
            supplies: 'Stock up fully in Srinagar.',
            permits: 'No special permits, but keep ID and vehicle papers easily accessible.'
        },
        notes: 'A relatively easy first day to shake down the bikes and adjust to the environment.'
    },
    {
        id: 2,
        title: 'Crossing the Zoji La',
        startLocation: 'Sonamarg',
        endLocation: 'Drass',
        anchors: [
            [34.3000, 75.3000], // Sonamarg
            [34.2960, 75.4660], // Zoji La Pass
            [34.3600, 75.5400], // Minimarg
            [34.4287, 75.7610], // Drass
        ],
        description: 'The infamous Zoji La pass connects the Kashmir Valley to the high-altitude desert of Ladakh. This is one of the most unpredictable and dangerous stretches of road in the Himalayas.',
        highlights: ['Zoji La Pass', 'Zero Point', 'Entering Ladakh', 'Drass War Memorial'],
        risks: {
            weather: 'Snowstorms possible even in summer. High winds.',
            altitude: 'Zoji La peaks at 3,528m (11,575 ft). Mild risk of AMS.',
            political: 'Strict convoy timings sometimes enforced by the military.',
            roadConditions: 'Unpaved, abysmal mud, sheer drops without guardrails, severe water crossings.'
        },
        logistics: {
            fuel: 'Carry enough from Sonamarg to reach Kargil.',
            lodging: 'Basic accommodations in Drass (the second coldest inhabited place on earth).',
            supplies: 'Limited. Carry emergency rations.',
            permits: 'Check Zoji La opening times locally; it closes frequently for clearing.'
        },
        notes: 'Start extremely early to avoid glacial meltwater crossings peaking in the afternoon.'
    },
    {
        id: 3,
        title: 'The Road to Kargil',
        startLocation: 'Drass',
        endLocation: 'Kargil',
        anchors: [
            [34.4287, 75.7610], // Drass
            [34.4800, 75.9000], // Bhimbat
            [34.5539, 76.1330], // Kargil
        ],
        description: 'A deeply historic and strategic stretch of highway running parallel to the Line of Control. The landscape transitions fully into jagged, arid brown mountains.',
        highlights: ['Tiger Hill viewpoints', 'Suru River valley', 'Historic Kargil town'],
        risks: {
            weather: 'Intense high-altitude UV exposure. Bitter cold at night.',
            altitude: 'Drass to Kargil hovers around 2,800m - 3,200m.',
            political: 'Highly sensitive border region. Do not deviate from the main highway and respect No Photography signs.',
            roadConditions: 'Generally good tarmac, but prone to landslides.'
        },
        logistics: {
            fuel: 'Kargil has a very reliable, large fuel station.',
            lodging: 'Good options in Kargil.',
            supplies: 'Last major town before Leh.',
            permits: 'Inner Line Permits not required for the main highway, but ID checks are common.'
        },
        notes: 'Kargil is the cultural boundary between Muslim-majority Kashmir and Buddhist-majority Ladakh.'
    },
    {
        id: 4,
        title: 'The High Desert Run',
        startLocation: 'Kargil',
        endLocation: 'Leh',
        anchors: [
            [34.5539, 76.1330], // Kargil
            [34.4710, 76.3310], // Mulbekh
            [34.2960, 76.4730], // Namika La
            [34.2820, 76.7740], // Lamayuru
            [34.1700, 77.3400], // Magnetic Hill
            [34.1526, 77.5771], // Leh
        ],
        description: 'A spectacular, sweeping ride through ancient Buddhist enclaves, moonscapes, and multiple high passes. This section is iconic Himalayan riding at its best.',
        highlights: ['Namika La & Fotu La passes', 'Lamayuru Moonland', 'Magnetic Hill', 'Indus-Zanskar Confluence'],
        risks: {
            weather: 'Dry, barren, extreme sun.',
            altitude: 'Fotu La reaches 4,108m (13,478 ft). Strict hydration mandated.',
            political: 'Low risk. Heavy military logistics traffic moving toward Leh.',
            roadConditions: 'Exceptional tarmac built by the BRO (Border Roads Organisation), but watch for black ice in shadows or loose gravel.'
        },
        logistics: {
            fuel: 'Fuel up in Kargil. Khalsi has emergency pumps.',
            lodging: 'Lamayuru has guesthouses. Leh has comprehensive accommodations.',
            supplies: 'Leh has everything mechanics, medics, and riders need.',
            permits: 'None required for the highway.'
        },
        notes: 'You will experience the cultural shift into Tibetan Buddhism here. Take time at the monasteries.'
    },
    {
        id: 5,
        title: 'Ascent to Nubra',
        startLocation: 'Leh',
        endLocation: 'Nubra Valley',
        anchors: [
            [34.1526, 77.5771], // Leh
            [34.2780, 77.6040], // Khardung La
            [34.4100, 77.6600], // Khardung Village
            [34.5420, 77.5450], // Diskit
            [34.6863, 77.5673], // Hunder (Nubra)
        ],
        description: 'Crossing Khardung La, historically claimed as the highest motorable road in the world, dropping down into the surreal, starkly beautiful high-altitude desert of Nubra Valley.',
        highlights: ['Khardung La Pass', 'Diskit Monastery', 'Hunder Sand Dunes & Bactrian Camels'],
        risks: {
            weather: 'Sub-zero temperatures and blizzards at the pass; sweltering heat in the valley below.',
            altitude: 'Khardung La sits at 5,359m (17,582 ft). Do NOT stay at the top longer than 15-20 minutes to avoid severe AMS.',
            political: 'Nubra borders Siachen glacier logistics routes. Remain on permitted roads.',
            roadConditions: 'The approach to Khardung La is heavily broken, rocky, and often muddy or iced.'
        },
        logistics: {
            fuel: 'Diskit has a fuel pump, but power outages often disable it. Carry jerry cans from Leh.',
            lodging: 'Tents and guesthouses in Hunder/Diskit.',
            supplies: 'Basic water and snacks only.',
            permits: 'Inner Line Permit (ILP) strictly required.'
        },
        notes: 'Ensure your motorcycle is tuned for thin air; power loss on carbureted or older EFI bikes will be extreme.'
    },
    {
        id: 6,
        title: 'The High Lake Route',
        startLocation: 'Leh',
        endLocation: 'Pangong Lake',
        anchors: [
            [34.1526, 77.5771], // Leh
            [34.0530, 77.7470], // Karu
            [34.0450, 77.9250], // Chang La
            [33.9180, 78.1180], // Durbuk
            [33.7297, 78.8983], // Pangong Tso (Spangmik)
        ],
        description: 'A grueling climb over Chang La pass leads to the breathtaking, aggressively blue waters of Pangong Lake, which straddles the disputed border with Tibet.',
        highlights: ['Chang La Pass', 'Marmot spotting', 'First view of Pangong Tso'],
        risks: {
            weather: 'Vicious cold winds at the lake. Freezing nights.',
            altitude: 'Chang La is 5,360m (17,586 ft). The lake itself is at 4,250m—sleeping here risks AMS if not acclimatized.',
            political: 'High-tension border region (Line of Actual Control). Do not fly drones. Do not stray past permitted villages.',
            roadConditions: 'Chang La is notoriously icy, with deep water crossings originating from glacial melt.'
        },
        logistics: {
            fuel: 'Absolutely no reliable fuel after Karu. Carry extra from Leh.',
            lodging: 'Homestays and freezing tent camps at Spangmik/Lukung.',
            supplies: 'Virtually nothing available at the lake. Take all medications and water.',
            permits: 'Inner Line Permit (ILP) strictly required.'
        },
        notes: 'The water crossings descending Chang La toward Durbuk are notoriously deep in the afternoon. Ride with caution.'
    }
];

export const MARKERS: KashmirMarker[] = [
    { id: 'm1', name: 'Srinagar', lat: 34.0837, lng: 74.7973, sectionId: 1, type: 'town', shortDescription: 'The summer capital full of houseboats on Dal Lake. Start of the expedition.' },
    { id: 'm2', name: 'Sonamarg', lat: 34.3000, lng: 75.3000, sectionId: 1, type: 'town', shortDescription: 'The "Meadow of Gold," last lush outpost before the harsh mountains.' },
    { id: 'm3', name: 'Zoji La', lat: 34.2960, lng: 75.4660, sectionId: 2, type: 'pass', shortDescription: 'Treacherous 3,528m pass. Highly unpredictable weather and sheer drops.' },
    { id: 'm4', name: 'Zero Point', lat: 34.3313, lng: 75.5242, sectionId: 2, type: 'scenic', shortDescription: 'Icy glacial valley usually packed with snow even in summer.' },
    { id: 'm5', name: 'Drass', lat: 34.4287, lng: 75.7610, sectionId: 2, type: 'town', shortDescription: 'Known as the second coldest inhabited place in the world.' },
    { id: 'm6', name: 'Kargil', lat: 34.5539, lng: 76.1330, sectionId: 3, type: 'town', shortDescription: 'Strategic town on the Suru River. Crucial fuel and supply stop.' },
    { id: 'm7', name: 'Lamayuru', lat: 34.2820, lng: 76.7740, sectionId: 4, type: 'scenic', shortDescription: 'Ancient monastery overlooking a surreal, lunar-like landscape.' },
    { id: 'm8', name: 'Magnetic Hill', lat: 34.1700, lng: 77.3400, sectionId: 4, type: 'scenic', shortDescription: 'Optical illusion where the road appears to go uphill, but vehicles roll "up".' },
    { id: 'm9', name: 'Leh', lat: 34.1526, lng: 77.5771, sectionId: 4, type: 'town', shortDescription: 'The capital of Ladakh. Essential for acclimatization, permits, and repairs.' },
    { id: 'm10', name: 'Khardung La', lat: 34.2780, lng: 77.6040, sectionId: 5, type: 'pass', shortDescription: 'One of the highest vehicle passes in the world at 5,359m (17,582 ft).' },
    { id: 'm11', name: 'Diskit Fuel', lat: 34.5420, lng: 77.5450, sectionId: 5, type: 'fuel', shortDescription: 'Unreliable fuel pump for Nubra. Operates only when there is power.' },
    { id: 'm12', name: 'Hunder Dunes', lat: 34.6863, lng: 77.5673, sectionId: 5, type: 'scenic', shortDescription: 'High-altitude desert dunes featuring double-humped Bactrian camels.' },
    { id: 'm13', name: 'Karu Checkpoint', lat: 34.0530, lng: 77.7470, sectionId: 6, type: 'checkpoint', shortDescription: 'Last fuel and permit check before ascending Chang La.' },
    { id: 'm14', name: 'Chang La', lat: 34.0450, lng: 77.9250, sectionId: 6, type: 'pass', shortDescription: 'Steep, icy 5,360m pass guarding the route to Pangong Lake.' },
    { id: 'm15', name: 'Pangong Tso', lat: 33.7297, lng: 78.8983, sectionId: 6, type: 'scenic', shortDescription: 'Stunning 134km long lake crossing the border into Tibet. Bitterly cold.' }
];
