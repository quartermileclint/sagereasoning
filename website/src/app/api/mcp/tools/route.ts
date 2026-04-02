import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, corsPreflightResponse } from '@/lib/security'
import {
  getAllMcpTools,
  getMcpToolsByTier,
  getMcpToolById,
  getOpenBrainToolset,
  getMcpServerCapabilities,
} from '@/lib/mcp-contracts'

// =============================================================================
// GET /api/mcp/tools — MCP Tool Discovery Endpoint
//
// Returns MCP-compatible tool schemas for agent discovery.
// No authentication required — this is a discovery endpoint.
//
// Query parameters:
//   ?tier=tier1_infrastructure|tier2_evaluation|tier3_wrapper
//     Filter tools by product tier.
//
//   ?id=sage-reason-quick
//     Return a single tool by skill ID.
//
//   ?preset=openbrain
//     Return the curated OpenBrain toolset (6 most relevant skills).
//
//   ?full=true
//     Return the complete MCP server capabilities declaration
//     (includes auth info, rate limits, compliance notices).
//
//   No parameters:
//     Returns all available tools.
//
// R4:  Tool schemas expose interfaces only, not evaluation logic.
// R8d: Plain English descriptions, outcome-focused.
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier')
    const id = searchParams.get('id')
    const preset = searchParams.get('preset')
    const full = searchParams.get('full')

    // Full server capabilities declaration
    if (full === 'true') {
      return NextResponse.json(getMcpServerCapabilities(), {
        headers: corsHeaders(),
      })
    }

    // Single tool by ID
    if (id) {
      const tool = getMcpToolById(id)
      if (!tool) {
        return NextResponse.json(
          { error: `Tool not found: ${id}` },
          { status: 404 },
        )
      }
      return NextResponse.json(tool, { headers: corsHeaders() })
    }

    // OpenBrain preset
    if (preset === 'openbrain') {
      return NextResponse.json(
        {
          preset: 'openbrain',
          description:
            'Curated toolset for OpenBrain integration. Covers AI Sorter (sage-classify), proactive loops (sage-guard, sage-prioritise), reasoning evaluation (sage-reason), decision support (sage-decide), and daily review (sage-reflect).',
          tools: getOpenBrainToolset(),
        },
        { headers: corsHeaders() },
      )
    }

    // Filter by tier
    if (tier) {
      const validTiers = [
        'tier1_infrastructure',
        'tier2_evaluation',
        'tier3_wrapper',
      ]
      if (!validTiers.includes(tier)) {
        return NextResponse.json(
          {
            error: `Invalid tier. Must be one of: ${validTiers.join(', ')}`,
          },
          { status: 400 },
        )
      }
      const tools = getMcpToolsByTier(
        tier as 'tier1_infrastructure' | 'tier2_evaluation' | 'tier3_wrapper',
      )
      return NextResponse.json({ tier, tools }, { headers: corsHeaders() })
    }

    // Default: return all tools
    return NextResponse.json(
      { tools: getAllMcpTools() },
      { headers: corsHeaders() },
    )
  } catch (error) {
    console.error('MCP tools discovery error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
