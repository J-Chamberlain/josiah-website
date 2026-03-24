import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SECTIONS, MARKERS } from '../../data/cobdr/data';
import type { SectionId } from '../../data/cobdr/data';

declare const L: any;

const MapRoot = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;

  .leaflet-container {
    background: #e5e5e5;
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

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;
        if (typeof L === 'undefined') {
            console.warn("Leaflet not loaded. Is the CDN script missing?");
            return;
        }

        if (leafletMapRef.current) return; // Already initialized

        // Center map roughly on Colorado
        const map = L.map(mapRef.current, {
            center: [39.0, -106.5],
            zoom: 7,
            zoomControl: true,
            maxBounds: [
                [36.8, -109.5], // South West
                [41.2, -104.5]  // North East
            ],
            maxBoundsViscosity: 0.8
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 14,
            attribution: '&copy; OpenStreetMap contributors | COBDR Independent Companion'
        }).addTo(map);

        leafletMapRef.current = map;

        // Draw Sections
        SECTIONS.forEach(section => {
            const polyline = L.polyline(section.anchors, {
                color: '#0056b3',
                weight: 6,
                opacity: 0.7,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map);

            // Interactions
            polyline.on('mouseover', () => {
                if (activeSectionId !== section.id) polyline.setStyle({ color: '#ff7b00', opacity: 1, weight: 8 });
            });

            polyline.on('mouseout', () => {
                if (activeSectionId !== section.id) polyline.setStyle({ color: '#0056b3', opacity: 0.7, weight: 6 });
            });

            polyline.on('click', () => {
                onSectionSelect(section.id);
                L.DomEvent.stopPropagation(arguments[0] as any);
            });

            // Bind tooltip
            polyline.bindTooltip(`Section ${section.sectionNumber}: ${section.title}`, { sticky: true, className: 'section-tooltip' });

            polylinesRef.current[section.id!] = polyline;
        });

        // Draw Markers
        MARKERS.forEach(markerData => {
            // Small basic icon
            const icon = L.divIcon({
                className: 'custom-cobdr-marker',
                html: `<div style="background: white; border: 2px solid #0056b3; width: 12px; height: 12px; border-radius: 50%;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });

            const marker = L.marker([markerData.lat, markerData.lng], { icon }).addTo(map);

            marker.bindTooltip(markerData.name, { direction: 'top', offset: [0, -8] });

            marker.on('click', (e: any) => {
                onMarkerSelect(markerData.id);
                if (markerData.sectionId) {
                    onSectionSelect(markerData.sectionId);
                }
                L.DomEvent.stopPropagation(e);
            });

            markersRef.current[markerData.id] = marker;
        });

        // Map Click - reset selection
        map.on('click', () => {
            onSectionSelect(null);
            onMarkerSelect(null);
        });

        // Fit bounds initially
        const group = new L.featureGroup(Object.values(polylinesRef.current));
        map.fitBounds(group.getBounds(), { padding: [50, 50] });

        return () => {
            map.remove();
            leafletMapRef.current = null;
        };
    }, []);

    // Sync state changes with Leaflet styles & view
    useEffect(() => {
        if (!leafletMapRef.current) return;
        const map = leafletMapRef.current;

        // Reset styles
        Object.keys(polylinesRef.current).forEach(id => {
            const sectionId = Number(id) as SectionId;
            const polyline = polylinesRef.current[sectionId!];

            if (activeSectionId === null || activeSectionId === sectionId) {
                polyline.setStyle({
                    color: activeSectionId === sectionId ? '#ff7b00' : '#0056b3',
                    opacity: activeSectionId === sectionId ? 1 : 0.7,
                    weight: activeSectionId === sectionId ? 8 : 6
                });
            } else {
                // Dim inactive sections
                polyline.setStyle({
                    color: '#888888',
                    opacity: 0.4,
                    weight: 4
                });
            }
        });

        // Marker styling updates
        Object.keys(markersRef.current).forEach(id => {
            const marker = markersRef.current[id];
            const html = activeMarkerId === id
                ? `<div style="background: #ff7b00; border: 2px solid white; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`
                : `<div style="background: white; border: 2px solid ${activeSectionId ? '#888888' : '#0056b3'}; width: 10px; height: 10px; border-radius: 50%;"></div>`;

            marker.setIcon(L.divIcon({
                className: 'custom-cobdr-marker',
                html,
                iconSize: activeMarkerId === id ? [18, 18] : [14, 14],
                iconAnchor: activeMarkerId === id ? [9, 9] : [7, 7],
            }));
        });

        // Fly to bounds or centers
        if (activeSectionId && !activeMarkerId) {
            const polyline = polylinesRef.current[activeSectionId];
            if (polyline) map.flyToBounds(polyline.getBounds(), { padding: [40, 40], duration: 1 });
        } else if (activeMarkerId) {
            const marker = markersRef.current[activeMarkerId];
            if (marker) map.flyTo(marker.getLatLng(), 11, { duration: 1 });
        } else {
            // Reset full view
            const group = new L.featureGroup(Object.values(polylinesRef.current));
            map.flyToBounds(group.getBounds(), { padding: [50, 50], duration: 1 });
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
