---
name: Git Workflow
description: Apply Git best practices automatically during development — branching, staging, committing, and pushing with Conventional Commits. (Version 2.0)
---

# Git Workflow

## Purpose

Maintain a clean, professional Git history by creating feature branches, committing and pushing changes at the right moments using Conventional Commits conventions, and safely merging to main.

## Regla de Oro (Golden Rule)

**NUNCA** hagas un commit directo en `main` si el cambio implica más de una línea de texto o configuración básica. Las funcionalidades nuevas SIEMPRE van por rama separada.

## Branching Management

### 1. Creación de Ramas por Feature

Antes de empezar cualquier cambio (feat, fix, refactor), debés crear una rama nueva partiendo de `main` con el comando:

```bash
git checkout -b nombre-de-la-rama
```

El nombre debe ser descriptivo, por ejemplo: `feat/sistema-notificaciones` o `fix/error-login`.

### 2. Ciclo de Trabajo

Trabajá y hacé los commits (siguiendo Conventional Commits) dentro de esa rama.

Al finalizar y verificar que el código NO está roto, hacé el push de la rama:

```bash
git push origin nombre-de-la-rama
```

### 3. Proceso de Merge (Integración)

Una vez que la feature esté terminada en el remoto y validada, el proceso para integrarla a `main` es el siguiente:

```bash
git checkout main
git pull origin main
git merge nombre-de-la-rama
git push origin main
```

### 4. Limpieza

Después del merge exitoso, eliminá la rama local para mantener el repositorio limpio:

```bash
git branch -d nombre-de-la-rama
```

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
git push origin nombre-de-la-rama
```

Push after every 1–3 related commits, o at the end of a work session. Always push before ending a conversation.

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
# Start new feature
git checkout main
git pull origin main
git checkout -b feat/password-validation

# After implementing password validation
git status
git diff --stat
git add src/app/login/page.tsx
git commit -m "feat: add password strength validation with visual indicators"

# Push branch
git push origin feat/password-validation

# Merge to main
git checkout main
git pull origin main
git merge feat/password-validation
git push origin main

# Cleanup
git branch -d feat/password-validation
```

## Automatic Trigger

The agent should apply this skill automatically when:

1. A task boundary transitions to **VERIFICATION** mode and passes
2. The user confirms changes are correct
3. Multiple related changes have been made without a commit
4. A conversation is about to end

The agent should proactively suggest branching and committing when significant work is done, rather than waiting to be asked.
