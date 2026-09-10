---
id: 08-database-agents-sql-langgraph
title: "Production Database Agents: SQL Generation & Query Verification"
sidebar_label: "08. Database SQL Agents"
sidebar_position: 8
description: "Build an enterprise Text-to-SQL database agent with schema introspection, query validation, and safe query execution."
tags:
  - sql-agent
  - text-to-sql
  - databases
  - langgraph
---

# Production Database Agents: SQL Generation & Query Verification

<div className="video-card" style={{border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '24px', background: 'rgba(56, 139, 253, 0.05)'}}>
  <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
    <div><strong>Curators:</strong> Krish Naik</div>
    <div><strong>Module:</strong> Module 4: Agentic AI & LangGraph</div>
    <div><strong>Focus:</strong> Beginner to Production</div>
  </div>
</div>

## 🎯 What You'll Learn
- Understand how Text-to-SQL agents convert natural language into database queries.
- Implement automated SQL safety checks to block `DROP`, `UPDATE`, or `DELETE` statements.
- Build an agentic query repair loop that fixes syntax errors automatically.

---

## 💡 Concept & Architecture

Business executives and data analysts frequently want to ask questions like:
> *'What were our top 5 revenue-generating products in Q3?'*

A **Database SQL Agent** connects an LLM to a relational database (PostgreSQL, SQLite, Snowflake):
1. **Schema Introspection:** The agent inspects table schemas, column names, and sample rows.
2. **SQL Generation:** The agent translates the user's natural language into valid SQL.
3. **Safety Verification:** The query is verified by a safety check node to guarantee it is strictly read-only (`SELECT`).
4. **Execution & Synthesis:** The query runs against the database and the agent formats the raw table rows into an executive summary.

### System Architecture & Data Flow

```mermaid
flowchart TD
    Q["User: 'How many customers signed up this week?'"] --> Gen["1. SQL Generator Node (Drafts SELECT query)"]
    Gen --> Guard{"2. SQL Safety Gate:
Is query strictly read-only?"}
    
    Guard -->|Dangerous (Contains DROP/DELETE/UPDATE)| Reject["Abort: Write Operations Forbidden"]
    Guard -->|Safe SELECT| Exec["3. Execute Query against Database"]
    
    Exec --> HasError{"Did SQL fail syntax error?"}
    HasError -->|Yes: Syntax Error| Repair["4. SQL Repair Node (Fixes query)"] --> Exec
    HasError -->|No: Valid Rows Returned| Synth["5. Synthesize Executive Answer"]
    Synth --> Final["Delivered Answer with Formatted Markdown Table"]
```

---

## 💻 Step-by-Step Code Walkthrough

Below is the complete implementation broken down into digestible parts so you can understand every line.

### Part 1: Step 1: Implementing an SQL Safety Validator Guardrail

```python
import re
from fastapi import HTTPException

# Blacklist of modifying or destructive SQL statements
FORBIDDEN_SQL_KEYWORDS = [
    r"\bDROP\b", r"\bDELETE\b", r"\bUPDATE\b", r"\bINSERT\b",
    r"\bALTER\b", r"\bTRUNCATE\b", r"\bEXEC\b", r"\bGRANT\b"
]

def validate_sql_safety(sql_query: str) -> str:
    """Enforce that generated SQL queries are strictly read-only SELECT statements."""
    cleaned_query = sql_query.strip()
    
    # Must start with SELECT or WITH (for CTEs)
    if not re.match(r"^(SELECT|WITH)\b", cleaned_query, re.IGNORECASE):
        raise ValueError("Security Violation: Only SELECT queries are permitted.")
        
    # Check for forbidden mutation keywords
    for keyword in FORBIDDEN_SQL_KEYWORDS:
        if re.search(keyword, cleaned_query, re.IGNORECASE):
            raise ValueError(f"Security Violation: Mutation keyword '{keyword}' detected.")
            
    return cleaned_query

# Test safety check
valid_query = "SELECT customer_id, count(*) FROM orders GROUP BY customer_id;"
print("Safety Verified:", validate_sql_safety(valid_query))
```

#### 🔍 In-Depth Explanation:
This guardrail prevents SQL injection and ensures the agent cannot modify or delete database tables.

### Part 2: Step 2: Simulating Safe Query Execution and Error Repair

```python
import sqlite3

def run_safe_query(db_conn, sql: str):
    """Execute validated query and return structured column results."""
    safe_sql = validate_sql_safety(sql)
    cursor = db_conn.cursor()
    cursor.execute(safe_sql)
    columns = [col[0] for col in cursor.description]
    rows = cursor.fetchall()
    return {"columns": columns, "rows": rows}

# Create a demo SQLite database
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE sales (id INT, product TEXT, revenue INT);")
cursor.execute("INSERT INTO sales VALUES (1, 'Cloud Hosting', 5000), (2, 'AI Training', 12000);")
conn.commit()

# Execute safe query
result = run_safe_query(conn, "SELECT product, revenue FROM sales WHERE revenue > 10000;")
print("Database Result:", result)
```

#### 🔍 In-Depth Explanation:
The safe query executes against the database, returning structured columns and rows ready for final synthesis.

---

## ⚠️ Beginner Tips & Best Practices

:::tip Use Read-Only Database User Credentials
In addition to code-level regex guardrails, always configure the database connection with a dedicated read-only database user role (`GRANT SELECT ON ...`). Defense in depth is critical.
:::

:::warning Provide Sample Table Rows in Prompts
LLMs often guess column formats incorrectly (e.g. `is_active` vs `active_status`). Providing 2 sample rows in the system prompt increases SQL generation accuracy by 40%.
:::

---

## 📝 Key Takeaways & Summary

- SQL agents empower non-technical stakeholders to query databases in plain English.
- Strict read-only validators prevent destructive mutations (`DROP`, `DELETE`, `UPDATE`).
- Error recovery loops allow agents to fix SQL syntax errors autonomously.

