									DOPOMS - Understanding LLM Models and Fine-Tuning



Accused Details Extraction - Complete Process

Database Flow
crimes table (FIR documents)
       ↓
Read brief_facts (FIR text)
       ↓
AI Model extracts accused info
       ↓
brief_facts_accused table (Accused details)

Step 1: Fetch Unprocessed FIRs
* System reads from crimes table
* Fetches FIRs that haven't been processed yet
* Processes 50 FIRs at a time (batch processing)

Step 2: Extract Accused Names (First Pass)
Input to AI:
FIR Text from crimes table:
"A1 Rahul @ Rocky aged 25 years s/o Ramesh was caught selling ganja 
near the bus stand on 10/01/2026 at 10:00 PM. A2 Suresh, age 30, 
the main supplier, is absconding. Inspector Reddy arrested A1 at the scene."
AI Task: "Read this FIR and extract ONLY accused names. Ignore police, complainants, and witnesses."
AI Output:
{
  "accused_names": ["Rahul @ Rocky", "Suresh"]
}
Why separate pass for names?
* Simpler task = More accurate
* AI focuses only on identifying WHO is accused
* Prevents confusion with police/witness names

Step 3: Extract Accused Details (Second Pass)
Input to AI:
Same FIR Text + Names found: ["Rahul @ Rocky", "Suresh"]
AI Task: "For each accused name, extract their details from the text."
AI Output:
{
  "accused_details": [
    {
      "full_name": "Rahul @ Rocky",
      "age": 25,
      "father_name": "Ramesh",
      "role_in_crime": "Caught selling ganja near the bus stand",
      "status_info": "Arrested at the scene"
    },
    {
      "full_name": "Suresh",
      "age": 30,
      "role_in_crime": "Main supplier",
      "status_info": "Absconding"
    }
  ]
}

Step 4: Rule-Based Classification
After AI extracts details, your code applies rules (no AI needed here):
Gender Classification:
* Contains "s/o" (son of) → Male
* Contains "d/o" (daughter of) → Female
* Contains "w/o" (wife of) → Female
Accused Type Classification:
* Keywords "selling", "peddler" → Type: Peddler
* Keywords "consuming", "user" → Type: Consumer
* Keywords "supplier", "dealer" → Type: Supplier
* Keywords "manufacturer" → Type: Manufacturer
Status Classification:
* Keywords "arrested", "caught" → Status: Arrested
* Keywords "absconding", "absconder" → Status: Absconding
* Keywords "surrendered" → Status: Surrendered
* No clear status → Status: Unknown
Juvenile Check:
* Age < 18 → is_ccl = true (Child in Conflict with Law)

Step 5: Save to Database
Data saved to brief_facts_accused table:
crime_id: 12345
full_name: Rahul @ Rocky
age: 25
gender: Male
father_name: Ramesh
accused_type: Peddler
status: Arrested
role_in_crime: Caught selling ganja near the bus stand
is_ccl: false
... (other fields)
System marks the FIR in crimes table as processed.


#############################################################################################################################
#############################################################################################################################


Drug Details Extraction - Complete Process

Database Flow


crimes table (FIR documents)
       ↓
Read brief_facts (FIR text)
       ↓
AI Model extracts drug info
       ↓
brief_facts_drug table (Drug details)

Step 1: Fetch Unprocessed FIRs
* System reads from crimes table
* Fetches FIRs that haven't been processed for drug extraction yet
* Processes 50 FIRs at a time (batch processing)

Step 2: Extract Drug Names (First Pass)
Input to AI:
FIR Text from crimes table:
"A1 Rahul @ Rocky was caught with 50 grams of Ganja (Cannabis) near the bus stand. 
A2 Suresh had 100 tablets of MDMA and 25 grams of Charas in his possession. 
Inspector Reddy seized all contraband items. Total seizure value: Rs. 50,000."
AI Task: "Read this FIR and extract ONLY drug/contraband names. Identify all seized substances."
AI Output:
json
{
  "drug_names": ["Ganja", "Cannabis", "MDMA", "Charas"]
}
Why separate pass for drug names?
* Simpler task = More accurate
* AI focuses only on identifying WHAT drugs were found
* Prevents confusion with other items or locations

Step 3: Extract Drug Details (Second Pass)
Input to AI:


Same FIR Text + Drugs found: ["Ganja", "Cannabis", "MDMA", "Charas"]
AI Task: "For each drug, extract quantity, unit, form, and seizure details."
AI Output:


