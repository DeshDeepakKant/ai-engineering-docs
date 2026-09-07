---
id: 06-prompts-in-langchain
title: "Prompts in LangChain"
sidebar_label: "06. Prompts in LangChain"
sidebar_position: 6
description: "Prompts in LangChain - Architectural deep dive, implementation patterns, and enterprise best practices."
tags:
  - langchain
  - lcel
  - python
  - campusx
---

# 📹 Prompts in LangChain

<div className="video-card" style={{border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '24px', background: 'rgba(56, 139, 253, 0.05)'}}>
  <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
    <div><strong>Instructor:</strong> Nitish Singh (CampusX)</div>
    <div><strong>Duration:</strong> 4713</div>
    <div><strong>Course:</strong> Module 2: LCEL, Local LLMs & Tool Calling</div>
    <div><strong>Watch Link:</strong> <a href="https://www.youtube.com/watch?v=3TGqlQxpuU0" target="_blank" rel="noopener noreferrer">YouTube Lecture ↗</a></div>
  </div>
</div>

## 📌 Executive Summary

Production prompt engineering demands parameterized, reusable templates rather than fragile string interpolations. LangChain's `ChatPromptTemplate` provides type validation, role-based boundary preservation, and dynamic message history injection.

This guide explores dynamic variable substitution, `MessagesPlaceholder` for stateful multi-turn history, few-shot formatting, and delimiter security.

---

## 🏗️ System Architecture & Execution Flow

```mermaid
flowchart TD
    subgraph Inputs["Runtime Variables"]
        V1["system_role: 'Senior SRE'"]
        V2["history: [HumanMessage, AIMessage]"]
        V3["query: 'Investigate 504 Gateway Timeout'"]
    end

    subgraph Template["ChatPromptTemplate Engine"]
        T1["SystemMessagePromptTemplate"]
        T2["MessagesPlaceholder(variable_name='history')"]
        T3["HumanMessagePromptTemplate"]
    end

    Inputs --> Template
    Template -->|format_messages()| Compiled["Formatted Message Sequence
Validated Context"]
```

---

## 📖 Core Concepts & Technical Deep Dive

### 1. Robust Parameterization
`ChatPromptTemplate` validates that all required parameters are provided before issuing network calls, automatically escapes formatting characters, and maps roles to provider-specific wire schemas.

### 2. Conversation History with MessagesPlaceholder
The `MessagesPlaceholder` dynamically inserts arbitrary lists of historical `BaseMessage` objects into the prompt without manual string concatenation.

### 3. In-Context Few-Shot Learning
Injecting 2-3 structured exemplar input-output pairs inside the prompt dramatically reduces hallucination rates in complex schema generation tasks.

---

## 💻 Production Implementation

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from langchain_core.messages import HumanMessage, AIMessage

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template("You are an SRE on-call engineer. Protocol: {protocol}."),
    MessagesPlaceholder(variable_name="chat_history"),
    HumanMessagePromptTemplate.from_template("Incident Description: {incident}")
])

history = [
    HumanMessage(content="Database connection pool exhausted on cluster-01."),
    AIMessage(content="Scaled connection pool to 80 and recycled idle workers.")
]

messages = prompt.format_messages(
    protocol="P1-Critical",
    chat_history=history,
    incident="Host cluster-01 CPU load exceeds 98% with 1500 threads."
)

for m in messages:
    print(f"[{m.type.upper()}]: {m.content}")
```

---

## ⚙️ Production Gotchas & Best Practices

:::tip Role Boundary Isolation
Keep user-controlled text strictly inside `HumanMessagePromptTemplate`. Never inject unsanitized user strings into system instructions to prevent prompt injection.
:::

:::warning Missing Variable Exceptions
If a variable declared in the template is omitted at runtime, LangChain raises a `KeyError`. Always validate inputs with Pydantic prior to prompt formatting.
:::

---

## 📊 Architectural Reference & Comparison

| Template Class | Input Structure | Output Type | Best Suited For |
| :--- | :--- | :--- | :--- |
| `PromptTemplate` | Text string with `{vars}` | `StringPromptValue` | Legacy completion models |
| `ChatPromptTemplate` | List of message tuples | `ChatPromptValue` | Modern multi-turn chat models |
| `MessagesPlaceholder` | Variable name referencing list | Sequence of `BaseMessage` | Injecting conversation history |
| `FewShotChatMessagePromptTemplate` | Exemplars + example prompt | `ChatPromptValue` | Complex classification |

---

## 📚 Key Takeaways & Enterprise Checklist

- [ ] **Architecture Verification:** Ensure your design addresses latency, decoupled interfaces, and strict data validation contracts.
- [ ] **Deterministic Testing:** Run unit tests and golden dataset evaluations before shipping changes to staging or production.
- [ ] **Security & Observability:** Enforce input/output guardrails, scrub sensitive credentials/PII, and capture distributed traces.
- [ ] **Scalability & Sizing:** Calibrate model parameters, context limits, and compute instance requirements against projected request concurrency.
