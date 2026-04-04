/**
 * embedding-pipeline.ts — Semantic Memory Embedding Pipeline
 *
 * When a support interaction is synced to Supabase, this pipeline:
 *   1. Generates an embedding vector from the interaction content
 *   2. Stores it in mentor_raw_inputs (the OpenBrain receipt table)
 *   3. Enables semantic search via search_mentor_memory()
 *
 * This is Jones's "compounding advantage" — every interaction makes
 * the next one smarter because the ring can find similar past situations.
 *
 * Embedding provider: Configurable (Claude or OpenAI).
 * Default: OpenAI text-embedding-3-small (1536 dimensions, $0.02/1M tokens).
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { SupabaseClient } from './sync-to-supabase'

// ============================================================================
// TYPES
// ============================================================================

/** Supported embedding providers */
export type EmbeddingProvider = 'openai' | 'claude'

/** Configuration for the embedding pipeline */
export type EmbeddingConfig = {
  /** Which provider to use for embeddings */
  readonly provider: EmbeddingProvider
  /** API key for the embedding provider */
  readonly api_key: string
  /** Model identifier */
  readonly model: string
  /** Embedding dimensions (must match pgvector column) */
  readonly dimensions: number
  /** Maximum content length before truncation (tokens) */
  readonly max_content_tokens: number
}

/** Default configuration using OpenAI */
export const DEFAULT_EMBEDDING_CONFIG: Omit<EmbeddingConfig, 'api_key'> = {
  provider: 'openai',
  model: 'text-embedding-3-small',
  dimensions: 1536,
  max_content_tokens: 8000,
}

/** Source types for the mentor_raw_inputs table */
export type MemorySource =
  | 'support'
  | 'journal'
  | 'proactive'
  | 'decision_gate'
  | 'reflection'
  | 'lead'
  | 'notification'
  | 'workflow'

/** Result of embedding a single piece of content */
export type EmbeddingResult = {
  readonly id: string | null
  readonly embedded: boolean
  readonly error: string | null
  readonly token_count: number
}

