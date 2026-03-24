import React, { useState } from 'react';
import styled from 'styled-components';
import Map from './Map';
import Sidebar from './Sidebar';
import { MARKERS } from '../../data/cobdr/data';
import type { SectionId } from '../../data/cobdr/data';

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 80px); /* fallback height accounting for typical headers */
  width: 100%;
  overflow: hidden;
  background: var(--theme-bg, #ffffff);

  @media (max-width: 768px) {
    flex-direction: column;
    height: calc(100vh - 60px);
  }
`;

const MapPanel = styled.div`
  flex: 2;
  position: relative;
  height: 100%;
  
  @media (max-width: 768px) {
    flex: 1;
    min-height: 50vh;
  }
`;

const SidebarPanel = styled.div`
  flex: 1;
  max-width: 450px;
  position: relative;
  z-index: 10;
  box-shadow: -2px 0 10px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    flex: 1;
    max-width: 100%;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  }
`;

export default function CobdrApp() {
  const [activeSectionId, setActiveSectionId] = useState<SectionId>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const handleSectionSelect = (id: SectionId) => {
    setActiveSectionId(id);
    if (!id || (activeMarkerId && MARKERS.find(m => m.id === activeMarkerId)?.sectionId !== id)) {
      setActiveMarkerId(null);
    }
  };

  const handleMarkerSelect = (id: string | null) => {
    setActiveMarkerId(id);
  };

  return (
    <AppContainer>
      <MapPanel>
        <Map
          activeSectionId={activeSectionId}
          activeMarkerId={activeMarkerId}
          onSectionSelect={handleSectionSelect}
          onMarkerSelect={handleMarkerSelect}
        />
      </MapPanel>
      <SidebarPanel>
        <Sidebar
          activeSectionId={activeSectionId}
          activeMarkerId={activeMarkerId}
        />
      </SidebarPanel>
    </AppContainer>
  );
}
