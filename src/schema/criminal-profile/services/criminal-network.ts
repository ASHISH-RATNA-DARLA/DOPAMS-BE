import { prisma } from 'datasources/prisma';
import ResourceNotFoundException from 'utils/errors/resource-not-found';

/**
 * Enhanced Criminal Network using Deduplication System
 *
 * This generates a complete network graph showing:
 * - Target accused (center node)
 * - All co-accused from all crimes (including across duplicate records)
 * - Crimes as connecting nodes
 * - Connection strength (how many crimes shared)
 * - Network metrics for analysis
 */

interface NetworkNode {
  id: string;
  type: 'person' | 'crime' | 'location';
  label: string;
  meta: {
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
    // Parentage information
    parentName?: string; // relativeName from persons table
    relationType?: string; // "S/o", "D/o", "W/o", etc.

    // Crime metadata
    crimeId?: string;
    firNum?: string;
    firRegNum?: string;
    firDate?: string;
    caseStatus?: string;
    sections?: string;
    psName?: string;
    distName?: string;
    // Number of accused in this crime
    accusedCount?: number;

    // Location metadata
    locationName?: string;
    crimeCount?: number;
  };
  // Visual properties for frontend
  size?: number; // Node size (based on crime count)
  color?: string; // Color coding
  shape?: string; // Shape for different node types
}

interface NetworkEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  relation: 'co_accused' | 'involved_in' | 'located_at' | 'accomplice';
  label?: string;
  weight?: number; // Connection strength (number of shared crimes)
  meta?: {
    sharedCrimes?: string[]; // List of crime IDs
    firNums?: string[]; // List of FIR numbers
    // Role information for involved_in edges
    accusedType?: string; // Main Accused, Co-Accused, Accomplice, etc.
    accusedCode?: string; // A1, A2, A3, etc.
    accusedStatus?: string; // Arrested, At Large, etc.
    // Relationship type for co_accused edges
    relationshipType?: string; // "co-accused" or "accomplice"
  };
}

interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  stats: {
    totalPersons: number;
    totalCrimes: number;
    totalLocations: number;
    totalConnections: number;
    networkDensity: number;
    targetPersonCrimeCount: number;
    mostConnectedPerson?: {
      id: string;
      name: string;
      connectionCount: number;
    };
  };
}

/**
 * Get criminal network for an accused using deduplication data
 * This shows ALL connections including those across duplicate person records
 */
