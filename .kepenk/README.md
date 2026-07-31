# Kepenk policy pilot

This directory contains the public founding-team pilot of Kepenk for the Ustaca AI monorepo.

## Files

- `policy.yaml`: repository-specific deterministic policy;
- `policy.tests.yaml`: expected decisions for routine, sensitive, prohibited, and unmatched actions;
- `.github/workflows/kepenk-policy.yml`: CI verification using the pinned public `v0.2.0` Kepenk GitHub Action.

## Current decisions

- repository lint, type checking, and local builds are allowed;
- dependency graph changes require explicit approval;
- remote repository changes require explicit approval;
- public package publication is denied;
- unmatched actions use the conservative `approval` default.

The CI workflow validates the policy and checks representative allow, approval, and deny outputs. Approval and deny checks are expected to return non-success action outcomes; a final assertion step verifies both the decision fields and those outcomes.

This pilot does not make Kepenk a sandbox and does not grant permission to perform an action. The surrounding repository permissions, branch rules, credentials, reviews, and execution environment remain authoritative.

The pilot is a founding-team integration. It must not be reported as independent adoption.
