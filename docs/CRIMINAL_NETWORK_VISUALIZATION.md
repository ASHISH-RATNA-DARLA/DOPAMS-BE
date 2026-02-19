# Criminal Network Visualization Guide

## Overview

This guide shows how to visualize the criminal network for an accused person, showing:

- **Target accused** (center node)
- **All co-accused** from all crimes (including across duplicate person records)
- **Crimes** as connecting nodes
- **Locations** where crimes occurred
- **Connection strength** (how many crimes shared between people)
- **Network statistics** for analysis

---

## GraphQL API

### 1. Basic Criminal Network Query

Get the complete network for an accused including all co-accused across all crimes.

```graphql
query GetCriminalNetwork($accusedId: String!) {
  criminalNetwork(accusedId: $accusedId) {
    # Network nodes (persons, crimes, locations)
    nodes {
      id
      type
      label
      size
      color
      shape
      meta {
        # Person metadata
        personId
        fullName
        alias
        age
        gender
        district
        totalCrimes
        isDuplicateTarget
        duplicateCount

        # Crime metadata
        crimeId
        firNum
        firRegNum
        firDate
        caseStatus
        sections
        psName
        distName

        # Location metadata
        locationName
        crimeCount
      }
    }

    # Network edges (connections)
    edges {
      id
      source
      target
      relation
      label
      weight
      meta {
        sharedCrimes
        firNums
      }
    }

    # Network statistics
    stats {
      totalPersons
      totalCrimes
      totalLocations
      totalConnections
      networkDensity
      targetPersonCrimeCount
      mostConnectedPerson {
        id
        name
        connectionCount
      }
    }
  }
}
```

**Query Variables:**

```json
{
  "accusedId": "655874ce3f00b43df86bc9e2"
}
```

### 2. Extended Network Query (2nd Degree Connections)

Get expanded network showing co-accused of co-accused.

```graphql
query GetExtendedCriminalNetwork($accusedId: String!, $maxDepth: Int) {
  extendedCriminalNetwork(accusedId: $accusedId, maxDepth: $maxDepth) {
    nodes {
      id
      type
      label
      size
      color
      shape
      meta {
        personId
        fullName
        totalCrimes
        isDuplicateTarget
      }
    }
    edges {
      id
      source
      target
      relation
      weight
    }
    stats {
      totalPersons
      totalCrimes
      totalConnections
      networkDensity
    }
  }
}
```

**Query Variables:**

```json
{
  "accusedId": "655874ce3f00b43df86bc9e2",
  "maxDepth": 2
}
```

---

## Response Example

