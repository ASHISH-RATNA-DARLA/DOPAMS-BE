import { prisma } from 'datasources/prisma';
import ResourceNotFoundException from 'utils/errors/resource-not-found';

import { FileUpload } from 'graphql-upload-ts';
import { processFileUploadToTomcat } from 'utils/misc';

export async function getCriminalNetwork(personId: string) {
  const accusedEntries = await prisma.accused.findMany({
    where: { personId },
    include: {
      crime: {
        include: {
          hierarchy: true,
          accuseds: {
            include: {
              person: true,
            },
          },
        },
      },
    },
  });

  const byCrimeId = new Map<string, any>();
  for (const acc of accusedEntries) {
    const crime = acc.crime;
    if (!crime) continue;
    if (!byCrimeId.has(crime.id)) {
      byCrimeId.set(crime.id, {
        crime,
        accuseds: [],
      });
    }
    const node = byCrimeId.get(crime.id);
    const others = (crime.accuseds ?? []).filter(a => a.personId !== personId);
    node.accuseds = others;
  }

  return Array.from(byCrimeId.values());
}

export async function getCrimesForNetworkPerson(personId: string) {
  const accusedEntries = await prisma.accused.findMany({
    where: { personId },
    include: {
      crime: {
        include: {
          hierarchy: {
            select: {
              psName: true,
            },
          },
          accuseds: {
            where: {
              personId: {
                not: personId, // Exclude the current person
              },
            },
            include: {
              person: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                  gender: true,
                  age: true,
                  relativeName: true,
                  relationType: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      crime: {
        firDate: 'desc',
      },
    },
  });

  const crimesMap = new Map<string, any>();
  const accusedPersonsMap = new Map<string, Set<string>>();

  for (const accusedEntry of accusedEntries) {
    const crime = accusedEntry.crime;
    if (!crime) continue;

    if (!crimesMap.has(crime.id)) {
      crimesMap.set(crime.id, {
        id: crime.id,
        crimeNum: crime.crimeNum,
        firRegNum: crime.firRegNum,
        psCode: crime.psCode,
        hierarchy: crime.hierarchy,
        firDate: crime.firDate,
        sections: crime.sections,
        crimeType: crime.crimeType,
        briefFacts: crime.briefFacts,
        persons: [],
      });
      accusedPersonsMap.set(crime.id, new Set());
    }

    const crimeData = crimesMap.get(crime.id);
    const seenPersons = accusedPersonsMap.get(crime.id);

    if (crimeData && seenPersons) {
      for (const otherAccused of crime.accuseds) {
        if (otherAccused.person && !seenPersons.has(otherAccused.person.id)) {
          seenPersons.add(otherAccused.person.id);
          crimeData.persons.push({
            ...otherAccused.person,
            crimes: [],
          });
        }
      }
    }
  }

  return Array.from(crimesMap.values());
}

export async function getCriminalNetworkDetails(personId: string) {
  const person = await prisma.persons.findUnique({
    where: { id: personId },
    select: {
      id: true,
      name: true,
      fullName: true,
      gender: true,
      age: true,
      relativeName: true,
      relationType: true,
    },
  });

  if (!person) throw new ResourceNotFoundException('Person not found');

  const crimes = await getCrimesForNetworkPerson(personId);

  return {
    ...person,
    crimes,
  };
}

export async function getNetwork(userId: string) {
  const accusedEntries = await prisma.accused.findMany({
    where: { personId: userId },
    include: {
      crime: {
        include: {
          hierarchy: true,
          briefFactsAccused: true,
          accuseds: {
            include: {
              person: true,
            },
          },
        },
      },
    },
  });

  const nodesMap = new Map<string, { id: string; type: string; label: string; meta?: any }>();
  const edges: { id: string; source: string; target: string; relation: string }[] = [];
  let edgeCounter = 1;

  const rootPerson = await prisma.persons.findUnique({
    where: { id: userId },
  });

  if (rootPerson) {
    nodesMap.set(`u:${userId}`, {
      id: `u:${userId}`,
      type: 'user',
      label: rootPerson.fullName || rootPerson.name || 'Unknown',
      meta: {
        personId: rootPerson.id,
        alias: rootPerson.alias,
        gender: rootPerson.gender,
        age: rootPerson.age,
      },
    });
  }

  for (const accusedEntry of accusedEntries) {
    const crime = accusedEntry.crime;
    if (!crime) continue;

    const crimeId = `c:${crime.id}`;
    const crimeLabel = crime.crimeNum || crime.firRegNum || `Crime ${crime.id}`;

    if (!nodesMap.has(crimeId)) {
      nodesMap.set(crimeId, {
        id: crimeId,
        type: 'crime',
        label: crimeLabel,
        meta: {
          crimeId: crime.id,
          firNumber: crime.crimeNum,
          firRegNum: crime.firRegNum,
          section: crime.sections,
          crimeType: crime.crimeType,
          firDate: crime.firDate?.toISOString(),
          ps: crime.hierarchy?.psName || crime.psCode,
        },
      });
    }

    edges.push({
      id: `e${edgeCounter++}`,
      source: `u:${userId}`,
      target: crimeId,
      relation: 'committed',
    });

    for (const coAccused of crime.accuseds || []) {
      if (coAccused.personId === userId) continue;

      const personId = `u:${coAccused.personId}`;
      const person = coAccused.person;

      if (!nodesMap.has(personId) && person) {
        nodesMap.set(personId, {
          id: personId,
          type: 'user',
          label: person.fullName || person.name || 'Unknown',
          meta: {
            personId: person.id,
            alias: person.alias,
            gender: person.gender,
            age: person.age,
          },
        });
      }

      const briefFacts = crime.briefFactsAccused?.find(b => b.personId === coAccused.personId);
      const relation = briefFacts?.type === 'Accused' ? 'committed' : 'accomplice';
      edges.push({
        id: `e${edgeCounter++}`,
        source: personId,
        target: crimeId,
        relation,
      });
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
  };
}

export async function uploadPersonFile(file: FileUpload, id: string) {
  const { fileName, viewUrl } = await processFileUploadToTomcat(file, `person-media/${id}`);
  await prisma.file.create({
    data: {
      parentId: id,
      sourceField: 'MEDIA',
      sourceType: 'person',
      filePath: viewUrl,
      fileUrl: `${process.env.TOMCAT_FILE_API_URL}${viewUrl}`,
      notes: fileName,
      hasField: true,
      isEmpty: false,
    },
  });

  return 'File uploaded successfully';
}
