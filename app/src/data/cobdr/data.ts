export type SectionId = 1 | 2 | 3 | 4 | 5 | 6 | null;

export interface CobdrSection {
  id: SectionId;
  sectionNumber: number;
  title: string;
  startLabel: string;
  endLabel: string;
  anchors: [number, number][]; // [lat, lng]
  description: string;
  highlights: string[];
  warnings: string[];
}

export interface CobdrMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sectionId: SectionId;
  type: 'pass' | 'town' | 'lake' | 'poi';
  shortDescription: string;
}

export const SECTIONS: CobdrSection[] = [
  {
    id: 1,
    sectionNumber: 1,
    title: 'The Desert Start',
    startLabel: 'Four Corners',
    endLabel: 'Telluride',
    // rough coordinates for line drawing (not exact GPS track)
    anchors: [
      [36.999, -109.045], // Four Corners
      [37.266, -108.855], // near Towaoc
      [37.493, -108.196], // Dolores
      [37.765, -108.037], // Dunton
      [37.937, -107.812], // Telluride
    ],
    description: 'Starting at the Four Corners monument, this section spans high-desert landscapes and transitions into the majestic San Juan mountains, concluding in the historic mining town of Telluride.',
    highlights: ['Four Corners Monument', 'Dolores River Valley', 'Groundhog Reservoir'],
    warnings: ['Deep sand in the desert', 'Long stretches without services', 'Potential flash floods in washes'],
  },
  {
    id: 2,
    sectionNumber: 2,
    title: 'The Alpine Passes',
    startLabel: 'Telluride',
    endLabel: 'Lake City',
    anchors: [
      [37.937, -107.812], // Telluride
      [37.863, -107.756], // Ophir
      [37.896, -107.652], // Corkscrew / Hurricane Pass area
      [37.945, -107.544], // California Gulch
      [37.932, -107.534], // Cinnamon Pass
      [38.029, -107.315], // Lake City
    ],
    description: 'Arguably the most technically demanding and visually stunning section. You will cross some of the highest passes in North America, navigating rocky jeep trails through the legendary San Juan Mountains.',
    highlights: ['Ophir Pass', 'California Pass', 'Cinnamon Pass', 'Animas Forks Ghost Town'],
    warnings: ['Extremely steep drops', 'Late-summer snow blockages', 'High altitude sickness potential', 'Narrow shelves requiring vehicle passing etiquette'],
  },
  {
    id: 3,
    sectionNumber: 3,
    title: 'High Valleys and Passes',
    startLabel: 'Lake City',
    endLabel: 'Buena Vista',
    anchors: [
      [38.029, -107.315], // Lake City
      [38.252, -107.039], // Los Pinos Pass area
      [38.312, -106.671], // Pitkin
      [38.750, -106.496], // Tincup Pass area
      [38.824, -106.398], // Cottonwood Pass
      [38.842, -106.131], // Buena Vista
    ],
    description: 'Connecting Lake City to the Arkansas River valley, this section features sweeping historic mining roads, challenging stream crossings, and historic towns like Pitkin and Tincup.',
    highlights: ['Los Pinos Pass', 'St. Elmo Ghost Town', 'Tincup Pass', 'Cottonwood Pass'],
    warnings: ['Rocky terrain on Tincup Pass', 'Frequent heavy afternoon thunderstorms', 'Deep mud and water crossings early in the season'],
  },
  {
    id: 4,
    sectionNumber: 4,
    title: 'The Collegiate Peaks',
    startLabel: 'Buena Vista',
    endLabel: 'Gypsum',
    anchors: [
      [38.842, -106.131], // Buena Vista
      [39.250, -106.292], // Leadville
      [39.263, -106.452], // Hagerman Pass
      [39.366, -106.512], // Ivanhoe Lake
      [39.525, -106.905], // Sylvan Lake
      [39.645, -106.953], // Gypsum
    ],
    description: 'This section shadows the impressive Collegiate Peaks before climbing over Hagerman Pass into the central Rockies. The journey weaves through forests and along historic railroad grades.',
    highlights: ['Collegiate Peaks views', 'Hagerman Pass', 'Historic Colorado Midland Railway route'],
    warnings: ['Hagerman Pass often snowbound well into July', 'Navigational complexity in dense forest logging roads'],
  },
  {
    id: 5,
    sectionNumber: 5,
    title: 'River Canyons and High Plains',
    startLabel: 'Gypsum',
    endLabel: 'Steamboat Springs',
    anchors: [
      [39.645, -106.953], // Gypsum
      [39.810, -106.634], // State Bridge
      [39.921, -106.772], // Radium area
      [40.100, -106.850], // Flat Tops edge
      [40.485, -106.831], // Steamboat Springs
    ],
    description: 'Transitioning out of the high peaks, you traverse along the Colorado River canyon and scale up towards the scenic rolling high plains leading to the ski town of Steamboat Springs.',
    highlights: ['Colorado River views near State Bridge', 'Gore Pass', 'Rabbit Ears Pass vicinity panoramas'],
    warnings: ['Extremely slick and impassable mud if wet ("gumbo")', 'Open range cattle and wildlife', 'Hotter temperatures in the lower canyons'],
  },
  {
    id: 6,
    sectionNumber: 6,
    title: 'The Northern Border',
    startLabel: 'Steamboat Springs',
    endLabel: 'Wyoming Border',
    anchors: [
      [40.485, -106.831], // Steamboat Springs
      [40.709, -106.917], // Clark
      [40.810, -106.955], // Steamboat Lake
      [40.976, -106.953], // Columbine
      [41.000, -107.039], // WYO border
    ],
    description: 'The final push takes you through dense pine forests and past alpine lakes toward the desolate beauty of the Wyoming border. It is a remote and stunning finish to the epic journey.',
    highlights: ['Steamboat Lake', 'Mount Zirkel Wilderness views', 'The satisfaction of reaching the border'],
    warnings: ['Remote area with essentially no cell service', 'Fallen trees blocking trails after storms'],
  },
];