```json
{
  "data": {
    "criminalNetwork": {
      "nodes": [
        {
          "id": "person:629f726e699c33fbaf1bacf0",
          "type": "person",
          "label": "Md Imroz",
          "size": 40,
          "color": "#EF4444",
          "shape": "diamond",
          "meta": {
            "personId": "629f726e699c33fbaf1bacf0",
            "fullName": "Md Imroz",
            "age": 23,
            "district": "BEGUMPET",
            "totalCrimes": 2,
            "isDuplicateTarget": true,
            "duplicateCount": 2
          }
        },
        {
          "id": "crime:6558632087f23a2277d09041",
          "type": "crime",
          "label": "255/2022",
          "size": 15,
          "color": "#3B82F6",
          "shape": "square",
          "meta": {
            "crimeId": "6558632087f23a2277d09041",
            "firNum": "255/2022",
            "firRegNum": "2011038220255",
            "firDate": "2022-11-18",
            "caseStatus": "Under Investigation",
            "psName": "BEGUMPET",
            "distName": "HYDERABAD"
          }
        },
        {
          "id": "person:63a1234567890abcdef12345",
          "type": "person",
          "label": "Mohd Ahmed",
          "size": 18,
          "color": "#F59E0B",
          "shape": "circle",
          "meta": {
            "personId": "63a1234567890abcdef12345",
            "fullName": "Mohd Ahmed",
            "age": 28,
            "totalCrimes": 1
          }
        },
        {
          "id": "location:BEGUMPET, HYDERABAD",
          "type": "location",
          "label": "BEGUMPET, HYDERABAD",
          "size": 14,
          "color": "#10B981",
          "shape": "triangle",
          "meta": {
            "locationName": "BEGUMPET, HYDERABAD",
            "crimeCount": 2
          }
        }
      ],
      "edges": [
        {
          "id": "edge:person:629f726e699c33fbaf1bacf0->crime:6558632087f23a2277d09041",
          "source": "person:629f726e699c33fbaf1bacf0",
          "target": "crime:6558632087f23a2277d09041",
          "relation": "involved_in",
          "label": "involved in",
          "weight": 1
        },
        {
          "id": "edge:person:63a1234567890abcdef12345->crime:6558632087f23a2277d09041",
          "source": "person:63a1234567890abcdef12345",
          "target": "crime:6558632087f23a2277d09041",
          "relation": "involved_in",
          "label": "involved in",
          "weight": 1
        },
        {
          "id": "edge:person:629f726e699c33fbaf1bacf0<=>person:63a1234567890abcdef12345",
          "source": "person:629f726e699c33fbaf1bacf0",
          "target": "person:63a1234567890abcdef12345",
          "relation": "co_accused",
          "label": "1 crime",
          "weight": 1,
          "meta": {
            "sharedCrimes": ["6558632087f23a2277d09041"]
          }
        },
        {
          "id": "edge:crime:6558632087f23a2277d09041->location:BEGUMPET, HYDERABAD",
          "source": "crime:6558632087f23a2277d09041",
          "target": "location:BEGUMPET, HYDERABAD",
          "relation": "located_at",
          "label": "at",
          "weight": 1
        }
      ],
      "stats": {
        "totalPersons": 2,
        "totalCrimes": 1,
        "totalLocations": 1,
        "totalConnections": 4,
        "networkDensity": 0.5,
        "targetPersonCrimeCount": 2,
        "mostConnectedPerson": {
          "id": "63a1234567890abcdef12345",
          "name": "Mohd Ahmed",
          "connectionCount": 1
        }
      }
    }
  }
}
```

---

## Frontend Implementation

### TypeScript Types

```typescript
// types/criminal-network.ts

export interface NetworkNodeMeta {
  // Person metadata
  personId?: string;
  fullName?: string;
  alias?: string;
  age?: number;
  gender?: string;
  district?: string;
  totalCrimes?: number;
  isDuplicateTarget?: boolean;
  duplicateCount?: number;

  // Crime metadata
  crimeId?: string;
  firNum?: string;
  firRegNum?: string;
  firDate?: string;
  caseStatus?: string;
  sections?: string;
  psName?: string;
  distName?: string;

  // Location metadata
  locationName?: string;
  crimeCount?: number;
}

export interface NetworkNode {
  id: string;
  type: 'person' | 'crime' | 'location';
  label: string;
  size?: number;
  color?: string;
  shape?: string;
  meta?: NetworkNodeMeta;
}

export interface NetworkEdgeMeta {
  sharedCrimes?: string[];
  firNums?: string[];
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  relation: 'co_accused' | 'involved_in' | 'located_at';
  label?: string;
  weight?: number;
  meta?: NetworkEdgeMeta;
}

export interface MostConnectedPerson {
  id: string;
  name: string;
  connectionCount: number;
}

export interface NetworkStats {
  totalPersons: number;
  totalCrimes: number;
  totalLocations: number;
  totalConnections: number;
  networkDensity: number;
  targetPersonCrimeCount: number;
  mostConnectedPerson?: MostConnectedPerson;
}

export interface CriminalNetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  stats: NetworkStats;
}
```

### Apollo Client Hook

