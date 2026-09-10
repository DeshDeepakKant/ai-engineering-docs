---
id: 07-corrective-rag-crag
title: "Corrective RAG (CRAG) with Automated Web Search Fallback"
sidebar_label: "07. Corrective RAG (CRAG)"
sidebar_position: 7
description: "Evaluate document relevance with an automated grader node and trigger web search fallback when internal docs are insufficient."
tags:
  - crag
  - corrective-rag
  - langgraph
  - web-search
---

# Corrective RAG (CRAG) with Automated Web Search Fallback

<div className="video-card" style={{border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '24px', background: 'rgba(56, 139, 253, 0.05)'}}>
  <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
    <div><strong>Curators:</strong> Nitish Singh (CampusX)</div>
    <div><strong>Module:</strong> Module 3: Advanced RAG & Conversational Memory</div>
    <div><strong>Focus:</strong> Beginner to Production</div>
  </div>
</div>

## 🎯 What You'll Learn
- Understand why naive RAG fails when retrievers return irrelevant or noisy context.
- Implement a Document Relevance Grader to classify chunks as 'relevant' or 'irrelevant'.
- Build a Corrective RAG state machine with automated Tavly web search fallback.

---

## 💡 Concept & Architecture

In traditional naive RAG, whatever documents the vector store returns are **blindly** passed to the generator. If the retriever fetches irrelevant noise, the LLM will hallucinate or return an unhelpful response.

**Corrective RAG (CRAG)** introduces a self-correcting evaluation layer:
1. **Retrieve:** Fetch documents from internal vector store.
2. **Grade:** An automated evaluator grades retrieved chunks for relevance to the query.
3. **Decide:**
   - If documents are **relevant**, proceed to answer synthesis.
   - If documents are **irrelevant or missing**, trigger an external **Web Search Fallback** (e.g. Tavly / Google Search) to retrieve fresh ground truth.
4. **Synthesize:** Generate a verified final answer.

### System Architecture & Data Flow

```mermaid
flowchart TD
    Query["User Query"] --> Ret["1. Retrieve Internal Documents"]
    Ret --> Grade{"2. Document Grader Node
(Are chunks relevant?)"}
    
    Grade -->|Yes (Relevant >= Threshold)| Refine["3. Knowledge Refinement
(Strip extraneous sentences)"]
    Grade -->|No (Irrelevant Context)| Fallback["3. Web Search Fallback
(Tavly Search API)"]
    
    Fallback --> Gen["4. Generate Grounded Answer"]
    Refine --> Gen
    Gen --> Final["Final Verified Answer"]
```

---

## 💻 Step-by-Step Code Walkthrough

Below is the complete implementation broken down into digestible parts so you can understand every line.

### Part 1: Step 1: Defining the Document Grader Schema and Function

```python
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# Schema for the grading decision
class GradeDecision(BaseModel):
    binary_score: str = Field(
        ...,
        description="Relevance score: 'yes' if document contains relevant information, 'no' if irrelevant."
    )

# Fast, lightweight evaluator prompt
grader_prompt = ChatPromptTemplate.from_template("""You are an expert document relevance evaluator.
Assess whether the retrieved document is relevant to the user question.
If the document contains keywords or semantic meaning relevant to the question, answer 'yes', otherwise answer 'no'.

Document:
{document}

Question:
{question}
""")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
grader = grader_prompt | llm.with_structured_output(GradeDecision)
```

#### 🔍 In-Depth Explanation:
We use `gpt-4o-mini` with strict structured output. It outputs `{'binary_score': 'yes'}` or `{'binary_score': 'no'}` in milliseconds without creative text.

### Part 2: Step 2: Simulating the Corrective Decision Flow

```python
def evaluate_and_route(question: str, retrieved_docs: list):
    """Evaluate documents and decide whether internal docs suffice or web search is needed."""
    relevant_docs = []
    
    for doc in retrieved_docs:
        decision = grader.invoke({"question": question, "document": doc.page_content})
        if decision.binary_score.lower() == "yes":
            relevant_docs.append(doc)
            
    print(f"Evaluated {len(retrieved_docs)} docs: {len(relevant_docs)} marked relevant.")
    
    if len(relevant_docs) == 0:
        print("--> [ACTION]: Triggering Web Search Fallback (Tavly API)...")
        # In production: web_results = TavlySearchResults().invoke(question)
        web_context = f"Simulated web search ground truth for: '{question}'"
        return [web_context]
    else:
        print("--> [ACTION]: Using internal verified knowledge base.")
        return [d.page_content for d in relevant_docs]
```

#### 🔍 In-Depth Explanation:
If zero internal documents pass the grading threshold, the system autonomously triggers a web search fallback rather than feeding garbage context to the model.

---

## ⚠️ Beginner Tips & Best Practices

:::tip Use Small Models for Grading
Always use fast, inexpensive models (like `gpt-4o-mini` or `llama-3.2-3b`) for grading nodes to keep latency under 300ms.
:::

:::warning Set Daily API Caps on Web Search
Web search APIs charge per query. Configure strict rate limits and caching on Tavly/Google to prevent runaway costs during traffic spikes.
:::

---

## 📝 Key Takeaways & Summary

- Corrective RAG prevents hallucinations caused by low-quality vector retrieval.
- An automated grader node evaluates chunks for factual relevance.
- Dynamic web search fallback retrieves external information when internal documents are lacking.

