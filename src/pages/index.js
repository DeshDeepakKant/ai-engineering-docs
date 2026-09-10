import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const MODULES = [
  {
    title: 'Module 1: Production Backend & Docker',
    emoji: '📦',
    lessons: '10 Master Lessons',
    description: 'Master high-throughput REST APIs with FastAPI, Pydantic v2 data validation, ML model serving, and Docker containerization.',
    link: '/docs/category/module-1-production-backend--docker',
  },
  {
    title: 'Module 2: LangChain Mastery & Local LLMs',
    emoji: '🧠',
    lessons: '10 Master Lessons',
    description: 'Unified LangChain masterclass (CampusX & Krish Naik): LCEL pipe operator, Runnables, Chat Models, Ollama on-device AI, and Guardrails.',
    link: '/docs/category/module-2-langchain-mastery--local-llms',
  },
  {
    title: 'Module 3: Advanced RAG & Conversational Memory',
    emoji: '🔍',
    lessons: '10 Master Lessons',
    description: 'Unified RAG & Memory masterclass: Loaders, chunking, vector stores, Hybrid Search (BM25), Corrective RAG (CRAG), Self-RAG, Multimodal RAG, and SQLite memory checkpointers.',
    link: '/docs/category/module-3-advanced-rag--conversational-memory',
  },
  {
    title: 'Module 4: Agentic AI & LangGraph',
    emoji: '🤖',
    lessons: '10 Master Lessons',
    description: 'Unified Agentic AI masterclass: ReAct cognitive loops, StateGraph state machines, cyclic workflows, human approval gates, SQL agents, CrewAI, and Smolagents.',
    link: '/docs/category/module-4-agentic-ai--langgraph',
  },
  {
    title: 'Module 5: Model Context Protocol (MCP) & Claude Code',
    emoji: '🔌',
    lessons: '10 Master Lessons',
    description: 'Unified MCP & Claude Code masterclass: Anthropic MCP standard, FastMCP local/remote servers, Claude Code CLI, CLAUDE.md spec-driven development, Plan Mode, and custom subagents.',
    link: '/docs/category/module-5-model-context-protocol-mcp--claude-code',
  },
  {
    title: 'Module 6: LLM Evaluation & Observability',
    emoji: '📊',
    lessons: '8 Master Lessons',
    description: 'Continuous AI evaluation: Golden datasets, LLM-as-a-Judge with rubrics, Hit Rate@K, MRR, G-Eval framework, and automated red-teaming.',
    link: '/docs/category/module-6-llm-evaluation--observability',
  },
  {
    title: 'Module 7: Cloud AI & LoRA Fine-Tuning',
    emoji: '☁️',
    lessons: '8 Master Lessons',
    description: 'Enterprise cloud AI & fine-tuning: AWS Bedrock serverless models, SageMaker TGI endpoints, LoRA/QLoRA math, and hands-on SFTTrainer fine-tuning.',
    link: '/docs/category/module-7-cloud-ai--lora-fine-tuning',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container" style={{textAlign: 'center', padding: '40px 0'}}>
        <Heading as="h1" className="hero__title" style={{fontSize: '2.8rem', fontWeight: 800}}>
          🚀 2026 Production AI Engineering Hub
        </Heading>
        <p className="hero__subtitle" style={{fontSize: '1.3rem', maxWidth: '850px', margin: '0 auto 24px'}}>
          Unified masterclass documentation across <strong>7 core production modules</strong> synthesizing the complete curriculums of <strong>CampusX (Nitish Singh)</strong> and <strong>Krish Naik</strong>.
          Deduplicated, beginner-friendly guided notes with step-by-step code breakdowns, diagrams, and zero clutter.
        </p>
        <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/roadmap">
            Curriculum Roadmap & Diagram 🗺️
          </Link>
          <Link
            className="button button--outline button--success button--lg"
            style={{background: 'rgba(255,255,255,0.1)', color: '#fff'}}
            to="/docs/category/module-1-production-backend--docker">
            Start Module 1 (FastAPI) 📦
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Production-Grade Notes, Architecture Diagrams & Code Walkthroughs for 2026 AI Engineering">
      <HomepageHeader />
      <main style={{padding: '48px 0', maxWidth: '1200px', margin: '0 auto', width: '90%'}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <Heading as="h2" style={{fontSize: '2rem'}}>📚 Unified Curriculum Modules (66 Master Lessons)</Heading>
          <p style={{color: '#888'}}>Structured study guides with Mermaid diagrams, step-by-step code breakdowns, and production best practices.</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {MODULES.map((m, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--ifm-color-emphasis-200)',
                borderRadius: '12px',
                padding: '24px',
                background: 'var(--ifm-card-background-color, rgba(255,255,255,0.03))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                <div style={{fontSize: '2.4rem', marginBottom: '12px'}}>{m.emoji}</div>
                <h3 style={{fontSize: '1.25rem', marginBottom: '8px'}}>{m.title}</h3>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'rgba(56, 139, 253, 0.15)',
                  color: '#58a6ff',
                  marginBottom: '12px'
                }}>
                  {m.lessons}
                </span>
                <p style={{fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--ifm-color-emphasis-700)'}}>
                  {m.description}
                </p>
              </div>
              <div style={{marginTop: '20px'}}>
                <Link
                  className="button button--primary button--block"
                  to={m.link}>
                  Open Module Notes →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
