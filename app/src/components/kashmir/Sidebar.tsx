import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SECTIONS, MARKERS } from '../../data/kashmir/data';
import type { SectionId, KashmirSection, KashmirMarker } from '../../data/kashmir/data';

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
  font-size: 1.6rem;
  line-height: 1.2;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--theme-text-light, #666666);
  font-size: 0.95rem;
  line-height: 1.4;
`;

const SectionMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b0000;
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

const BlockGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const InfoBlock = styled.div<{ $type?: 'risk' | 'logistics' | 'highlights' }>`
  background: ${props => props.$type === 'risk' ? '#fff5f5' : props.$type === 'logistics' ? '#f0f4f8' : '#f9f9f9'};
  border-left: 4px solid ${props => props.$type === 'risk' ? '#e53e3e' : props.$type === 'logistics' ? '#3182ce' : '#cbd5e0'};
  padding: 16px;
  border-radius: 4px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 1.05rem;
    color: ${props => props.$type === 'risk' ? '#c53030' : props.$type === 'logistics' ? '#2b6cb0' : '#4a5568'};
  }

  ul {
    margin: 0;
    padding-left: 20px;
    li {
      margin-bottom: 6px;
      line-height: 1.4;
      font-size: 0.9rem;
    }
  }

  p {
    margin: 4px 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const AIButton = styled.button`
  background: #2d3748;
  color: #ffffff;
  border: none;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  &:hover {
    background: #1a202c;
  }
`;

const DisclaimerBox = styled.div`
  background: #2d3748;
  color: #edf2f7;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;

  strong {
    color: #feb2b2;
    display: block;
    margin-bottom: 4px;
  }
`;

const DefaultStateContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AIInsightsBlock = styled.div`
  background: #fdfaf6;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #805ad5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 16px;

  h3 {
    color: #553c9a;
    margin: 0 0 16px 0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  h4 {
    margin: 16px 0 6px 0;
    font-size: 1rem;
    color: #2d3748;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #4a5568;
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
        risksAnalysis?: string;
        pacing?: string;
        decisionPoints?: string;
    } | null>(null);

    useEffect(() => {
        setInsights(null);
    }, [activeSectionId, activeMarkerId]);

    const handleAskAI = async (context: string) => {
        setInsightsLoading(true);
        setInsights(null);
        try {
            const res = await fetch('/api/generate-kashmir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context })
            });
            const data = await res.json();
            if (res.ok && data.insights) {
                setInsights(data.insights);
            } else {
                alert(data.error || 'Failed to generate situational awareness insights.');
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
            {insightsLoading && <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#718096' }}>Calculating expedition risks and interpreting terrain metrics...</p>}
            {insights && (
                <AIInsightsBlock>
                    <h3>Situational Intelligence</h3>
                    <p><strong>Overview:</strong> {insights.summary}</p>
                    <h4>Difficulty Profile</h4>
                    <p>{insights.difficulty}</p>
                    <h4>Risk Factors</h4>
                    <p>{insights.risksAnalysis}</p>
                    <h4>Pacing & Acclimatization</h4>
                    <p>{insights.pacing}</p>
                    <h4>Decision Points</h4>
                    <p>{insights.decisionPoints}</p>
                </AIInsightsBlock>
            )}
        </>
    );

    const renderDefaultState = () => (
        <>
            <ContentHeader>
                <Title>Kashmir ADV Expedition Planner</Title>
                <Subtitle>High-altitude situational awareness and segment analysis.</Subtitle>
            </ContentHeader>

            <ContentBody>
                <DefaultStateContent>
                    <DisclaimerBox>
                        <strong>HIGH UNCERTAINTY ENVIRONMENT</strong>
                        This tool provides situational awareness, planning contexts, and interpretation for Himalayan travel.
                        It is absolutely <strong>NOT</strong> a turn-by-turn navigation product. Weather, political shifts,
                        and glacier melts alter routes daily. Rely only on boots-on-the-ground intelligence before riding.
                    </DisclaimerBox>
                    <p>
                        Select an expedition segment or a landmark point on the map to review
                        risks, logistics, and access the AI Interpretation layer.
                    </p>
                </DefaultStateContent>
            </ContentBody>
        </>
    );

    const renderMarkerState = (m: KashmirMarker) => (
        <>
            <ContentHeader>
                <Title>{m.name}</Title>
                <SectionMetaRow>
                    <span>{m.type.toUpperCase()}</span>
                    {m.sectionId && <span>Segment {m.sectionId}</span>}
                </SectionMetaRow>
            </ContentHeader>

            <ContentBody>
                <SectionDescription>{m.shortDescription}</SectionDescription>
                {!insightsLoading && !insights && (
                    <AIButton onClick={() => handleAskAI(`Landmark - ${m.name} (${m.type})`)}>
                        Interpret Operational Context
                    </AIButton>
                )}
                {renderInsights()}
            </ContentBody>
        </>
    );

    const renderSectionState = (s: KashmirSection) => (
        <>
            <ContentHeader>
                <Title>Sec. {s.id}: {s.title}</Title>
                <SectionMetaRow>
                    <span>{s.startLocation}</span>
                    <span>→</span>
                    <span>{s.endLocation}</span>
                </SectionMetaRow>
            </ContentHeader>

            <ContentBody>
                <SectionDescription>{s.description}</SectionDescription>

                <BlockGrid>
                    <InfoBlock $type="highlights">
                        <h3>Key Waypoints</h3>
                        <ul>
                            {s.highlights.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                    </InfoBlock>

                    <InfoBlock $type="risk">
                        <h3>Expedition Risks</h3>
                        <p><strong>Altitude:</strong> {s.risks.altitude}</p>
                        <p><strong>Weather:</strong> {s.risks.weather}</p>
                        <p><strong>Roads:</strong> {s.risks.roadConditions}</p>
                        <p><strong>Security:</strong> {s.risks.political}</p>
                    </InfoBlock>

                    <InfoBlock $type="logistics">
                        <h3>Logistics Base</h3>
                        <p><strong>Fuel:</strong> {s.logistics.fuel}</p>
                        <p><strong>Lodging:</strong> {s.logistics.lodging}</p>
                        <p><strong>Permits:</strong> {s.logistics.permits}</p>
                    </InfoBlock>
                </BlockGrid>

                <SectionDescription style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#4a5568' }}>
                    Note: {s.notes}
                </SectionDescription>

                {!insightsLoading && !insights && (
                    <AIButton onClick={() => handleAskAI(`Segment ${s.id} - ${s.title}: ${s.startLocation} to ${s.endLocation}`)}>
                        Interpret Segment with AI
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
