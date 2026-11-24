# Playbook

## Statuses

| Status | Meaning | Where it shows |
|---|---|---|
| `used` | Production code reads it and it is declared in this repo, on the other side, or in a SaaS provider | Used |
| `ghost` | Production code reads it, nothing declares it, so it always returns the default | Used |
| `unused` | Declared, nothing reads it | Unused |
| `test-only` | Declared, only tests read it | Unused |
| `maybe-dynamic` | Declared, no literal read, but a dynamic key with a matching prefix may build its name | Unused |

A flag is keyed by side plus its normalized name: lower case, no separators, no `FEATURE_`, `FLAG_`,
`FF_`, `VITE_`, `NEXT_PUBLIC_` or `REACT_APP_` prefix. `FEATURE_NEW_CHECKOUT`, `new-checkout` and
`newCheckout` are the same flag.

## Safe deletion order

1. Log first. Every read of the flag writes one structured line:
   `{"event":"flag_evaluated","flag":"<name>","value":<value>,"time":"<iso>"}`.
   The catalog also reads `message` instead of `event` and `@timestamp` instead of `time`.
2. Wait 3 weeks (21 days) so weekly and monthly jobs run at least once.
3. Run the catalog again with `--eval-log`. No evaluation in 21 days means nothing needs the flag.
   For an on flag, every evaluation must have returned `true`. For an off flag, `false`.
4. Delete the code path that never runs. Keep the branch that ships. Delete its tests.
5. Delete the declaration in every config file and every environment.
6. Delete the flag in the provider dashboard.
7. Run the catalog again and confirm the flag is gone.

## Reviewing a dynamic read

* Read the expression and every caller. List every value the key can take.
* When the values are a closed set (an enum, a fixed list of regions), mark each matching flag
  `used` with a note naming the set.
* When the value comes from user input or a database, keep `maybe-dynamic` and say so in the note.

## Reviewing a ghost

* Find the default value at the read: that branch is what runs in production.
* If another repo or service declares it, note which one.

## Reviewing test-only

* Confirm no production file reads it through a helper the scan did not follow.