export const MARKERS: CobdrMarker[] = [
  { id: 'm1', name: 'Four Corners', lat: 36.999, lng: -109.045, sectionId: 1, type: 'poi', shortDescription: 'The starting point where four states meet.' },
  { id: 'm2', name: 'Telluride', lat: 37.937, lng: -107.812, sectionId: 1, type: 'town', shortDescription: 'Iconic box canyon ski town. End of section 1.' },
  { id: 'm3', name: 'Bridal Veil Falls', lat: 37.917, lng: -107.755, sectionId: 2, type: 'poi', shortDescription: 'Tallest free-falling waterfall in Colorado.' },
  { id: 'm4', name: 'Ophir Pass', lat: 37.863, lng: -107.756, sectionId: 2, type: 'pass', shortDescription: 'Rocky 11,789 ft pass with steep shelf roads.' },
  { id: 'm5', name: 'Ouray', lat: 38.022, lng: -107.671, sectionId: 2, type: 'town', shortDescription: 'The Switzerland of America. Worth a detour.' },
  { id: 'm6', name: 'Corkscrew Pass', lat: 37.896, lng: -107.652, sectionId: 2, type: 'pass', shortDescription: 'Famous red dirt pass standing at 12,244 ft.' },
  { id: 'm7', name: 'California Pass', lat: 37.945, lng: -107.544, sectionId: 2, type: 'pass', shortDescription: 'Offers incredible views of Lake Como.' },
  { id: 'm8', name: 'Cinnamon Pass', lat: 37.932, lng: -107.534, sectionId: 2, type: 'pass', shortDescription: 'Part of the Alpine Loop dropping into Lake City.' },
  { id: 'm9', name: 'Lake City', lat: 38.029, lng: -107.315, sectionId: 2, type: 'town', shortDescription: 'Historic mountain town. End of section 2.' },
  { id: 'm10', name: 'Tincup', lat: 38.754, lng: -106.478, sectionId: 3, type: 'town', shortDescription: 'Small historic settlement below Tincup Pass.' },
  { id: 'm11', name: 'Cottonwood Pass', lat: 38.824, lng: -106.398, sectionId: 3, type: 'pass', shortDescription: 'High paved/dirt pass providing access to Buena Vista.' },
  { id: 'm12', name: 'Buena Vista', lat: 38.842, lng: -106.131, sectionId: 3, type: 'town', shortDescription: 'Town in the Arkansas River valley. End of section 3.' },
  { id: 'm13', name: 'Leadville', lat: 39.250, lng: -106.292, sectionId: 4, type: 'town', shortDescription: 'Highest incorporated city in North America.' },
  { id: 'm14', name: 'Hagerman Pass', lat: 39.263, lng: -106.452, sectionId: 4, type: 'pass', shortDescription: 'Rocky pass following the path of an old railway.' },
  { id: 'm15', name: 'Gypsum', lat: 39.645, lng: -106.953, sectionId: 4, type: 'town', shortDescription: 'Town along the I-70 corridor. End of section 4.' },
  { id: 'm16', name: 'State Bridge', lat: 39.810, lng: -106.634, sectionId: 5, type: 'poi', shortDescription: 'River crossing over the mighty Colorado River.' },
  { id: 'm17', name: 'Stagecoach Reservoir', lat: 40.231, lng: -106.815, sectionId: 5, type: 'lake', shortDescription: 'Large reservoir close to Steamboat Springs.' },
  { id: 'm18', name: 'Steamboat Springs', lat: 40.485, lng: -106.831, sectionId: 5, type: 'town', shortDescription: 'Famous ski town and hot springs. End of section 5.' },
  { id: 'm19', name: 'Steamboat Lake', lat: 40.810, lng: -106.955, sectionId: 6, type: 'lake', shortDescription: 'Beautiful alpine lake with views of Hahn’s Peak.' },
  { id: 'm20', name: 'Wyoming Border', lat: 41.000, lng: -107.039, sectionId: 6, type: 'poi', shortDescription: 'The official conclusion of the COBDR.' },
];
