# Kepenk policy pilot

This directory contains the public founding-team pilot of Kepenk for the Ustaca AI monorepo.

## Files

- `policy.yaml`: repository-specific deterministic policy using explicit repository context;
- `policy.tests.yaml`: expected decisions for routine, sensitive, prohibited, missing-context, and unmatched actions;
- `adoption.json`: version-1 offline public evidence classified as `founding_team_pilot`;
- `.github/workflows/kepenk-policy.yml`: CI verification using the pinned public `v0.4.0` Kepenk GitHub Action, policy tests, and adoption-evidence validator.

## Current decisions

For the explicit `bilgi-ship-it/ustaca-ai` repository context:

- repository lint, type checking, and local builds are allowed;
- dependency graph changes require explicit approval;
- remote repository changes require explicit approval;
- public package publication is denied;
- unmatched actions use the conservative `approval` default.

When repository context is omitted or different, repository-scoped rules do not match and evaluation falls back to later rules or the conservative default.

The CI workflow:

1. validates the policy;
2. runs the complete eight-case declarative policy regression suite;
3. validates `adoption.json` locally without telemetry or URL fetching;
4. checks representative allow, approval, and deny outputs through the GitHub Action;
5. verifies both decision fields and expected non-success outcomes for approval and deny.

The `v0.4.0` release is installed and executed inside this npm/Turborepo repository, which has no Python project metadata. This continues to verify the non-Python consumer portability fixed in v0.2.1, v0.3 repository context and policy tests, and v0.4 offline evidence validation.

A valid adoption manifest proves only that the checked-in JSON has the documented structure. It does not prove repository ownership, maintainer identity, URL availability, production security, complete policy coverage, or independent adoption. The repository and Kepenk registry still require human review and explicit maintainer consent.

This pilot does not make Kepenk a sandbox, authenticate the repository value, or grant permission to perform an action. The surrounding workflow definition, repository permissions, branch rules, credentials, reviews, runner, and execution environment remain authoritative.

The pilot is a founding-team integration. It must not be reported as independent adoption or outside contribution.
