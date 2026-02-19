# GraphQL Case History Queries

## Overview

These GraphQL queries use the `person_deduplication_tracker` table to show complete case history for accused persons, including:

- All crimes across duplicate person records
- Matching strategy used for identification
- Confidence level
- Duplicate record warnings

---

## Query 1: Get Accused Case History (Main Query for UI)

Use this query in your **Criminal Profile / Case History** tab to show all cases for an accused.

### GraphQL Query

```graphql
query GetAccusedCaseHistory($accusedId: String!) {
  accusedCaseHistory(accusedId: $accusedId) {
    # Deduplication metadata
    personFingerprint
    matchingStrategy
    matchingTier
    confidenceLevel
    isDuplicate

    # Person information
    canonicalPersonId
    fullName
    parentName
    age
    district
    phone

    # Statistics
    totalCrimes
    totalDuplicateRecords
    allPersonIds
    allAccusedIds

    # Complete crime history
    crimeHistory {
      crimeId
      accusedId
      firNum
      firRegNum
      firDate
      caseStatus
      psName
      distName
      accusedCode
      accusedType
      accusedStatus
      matchingStrategy
      confidenceLevel
      matchingTier
    }
  }
}
```

### Query Variables

```json
{
  "accusedId": "629f726e699c33fbaf1bacf0"
}
```

### Expected Response

```json
{
  "data": {
    "accusedCaseHistory": {
      "personFingerprint": "a1b2c3d4e5f6...",
      "matchingStrategy": "Name + Parent + District + Age",
      "matchingTier": 3,
      "confidenceLevel": "Good (★★★☆☆)",
      "isDuplicate": "YES",
      "canonicalPersonId": "629f726e699c33fbaf1bacf0",
      "fullName": "Md Imroz",
      "parentName": "Md Khadeer",
      "age": 23,
      "district": "BEGUMPET",
      "phone": null,
      "totalCrimes": 2,
      "totalDuplicateRecords": 2,
      "allPersonIds": ["629f726e699c33fbaf1bacf0", "63a1234567890abcdef12345"],
      "allAccusedIds": ["655874ce3f00b43df86bc9e2", "6627a185994f364353e5db8d"],
      "crimeHistory": [
        {
          "crimeId": "6558632087f23a2277d09041",
          "accusedId": "655874ce3f00b43df86bc9e2",
          "firNum": "255/2022",
          "firRegNum": "2011038220255",
          "firDate": "2022-11-18",
          "caseStatus": "Under Investigation",
          "psName": "BEGUMPET",
          "distName": "HYDERABAD",
          "accusedCode": "A1",
          "accusedType": "Main Accused",
          "accusedStatus": "Arrested",
          "matchingStrategy": "Name + Parent + District + Age",
          "confidenceLevel": "Good (★★★☆☆)",
          "matchingTier": 3
        },
        {
          "crimeId": "66277f586008ab15081c1c15",
          "accusedId": "6627a185994f364353e5db8d",
          "firNum": "64/2024",
          "firRegNum": "2011038240064",
          "firDate": "2024-04-23",
          "caseStatus": "Pending",
          "psName": "BEGUMPET",
          "distName": "HYDERABAD",
          "accusedCode": "A2",
          "accusedType": "Co-Accused",
          "accusedStatus": "At Large",
          "matchingStrategy": "Name + Parent + District + Age",
          "confidenceLevel": "Good (★★★☆☆)",
          "matchingTier": 3
        }
      ]
    }
  }
}
```

---

## Query 2: Search Persons by Name

Use this for search functionality or finding repeat offenders.

### GraphQL Query

```graphql
query SearchPersons($name: String!) {
  searchPersonsByName(name: $name) {
    personFingerprint
    matchingStrategy
    fullName
    parentName
    age
    district
    phone
    totalCrimes
    totalDuplicateRecords
  }
}
```

### Query Variables

```json
{
  "name": "Imroz"
}
```

### Expected Response

```json
{
  "data": {
    "searchPersonsByName": [
      {
        "personFingerprint": "a1b2c3d4e5f6...",
        "matchingStrategy": "Name + Parent + District + Age",
        "fullName": "Md Imroz",
        "parentName": "Md Khadeer",
        "age": 23,
        "district": "BEGUMPET",
        "phone": null,
        "totalCrimes": 2,
        "totalDuplicateRecords": 2
      }
    ]
  }
}
```

---

## Query 3: Get Case History by Person ID

Alternative query if you have person_id instead of accused_id.

### GraphQL Query

```graphql
query GetPersonCaseHistory($personId: String!) {
  personCaseHistory(personId: $personId) {
    personFingerprint
    matchingStrategy
    confidenceLevel
    fullName
    parentName
    age
    totalCrimes
    totalDuplicateRecords
    crimeHistory {
      firNum
      firDate
      caseStatus
      psName
      accusedCode
      accusedType
    }
  }
}
```

---

## React/TypeScript Integration

### 1. TypeScript Types

```typescript
// types/case-history.ts

export interface CrimeHistoryRecord {
  crimeId: string;
  accusedId: string;
  firNum: string;
  firRegNum?: string;
  firDate?: string;
  caseStatus?: string;
  psName?: string;
  distName?: string;
  accusedCode?: string;
  accusedType?: string;
  accusedStatus?: string;
  matchingStrategy?: string;
  confidenceLevel?: string;
  matchingTier?: number;
}

export interface AccusedCaseHistory {
  personFingerprint: string;
  matchingStrategy: string;
  matchingTier: number;
  confidenceLevel: string;
  isDuplicate: 'YES' | 'NO';
  canonicalPersonId: string;
  fullName?: string;
  parentName?: string;
  age?: number;
  district?: string;
  phone?: string;
  totalCrimes: number;
  totalDuplicateRecords: number;
  allPersonIds: string[];
  allAccusedIds: string[];
  crimeHistory: CrimeHistoryRecord[];
}
```

