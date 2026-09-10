---
id: 08-self-reflective-rag
title: "Self-Reflective RAG (Self-RAG) & Hallucination Grading"
sidebar_label: "08. Self-Reflective RAG"
sidebar_position: 8
description: "Equip language models with introspection: determine when to retrieve, evaluate factual grounding, and detect hallucinations."
tags:
  - self-rag
  - reflection
  - hallucination
  - langgraph
---

# Self-Reflective RAG (Self-RAG) & Hallucination Grading

<div className="video-card" style={{border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '24px', background: 'rgba(56, 139, 253, 0.05)'}}>
  <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
    <div><strong>Curators:</strong> Nitish Singh (CampusX)</div>
    <div><strong>Module:</strong> Module 3: Advanced RAG & Conversational Memory</div>
    <div><strong>Focus:</strong> Beginner to Production</div>
  </div>
</div>

## 🎯 What You'll Learn
- Understand the Self-RAG framework: adaptive retrieval, generation, and critique.
- Implement automated Hallucination Graders to check if claims are backed by context.
- Build an iterative retry loop in LangGraph with bounded recursion limits.

---

## 💡 Concept & Architecture

Traditional RAG retrieves on **every single turn**, even for simple questions like *'Hi, how are you?'* or *'What is 2+2?'*. This wastes database queries, token costs, and latency.

**Self-Reflective RAG (Self-RAG)** equips the agent with introspective self-critique:
1. **Retrieve Decision:** Does this inquiry actually require external knowledge? If no, answer directly.
2. **Context Relevance:** Do retrieved chunks contain relevant facts? If no, rewrite the query and retry.
3. **Hallucination Check (Grounding):** Does the generated answer contain any claim NOT supported by the context? If yes, regenerate!
4. **Answer Utility:** Does the answer actually answer the user's specific question?

### System Architecture & Data Flow

```mermaid
flowchart TD
    Query["User Query"] --> NeedRet{"Is external retrieval needed?"}
    NeedRet -->|No| Direct["Generate Direct Answer"]
    NeedRet -->|Yes| Ret["Retrieve Chunks"]
    
    Ret --> Relevant{"Are chunks relevant?"}
    Relevant -->|No| Rewrite["Rewrite Query"] --> Ret
    Relevant -->|Yes| Gen["Generate Grounded Answer"]
    
    Gen --> Grounded{"Hallucination Check:
Is answer backed by facts?"}
    Grounded -->|No (Hallucination)| Gen
    Grounded -->|Yes| Useful{"Does answer satisfy user's query?"}
    Useful -->|Yes| Output["Deliver Verified Output"]
    Useful -->|No| Rewrite
```

---

## 💻 Step-by-Step Code Walkthrough

Below is the complete implementation broken down into digestible parts so you can understand every line.

### Part 1: Step 1: Building a Hallucination Grader Schema

```python
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

class HallucinationScore(BaseModel):
    is_grounded: bool = Field(
        ...,
        description="True if every fact in the answer is backed by the context, False if model hallucinated."
    )
    explanation: str = Field(
        ...,
        description="Brief explanation of whether claims are grounded or fabricated."
    )

hallucination_prompt = ChatPromptTemplate.from_template("""You are a strict factual auditor.
Assess whether the generated answer is grounded in and supported by the provided facts.
If the answer makes any claims not present in the facts, mark is_grounded as False.

Facts:
{facts}

Answer:
{answer}
""")

evaluator = hallucination_prompt | ChatOpenAI(model="gpt-4o-mini", temperature=0.0).with_structured_output(HallucinationScore)
```

#### 🔍 In-Depth Explanation:
This evaluator checks whether the generated answer is strictly grounded in the retrieved facts. If the answer introduces unsupported assertions, it catches them immediately.

### Part 2: Step 2: Testing Hallucination Detection

```python
sample_facts = "The server maintenance window is Sunday 02:00 UTC to 04:00 UTC."

# Case A: Grounded answer
grounded_answer = "Maintenance occurs on Sunday between 2 AM and 4 AM UTC."
result_a = evaluator.invoke({"facts": sample_facts, "answer": grounded_answer})
print("Case A Grounded?:", result_a.is_grounded) # True

# Case B: Hallucinated answer with unsupported claims
hallucinated_answer = "Maintenance is Sunday at 2 AM, and you will receive a $50 refund for downtime."
result_b = evaluator.invoke({"facts": sample_facts, "answer": hallucinated_answer})
print("Case B Grounded?:", result_b.is_grounded) # False
print("Auditor Reason:", result_b.explanation)
```

#### 🔍 In-Depth Explanation:
Notice how Case B is flagged as `False` because the model added a claim about a '$50 refund' that does not exist in the source facts.

---

## ⚠️ Beginner Tips & Best Practices

:::tip Always Bound Loop Iterations
Because Self-RAG can retry on failure, always maintain an `iteration_count` in your state machine. If retries exceed 3, exit gracefully with an apology.
:::

:::warning Token Overhead
Running multiple evaluation passes multiplies token consumption. Reserve full Self-RAG for high-stakes domains like legal compliance, medical records, or banking.
:::

---

## 📝 Key Takeaways & Summary

- Self-RAG replaces blind retrieval with intelligent introspection and automated self-correction.
- Hallucination grading verifies that every sentence in an answer is backed by source facts.
- Loop bounds prevent infinite retry cycles in production graphs.