export async function getCriminalNetwork(accusedId: string): Promise<NetworkData> {
  // First, get the complete case history including deduplication info
  const caseHistoryResult = await prisma.$queryRaw<any[]>`
    SELECT 
      pdt.person_fingerprint as "personFingerprint",
      pdt.canonical_person_id as "canonicalPersonId",
      pdt.full_name as "fullName",
      pdt.relative_name as "parentName",
      pdt.age,
      pdt.present_district as district,
      pdt.phone_number as phone,
      pdt.crime_count as "totalCrimes",
      pdt.person_record_count as "totalDuplicateRecords",
      pdt.all_person_ids as "allPersonIds",
      pdt.all_accused_ids as "allAccusedIds",
      pdt.crime_details as "crimeDetails"
    FROM person_deduplication_tracker pdt
    WHERE ${accusedId} = ANY(pdt.all_accused_ids)
       OR ${accusedId} = ANY(pdt.all_person_ids)
  `;

  // Fallback if not in deduplication tracker
  if (caseHistoryResult.length === 0) {
    return await getFallbackNetwork(accusedId);
  }

  const targetPerson = caseHistoryResult[0];
  const crimes =
    typeof targetPerson.crimeDetails === 'string' ? JSON.parse(targetPerson.crimeDetails) : targetPerson.crimeDetails;

  // Maps to avoid duplicates
  const nodesMap = new Map<string, NetworkNode>();
  const edgesMap = new Map<string, NetworkEdge>();
  const locationNodesMap = new Map<string, NetworkNode>();

  // Connection strength tracking
  const personConnectionCount = new Map<string, number>();
  const personSharedCrimes = new Map<string, Map<string, string[]>>(); // personId -> otherPersonId -> crimeIds[]

  // Add target person as center node
  const targetNodeId = `person:${targetPerson.canonicalPersonId}`;
  nodesMap.set(targetNodeId, {
    id: targetNodeId,
    type: 'person',
    label: targetPerson.fullName || 'Unknown',
    meta: {
      personId: targetPerson.canonicalPersonId,
      fullName: targetPerson.fullName,
      age: targetPerson.age,
      district: targetPerson.district,
      totalCrimes: targetPerson.totalCrimes,
      isDuplicateTarget: true,
      duplicateCount: targetPerson.totalDuplicateRecords,
    },
    size: 30 + targetPerson.totalCrimes * 5, // Larger size for target
    color: '#EF4444', // Red for target
    shape: 'diamond',
  });

  // Get all co-accused for each crime
  for (const crime of crimes) {
    const crimeNodeId = `crime:${crime.crimeId || crime.crime_id}`;
    const crimeId = crime.crimeId || crime.crime_id;
    const firNum = crime.firNum || crime.fir_num;
    const firDate = crime.firDate || crime.fir_date;
    const psName = crime.psName || crime.ps_name;
    const distName = crime.distName || crime.dist_name;

    // Add crime node
    if (!nodesMap.has(crimeNodeId)) {
      nodesMap.set(crimeNodeId, {
        id: crimeNodeId,
        type: 'crime',
        label: firNum || crimeId,
        meta: {
          crimeId: crimeId,
          firNum: firNum,
          firRegNum: crime.firRegNum || crime.fir_reg_num,
          firDate: firDate,
          caseStatus: crime.caseStatus || crime.case_status,
          sections: crime.sections,
          psName: psName,
          distName: distName,
        },
        size: 15,
        color: '#3B82F6', // Blue for crimes
        shape: 'square',
      });
    }

    // Add edge from target person to crime
    const targetToCrimeEdgeId = `edge:${targetNodeId}->${crimeNodeId}`;
    if (!edgesMap.has(targetToCrimeEdgeId)) {
      edgesMap.set(targetToCrimeEdgeId, {
        id: targetToCrimeEdgeId,
        source: targetNodeId,
        target: crimeNodeId,
        relation: 'involved_in',
        label: 'involved in',
        weight: 1,
      });
    }

    // Add location node if available
    if (psName && distName) {
      const locationKey = `${psName}, ${distName}`;
      const locationNodeId = `location:${locationKey}`;

      if (!locationNodesMap.has(locationNodeId)) {
        locationNodesMap.set(locationNodeId, {
          id: locationNodeId,
          type: 'location',
          label: locationKey,
          meta: {
            locationName: locationKey,
            crimeCount: 1,
          },
          size: 10,
          color: '#10B981', // Green for locations
          shape: 'triangle',
        });
      } else {
        const locNode = locationNodesMap.get(locationNodeId)!;
        locNode.meta.crimeCount = (locNode.meta.crimeCount || 0) + 1;
        locNode.size = 10 + locNode.meta.crimeCount! * 2;
      }

      // Edge from crime to location
      const crimeToLocationEdgeId = `edge:${crimeNodeId}->${locationNodeId}`;
      if (!edgesMap.has(crimeToLocationEdgeId)) {
        edgesMap.set(crimeToLocationEdgeId, {
          id: crimeToLocationEdgeId,
          source: crimeNodeId,
          target: locationNodeId,
          relation: 'located_at',
          label: 'at',
          weight: 1,
        });
      }
    }

    // Now fetch all co-accused for this crime
    const coAccusedResult = await prisma.$queryRaw<any[]>`
      SELECT 
        a.accused_id,
        p.person_id,
        p.full_name,
        p.alias,
        p.age,
        p.gender,
        p.present_district,
        a.accused_code,
        bfa.accused_type,
        bfa.status as accused_status
      FROM accused a
      JOIN persons p ON a.person_id = p.person_id
      LEFT JOIN brief_facts_accused bfa ON a.accused_id = bfa.accused_id
      WHERE a.crime_id = ${crimeId}
        AND a.person_id != ${targetPerson.canonicalPersonId}
    `;

    // Filter out target person's duplicate IDs (do this in JavaScript to avoid SQL type casting issues)
    const targetPersonIds = targetPerson.allPersonIds || [targetPerson.canonicalPersonId];
    const filteredCoAccused = coAccusedResult.filter(coAccused => !targetPersonIds.includes(coAccused.person_id));

    // Add co-accused as nodes
    for (const coAccused of filteredCoAccused) {
      const personNodeId = `person:${coAccused.person_id}`;

      // Check if this person is also in deduplication tracker
      const coAccusedDedup = await prisma.$queryRaw<any[]>`
        SELECT 
          pdt.crime_count,
          pdt.person_record_count
        FROM person_deduplication_tracker pdt
        WHERE ${coAccused.person_id} = ANY(pdt.all_person_ids)
        LIMIT 1
      `;

      const coAccusedCrimeCount = coAccusedDedup.length > 0 ? coAccusedDedup[0].crime_count : 1;

      // Add or update person node
      if (!nodesMap.has(personNodeId)) {
        nodesMap.set(personNodeId, {
          id: personNodeId,
          type: 'person',
          label: coAccused.full_name || coAccused.alias || 'Unknown',
          meta: {
            personId: coAccused.person_id,
            fullName: coAccused.full_name || undefined,
            alias: coAccused.alias || undefined,
            age: coAccused.age || undefined,
            gender: coAccused.gender || undefined,
            district: coAccused.present_district || undefined,
            totalCrimes: coAccusedCrimeCount,
            isDuplicateTarget: false,
          },
          size: 15 + coAccusedCrimeCount * 3,
          color: '#F59E0B', // Orange for co-accused
          shape: 'circle',
        });
      }

      // Add edge from co-accused to crime
      const personToCrimeEdgeId = `edge:${personNodeId}->${crimeNodeId}`;
      if (!edgesMap.has(personToCrimeEdgeId)) {
        edgesMap.set(personToCrimeEdgeId, {
          id: personToCrimeEdgeId,
          source: personNodeId,
          target: crimeNodeId,
          relation: 'involved_in',
          label: 'involved in',
          weight: 1,
        });
      }

      // Track connection between target and this person
      if (!personSharedCrimes.has(targetPerson.canonicalPersonId)) {
        personSharedCrimes.set(targetPerson.canonicalPersonId, new Map());
      }
      const targetConnections = personSharedCrimes.get(targetPerson.canonicalPersonId)!;

      if (!targetConnections.has(coAccused.person_id)) {
        targetConnections.set(coAccused.person_id, []);
      }
      targetConnections.get(coAccused.person_id)!.push(crimeId);

      // Count connections
      personConnectionCount.set(coAccused.person_id, (personConnectionCount.get(coAccused.person_id) || 0) + 1);
    }
  }

  // Add direct connection edges between target and co-accused (optional, for stronger visual)
  if (personSharedCrimes.has(targetPerson.canonicalPersonId)) {
    const targetConnections = personSharedCrimes.get(targetPerson.canonicalPersonId)!;

    for (const [otherPersonId, sharedCrimeIds] of targetConnections.entries()) {
      const personNodeId = `person:${otherPersonId}`;
      const directEdgeId = `edge:${targetNodeId}<=>${personNodeId}`;

      if (sharedCrimeIds.length > 0) {
        edgesMap.set(directEdgeId, {
          id: directEdgeId,
          source: targetNodeId,
          target: personNodeId,
          relation: 'co_accused',
          label: `${sharedCrimeIds.length} crime${sharedCrimeIds.length > 1 ? 's' : ''}`,
          weight: sharedCrimeIds.length,
          meta: {
            sharedCrimes: sharedCrimeIds,
          },
        });
      }
    }
  }

  // Merge location nodes into main nodes
  for (const [id, node] of locationNodesMap.entries()) {
    nodesMap.set(id, node);
  }

  // Calculate network statistics
  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());

  const personNodes = nodes.filter(n => n.type === 'person');
  const crimeNodes = nodes.filter(n => n.type === 'crime');
  const locationNodes = nodes.filter(n => n.type === 'location');

  // Find most connected person
  let mostConnectedPerson: { id: string; name: string; connectionCount: number } | undefined = undefined;
  if (personConnectionCount.size > 0) {
    const [personId, count] = Array.from(personConnectionCount.entries()).sort((a, b) => b[1] - a[1])[0];

    const personNode = nodesMap.get(`person:${personId}`);
    if (personNode) {
      mostConnectedPerson = {
        id: personId,
        name: personNode.label,
        connectionCount: count,
      };
    }
  }

  // Calculate network density (actual edges / possible edges)
  const possibleEdges = (personNodes.length * (personNodes.length - 1)) / 2;
  const networkDensity = possibleEdges > 0 ? edges.filter(e => e.relation === 'co_accused').length / possibleEdges : 0;

  return {
    nodes,
    edges,
    stats: {
      totalPersons: personNodes.length,
      totalCrimes: crimeNodes.length,
      totalLocations: locationNodes.length,
      totalConnections: edges.length,
      networkDensity: Math.round(networkDensity * 100) / 100,
      targetPersonCrimeCount: targetPerson.totalCrimes,
      mostConnectedPerson,
    },
  };
}