```typescript
// hooks/useCriminalNetwork.ts

import { useQuery, gql } from '@apollo/client';
import { CriminalNetworkData } from 'types/criminal-network';

const GET_CRIMINAL_NETWORK = gql`
  query GetCriminalNetwork($accusedId: String!) {
    criminalNetwork(accusedId: $accusedId) {
      nodes {
        id
        type
        label
        size
        color
        shape
        meta {
          personId
          fullName
          alias
          age
          gender
          district
          totalCrimes
          isDuplicateTarget
          duplicateCount
          crimeId
          firNum
          firDate
          caseStatus
          psName
          distName
          locationName
          crimeCount
        }
      }
      edges {
        id
        source
        target
        relation
        label
        weight
        meta {
          sharedCrimes
        }
      }
      stats {
        totalPersons
        totalCrimes
        totalLocations
        totalConnections
        networkDensity
        targetPersonCrimeCount
        mostConnectedPerson {
          id
          name
          connectionCount
        }
      }
    }
  }
`;

export function useCriminalNetwork(accusedId: string) {
  return useQuery<{ criminalNetwork: CriminalNetworkData }>(GET_CRIMINAL_NETWORK, {
    variables: { accusedId },
    skip: !accusedId,
  });
}
```

---

## Visualization Options

### Option 1: React Force Graph (Recommended for 3D/2D Force-Directed)

**Best for:** Interactive, physics-based network visualization with zoom and pan.

**Installation:**

```bash
npm install react-force-graph
# or
yarn add react-force-graph
```

**Implementation:**