json
{
  "drug_details": [
    {
      "drug_name": "Ganja",
      "alternate_name": "Cannabis",
      "quantity": 50,
      "unit": "grams",
      "form": "dry leaves",
      "seized_from": "A1 Rahul @ Rocky",
      "seizure_location": "Near bus stand"
    },
    {
      "drug_name": "MDMA",
      "quantity": 100,
      "unit": "tablets",
      "form": "tablets",
      "seized_from": "A2 Suresh"
    },
    {
      "drug_name": "Charas",
      "quantity": 25,
      "unit": "grams",
      "form": "solid/resin",
      "seized_from": "A2 Suresh"
    }
  ]
}

Step 4: Rule-Based Classification
After AI extracts details, your code applies rules (no AI needed here):
Drug Type Classification:
* Keywords "ganja", "cannabis", "marijuana", "weed" → Type: Cannabis
* Keywords "heroin", "smack", "brown sugar" → Type: Opioid
* Keywords "cocaine", "coke" → Type: Cocaine
* Keywords "MDMA", "ecstasy", "molly" → Type: Synthetic Drug
* Keywords "charas", "hashish" → Type: Cannabis Derivative
* Keywords "methamphetamine", "meth", "ice" → Type: Amphetamine
Quantity Classification:
* Quantity < 100 grams (for cannabis) → Category: Small Quantity
* Quantity 100-1000 grams → Category: Commercial Quantity
* Quantity > 1000 grams → Category: Large Commercial Quantity
NDPS Act Classification:
* Based on drug type and quantity → Section: NDPS 20, 21, 22, etc.
Street Value Calculation:
* Cannabis: ₹500-1000 per gram
* MDMA: ₹2000-3000 per tablet
* Heroin: ₹5000-8000 per gram
* Calculate total seizure value

Step 5: Save to Database
Data saved to brief_facts_drug table:
crime_id: 12345
drug_name: Ganja
alternate_name: Cannabis
quantity: 50
unit: grams
drug_type: Cannabis
category: Small Quantity
form: dry leaves
seized_from: A1 Rahul @ Rocky
seizure_location: Near bus stand
ndps_section: 20
street_value: 25000
... (other fields)
System marks the FIR in crimes table as processed for drug extraction.

Example Flow
Complete Example:
Input FIR:


"During patrolling, police intercepted A1 Ramesh who was carrying a bag. 
Upon search, 250 grams of Ganja, 50 tablets of Nitrosun (Nitrazepam), 
and 10 grams of Brown Sugar (Heroin) were recovered. 
All items were seized under NDPS Act. SI Kumar made the arrest."
Step 1 Output (Drug Names):


json
{
  "drug_names": ["Ganja", "Nitrosun", "Nitrazepam", "Brown Sugar", "Heroin"]
}
Step 2 Output (Drug Details):


json
{
  "drug_details": [
    {
      "drug_name": "Ganja",
      "quantity": 250,
      "unit": "grams",
      "seized_from": "A1 Ramesh"
    },
    {
      "drug_name": "Nitrosun",
      "alternate_name": "Nitrazepam",
      "quantity": 50,
      "unit": "tablets",
      "seized_from": "A1 Ramesh"
    },
    {
      "drug_name": "Brown Sugar",
      "alternate_name": "Heroin",
      "quantity": 10,
      "unit": "grams",
      "seized_from": "A1 Ramesh"
    }
  ]
}
Step 3 (Rule Classification):


Drug 1: Ganja
- Type: Cannabis
- Category: Commercial Quantity (250g > 100g)
- NDPS Section: 20
- Street Value: ₹1,25,000

Drug 2: Nitrazepam
- Type: Psychotropic Substance
- Category: Small Quantity
- NDPS Section: 22
- Street Value: ₹10,000

Drug 3: Heroin
- Type: Opioid
- Category: Small Quantity
- NDPS Section: 21
- Street Value: ₹50,000
Step 4 (Save to Database):


3 records created in brief_facts_drug table
Total seizure value: ₹1,85,000
Crime marked as processed

Model Information
Model Used: qwen2.5-coder:14b
Why this model?
* Larger than accused extraction model (14B vs 3B parameters)
* Better at understanding complex medical/chemical terminology
* More accurate with drug names and their variations
* Handles multiple drug types in single FIR better


#############################################################################################################################
#############################################################################################################################

Chatbot System - Complete Process

Database Flow
User asks question in chat
       ↓
Flask API receives request
       ↓
LangGraph Agent processes (6 steps)
       ↓
PostgreSQL / MongoDB databases
       ↓
Response formatted and returned
       ↓
User sees answer in chat

