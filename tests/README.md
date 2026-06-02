# Traceability harness tests

Pytest suite that exercises `scripts/verify-traceability.sh` against
synthesised fixture engagements built in `tmp_path`. Each test invokes
the **real** shell script as a subprocess so we test the contract, not a
reimplementation.

## Run locally

```bash
pip install -r tests/requirements-dev.txt
pytest -q tests/
```

Set `DOJO_BASH` if `bash` is not on PATH:

```bash
DOJO_BASH="C:\\Program Files\\Git\\bin\\bash.exe" pytest -q tests/
```

## What the harness covers

| Concern | Tests |
|---|---|
| Happy paths | full BR→FR cascade; BR→FR→NFR→SR→IR→TR |
| Frontmatter shape | missing required keys; id/filename/folder mismatches; invalid layer codes |
| Measurable hardline | NFR/SR/TR must declare `measurable: true` |
| Ratification | `--strict` converts warning → failure |
| Parent rules | non-BR without parents; unresolved parent_id; illegal parent layer |
| Cycle detection | two-node cycle is detected |
| Invocation | unknown flag → exit 2; `--help` → exit 0; missing engagement dir → exit 1 |
| Regression guard | committed `requirements/sample/` continues to pass |

## Why a Python harness for a shell script?

- Real subprocess invocation — no false confidence from mocking
- `tmp_path` keeps each test hermetic; the repo's own `requirements/` is
  never mutated
- Parametrisation gives one-line coverage of the 6 required-key
  variations and 3 quant-layer measurable-true rules
- pytest assertion rewriting + captured stdout/stderr give human-readable
  failure messages

## Adding a new test

1. Use the `Artifact` dataclass (or `br()` / `fr()` / `nfr()` / `sr()`
   convenience builders) in `conftest.py` to describe the fixture state.
2. Call the `engagement` fixture to run the script and inspect the result.
3. Assert on `r.returncode` plus a substring of `r.stdout` / `r.combined`
   so the failure message tells you *which* invariant the script
   reported, not just that the exit code differed.
