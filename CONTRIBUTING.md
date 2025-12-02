# Contributing to CoatVision_MVP

Thank you for your interest in contributing! We welcome bug reports, feature requests, and pull requests.

## How to contribute

1. Fork the repository and create a feature branch from `main` or `develop`:

```bash
git checkout -b feat/short-description
```

2. Write clear commit messages. We recommend following Conventional Commits (e.g., `fix:`, `feat:`, `chore:`).

3. Run tests and linters locally before opening a PR.

4. Push your branch and open a Pull Request describing the change.

## Branch naming

Use descriptive branch names, for example:
- `feat/add-login-flow`
- `fix/health-endpoint`
- `chore/update-deps`

## Code style

- Python: follow PEP8 (use black/isort/flake8)
- JavaScript/TypeScript: follow your configured linter (prettier/eslint)

## Running tests

- Backend: run `pytest` in the `backend` directory
- Frontend: `npm ci && npm test` in the `frontend` directory

## Pull request checklist

- [ ] My code follows the repository style guidelines
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] I have added necessary documentation (if appropriate)
- [ ] I have updated the CHANGELOG.md (if one exists)
