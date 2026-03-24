import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SECTIONS, MARKERS } from '../../data/cobdr/data';
import type { SectionId, CobdrSection, CobdrMarker } from '../../data/cobdr/data';

const SidebarContainer = styled.aside`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--theme-bg, #ffffff);
  color: var(--theme-text, #333333);
  overflow-y: auto;
  border-left: 1px solid var(--theme-border, #eaeaea);
  padding: 24px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    border-left: none;
    border-top: 1px solid var(--theme-border, #eaeaea);
  }
`;

const ContentHeader = styled.header`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--theme-text-light, #666666);
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SectionMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--theme-accent, #0056b3);
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionDescription = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
`;

const ListBlock = styled.div`
  background: var(--theme-bg-alt, #f9f9f9);
  padding: 16px;
  border-radius: 8px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 1rem;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 6px;
      line-height: 1.4;
    }
  }
`;

const WarningBlock = styled(ListBlock)`
  background: #fff5f5;
  border-left: 4px solid #e53e3e;

  h3 {
    color: #c53030;
  }
`;

const AIButton = styled.button`
  background: var(--theme-accent, #0056b3);
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 16px;

  &:hover {
    background: var(--theme-accent-hover, #004494);
  }
`;

const DefaultStateContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DisclaimerBox = styled.div`
  background: #fdf6e3;
  border: 1px solid #f6e8c3;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #665c3f;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const ActionLink = styled.a`
  text-decoration: none;
  color: var(--theme-accent, #0056b3);
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
  padding: 8px 16px;
  border: 1px solid var(--theme-accent, #0056b3);
  border-radius: 4px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    background: var(--theme-accent, #0056b3);
    color: #fff;
  }
`;

const AIInsightsBlock = styled.div`
  background: var(--theme-bg-alt, #f0f7ff);
  border: 1px solid #cce5ff;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;

  h3 {
    color: #0056b3;
    margin: 0 0 12px 0;
    font-size: 1.1rem;
  }
  
  h4 {
    margin: 12px 0 4px 0;
    font-size: 0.95rem;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #444;
  }
`;


interface SidebarProps {
  activeSectionId: SectionId;
  activeMarkerId: string | null;
}

export default function Sidebar({ activeSectionId, activeMarkerId }: SidebarProps) {
  const section = activeSectionId ? SECTIONS.find(s => s.id === activeSectionId) : null;
  const marker = activeMarkerId ? MARKERS.find(m => m.id === activeMarkerId) : null;

  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<{
    summary?: string;
    difficulty?: string;
    terrain?: string;
    altitudeConsiderations?: string;
    logistics?: string;
  } | null>(null);

  useEffect(() => {
    setInsights(null);
  }, [activeSectionId, activeMarkerId]);

  const handleAskAI = async (context: string) => {
    setInsightsLoading(true);
    setInsights(null);
    try {
      const res = await fetch('/api/generate-cobdr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      });
      const data = await res.json();
      if (res.ok && data.insights) {
        setInsights(data.insights);
      } else {
        alert(data.error || 'Failed to generate insights.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while asking AI.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const renderInsights = () => (
    <>
      {insightsLoading && <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#666' }}>Consulting the AI guide...</p>}
      {insights && (
        <AIInsightsBlock>
          <h3>AI Guide Insights</h3>
          <p><strong>Summary:</strong> {insights.summary}</p>
          <h4>Difficulty</h4>
          <p>{insights.difficulty}</p>
          <h4>Terrain</h4>
          <p>{insights.terrain}</p>
          <h4>Altitude & Passes</h4>
          <p>{insights.altitudeConsiderations}</p>
          <h4>Logistics</h4>
          <p>{insights.logistics}</p>
        </AIInsightsBlock>
      )}
    </>
  );

  const renderDefaultState = () => (
    <>
      <ContentHeader>
        <Title>COBDR Interactive Companion</Title>
        <Subtitle>Explore the Colorado Backcountry Discovery Route</Subtitle>
      </ContentHeader>

      <ContentBody>
        <DefaultStateContent>
          <p>
            Welcome to the interactive companion guide. Select a route section or point
            of interest on the map to view detailed information, highlights, and insights.
          </p>

          <DisclaimerBox>
            <strong>Attention:</strong> This tool is an independent interactive companion to the Colorado
            Backcountry Discovery Route and is intended to complement, not replace, official
            BDR maps and resources. The route lines are approximate corridors, not exact GPX tracks.
          </DisclaimerBox>

          <ButtonsRow>
            <ActionLink href="https://ridebdr.com/cobdr/" target="_blank" rel="noopener noreferrer">
              View Official Resources
            </ActionLink>
            <ActionLink href="https://ridebdr.com/store/" target="_blank" rel="noopener noreferrer">
              Purchase BDR Maps
            </ActionLink>
          </ButtonsRow>
        </DefaultStateContent>
      </ContentBody>
    </>
  );

  const renderMarkerState = (m: CobdrMarker) => (
    <>
      <ContentHeader>
        <Title>{m.name}</Title>
        <SectionMetaRow>
          <span>Point of Interest</span>
          {m.sectionId && <span>Section {m.sectionId}</span>}
        </SectionMetaRow>
      </ContentHeader>

      <ContentBody>
        <SectionDescription>{m.shortDescription}</SectionDescription>
        {!insightsLoading && !insights && (
          <AIButton onClick={() => handleAskAI(`Marker - ${m.name} (${m.type})`)}>
            Ask AI about this point
          </AIButton>
        )}
        {renderInsights()}
      </ContentBody>
    </>
  );

  const renderSectionState = (s: CobdrSection) => (
    <>
      <ContentHeader>
        <Title>Section {s.sectionNumber}: {s.title}</Title>
        <SectionMetaRow>
          <span>{s.startLabel}</span>
          <span>→</span>
          <span>{s.endLabel}</span>
        </SectionMetaRow>
      </ContentHeader>

      <ContentBody>
        <SectionDescription>{s.description}</SectionDescription>

        <ListBlock>
          <h3>Highlights</h3>
          <ul>
            {s.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </ListBlock>

        <WarningBlock>
          <h3>Heads Up & Warnings</h3>
          <ul>
            {s.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </WarningBlock>

        {!insightsLoading && !insights && (
          <AIButton onClick={() => handleAskAI(`Section ${s.sectionNumber} - ${s.title}`)}>
            Ask AI about this section
          </AIButton>
        )}
        {renderInsights()}
      </ContentBody>
    </>
  );

  return (
    <SidebarContainer>
      {marker
        ? renderMarkerState(marker)
        : section
          ? renderSectionState(section)
          : renderDefaultState()
      }
    </SidebarContainer>
  );
}