/**
 * Fallback network for accused not in deduplication tracker
 */
async function getFallbackNetwork(accusedId: string): Promise<NetworkData> {
  // Check if it's a person_id or accused_id
  const accusedRecord = await prisma.accused.findUnique({
    where: { id: accusedId },
    include: {
      person: true,
      crime: {
        include: {
          hierarchy: true,
          accuseds: {
            include: {
              person: true,
              briefFactsAccused: true,
            },
          },
        },
      },
    },
  });

  if (!accusedRecord) {
    throw new ResourceNotFoundException('Accused not found in the system');
  }

  const nodesMap = new Map<string, NetworkNode>();
  const edgesMap = new Map<string, NetworkEdge>();

  // Add target person
  const targetNodeId = `person:${accusedRecord.personId || ''}`;
  nodesMap.set(targetNodeId, {
    id: targetNodeId,
    type: 'person',
    label: accusedRecord.person?.fullName || accusedRecord.person?.name || 'Unknown',
    meta: {
      personId: accusedRecord.personId || undefined,
      fullName: accusedRecord.person?.fullName || undefined,
      age: accusedRecord.person?.age || undefined,
      totalCrimes: 1,
      isDuplicateTarget: true,
    },
    size: 30,
    color: '#EF4444',
    shape: 'diamond',
  });

  // Get all crimes for this person
  const allAccused = await prisma.accused.findMany({
    where: { personId: accusedRecord.personId || '' },
    include: {
      crime: {
        include: {
          hierarchy: true,
          accuseds: {
            include: {
              person: true,
              briefFactsAccused: true,
            },
          },
        },
      },
    },
  });

  // Process each crime
  for (const acc of allAccused) {
    const crime = acc.crime;
    const crimeNodeId = `crime:${crime.id}`;

    // Add crime node
    nodesMap.set(crimeNodeId, {
      id: crimeNodeId,
      type: 'crime',
      label: crime.crimeNum || crime.firRegNum || crime.id,
      meta: {
        crimeId: crime.id,
        firNum: crime.crimeNum || undefined,
        firRegNum: crime.firRegNum,
        firDate: crime.firDate?.toISOString(),
        caseStatus: crime.caseStatus || undefined,
        sections: crime.sections || undefined,
        psName: crime.hierarchy?.psName || undefined,
        distName: crime.hierarchy?.distName || undefined,
      },
      size: 15,
      color: '#3B82F6',
      shape: 'square',
    });

    // Edge from target to crime
    edgesMap.set(`edge:${targetNodeId}->${crimeNodeId}`, {
      id: `edge:${targetNodeId}->${crimeNodeId}`,
      source: targetNodeId,
      target: crimeNodeId,
      relation: 'involved_in',
      label: 'involved in',
      weight: 1,
    });

    // Add co-accused
    for (const coAcc of crime.accuseds) {
      if (coAcc.personId === accusedRecord.personId || !coAcc.personId) continue;

      const personNodeId = `person:${coAcc.personId || ''}`;

      if (!nodesMap.has(personNodeId)) {
        nodesMap.set(personNodeId, {
          id: personNodeId,
          type: 'person',
          label: coAcc.person?.fullName || coAcc.person?.name || 'Unknown',
          meta: {
            personId: coAcc.personId || undefined,
            fullName: coAcc.person?.fullName || undefined,
            age: coAcc.person?.age || undefined,
            totalCrimes: 1,
          },
          size: 15,
          color: '#F59E0B',
          shape: 'circle',
        });
      }

      edgesMap.set(`edge:${personNodeId}->${crimeNodeId}`, {
        id: `edge:${personNodeId}->${crimeNodeId}`,
        source: personNodeId,
        target: crimeNodeId,
        relation: 'involved_in',
        label: 'involved in',
        weight: 1,
      });
    }
  }

  const nodes = Array.from(nodesMap.values());
  const edges = Array.from(edgesMap.values());
  const personNodes = nodes.filter(n => n.type === 'person');
  const crimeNodes = nodes.filter(n => n.type === 'crime');

  return {
    nodes,
    edges,
    stats: {
      totalPersons: personNodes.length,
      totalCrimes: crimeNodes.length,
      totalLocations: 0,
      totalConnections: edges.length,
      networkDensity: 0,
      targetPersonCrimeCount: allAccused.length,
    },
  };
}

