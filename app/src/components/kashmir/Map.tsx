import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SECTIONS, MARKERS } from '../../data/kashmir/data';
import type { SectionId } from '../../data/kashmir/data';

declare const L: any;

const MapRoot = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;

  .leaflet-container {
    background: #e5e0d8; /* slightly warmer sand/mountain tone */
  }
`;

const ResetButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  color: #333;
  transition: background 0.2s;

  &:hover {
    background: #f8f8f8;
  }
`;

interface MapProps {
    onSectionSelect: (id: SectionId) => void;
    onMarkerSelect: (id: string | null) => void;
    activeSectionId: SectionId;
    activeMarkerId: string | null;
}

export default function Map({
    onSectionSelect,
    onMarkerSelect,
    activeSectionId,
    activeMarkerId
}: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const polylinesRef = useRef<{ [id: number]: any }>({});
    const markersRef = useRef<{ [id: string]: any }>({});

    useEffect(() => {
        if (!mapRef.current) return;
        if (typeof L === 'undefined') {
            console.warn("Leaflet not loaded. Is the CDN script missing?");
            return;
        }

        if (leafletMapRef.current) return;

        // Center map roughly on Kashmir/Ladakh region
        const map = L.map(mapRef.current, {
            center: [34.2, 76.5],
            zoom: 8,
            zoomControl: true,
            maxBounds: [
                [32.0, 73.0], // South West
                [36.5, 80.0]  // North East
            ],
            maxBoundsViscosity: 0.8
        });

        // Use a terrain style base map if available via CDN standard
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 14,
            attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
        }).addTo(map);

        leafletMapRef.current = map;

        // Draw Sections
        SECTIONS.forEach(section => {
            const polyline = L.polyline(section.anchors, {
                color: '#8b0000', // Deep mountain red
                weight: 6,
                opacity: 0.7,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map);

            polyline.on('mouseover', () => {
                if (activeSectionId !== section.id) polyline.setStyle({ color: '#ff4500', opacity: 1, weight: 8 });
            });

            polyline.on('mouseout', () => {
                if (activeSectionId !== section.id) polyline.setStyle({ color: '#8b0000', opacity: 0.7, weight: 6 });
            });

            polyline.on('click', () => {
                onSectionSelect(section.id);
                L.DomEvent.stopPropagation(arguments[0] as any);
            });

            polyline.bindTooltip(`Segment: ${section.title}`, { sticky: true, className: 'section-tooltip' });

            polylinesRef.current[section.id!] = polyline;
        });

        // Draw Markers
        MARKERS.forEach(markerData => {
            let markerColor = '#8b0000';
            if (markerData.type === 'fuel') markerColor = '#ffaa00';
            else if (markerData.type === 'pass') markerColor = '#4a90e2';
            else if (markerData.type === 'checkpoint') markerColor = '#333333';
            else if (markerData.type === 'risk') markerColor = '#d0021b';

            const icon = L.divIcon({
                className: 'custom-kashmir-marker',
                html: `<div style="background: white; border: 3px solid ${markerColor}; width: 14px; height: 14px; border-radius: 50%;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            });

            const marker = L.marker([markerData.lat, markerData.lng], { icon }).addTo(map);
            marker.bindTooltip(markerData.name, { direction: 'top', offset: [0, -10] });

            marker.on('click', (e: any) => {
                onMarkerSelect(markerData.id);
                if (markerData.sectionId) {
                    onSectionSelect(markerData.sectionId);
                }
                L.DomEvent.stopPropagation(e);
            });

            markersRef.current[markerData.id] = marker;
        });

        map.on('click', () => {
            onSectionSelect(null);
            onMarkerSelect(null);
        });

        const group = new L.featureGroup(Object.values(polylinesRef.current));
        map.fitBounds(group.getBounds(), { padding: [40, 40] });

        return () => {
            map.remove();
            leafletMapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!leafletMapRef.current) return;
        const map = leafletMapRef.current;

        Object.keys(polylinesRef.current).forEach(id => {
            const sectionId = Number(id) as SectionId;
            const polyline = polylinesRef.current[sectionId!];

            if (activeSectionId === null || activeSectionId === sectionId) {
                polyline.setStyle({
                    color: activeSectionId === sectionId ? '#ff4500' : '#8b0000',
                    opacity: activeSectionId === sectionId ? 1 : 0.7,
                    weight: activeSectionId === sectionId ? 8 : 6
                });
            } else {
                polyline.setStyle({
                    color: '#888888',
                    opacity: 0.3,
                    weight: 4
                });
            }
        });

        Object.keys(markersRef.current).forEach(id => {
            const markerData = MARKERS.find(m => m.id === id);
            const marker = markersRef.current[id];

            let markerColor = '#8b0000';
            if (markerData && markerData.type === 'fuel') markerColor = '#ffaa00';
            else if (markerData && markerData.type === 'pass') markerColor = '#4a90e2';
            else if (markerData && markerData.type === 'checkpoint') markerColor = '#333333';
            else if (markerData && markerData.type === 'risk') markerColor = '#d0021b';

            const isActive = activeMarkerId === id;
            const html = isActive
                ? `<div style="background: ${markerColor}; border: 2px solid white; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.8);"></div>`
                : `<div style="background: white; border: 3px solid ${activeSectionId ? '#aaaaaa' : markerColor}; width: 12px; height: 12px; border-radius: 50%;"></div>`;

            marker.setIcon(L.divIcon({
                className: 'custom-kashmir-marker',
                html,
                iconSize: isActive ? [20, 20] : [16, 16],
                iconAnchor: isActive ? [10, 10] : [8, 8],
            }));
        });

        if (activeSectionId && !activeMarkerId) {
            const polyline = polylinesRef.current[activeSectionId];
            if (polyline) map.flyToBounds(polyline.getBounds(), { padding: [60, 60], duration: 1.2 });
        } else if (activeMarkerId) {
            const marker = markersRef.current[activeMarkerId];
            if (marker) map.flyTo(marker.getLatLng(), 10, { duration: 1.2 });
        } else {
            const group = new L.featureGroup(Object.values(polylinesRef.current));
            map.flyToBounds(group.getBounds(), { padding: [40, 40], duration: 1.2 });
        }
    }, [activeSectionId, activeMarkerId]);

    return (
        <MapRoot>
            <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
            {(activeSectionId !== null || activeMarkerId !== null) && (
                <ResetButton onClick={() => {
                    onSectionSelect(null);
                    onMarkerSelect(null);
                }}>
                    Reset View
                </ResetButton>
            )}
        </MapRoot>
    );
}