### 2. Apollo Client Hook

```typescript
// hooks/useAccusedCaseHistory.ts

import { useQuery, gql } from '@apollo/client';
import { AccusedCaseHistory } from 'types/case-history';

const GET_ACCUSED_CASE_HISTORY = gql`
  query GetAccusedCaseHistory($accusedId: String!) {
    accusedCaseHistory(accusedId: $accusedId) {
      personFingerprint
      matchingStrategy
      matchingTier
      confidenceLevel
      isDuplicate
      canonicalPersonId
      fullName
      parentName
      age
      district
      phone
      totalCrimes
      totalDuplicateRecords
      allPersonIds
      allAccusedIds
      crimeHistory {
        crimeId
        accusedId
        firNum
        firRegNum
        firDate
        caseStatus
        psName
        distName
        accusedCode
        accusedType
        accusedStatus
        matchingStrategy
        confidenceLevel
        matchingTier
      }
    }
  }
`;

export function useAccusedCaseHistory(accusedId: string) {
  return useQuery<{ accusedCaseHistory: AccusedCaseHistory }>(GET_ACCUSED_CASE_HISTORY, {
    variables: { accusedId },
    skip: !accusedId,
  });
}
```

### 3. React Component (Case History Tab)

```typescript
// components/CriminalProfile/CaseHistoryTab.tsx

import React from 'react';
import { useAccusedCaseHistory } from 'hooks/useAccusedCaseHistory';
import { Alert, Badge, Card, Spinner } from 'components/ui';
import { formatDate } from 'utils/date';

interface CaseHistoryTabProps {
  accusedId: string;
}

export const CaseHistoryTab: React.FC<CaseHistoryTabProps> = ({ accusedId }) => {
  const { data, loading, error } = useAccusedCaseHistory(accusedId);

  if (loading) return <Spinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;
  if (!data) return <Alert type="info">No case history found</Alert>;

  const history = data.accusedCaseHistory;

  return (
    <div className="case-history">
      {/* Deduplication Info Banner */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Person Identification</h3>
            <p className="text-sm text-gray-600">
              Matched using: <strong>{history.matchingStrategy}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Confidence: <Badge>{history.confidenceLevel}</Badge>
            </p>
          </div>

          {history.isDuplicate === 'YES' && (
            <Alert type="warning" className="max-w-md">
              <strong>Duplicate Records Found:</strong> This person has{' '}
              {history.totalDuplicateRecords} separate records in the system
              that have been merged for this view.
            </Alert>
          )}
        </div>
      </Card>

      {/* Crime Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {history.totalCrimes}
            </div>
            <div className="text-sm text-gray-600">Total Cases</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {history.totalDuplicateRecords}
            </div>
            <div className="text-sm text-gray-600">Duplicate Records</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {history.matchingTier}/5
            </div>
            <div className="text-sm text-gray-600">Match Quality</div>
          </div>
        </Card>
      </div>

      {/* Crime History List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Complete Case History ({history.totalCrimes} cases)
        </h3>

        {history.crimeHistory.map((crime, index) => (
          <Card key={crime.crimeId} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="primary">
                    Case #{index + 1}
                  </Badge>
                  <h4 className="font-semibold text-lg">
                    FIR {crime.firNum}
                  </h4>
                  <Badge
                    variant={
                      crime.caseStatus === 'Closed' ? 'success' :
                      crime.caseStatus === 'Pending' ? 'warning' :
                      'info'
                    }
                  >
                    {crime.caseStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">FIR Date:</span>{' '}
                    <strong>{formatDate(crime.firDate)}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Police Station:</span>{' '}
                    <strong>{crime.psName}, {crime.distName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Role:</span>{' '}
                    <strong>{crime.accusedType} ({crime.accusedCode})</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{' '}
                    <strong>{crime.accusedStatus}</strong>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-link"
                onClick={() => window.location.href = `/crimes/${crime.crimeId}`}
              >
                View Details →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

---

## Apollo Client Setup

Make sure you have Apollo Client configured in your app:

```typescript
// lib/apollo-client.ts

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'http://localhost:5173/graphql', // Your GraphQL endpoint
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

```typescript
// App.tsx or _app.tsx

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from 'lib/apollo-client';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      {/* Your app components */}
    </ApolloProvider>
  );
}
```

---

## Testing the Query

### Using GraphQL Playground

1. Navigate to: `http://localhost:5173/graphql`
2. Paste the query from Query 1
3. Update the accusedId variable to: `"629f726e699c33fbaf1bacf0"` (from your URL)
4. Click Play

### Using curl

```bash
curl -X POST http://localhost:5173/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetAccusedCaseHistory($accusedId: String!) { accusedCaseHistory(accusedId: $accusedId) { personFingerprint matchingStrategy confidenceLevel fullName parentName age totalCrimes crimeHistory { firNum firDate caseStatus psName } } }",
    "variables": {
      "accusedId": "629f726e699c33fbaf1bacf0"
    }
  }'
```

---

## Benefits of This Approach

✅ **Shows ALL cases** - Even if person has duplicate records  
✅ **Confidence levels** - Know how reliable the match is  
✅ **Duplicate warnings** - Alert users to merged records  
✅ **Matching strategy** - Transparent about how person was identified  
✅ **Complete history** - No missing cases due to data duplication

---

## Next Steps

1. ✅ Add the query to your Case History tab
2. ✅ Display the confidence level badge
3. ✅ Show duplicate record warning if applicable
4. ✅ Format dates and status badges
5. ✅ Add links to individual crime details

---

**Created:** 2025-11-10  
**Version:** 1.0  
**Status:** Ready for Frontend Integration