```tsx
// components/CriminalNetworkGraph.tsx

import React, { useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
// Or use ForceGraph3D for 3D visualization
import { useCriminalNetwork } from 'hooks/useCriminalNetwork';
import type { NetworkNode, NetworkEdge } from 'types/criminal-network';

interface Props {
  accusedId: string;
}

export const CriminalNetworkGraph: React.FC<Props> = ({ accusedId }) => {
  const { data, loading, error } = useCriminalNetwork(accusedId);
  const graphRef = useRef<any>();

  // Transform data for react-force-graph
  const graphData = React.useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    return {
      nodes: data.criminalNetwork.nodes.map(node => ({
        id: node.id,
        name: node.label,
        val: node.size || 10, // Node size
        color: node.color,
        ...node,
      })),
      links: data.criminalNetwork.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        label: edge.label,
        value: edge.weight || 1, // Link thickness
        color: edge.relation === 'co_accused' ? '#EF4444' : '#94A3B8',
        ...edge,
      })),
    };
  }, [data]);

  // Node click handler
  const handleNodeClick = useCallback((node: any) => {
    if (node.type === 'person') {
      window.location.href = `/criminal-profile/${node.meta.personId}`;
    } else if (node.type === 'crime') {
      window.location.href = `/crimes/${node.meta.crimeId}`;
    }
  }, []);

  // Node hover tooltip
  const nodeLabel = useCallback((node: any) => {
    if (node.type === 'person') {
      return `
        <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <strong>${node.label}</strong><br/>
          Age: ${node.meta.age || 'N/A'}<br/>
          District: ${node.meta.district || 'N/A'}<br/>
          Total Crimes: ${node.meta.totalCrimes || 0}
        </div>
      `;
    } else if (node.type === 'crime') {
      return `
        <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <strong>FIR: ${node.meta.firNum}</strong><br/>
          Date: ${node.meta.firDate || 'N/A'}<br/>
          Status: ${node.meta.caseStatus || 'N/A'}<br/>
          Location: ${node.meta.psName}, ${node.meta.distName}
        </div>
      `;
    }
    return node.label;
  }, []);

  if (loading) return <div>Loading network...</div>;
  if (error) return <div>Error loading network: {error.message}</div>;
  if (!data) return <div>No network data available</div>;

  return (
    <div className="network-container">
      {/* Statistics Panel */}
      <div className="stats-panel mb-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-bold mb-2">Network Statistics</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-red-600">{data.criminalNetwork.stats.totalPersons}</div>
            <div className="text-sm text-gray-600">Persons</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{data.criminalNetwork.stats.totalCrimes}</div>
            <div className="text-sm text-gray-600">Crimes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{data.criminalNetwork.stats.totalLocations}</div>
            <div className="text-sm text-gray-600">Locations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {data.criminalNetwork.stats.networkDensity.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Density</div>
          </div>
        </div>

        {data.criminalNetwork.stats.mostConnectedPerson && (
          <div className="mt-3 p-2 bg-yellow-100 rounded">
            <strong>Most Connected: </strong>
            {data.criminalNetwork.stats.mostConnectedPerson.name}(
            {data.criminalNetwork.stats.mostConnectedPerson.connectionCount} connections)
          </div>
        )}
      </div>

      {/* Force Graph */}
      <div className="graph-wrapper" style={{ height: '600px' }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={nodeLabel}
          nodeAutoColorBy="type"
          nodeVal="val"
          nodeCanvasObject={(node, ctx, globalScale) => {
            // Custom node rendering
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;

            // Draw node shape based on type
            const size = node.val || 10;
            ctx.fillStyle = node.color || '#999';

            if (node.shape === 'diamond') {
              // Diamond for target
              ctx.save();
              ctx.translate(node.x, node.y);
              ctx.rotate(Math.PI / 4);
              ctx.fillRect(-size / 2, -size / 2, size, size);
              ctx.restore();
            } else if (node.shape === 'square') {
              // Square for crimes
              ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
            } else if (node.shape === 'triangle') {
              // Triangle for locations
              ctx.beginPath();
              ctx.moveTo(node.x, node.y - size / 2);
              ctx.lineTo(node.x - size / 2, node.y + size / 2);
              ctx.lineTo(node.x + size / 2, node.y + size / 2);
              ctx.closePath();
              ctx.fill();
            } else {
              // Circle for regular nodes
              ctx.beginPath();
              ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
              ctx.fill();
            }

            // Draw label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText(label, node.x, node.y + size / 2 + fontSize);
          }}
          linkLabel="label"
          linkWidth={link => Math.sqrt(link.value || 1)}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          linkColor="color"
          onNodeClick={handleNodeClick}
          enableNodeDrag={true}
          enableZoomPanInteraction={true}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current?.zoomToFit(400)}
        />
      </div>

      {/* Legend */}
      <div className="legend mt-4 p-4 bg-gray-100 rounded">
        <h4 className="font-bold mb-2">Legend</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 transform rotate-45"></div>
            <span>Target Accused</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
            <span>Co-Accused</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500"></div>
            <span>Crime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
            <span>Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Option 2: Cytoscape.js (Recommended for Complex Layouts)

**Best for:** Advanced network analysis with multiple layout algorithms.

**Installation:**

```bash
npm install cytoscape react-cytoscapejs
npm install @types/cytoscape --save-dev
```

**Implementation:**

```tsx
// components/CriminalNetworkCytoscape.tsx

import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useCriminalNetwork } from 'hooks/useCriminalNetwork';

interface Props {
  accusedId: string;
}

export const CriminalNetworkCytoscape: React.FC<Props> = ({ accusedId }) => {
  const { data, loading } = useCriminalNetwork(accusedId);

  if (loading || !data) return <div>Loading...</div>;

  // Transform to Cytoscape format
  const elements = [
    ...data.criminalNetwork.nodes.map(node => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        ...node.meta,
      },
      style: {
        'background-color': node.color,
        shape:
          node.shape === 'square'
            ? 'rectangle'
            : node.shape === 'diamond'
              ? 'diamond'
              : node.shape === 'triangle'
                ? 'triangle'
                : 'ellipse',
        width: node.size,
        height: node.size,
      },
    })),
    ...data.criminalNetwork.edges.map(edge => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        weight: edge.weight,
      },
    })),
  ];

  const stylesheet = [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': '10px',
        'border-width': 2,
        'border-color': '#fff',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 'data(weight)',
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '8px',
      },
    },
  ];

  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={stylesheet}
      style={{ width: '100%', height: '600px' }}
      layout={{
        name: 'cose', // Force-directed layout
        // Try: 'circle', 'grid', 'breadthfirst', 'cose-bilkent'
        animate: true,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
      }}
    />
  );
};
```

### Option 3: D3.js (Most Customizable)

**Best for:** Complete control over visualization.

```tsx
// components/CriminalNetworkD3.tsx

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useCriminalNetwork } from 'hooks/useCriminalNetwork';