Step 1: User Asks Question
Input from user:
Examples of questions:
- "Show me recent FIR records for Rahul"
- "How many drug cases in January 2026?"
- "Find all cases related to phone number 9876543210"
- "What is the status of case ID 12345?"
What happens:
* User types question in web browser (chat interface)
* JavaScript captures the message
* Generates/uses a session_id to track conversation
* Sends POST request to /api/chat endpoint
Request format:
{
  "message": "Show me recent FIR records for Rahul",
  "session_id": "abc123-session-id"
}

Step 2: API Layer (Validation & Security)
Flask route /api/chat receives request:
Security checks:
* Input sanitization (cleans user input)
* Rate limiting (prevents abuse)
* Session validation (checks if session_id is valid)
What happens:
1. Parse JSON request body
   ↓
2. InputSanitizer cleans message and session_id
   ↓
3. Check rate limits (e.g., 10 requests per minute)
   ↓
4. If valid → pass to DatabaseQueryAgent
   ↓
5. If invalid → return error to user
Calls:
agent.process_message(sanitized_message, session_id)

Step 3: LangGraph Agent Processing (6 Sub-Steps)
The DatabaseQueryAgent uses LangGraph to orchestrate the following workflow:

Sub-Step 3.1: Parse Intent
AI Model Task: "Understand what the user is asking"
Input:
User message: "Show me recent FIR records for Rahul"
AI Analysis:
{
  "intent": "search_fir_records",
  "entities": {
    "person_name": "Rahul",
    "time_filter": "recent"
  },
  "relevant_databases": ["PostgreSQL"],
  "relevant_tables": ["crimes", "brief_facts_accused"],
  "early_exit": false
}
Special cases (early exit):
* If user says "hi", "hello", "who are you?" → AI responds directly without database query
* Early exit = true → Skip to Step 6 (format simple response)

Sub-Step 3.2: Get Schema
Purpose: Fetch database structure information
What happens:
* SchemaManager reads:
    * PostgreSQL tables (crimes, brief_facts_accused, etc.)
    * MongoDB collections (if needed)
    * Table columns, data types, relationships
    * Indexes and constraints
Schema information retrieved:
PostgreSQL:
- crimes table: id, brief_facts, date_of_occurrence, police_station, ...
- brief_facts_accused table: id, crime_id, full_name, age, gender, ...
- Relationships: crimes.id ← brief_facts_accused.crime_id

MongoDB:
- (if relevant collections exist)
Stored in graph state:
{
  "schema": {
    "postgres": {
      "tables": ["crimes", "brief_facts_accused"],
      "relationships": "crimes.id = brief_facts_accused.crime_id"
    },
    "mongodb": {}
  }
}

Sub-Step 3.3: Generate Queries
AI Model Task: "Create safe database queries to answer the question"
Input:
* User intent: "search_fir_records for Rahul (recent)"
* Database schema
* Entity information: name = "Rahul"
AI generates SQL:
SELECT 
    c.id,
    c.brief_facts,
    c.date_of_occurrence,
    c.police_station,
    bfa.full_name,
    bfa.age,
    bfa.accused_type,
    bfa.status
FROM crimes c
JOIN brief_facts_accused bfa ON c.id = bfa.crime_id
WHERE bfa.full_name ILIKE '%Rahul%'
  AND c.date_of_occurrence >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY c.date_of_occurrence DESC
LIMIT 20;
For MongoDB (if needed):
{
  "collection": "investigation_notes",
  "query": {
    "accused_name": {"$regex": "Rahul", "$options": "i"},
    "date": {"$gte": "2026-01-01"}
  },
  "limit": 20
}
Stored in graph state:
{
  "queries": {
    "postgres": ["SELECT ... FROM crimes ..."],
    "mongodb": []
  }
}

Sub-Step 3.4: Validate Queries
Purpose: Ensure queries are safe and authorized
QueryValidator checks:
* ❌ Block dangerous operations:
    * No DROP, DELETE, TRUNCATE commands
    * No UPDATE without WHERE clause
    * No SQL injection patterns
* ❌ Block unauthorized access:
    * No access to system tables
    * No reading sensitive tables (if restricted)
* ✅ Allow safe operations:
    * SELECT with proper WHERE clauses
    * Joins with known relationships
    * Aggregations (COUNT, SUM, AVG)
Example validation:
Query: "SELECT * FROM crimes WHERE id = 123"
Result: ✅ SAFE (read-only, specific filter)

Query: "DROP TABLE crimes"
Result: ❌ BLOCKED (dangerous operation)

