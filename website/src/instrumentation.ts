/**
 * instrumentation.ts — Next.js server instrumentation hook (A12).
 *
 * Next.js calls register() once at server startup (requires
 * experimental.instrumentationHook: true in next.config.js for Next 14).
 *
 * STRICT NO-OP WHEN OFF: when SUBSTRATE_OTEL_ENABLED !== 'true' (the production
 * default), register() returns immediately — it imports nothing, registers
 * nothing, and adds no overhead beyond one early-return function call at boot.
 * Production behaviour is byte-identical.
 *
 * WHEN ON (TEST proof): registers a NodeTracerProvider with a ConsoleSpanExporter
 * so substrate spans (substrate.reason → layer1/layer2/layer3 → audit insert)
 * print to the `npm run dev` terminal — the tangible artifact the founder can see
 * during the TEST verification run. The heavier @opentelemetry/sdk-trace-*
 * packages are DYNAMICALLY imported here, so they are never loaded in production.
 *
 * Choosing a production export backend (Vercel OTel / Grafana / Honeycomb /
 * Datadog — all support the GenAI conventions) is a deferred downstream decision
 * (PR7); it is not needed for the single-endpoint proof.
 *
 * Registration is wrapped in try/catch — a registration failure logs and is
 * swallowed; it never prevents the server from starting.
 */
export async function register(): Promise<void> {
  if (process.env.SUBSTRATE_OTEL_ENABLED !== 'true') return
  // Node runtime only — the substrate path runs under nodejs, not edge.
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    const { NodeTracerProvider } = await import('@opentelemetry/sdk-trace-node')
    const { SimpleSpanProcessor, ConsoleSpanExporter } = await import(
      '@opentelemetry/sdk-trace-base'
    )

    const provider = new NodeTracerProvider()
    // addSpanProcessor is the widely-compatible registration form across the
    // OTel 1.x SDK line.
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
    provider.register()

    // eslint-disable-next-line no-console
    console.log(
      '[instrumentation] SageReasoning substrate OTel registered ' +
        '(SUBSTRATE_OTEL_ENABLED=true; ConsoleSpanExporter). ' +
        'Spans will print to this terminal.'
    )
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[instrumentation] OTel registration failed (non-fatal; server continues):',
      err instanceof Error ? err.message : err
    )
  }
}
