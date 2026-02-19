# Test Accused IDs for Case History

Here are some accused IDs you can use to test the Case History feature:

## Example 1: Multi-Crime Repeat Offender

**Accused ID:** `655874ce3f00b43df86bc9e2`

- Name: Md Imroz
- Parent: Md Khadeer
- Expected Crimes: 2+
- Duplicate Records: Yes
- Confidence: Good (★★★☆☆)
- URL: http://localhost:5173/criminal-profile/655874ce3f00b43df86bc9e2

## Example 2: Current Test Record

**Accused ID:** `6625554b588cd66833c9c105`

- Expected: Multiple crimes with FIR details
- URL: http://localhost:5173/criminal-profile/6625554b588cd66833c9c105

## Example 3: Another Multi-Crime Record

**Accused ID:** `6627a185994f364353e5db8d`

- Name: Md Imroz (duplicate record)
- Expected Crimes: 2+
- URL: http://localhost:5173/criminal-profile/6627a185994f364353e5db8d

## GraphQL Query to Test

```graphql
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
```

### Query Variables

```json
{
  "accusedId": "655874ce3f00b43df86bc9e2"
}
```

## Testing in GraphQL Playground

1. Navigate to: http://localhost:5173/graphql
2. Copy the query above
3. Add variables with one of the accused IDs
4. Click Execute
5. Verify you see:
   - FIR numbers (not "N/A")
   - FIR dates
   - Police station names
   - Case status
   - Complete crime history

## Expected Response Format

```json
{
  "data": {
    "accusedCaseHistory": {
      "personFingerprint": "abc123...",
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

## Quick Test Commands

### Test in Browser

```
http://localhost:5173/criminal-profile/655874ce3f00b43df86bc9e2
```

### Test with curl

```bash
curl -X POST http://localhost:5173/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetAccusedCaseHistory($accusedId: String!) { accusedCaseHistory(accusedId: $accusedId) { fullName parentName totalCrimes crimeHistory { firNum firDate psName } } }",
    "variables": {"accusedId": "655874ce3f00b43df86bc9e2"}
  }'
```

---

**Note:** These IDs are from the actual database. If you get "Not Found" errors, the deduplication table may need to be regenerated. Run:

```bash
python3 scripts/create_person_deduplication_table.py
```