Query: "UPDATE crimes SET status = 'closed'"
Result: ❌ BLOCKED (no WHERE clause, affects all rows)
Stored in graph state:
{
  "validated_queries": {
    "postgres": ["SELECT ... FROM crimes ..."],
    "mongodb": []
  }
}

Sub-Step 3.5: Execute Queries
Purpose: Run validated queries against databases
PostgreSQLExecutor:
# Connects to PostgreSQL database
# Executes SQL query
# Returns results as list of dictionaries
Example execution:
Query: "SELECT ... FROM crimes JOIN brief_facts_accused ..."
Results: [
  {
    "id": 12345,
    "brief_facts": "A1 Rahul @ Rocky was caught...",
    "date_of_occurrence": "2026-01-15",
    "police_station": "City Police Station",
    "full_name": "Rahul @ Rocky",
    "age": 25,
    "accused_type": "Peddler",
    "status": "Arrested"
  },
  {
    "id": 12346,
    "brief_facts": "Rahul Kumar was found with contraband...",
    "date_of_occurrence": "2026-01-20",
    "police_station": "North Police Station",
    "full_name": "Rahul Kumar",
    "age": 30,
    "accused_type": "Consumer",
    "status": "Released"
  }
]
MongoDBExecutor (if needed):
# Connects to MongoDB
# Executes query
# Returns documents as list
Stored in graph state:
{
  "results": {
    "postgres": [
      {"id": 12345, "brief_facts": "...", ...},
      {"id": 12346, "brief_facts": "...", ...}
    ],
    "mongodb": []
  },
  "results_count": {
    "postgres": 2,
    "mongodb": 0
  }
}

Sub-Step 3.6: Format Response
Purpose: Convert raw database results into human-readable answer
AI Model Task: "Summarize the findings in natural language"
Input:
* Original question: "Show me recent FIR records for Rahul"
* Database results (2 records)
* Context: tables used, filters applied
AI generates formatted response:
I found 2 recent FIR records for Rahul from the last 30 days:

**1. Case ID: 12345** (January 15, 2026)
- Accused: Rahul @ Rocky, age 25
- Type: Peddler
- Status: Arrested
- Police Station: City Police Station
- Details: A1 Rahul @ Rocky was caught selling ganja...

**2. Case ID: 12346** (January 20, 2026)
- Accused: Rahul Kumar, age 30
- Type: Consumer
- Status: Released
- Police Station: North Police Station
- Details: Rahul Kumar was found with contraband...

These records were found in the crimes table joined with brief_facts_accused.
Response formatting options:
* Narrative style: Natural language summary
* Structured style: Bullet points and tables
* Count-only style: "Found 2 records matching your query"
Stored in graph state:
{
  "final_response": "I found 2 recent FIR records for Rahul...",
  "success": true
}

Step 4: Handle Errors (If Any)
If something goes wrong at any sub-step:
Example error scenarios:
Error: No results found
User asked: "Show FIR for John Doe"
Database returned: 0 records

Response:
"I couldn't find any FIR records for 'John Doe'. 
This could mean:
- The name might be spelled differently in our records
- No cases have been registered with that name
Try searching with different spelling or additional details."
Error: Invalid query
AI generated unsafe query
Validator blocked it

Response:
"I'm having trouble processing that request safely. 
Could you rephrase your question? 
For example: 'Show cases from January 2026' or 'Find accused named Rahul'."
Error: Database connection failed
PostgreSQL is unreachable

Response:
"I'm experiencing technical difficulties connecting to the database. 
Please try again in a moment or contact support if the issue persists."

Step 5: Store Conversation History
After successful processing:
RedisManager stores:
{
  "session_id": "abc123-session-id",
  "history": [
    {
      "timestamp": "2026-02-04T10:30:00",
      "user_message": "Show me recent FIR records for Rahul",
      "assistant_response": "I found 2 recent FIR records...",
      "queries_used": ["SELECT ... FROM crimes ..."]
    }
  ]
}
Purpose:
* Track conversation context
* Allow follow-up questions ("Show me more details about case 12345")
* Enable history retrieval via /api/chat/history/<session_id>

Step 6: Return Response to User
API sends JSON response to browser:
{
  "success": true,
  "response": "I found 2 recent FIR records for Rahul...",
  "queries": [
    "SELECT c.id, c.brief_facts, ... FROM crimes c JOIN brief_facts_accused bfa ..."
  ],
  "results_count": {
    "postgres": 2,
    "mongodb": 0
  },
  "session_id": "abc123-session-id",
  "workflow_steps": [
    "parse_intent",
    "get_schema",
    "generate_sql",
    "validate_sql",
    "execute_query",
    "format_response"
  ]
}
JavaScript in browser:
* Removes "Analyzing your query..." loading message
* Displays formatted response
* Applies markdown formatting (bold, code blocks)
* Scrolls to bottom of chat
* Keeps local message history
User sees in chat:
You: Show me recent FIR records for Rahul

