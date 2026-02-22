# Search & Browse Curricula - Operations Guide

## Overview

This document describes the embedding model choice, vector store configuration, and indexing cadence for the StudyPath Search & Browse feature.

## Embedding Model

**Recommended:** Use a lightweight, open embedding model suitable for educational content:

- **OpenAI `text-embedding-3-small`** (1536 dims) – Good quality, low cost
- **Cohere `embed-multilingual-v3`** – Strong for multi-language curricula
- **Open-source:** `sentence-transformers/all-MiniLM-L6-v2` (384 dims) – Self-hosted, no API cost

**Selection criteria:**
- Support for mixed content (titles, descriptions, lesson bodies)
- Latency < 100ms per batch
- Dimension count compatible with vector store (PGVector: flexible; Pinecone: typically 768–1536)

## Vector Store Configuration

### Option A: PGVector (PostgreSQL extension)

- **Pros:** Single database, no extra infra, ACID, RLS
- **Setup:** `CREATE EXTENSION vector;`
- **Column:** `vector(1536)` or `vector(384)` depending on model
- **Index:** HNSW or IVFFlat for approximate nearest neighbor
- **Index build:** `CREATE INDEX ON curriculum_embeddings USING hnsw (embedding vector_cosine_ops);`

### Option B: Pinecone / Milvus / Qdrant

- **Pros:** Optimized for vector search, horizontal scaling
- **Setup:** Create index with dimension matching embedding model
- **Metadata:** Store `curriculum_id`, `lesson_id`, `source`, `depth` for filtering
- **Metric:** Cosine similarity (default for most embedding models)

## Indexing Pipeline

### When to Index

1. **On curriculum create/update** – Trigger embedding generation for:
   - Curriculum-level: concat(title, description, topics)
   - Lesson-level: concat(title, body/summary)
2. **On lesson create/update** – Update lesson embedding and parent curriculum aggregate
3. **Periodic re-index** – Daily job to refresh popularity metrics (adoption_count, rating_avg)

### Indexing Cadence

| Event              | Action                                      |
|--------------------|---------------------------------------------|
| Curriculum created | Generate curriculum + lesson embeddings     |
| Curriculum updated | Regenerate affected embeddings              |
| Lesson updated     | Regenerate lesson embedding                |
| Adoption/save      | Increment adoption_count (async)           |
| Rating submitted  | Recompute rating_avg (async)               |
| Daily cron         | Rebuild popularity facets, refresh cache    |

### Full-Text Search (PostgreSQL)

- Use `to_tsvector('english', title || ' ' || description)` for curriculum
- Use `ts_rank_cd` for ranking
- Combine with vector similarity via weighted score: `0.6 * vector_score + 0.4 * ts_rank`

## Autosuggest Caching

- **Prefix search** on titles, tags, authors
- **Cache** top 100 suggestions per type, refresh every 5 minutes
- **Rate limit:** 30 req/min per IP for autosuggest endpoint

## Monitoring

- Track p95 latency for search and autosuggest
- Alert on indexing queue depth > 1000
- Monitor vector store disk/index size
