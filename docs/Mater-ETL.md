# DOPAMAS Master ETL Process
Daily Incremental Data Pipeline with LLM Enrichment

---

## 1. Overview

The **DOPAMAS Master ETL Process** is a centrally orchestrated, **daily-running ETL pipeline** responsible for:

- Fetching **new and updated records** from the DOPAMAS API
- Incrementally loading data into PostgreSQL
- Maintaining referential integrity across entities
- Normalizing and correcting identity data
- Enriching records using **LLM / NLP models**
- Managing file and media synchronization
- Ensuring restart safety and zero data loss

The pipeline is controlled by a single orchestrator (`master_etl.py`) and a declarative configuration file (`input.txt`).

---

## 2. High-Level Architecture
┌───────────────────────┐
│ input.txt │ ← Execution order & commands
└─────────┬─────────────┘
│
┌─────────▼─────────────┐
│ master_etl.py │ ← Orchestration engine
└─────────┬─────────────┘
│
┌─────────▼─────────────┐
│ Individual ETL Jobs │ ← Business logic
│ (hierarchy, crimes…) │
└─────────┬─────────────┘
│
┌─────────▼─────────────┐
│ config.py + .env │ ← DB, API, LLM config
└───────────────────────┘


---

## 3. Daily Execution Model

- The Master ETL is executed **once per day** (cron / scheduler)
- Each ETL:
  - Fetches **only new or updated records**
  - Uses timestamps (`date_created`, `date_modified`)
  - Automatically resumes from the **last processed point**
- No manual date input is required

---

## 4. Incremental Data Logic

### Date Range Handling

- **Start Date**
  - Fixed: `2022-01-01T00:00:00+05:30`
- **End Date**
  - Always calculated dynamically:
    - Yesterday at `23:59:59 IST`
- **Resume Logic**
  - ETL queries:
    ```
    max(date_created, date_modified)
    ```
  - Continues from the latest value found in DB

### Chunking Strategy

| Parameter | Value |
|--------|------|
| Chunk size | 5 days |
| Overlap | 1 day |
| Purpose | Prevent data loss |

---

## 5. Orchestration Logic (`master_etl.py`)

### How It Works

1. Reads `input.txt` from top to bottom
2. Detects blocks using:


3. Executes each block sequentially
4. Stops immediately if **any command fails**
5. Waits 5 seconds between processes

### Execution Rules

- All commands in a block run in **one shell**
- Commands are chained using:


- `source venv/bin/activate` works via `/bin/bash`
- Pipeline is **fail-fast and restart-safe**

---

## 6. Logical ETL Flow (Business Order)

> `refresh_views` steps are **excluded from logical flow**
> (performance-only operations)

---

## PHASE 1: MASTER DATA

### Order 1 – Hierarchy
- Loads administrative and organizational hierarchy
- Base reference for all downstream entities

---

## PHASE 2: CORE CASE DATA

### Order 2 – Crimes
- Core crime/case records
- Central anchor table for pipeline

### Order 3 – Case Classification
- Section-wise and legal categorization

### Order 4 – Case Status
- Updates lifecycle and current state of cases

---

## PHASE 3: PERSON & IDENTITY DATA

### Order 5 – Accused
- Accused records linked to crimes

### Order 6 – Persons
- Master person registry
- Connects accused, victims, witnesses

### Order 7 – State & Country Normalization
- Standardizes geographic attributes

### Order 8 – Domicile Classification
- Native vs non-native classification
- Used for analytics

---

## PHASE 4: NAME NORMALIZATION PIPELINE

Executed **sequentially and dependently**:

1. Fix person name fields
2. Fix full names
3. Normalize first name
4. Normalize surname

Purpose:
- Correct malformed names
- Ensure consistent identity resolution
- Improve downstream analytics and NLP

---

## PHASE 5: CASE DETAIL ENTITIES

### Order 13 – Properties
- Case-linked property information

### Order 14 – Interrogation Reports (IR)
- Complex nested IR data
- Populates multiple IR_* tables

### Order 15 – Disposal
- Case closure and disposal details

### Order 16 – Arrests
- Arrest events tied to accused

### Order 17 – MO & Seizures
- Modus operandi and seized items

### Order 18 – Chargesheets
- Initial chargesheet data

### Order 19 – Updated Chargesheets
- Supplementary / revised chargesheets

### Order 20 – FSL Case Property
- Forensic laboratory linkages

---

## PHASE 6: LLM / NLP ENRICHMENT

These stages **use language models** for enrichment.

### Order 22 – Brief Facts (Accused)
- NLP classification of accused roles
- Pattern and intent extraction

### Order 23 – Brief Facts (Drugs)
- Drug mention detection from text

### Order 24 – Drug Standardization
- Normalize drug names
- Remove aliases, spelling variants

### LLM Models Used

| Use Case | Model |
|------|------|
| Long text embeddings | all-mpnet-base-v2 |
| Short patterns | all-MiniLM-L6-v2 |
| General embeddings | all-MiniLM-L6-v2 |

---

## PHASE 7: FILE & MEDIA PIPELINE

### Order 26 – File ID Synchronization
- Align DB file references

### Order 27 – Media Server Download
- Fetch files from media server
- Store locally / object storage

### Order 28 – File Extension Correction
- Fix MIME-type based extensions
- Repair broken URLs

---

## 7. Configuration Management

### Environment Variables (`.env`)

- Database connection
- API credentials
- LLM toggle flags
- Chunk overlap control
- Table overrides for testing

### Central Config File

`config.py` is imported by **every ETL job**, ensuring:
- Consistent DB access
- Uniform API handling
- Shared LLM settings
- Centralized table naming

---

## 8. Performance & Optimization

### `refresh_views`
- Refreshes materialized views
- Improves query speed
- **No data creation**
- Can be safely ignored in business logic

---

## 9. Failure Handling & Recovery

✔ Stops on first failure  
✔ Logs to `master_etl.log`  
✔ Restart resumes from last successful timestamp  
✔ No duplicate data due to overlap strategy  
✔ Safe to rerun same day  

---

## 10. Summary

The DOPAMAS Master ETL is a:

- Fully automated
- Incremental
- Restart-safe
- LLM-enriched
- Production-grade data pipeline

Designed to **run daily**, continuously synchronize new data, and enhance it using **modern NLP models** while maintaining strong operational reliability.

---