#############################################################################################################################
#############################################################################################################################


Deduplication System - Complete Process

Database Flow
persons table (all person records)
       ↓
Load to Redis cache
       ↓
Deduplication Engine (blocking + comparison)
       ↓
Tier-based matching + LLM verification
       ↓
Cluster formation (group duplicates)
       ↓
agent_deduplication_tracker table (results)
       ↓
deduplication_results.json (output file)

Step 1: Initialize Database
Command:
python cli.py init-db
What happens:
* Runs database migrations
* Creates required tables:
    * persons (all person records)
    * agent_deduplication_tracker (tracks which persons are duplicates)
    * dedup_cluster_state (groups of duplicate persons)
    * dedup_comparisons (stores comparison results)
    * dedup_run_metadata (tracks deduplication runs)
* Seeds initial data if needed
Tables created:
persons:
- id, name, father_name, phone, aadhaar, 
  permanent_district, present_district, date_created, ...

agent_deduplication_tracker:
- canonical_person_id (the "main" person)
- duplicate_person_ids (list of duplicates)
- cluster_id (group identifier)

dedup_cluster_state:
- cluster_id, person_ids, representative_id

dedup_comparisons:
- person1_id, person2_id, match_score, 
  is_match, matching_method, fields_used

dedup_run_metadata:
- run_id, status, total_persons, 
  last_processed_index, start_time

Step 2: Load Cache
Command:
python cli.py load-cache
What happens:
Step 2.1: Read from database
SELECT * FROM persons ORDER BY date_created DESC;
Step 2.2: Check existing deduplication status
* Reads agent_deduplication_tracker table
* Identifies which persons are already processed:
    * Canonical persons (main records)
    * Duplicate persons (already merged)
Step 2.3: Mark new vs existing
For each person:
  If person_id NOT in agent_deduplication_tracker:
    Mark as _is_new = True (needs deduplication)
  Else:
    Mark as _is_new = False (already processed)
Step 2.4: Store in Redis cache
Key: persons:all
Value: [
  {
    "id": 1,
    "name": "Rahul Kumar",
    "father_name": "Ramesh Kumar",
    "phone": "9876543210",
    "aadhaar": "1234-5678-9012",
    "permanent_district": "bangalore",
    "present_district": "bangalore",
    "_is_new": true
  },
  {
    "id": 2,
    "name": "Rahul @ Rocky",
    "father_name": "Ramesh",
    "phone": "9876543210",
    "aadhaar": null,
    "permanent_district": "bangalore",
    "_is_new": true
  },
  ... (100,000 persons)
]

Also stores individual records:
Key: person:1
Key: person:2
... for quick lookups
Logs output:
Total persons: 100,000
Already deduped: 5,000
New persons: 95,000

Step 3: Run Deduplication
Command:
python cli.py run-deduplication 70.0 true
* 70.0 = minimum confidence score to consider as match
* true = include all matches (not just best match)
Or via API:
GET /agent/deduplicate?min_confidence=70.0&include_all_matches=true

Sub-Step 3.1: Setup and Resume Logic
What happens:
* Reads all persons from Redis persons:all
* Checks dedup_run_metadata table for existing run:
If previous run exists with status="running":
Resume from last_processed_index
Example: Previously processed 50,000 persons → Resume from person 50,001
If no previous run or completed:
Create new run_id
Set last_processed_index = 0
Status = "running"
Load existing clusters and comparisons into memory:
DedupCache (in-memory):
- Existing clusters: {cluster_id: [person_ids]}
- Existing comparisons: {(person1, person2): score}
- Helps avoid re-doing work

Sub-Step 3.2: Blocking (Reduce Comparison Space)
Problem: Comparing 100,000 persons = 100,000 × 99,999 / 2 = 5 billion comparisons!
Solution: Block by district (only compare persons from same district)
Process:
For each person:
  District = permanent_district OR present_district
  Normalize: "Bangalore" → "bangalore"
  
Group persons by district:
  bangalore: [person_1, person_2, person_50, ...]
  delhi: [person_100, person_101, ...]
  mumbai: [person_500, person_501, ...]
Result:
Original comparisons: 5 billion
After blocking: 50 million (90% reduction!)