/** Result of a batch embedding operation */
export type BatchEmbeddingResult = {
  readonly total: number
  readonly embedded: number
  readonly failed: number
  readonly errors: string[]
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate an embedding vector from text content.
 *
 * Calls the configured embedding provider's API.
 * Returns a float array of the configured dimensions.
 *
 * OpenAI endpoint: POST https://api.openai.com/v1/embeddings
 * Claude endpoint: Not yet available — falls back to OpenAI.
 */
export async function generateEmbedding(
  content: string,
  config: EmbeddingConfig
): Promise<{ embedding: number[]; token_count: number } | { error: string }> {
  // Truncate content if too long (rough estimate: 4 chars per token)
  const maxChars = config.max_content_tokens * 4
  const truncated = content.length > maxChars
    ? content.slice(0, maxChars)
    : content

  if (config.provider === 'openai') {
    return generateOpenAIEmbedding(truncated, config)
  }

  // Claude embeddings not yet available — fall back to OpenAI
  return { error: `Unsupported embedding provider: ${config.provider}. Use 'openai'.` }
}

/**
 * Generate an embedding using the OpenAI API.
 */
async function generateOpenAIEmbedding(
  content: string,
  config: EmbeddingConfig
): Promise<{ embedding: number[]; token_count: number } | { error: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`,
      },
      body: JSON.stringify({
        model: config.model,
        input: content,
        dimensions: config.dimensions,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      return { error: `OpenAI API error (${response.status}): ${errBody}` }
    }

    const data = await response.json() as {
      data: Array<{ embedding: number[] }>
      usage: { total_tokens: number }
    }

    return {
      embedding: data.data[0].embedding,
      token_count: data.usage.total_tokens,
    }
  } catch (err) {
    return {
      error: `Failed to call OpenAI embeddings API: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

// ============================================================================
// MEMORY STORAGE
// ============================================================================

/**
 * Store content with its embedding in the mentor_raw_inputs table.
 *
 * Uses the insert_mentor_raw_input() Supabase function for
 * deduplication (content_hash based).
 */
export async function storeMemory(
  supabase: SupabaseClient,
  userId: string,
  source: MemorySource,
  content: string,
  embedding: number[],
  metadata: Record<string, unknown> = {}
): Promise<EmbeddingResult> {
  try {
    const { data, error } = await supabase.rpc('insert_mentor_raw_input', {
      p_user_id: userId,
      p_source: source,
      p_content: content,
      p_embedding: JSON.stringify(embedding),
      p_metadata: metadata,
    })

    if (error) {
      return {
        id: null,
        embedded: false,
        error: `Supabase RPC error: ${error.message}`,
        token_count: 0,
      }
    }

    return {
      id: String(data),
      embedded: true,
      error: null,
      token_count: 0,
    }
  } catch (err) {
    return {
      id: null,
      embedded: false,
      error: `Failed to store memory: ${err instanceof Error ? err.message : String(err)}`,
      token_count: 0,
    }
  }
}

// ============================================================================
// FULL PIPELINE
// ============================================================================

/**
 * Full pipeline: embed content and store in Supabase.
 *
 * This is the main entry point. Call after syncing a resolved interaction.
 *
 * Steps:
 * 1. Generate embedding vector from content
 * 2. Store content + embedding in mentor_raw_inputs
 * 3. Return result with token count for cost tracking
 */
export async function embedAndStore(
  supabase: SupabaseClient,
  userId: string,
  source: MemorySource,
  content: string,
  config: EmbeddingConfig,
  metadata: Record<string, unknown> = {}
): Promise<EmbeddingResult> {
  // 1. Generate embedding
  const embeddingResult = await generateEmbedding(content, config)

  if ('error' in embeddingResult) {
    return {
      id: null,
      embedded: false,
      error: embeddingResult.error,
      token_count: 0,
    }
  }

  // 2. Store in Supabase
  const storeResult = await storeMemory(
    supabase,
    userId,
    source,
    content,
    embeddingResult.embedding,
    metadata
  )

  return {
    ...storeResult,
    token_count: embeddingResult.token_count,
  }
}

/**
 * Embed and store a support interaction.
 *
 * Convenience wrapper that formats the content appropriately
 * for the support context.
 */
export async function embedSupportInteraction(
  supabase: SupabaseClient,
  userId: string,
  interactionId: string,
  subject: string,
  customerMessage: string,
  draftResponse: string | null,
  config: EmbeddingConfig
): Promise<EmbeddingResult> {
  // Combine subject + message + draft for richer semantic matching
  const content = [
    `Subject: ${subject}`,
    `Customer: ${customerMessage}`,
    draftResponse ? `Response: ${draftResponse}` : '',
  ].filter(Boolean).join('\n\n')

  const metadata = {
    interaction_id: interactionId,
    type: 'support_interaction',
    embedded_at: new Date().toISOString(),
  }

  return embedAndStore(supabase, userId, 'support', content, config, metadata)
}

// ============================================================================
// BATCH EMBEDDING
// ============================================================================

/**
 * Batch embed multiple pieces of content.
 *
 * Processes items sequentially to respect rate limits.
 * Returns aggregate results.
 */
export async function batchEmbed(
  supabase: SupabaseClient,
  userId: string,
  items: Array<{
    source: MemorySource
    content: string
    metadata?: Record<string, unknown>
  }>,
  config: EmbeddingConfig
): Promise<BatchEmbeddingResult> {
  let embedded = 0
  let failed = 0
  const errors: string[] = []

  for (const item of items) {
    const result = await embedAndStore(
      supabase,
      userId,
      item.source,
      item.content,
      config,
      item.metadata || {}
    )

    if (result.embedded) {
      embedded++
    } else {
      failed++
      if (result.error) errors.push(result.error)
    }

    // Simple rate limiting: 100ms between calls
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return {
    total: items.length,
    embedded,
    failed,
    errors,
  }
}

// ============================================================================
// SEMANTIC SEARCH (wrapper for the Supabase function)
// ============================================================================

/**
 * Search the mentor's memory for semantically similar past interactions.
 *
 * This wraps the search_mentor_memory() Supabase function.
 * Called by the ring's BEFORE phase to enrich context.
 */
export async function searchMemory(
  supabase: SupabaseClient,
  queryContent: string,
  config: EmbeddingConfig,
  options: {
    threshold?: number
    maxResults?: number
    source?: MemorySource
  } = {}
): Promise<{
  results: Array<{
    id: string
    source: string
    content: string
    metadata: Record<string, unknown>
    similarity: number
    created_at: string
  }>
  error: string | null
}> {
  // 1. Generate query embedding
  const embeddingResult = await generateEmbedding(queryContent, config)
  if ('error' in embeddingResult) {
    return { results: [], error: embeddingResult.error }
  }

  // 2. Call the Supabase search function
  try {
    const { data, error } = await supabase.rpc('search_mentor_memory', {
      query_embedding: JSON.stringify(embeddingResult.embedding),
      match_threshold: options.threshold ?? 0.7,
      match_count: options.maxResults ?? 5,
      p_source: options.source ?? null,
    })

    if (error) {
      return { results: [], error: `Search failed: ${error.message}` }
    }

    return {
      results: (data as Array<{
        id: string
        source: string
        content: string
        metadata: Record<string, unknown>
        similarity: number
        created_at: string
      }>) || [],
      error: null,
    }
  } catch (err) {
    return {
      results: [],
      error: `Search error: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
