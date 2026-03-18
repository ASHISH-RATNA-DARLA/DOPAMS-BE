import re
import json

with open('DB-schema-old.sql', 'r') as f:
    old_schema = f.read()

with open('DB-schema.sql', 'r') as f:
    new_schema = f.read()

def extract_table_names(content):
    pattern = r'^CREATE TABLE public\.(\w+)'
    return sorted(set(re.findall(pattern, content, re.MULTILINE)))

old_tables = extract_table_names(old_schema)
new_tables = extract_table_names(new_schema)

print("=" * 70)
print("OLD SCHEMA TABLES ({})".format(len(old_tables)))
print("=" * 70)
for t in sorted(old_tables):
    print(f"  - {t}")

print("\n" + "=" * 70)
print("NEW SCHEMA TABLES ({})".format(len(new_tables)))
print("=" * 70)
for t in sorted(new_tables):
    print(f"  - {t}")

print("\n" + "=" * 70)
print("TABLES REMOVED")
print("=" * 70)
removed = set(old_tables) - set(new_tables)
if removed:
    for t in sorted(removed):
        print(f"  - {t}")
else:
    print("  (none)")

print("\n" + "=" * 70)
print("TABLES ADDED")
print("=" * 70)
added = set(new_tables) - set(old_tables)
if added:
    for t in sorted(added):
        print(f"  + {t}")
else:
    print("  (none)")

def extract_columns(content, table_name):
    pattern = rf'^CREATE TABLE public\.{re.escape(table_name)}\s*\((.*?)\);'
    match = re.search(pattern, content, re.MULTILINE | re.DOTALL)
    if match:
        cols_text = match.group(1)
        lines = cols_text.split('\n')
        columns = {}
        for line in lines:
            line = line.strip()
            if not line or line.startswith('CONSTRAINT') or line.startswith('--'):
                continue
            parts = re.split(r'\s+', line, 1)
            if parts:
                col_name = parts[0]
                if col_name and not col_name.startswith(','):
                    columns[col_name] = line
        return columns
    return {}

print("\n" + "=" * 70)
print("COLUMN CHANGES IN SHARED TABLES")
print("=" * 70)

shared_tables = set(old_tables) & set(new_tables)
for table_name in sorted(shared_tables):
    old_cols = extract_columns(old_schema, table_name)
    new_cols = extract_columns(new_schema, table_name)
    
    if old_cols == new_cols:
        continue
    
    print(f"\n[TABLE: {table_name}]")
    
    removed_cols = set(old_cols.keys()) - set(new_cols.keys())
    if removed_cols:
        print(f"  REMOVED COLUMNS:")
        for col in sorted(removed_cols):
            print(f"    - {col}")
    
    added_cols = set(new_cols.keys()) - set(old_cols.keys())
    if added_cols:
        print(f"  ADDED COLUMNS:")
        for col in sorted(added_cols):
            print(f"    + {col}")
    
    modified_cols = set()
    for col in old_cols:
        if col in new_cols and old_cols[col] != new_cols[col]:
            modified_cols.add(col)
    
    if modified_cols:
        print(f"  MODIFIED COLUMNS:")
        for col in sorted(modified_cols):
            print(f"    ~ {col}")
            print(f"      OLD: {old_cols[col][:80]}")
            print(f"      NEW: {new_cols[col][:80]}")