Example stats:
- Total blocks: 50 districts
- Avg block size: 2,000 persons
- Largest block: 15,000 persons (bangalore)
- Smallest block: 100 persons (small_town)
Why this works:
* People rarely have duplicates in different districts
* Most duplicates are within same geographic area

Sub-Step 3.3: Main Comparison Loop
For each person i (from last_processed_index to N):
Step 3.3.1: Check if already clustered
If person_i is already in a cluster AND not the representative:
  Skip this person (already deduped via another person)
  Continue to next person
Step 3.3.2: Get candidates from same district
candidates = all persons in same district block as person_i
Filter: only candidates where j > i (avoid duplicates and self-comparison)
Example:
Person i = 1000 (bangalore district)
Candidates = [1001, 1002, 1003, ... 15000] (all bangalore persons after 1000)

Sub-Step 3.4: Compare Person Pairs (i vs j)
For each candidate j:
Step 3.4.1: Check existing comparison
1. Check in-memory cache: DedupCache.has_comparison(i, j)
2. If not in memory, check database: 
   SELECT * FROM dedup_comparisons 
   WHERE person1_id = i AND person2_id = j

If found:
  Reuse stored result (score, is_match, method)
  Skip to next candidate
Step 3.4.2: Check cluster membership
If person_i and person_j are already in same cluster:
  Skip (already known as duplicates)
  
If person_j is in a cluster, and we previously compared person_i 
with another member of that cluster and it was NOT a match:
  Skip (optimization: if not match with one cluster member, 
        likely not match with others)
Step 3.4.3: Perform new comparison (if needed)

Sub-Step 3.5: Tier-Based Matching
Purpose: Fast, rule-based comparison before using expensive LLM
Tier 1: Exact match on multiple fields
Hash = phone + father_name + name_first_3_chars
Example:
  Person A: 9876543210 + ramesh + rah
  Person B: 9876543210 + ramesh + rah
  Hash match? YES → Tier 1 match (confidence: 85%)
Tier 2: Strong match on key fields
Hash = aadhaar + date_of_birth
Example:
  Person A: 1234-5678-9012 + 1990-05-15
  Person B: 1234-5678-9012 + 1990-05-15
  Hash match? YES → Tier 2 match (confidence: 95%)
Tier 3: Moderate match
Hash = phone + district + age_range
Example:
  Person A: 9876543210 + bangalore + 30-35
  Person B: 9876543210 + bangalore + 30-35
  Hash match? YES → Tier 3 match (confidence: 60%)
Tier 4: Weak match
Hash = name_normalized + father_name_normalized
Example:
  Person A: rahulkumar + rameshkumar
  Person B: rahul kumar + ramesh
  Hash match? YES → Tier 4 match (confidence: 45%)
Decision based on tier confidence:
If confidence > 65% (High confidence):
Result:
  is_match = True
  match_score = 85% (from tier)
  matching_method = "tier1_hash"
  fields_used = "phone + father_name + name"
  reasoning = "Tier 1 exact hash match"
  
Action: Mark as duplicate directly (NO LLM needed)
If 40% ≤ confidence ≤ 65% (Medium confidence):
Decision: Ask LLM for verification
Reason: Not confident enough for direct match, 
        but similar enough to warrant deep check
        
Proceed to Sub-Step 3.6 (LLM verification)
If confidence < 40% (Low confidence):
Result:
  is_match = False
  match_score = 30% (from tier)
  matching_method = "tier4_hash_rejected"
  
Action: Mark as NOT a duplicate (NO LLM needed)

Sub-Step 3.6: LLM Verification (Only for medium confidence)
When: Tier confidence between 40-65%
Purpose: Use AI to make nuanced decision on borderline cases
Input to LLM (via Ollama - qwen2.5:7b):
{
  "person_a": {
    "id": 1000,
    "name": "Rahul Kumar",
    "father_name": "Ramesh Kumar",
    "phone": "9876543210",
    "aadhaar": null,
    "permanent_district": "bangalore",
    "age": 32
  },
  "person_b": {
    "id": 1050,
    "name": "Rahul @ Rocky",
    "father_name": "Ramesh",
    "phone": "9876543210",
    "aadhaar": null,
    "permanent_district": "bangalore",
    "age": 32
  },
  "task": "Compare these two person records and determine if they are the same person. Consider name variations, aliases (@), phone numbers, father names, and other fields."
}
LLM Analysis:
LLM reasoning:
"Both persons have:
- Same phone number (9876543210) - Strong indicator
- Similar father names (Ramesh Kumar vs Ramesh) - Likely same person
- Same district (bangalore)
- Same age (32)
- Name variation: Rahul Kumar vs Rahul @ Rocky
  - '@' indicates alias
  - 'Rocky' is likely a nickname