/**
 * Get extended network (2nd degree connections)
 * This shows co-accused of co-accused (network expansion)
 */
export async function getExtendedCriminalNetwork(accusedId: string, maxDepth: number = 2): Promise<NetworkData> {
  // Start with primary network
  const primaryNetwork = await getCriminalNetwork(accusedId);

  if (maxDepth <= 1) {
    return primaryNetwork;
  }

  // Get 2nd degree connections
  const coAccusedIds = primaryNetwork.nodes
    .filter(n => n.type === 'person' && !n.meta.isDuplicateTarget)
    .map(n => n.meta.personId!)
    .filter(Boolean);

  // For each co-accused, get their networks
  const secondDegreeMap = new Map<string, NetworkNode>();
  const secondDegreeEdges = new Map<string, NetworkEdge>();

  for (const coAccusedId of coAccusedIds.slice(0, 5)) {
    // Limit to top 5 to avoid huge graphs
    try {
      const subNetwork = await getCriminalNetwork(coAccusedId);

      // Add only new nodes and edges
      for (const node of subNetwork.nodes) {
        if (!primaryNetwork.nodes.find(n => n.id === node.id)) {
          // Reduce size for 2nd degree nodes
          node.size = (node.size || 15) * 0.7;
          node.color = node.type === 'person' ? '#A855F7' : node.color; // Purple for 2nd degree
          secondDegreeMap.set(node.id, node);
        }
      }

      for (const edge of subNetwork.edges) {
        const edgeKey = `${edge.source}-${edge.target}`;
        if (!primaryNetwork.edges.find(e => `${e.source}-${e.target}` === edgeKey)) {
          secondDegreeEdges.set(edgeKey, edge);
        }
      }
    } catch (error) {
      console.error(`Error fetching network for ${coAccusedId}:`, error);
    }
  }

  return {
    nodes: [...primaryNetwork.nodes, ...Array.from(secondDegreeMap.values())],
    edges: [...primaryNetwork.edges, ...Array.from(secondDegreeEdges.values())],
    stats: {
      ...primaryNetwork.stats,
      totalPersons:
        primaryNetwork.stats.totalPersons +
        Array.from(secondDegreeMap.values()).filter(n => n.type === 'person').length,
      totalCrimes:
        primaryNetwork.stats.totalCrimes + Array.from(secondDegreeMap.values()).filter(n => n.type === 'crime').length,
    },
  };
}
