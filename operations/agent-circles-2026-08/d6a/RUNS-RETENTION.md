# D6a `runs/` — measured size and the archive policy

**2026-08-31.** Carried item 5. **Archive, never delete** — the per-probe JSONL is the only record
from which a published rate can be re-derived, and a rate on a live public surface must stay
reproducible from evidence in the repository.

## The size figure, corrected for the third time

Measured directly, not carried forward:

| Quantity | Value |
|---|---|
| `runs/2026-08-30/` content | **1,483,930 bytes (1.42 MiB)** across **101 records** |
| On disk (block-rounded) | ~1.69 MB |
| **Per record** | **~14.5 KB** |
| **A balanced 70-call sweep** | **~1.0 MB** |
| gzip -9 on the JSONL | **69 KB — 5% of original** |

**The record has now drifted three times on this one number:** first ~300 KB, then "1.3 MB/sweep"
correcting it, and now ~1.0 MB per balanced sweep against 1.42 MiB for this particular directory —
which holds 101 records, not 70, because a second sweep aborted into it. The 1.3 MB figure appears to
have been a directory measurement quoted as a per-sweep rate. **Derive it from bytes-per-record and
the actual call count; do not quote a per-sweep constant.**

## Policy

1. **Never delete a `runs/<date>/` directory**, and never delete or rewrite a `d6a-rate*.json`.
   `d6a-rate.json` is cited as evidence by the decision log, the disclosure wording, the mentor
   question, this arc's closes, and — through those — by the figure published on four live surfaces.
2. **Do not relocate or compress a directory whose rate is currently published.** Five in-repo
   records cite `d6a/runs/2026-08-30/` by path; moving it breaks all five, and the point of retaining
   evidence is that a reader can follow the pointer.
3. **Archive superseded run directories by gzipping the `*.jsonl` in place** (`gzip -9`, ~5% of
   original), leaving every `d6a-rate*.json` uncompressed and the directory where it is. A run
   directory becomes archivable once no live surface or open record cites its rate.
4. `runs/2026-08-30/` is **NOT archivable today** — its rate went live 2026-08-31.

## A trap in the tooling, recorded here because it is easy to hit

`python3 d6a-runner.py summary <dir>` **writes `<dir>/d6a-rate.json`**, overwriting whatever is
there. Never run `summary` against a `runs/` directory whose rate has been published. Copy the JSONL
to a scratch directory and run it there.