- Missing aadhaar in both records

Conclusion: These are likely the same person. 
Rahul Kumar is the formal name, Rahul @ Rocky includes an alias."
LLM Output:
{
  "match_score_numeric": 88,
  "is_match": true,
  "fields_used_to_decide_the_match": [
    "phone (exact match)",
    "father_name (similar)",
    "district (same)",
    "age (same)",
    "name (variation with alias)"
  ],
  "reasoning": "Same phone, same father name (variation), same district and age. Name includes alias marker (@). High confidence these are the same person."
}
Result stored:
is_match = True
match_score_numeric = 88%
matching_method = "tier3_hash_llm_verified"
fields_used = "phone, father_name, district, age, name"
reasoning = "LLM verified: Same phone, father name variation..."
Storage decision:
If is_match = True OR "llm" in matching_method:
  Save to database (expensive/important comparison)
  
Batch insertions: Every 100 comparisons, bulk insert to DB

Sub-Step 3.7: Cluster Formation
When a match is found (is_match = True):
Scenario 1: Neither person in any cluster
Person i: Not in cluster
Person j: Not in cluster

Action:
  Create new cluster_id = 1001
  Add both i and j to cluster 1001
  Set person_i as representative (canonical)
  
Result:
  Cluster 1001: [person_i, person_j]
  Representative: person_i
Scenario 2: Person i in cluster, person j not
Person i: In cluster 1001
Person j: Not in cluster

Action:
  Add person_j to cluster 1001
  
Result:
  Cluster 1001: [person_i, person_j, person_k]
  Representative: person_i (unchanged)
Scenario 3: Person j in cluster, person i not
Person i: Not in cluster
Person j: In cluster 1002

Action:
  Add person_i to cluster 1002
  
Result:
  Cluster 1002: [person_j, person_m, person_i]
  Representative: person_j (unchanged)
Scenario 4: Both in different clusters (MERGE)
Person i: In cluster 1001 (members: i, k, l)
Person j: In cluster 1002 (members: j, m, n)

Action:
  Merge cluster 1002 into cluster 1001
  Update all members of 1002 to point to 1001
  Keep person_i as representative
  
Result:
  Cluster 1001: [person_i, person_k, person_l, person_j, person_m, person_n]
  Cluster 1002: DELETED
  Representative: person_i
Storage:
Database table: dedup_cluster_state
cluster_id | person_ids              | representative_id
-----------+-------------------------+------------------
1001       | [1000, 1050, 1100]     | 1000
1002       | [2000, 2050]           | 2000
1003       | [3000, 3100, 3200]     | 3000

In-memory cache mirrors this for fast lookups

Sub-Step 3.8: Build Comparison Map
For each person, store all matches above minimum confidence:
Example:
Person 1000 compared with:
  - Person 1050: 88% match
  - Person 1100: 72% match
  - Person 1200: 45% match (below 70% threshold, excluded)

comparison_map[1000] = [
  {
    "checked_person_id": 1050,
    "match_score": "88%",
    "match_score_numeric": 88,
    "fields_used": "phone, father_name, district, age, name",
    "matching_description": "Same phone, father name variation...",
    "matching_method": "tier3_hash_llm_verified"
  },
  {
    "checked_person_id": 1100,
    "match_score": "72%",
    "match_score_numeric": 72,
    "fields_used": "phone, name",
    "matching_description": "Same phone number, similar name",
    "matching_method": "tier1_hash"
  }
]

Sub-Step 3.9: Progress Tracking and Optimization
Every 10 persons processed:
Update dedup_run_metadata:
  last_processed_index = current_person_index
  COMMIT to database
  
Purpose: If process crashes, can resume from this point
Every 50 persons processed:
Cleanup old comparisons from memory cache
Log memory usage stats
Prevent memory overflow
Every 100 comparisons:
Bulk insert comparison results to dedup_comparisons table
Clear comparison batch from memory

Step 4: Finalize Deduplication
After processing all persons:
Step 4.1: Flush remaining data
- Insert any remaining comparisons to database
- Commit all pending transactions
Step 4.2: Sync deduplication tracker
For each cluster:
  canonical_person_id = representative (first person in cluster)
  duplicate_person_ids = [all other persons in cluster]
  
INSERT INTO agent_deduplication_tracker:
  canonical_person_id: 1000
  duplicate_person_ids: [1050, 1100, 1150]
  cluster_id: 1001
