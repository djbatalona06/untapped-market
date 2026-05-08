```markdown
# untapped-market Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `untapped-market` TypeScript codebase. It covers file organization, import/export styles, commit habits, and testing patterns, providing practical examples and suggested commands for efficient contribution.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `marketDataFetcher.ts`

### Import Style
- Use **relative imports** for referencing local files.
  - Example:
    ```typescript
    import { fetchMarketData } from './marketDataFetcher';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In userProfile.ts
    export function getUserProfile(id: string) { ... }

    // In another file
    import { getUserProfile } from './userProfile';
    ```

### Commit Patterns
- Commit messages are **freeform** (no enforced prefixes).
- Average commit message length: ~54 characters.
  - Example:  
    ```
    Add support for new market data endpoint
    ```

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new capability or module  
**Command:** `/add-feature`

1. Create a new file using camelCase naming (e.g., `newFeature.ts`).
2. Use relative imports to include dependencies.
3. Export functions or constants using named exports.
4. Write corresponding tests in a `*.test.ts` file.
5. Commit changes with a descriptive message.

### Refactoring Existing Code
**Trigger:** When improving or restructuring code  
**Command:** `/refactor`

1. Identify the file(s) to refactor.
2. Maintain camelCase file naming.
3. Update imports/exports to remain relative and named.
4. Run or update tests to ensure functionality.
5. Commit with a message summarizing the refactor.

### Writing Tests
**Trigger:** When adding or updating tests  
**Command:** `/write-test`

1. Create or update a test file matching `*.test.ts` pattern.
2. Implement test cases for the relevant module or function.
3. Run tests to verify correctness.
4. Commit with a message describing the test coverage.

## Testing Patterns

- Test files use the `*.test.ts` naming convention.
- The testing framework is **unknown** (check project documentation or dependencies).
- Place tests alongside or near the modules they cover.
- Example test file:
  ```typescript
  // userProfile.test.ts
  import { getUserProfile } from './userProfile';

  test('should return user profile for valid id', () => {
    // ...test implementation
  });
  ```

## Commands
| Command      | Purpose                                         |
|--------------|-------------------------------------------------|
| /add-feature | Scaffold and implement a new feature/module     |
| /refactor    | Refactor existing code following conventions    |
| /write-test  | Add or update tests for a module or function    |
```