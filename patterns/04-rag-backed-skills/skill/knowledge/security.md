# Security

## Secrets
Secrets live in the vault, never in the repository, environment files committed to git, or chat messages. A leaked secret is rotated within one hour.

## Dependencies
Critical vulnerabilities in dependencies are patched within 7 days, high within 30 days.

## Access
Production database access is granted for 4 hours at a time through an access request, and every query is audited.