Example tracker table:
canonical_person_id | duplicate_person_ids | cluster_id
--------------------+---------------------+-----------
1000                | [1050, 1100, 1150] | 1001
2000                | [2050]              | 1002
3000                | [3100, 3200, 3500] | 1003
Step 4.3: Mark run as completed
UPDATE dedup_run_metadata
SET status = 'completed',
    end_time = NOW(),
    total_comparisons = 1,500,000,
    total_matches = 25,000,
    llm_calls = 50,000
WHERE run_id = current_run_id;
Step 4.4: Generate output file
Write to: deduplication_results.json

{
  "run_id": "run_2026_02_04_001",
  "total_persons": 100000,
  "total_comparisons": 1500000,
  "total_matches": 25000,
  "llm_calls": 50000,
  "skipped_via_clustering": 3000000,
  "reduction_percentage": 66.67,
  "comparison_map": {
    "1000": [
      {
        "checked_person_id": 1050,
        "match_score": "88%",
        "match_score_numeric": 88,
        "fields_used": "phone, father_name, district, age, name",
        "matching_method": "tier3_hash_llm_verified"
      }
    ],
    "2000": [...],
    ...
  },
  "statistics": {
    "total_clusters": 8000,
    "persons_with_duplicates": 25000,
    "unique_persons": 75000
  }
}

Step 5: Use Results
How downstream systems use the results:
Option 1: Query via API
GET /agent/deduplicate?min_confidence=70.0&include_all_matches=false

Returns:
- Best match only for each person
- Can be used for UI display
Option 2: Read from database
-- Get all duplicates for a person
SELECT duplicate_person_ids 
FROM agent_deduplication_tracker 
WHERE canonical_person_id = 1000;

-- Get canonical person for a duplicate
SELECT canonical_person_id 
FROM agent_deduplication_tracker 
WHERE 1050 = ANY(duplicate_person_ids);
Option 3: Read from JSON file
Read deduplication_results.json
Parse comparison_map
Display to investigators/analysts
Use cases:
* Merge records: Combine duplicate person profiles into one
* Investigation: Find all aliases and records for a person
* Data cleaning: Remove duplicate entries
* Analytics: Count unique persons (not duplicates)

Summary of Complete Process
Step 1: Initialize Database
  ├─ Create tables (persons, dedup_tracker, clusters, comparisons)
  └─ Ready for deduplication

Step 2: Load Cache
  ├─ Read all persons from database
  ├─ Mark new vs already processed
  └─ Store in Redis for fast access

Step 3: Run Deduplication
  ├─ 3.1: Setup (resume from last run if crashed)
  ├─ 3.2: Blocking (group by district)
  ├─ 3.3: Loop through each person
  ├─ 3.4: Compare with candidates in same district
  ├─ 3.5: Tier-based matching (fast rules)
  ├─ 3.6: LLM verification (for borderline cases)
  ├─ 3.7: Cluster formation (group duplicates)
  ├─ 3.8: Build comparison map
  └─ 3.9: Track progress (can resume if crash)

Step 4: Finalize
  ├─ Sync dedup tracker table
  ├─ Mark run as completed
  └─ Generate JSON output file

Step 5: Use Results
  ├─ Query via API
  ├─ Read from database
  └─ Process JSON file

Key Performance Optimizations
1. District Blocking
* Reduces comparisons by 90%
* From 5 billion → 50 million comparisons
2. Cluster Caching
* If person already in cluster, skip
* Avoids redundant comparisons
3. Comparison Caching
* Store previous comparison results
* Reuse instead of re-computing
4. Resume Capability
* Process crashes? Resume from last checkpoint
* No need to restart from beginning
5. Selective LLM Usage
* Only use LLM for borderline cases (40-65% confidence)
* ~5% of comparisons need LLM
* Saves time and cost
6. Batch Database Operations
* Bulk insert 100 comparisons at once
* Faster than individual inserts

Statistics Example
For 100,000 persons:
Original comparisons needed: 5,000,000,000 (5 billion)
After blocking: 50,000,000 (50 million)
After clustering: 15,000,000 (15 million)
Reduction: 99.7%

Comparisons performed: 1,500,000
  - Tier-based direct: 1,200,000 (80%)
  - LLM-verified: 50,000 (3%)
  - Cached/skipped: 250,000 (17%)

Matches found: 25,000
  - Total clusters: 8,000
  - Avg duplicates per cluster: 3.1

LLM calls: 50,000 (only 3% of comparisons)

Time taken: 4 hours
  - Without optimization: 2000+ hours
  - Speedup: 500x faster


