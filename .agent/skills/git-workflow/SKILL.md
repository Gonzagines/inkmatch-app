---
name: Git Workflow
description: Apply Git best practices automatically during development — staging, committing, and pushing with Conventional Commits.
---

# Git Workflow

## Purpose

Maintain a clean, professional Git history by committing and pushing changes at the right moments using Conventional Commits conventions.

## When to Commit

Commit after completing any of the following:

- A new feature or component is functional and tested
- A bug fix is verified working
- A UI/UX improvement is visually confirmed
- A refactor that doesn't change behavior
- Documentation updates
- Configuration or dependency changes

## When NOT to Commit

Never commit when:

- Code has syntax errors or doesn't compile
- Temporary `console.log` / debug statements are still present
- An implementation is half-finished
- Tests are failing due to your changes
- `.env`, secrets, API keys, or credentials are staged

## Workflow Steps

After completing a meaningful unit of work, run these steps **in order**:

### 1. Review changes

```bash
git status
git diff --stat
```

Scan the output. Confirm there are no unintended files (build artifacts, `.env`, `node_modules`, etc.).

### 2. Verify `.gitignore`

Before the first commit in a project, confirm `.gitignore` covers at minimum:

```
node_modules/
.env
.env.local
.next/
dist/
build/
*.log
```

### 3. Stage relevant files

```bash
git add <specific files or directories>
```

Prefer targeted `git add` over `git add .` to keep commits focused. Group related changes together.

### 4. Write a Conventional Commit message

```bash
git commit -m "<type>: <short description in lowercase>"
```

#### Commit types

| Type       | Use for                                    |
|------------|--------------------------------------------|
| `feat`     | New functionality visible to the user      |
| `fix`      | Bug correction                             |
| `refactor` | Internal code improvement, no behavior change |
| `style`    | Formatting, whitespace, CSS-only changes   |
| `docs`     | Documentation or comments                  |
| `chore`    | Config, dependencies, tooling              |
| `perf`     | Performance improvement                    |
| `test`     | Adding or updating tests                   |

#### Good commit messages

```
feat: add password strength validation to registration form
fix: resolve search not finding artists by location
refactor: extract navbar into reusable layout component
style: update artist card hover animation
chore: add suppessHydrationWarning to root layout
```

#### Bad commit messages

```
update files          ← too vague
fix stuff             ← meaningless
WIP                   ← incomplete work shouldn't be committed
asdfasdf              ← obviously bad
```

### 5. Push to remote

```bash
git push origin main
```

Push after every 1–3 related commits, or at the end of a work session. Always push before ending a conversation.

## Commit Granularity Guidelines

- **One logical change per commit.** Don't mix a feature with an unrelated fix.
- **Small is better.** A commit that touches 2–5 files is ideal. If you're touching 15+ files, consider splitting.
- **Group by intent.** All files for "add search by location" go in one commit; a separate CSS fix goes in another.

## Safety Checks

Before every `git add`, verify:

1. `git status` shows no `.env`, `.env.local`, or secret files
2. No `console.log` debug lines remain in staged files
3. No `TODO` or `HACK` markers that indicate unfinished work
4. The dev server (`npm run dev`) still runs without errors

## Example Session

```bash
# After implementing password validation
git status
git diff --stat
git add src/app/login/page.tsx
git commit -m "feat: add password strength validation with visual indicators"

# After fixing a hydration error
git add src/app/layout.tsx
git commit -m "fix: resolve hydration mismatch with suppressHydrationWarning"

# Push both commits
git push origin main
```

## Automatic Trigger

The agent should apply this skill automatically when:

1. A task boundary transitions to **VERIFICATION** mode and passes
2. The user confirms changes are correct
3. Multiple related changes have been made without a commit
4. A conversation is about to end

The agent should proactively suggest committing when significant work is done, rather than waiting to be asked.
