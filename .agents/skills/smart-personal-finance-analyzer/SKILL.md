```markdown
# smart-personal-finance-analyzer Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `smart-personal-finance-analyzer` TypeScript codebase. It covers file naming, import/export styles, commit conventions, and testing patterns to ensure consistency and maintainability.

## Coding Conventions

### File Naming
- Use **PascalCase** for all file names.
  - Example: `TransactionAnalyzer.ts`, `UserProfileManager.ts`

### Imports
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import Analyzer from 'components/TransactionAnalyzer';
    ```

### Exports
- Use **default exports** for modules.
  - Example:
    ```typescript
    const TransactionAnalyzer = () => { /* ... */ };
    export default TransactionAnalyzer;
    ```

### Commit Messages
- Follow **Conventional Commits**.
- Common prefixes: `docs`, `refactor`
- Example:
  ```
  docs: update README with setup instructions
  refactor: simplify budget calculation logic in TransactionAnalyzer
  ```

## Workflows

### Refactoring Code
**Trigger:** When improving code structure or readability without changing functionality  
**Command:** `/refactor`

1. Identify code that needs refactoring.
2. Make improvements (e.g., rename variables, extract functions).
3. Ensure all tests pass.
4. Commit changes with a message starting with `refactor:`.
   - Example: `refactor: extract balance calculation to helper function`
5. Push your changes.

### Updating Documentation
**Trigger:** When documentation needs to be added or updated  
**Command:** `/docs-update`

1. Edit or add documentation files (e.g., `README.md`, inline comments).
2. Commit changes with a message starting with `docs:`.
   - Example: `docs: add usage examples to README`
3. Push your changes.

## Testing Patterns

- Test files use the pattern: `*.test.*` (e.g., `TransactionAnalyzer.test.ts`)
- The specific testing framework is not detected; check existing test files for the framework in use.
- Example test file structure:
  ```typescript
  import Analyzer from 'components/TransactionAnalyzer';

  describe('TransactionAnalyzer', () => {
    it('calculates total expenses correctly', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command         | Purpose                                      |
|-----------------|----------------------------------------------|
| /refactor       | Start a code refactor workflow               |
| /docs-update    | Start a documentation update workflow        |
```