interface Props {
  accusedId: string;
}

export const CriminalNetworkD3: React.FC<Props> = ({ accusedId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data } = useCriminalNetwork(accusedId);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    svg.selectAll('*').remove(); // Clear previous

    const simulation = d3
      .forceSimulation(data.criminalNetwork.nodes as any)
      .force(
        'link',
        d3
          .forceLink(data.criminalNetwork.edges)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw edges
    const link = svg
      .append('g')
      .selectAll('line')
      .data(data.criminalNetwork.edges)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-width', (d: any) => Math.sqrt(d.weight || 1));

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('circle')
      .data(data.criminalNetwork.nodes)
      .join('circle')
      .attr('r', (d: any) => d.size / 2)
      .attr('fill', (d: any) => d.color || '#999')
      .call(d3.drag<any, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended) as any);

    // Add labels
    const labels = svg
      .append('g')
      .selectAll('text')
      .data(data.criminalNetwork.nodes)
      .join('text')
      .text((d: any) => d.label)
      .attr('font-size', 10)
      .attr('dx', 15)
      .attr('dy', 4);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

      labels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [data]);

  return <svg ref={svgRef}></svg>;
};
```

---

## Usage in Your App

```tsx
// pages/criminal-network/[id].tsx

import { useRouter } from 'next/router';
import { CriminalNetworkGraph } from 'components/CriminalNetworkGraph';

export default function CriminalNetworkPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return <div>Invalid accused ID</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Criminal Network Analysis</h1>
      <CriminalNetworkGraph accusedId={id} />
    </div>
  );
}
```

---

## Recommendations

### For Your Use Case (URL: `/criminal-network/655874ce3f00b43df86bc9e2`)

**I recommend react-force-graph-2d** because:

1. ✅ **Easy to implement** - Minimal setup, great defaults
2. ✅ **Interactive** - Zoom, pan, drag nodes
3. ✅ **Performant** - Handles 100+ nodes smoothly
4. ✅ **Beautiful** - Physics-based layout looks professional
5. ✅ **Customizable** - Can style nodes/edges per your needs
6. ✅ **Tooltip support** - Built-in hover tooltips
7. ✅ **Click handlers** - Navigate to profiles/crimes easily

### Key Features to Implement:

1. **Node sizing** based on crime count (already in API response)
2. **Edge thickness** based on shared crimes weight
3. **Color coding**:
   - 🔴 Red diamond: Target accused
   - 🟠 Orange circles: Co-accused
   - 🔵 Blue squares: Crimes
   - 🟢 Green triangles: Locations
4. **Hover tooltips** showing person/crime details
5. **Click to navigate** to detailed profiles
6. **Statistics panel** showing network metrics
7. **Filter controls** (optional) to show/hide node types
8. **Export** as PNG (optional)

---

## Testing

Test with your URL:

```
http://localhost:5173/criminal-network/655874ce3f00b43df86bc9e2
```

The API will:

1. Look up this accused in the deduplication tracker
2. Find ALL crimes across duplicate records
3. Get ALL co-accused from each crime
4. Calculate connection strengths
5. Include location nodes
6. Return ready-to-visualize graph data

---

**Created:** 2025-11-10  
**Version:** 1.0  
**Status:** Ready for Integration
