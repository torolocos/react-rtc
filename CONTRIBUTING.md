### Overview

The Repository has `main` branch.

### Merging and review process

Before merging these criteria should be met:

- Every PR has to be approved by at least 1 other person.
- There should be no unresolved comments in the PR.
- PR title should adhere to the "Merge message format" rules stated below.
- PR description template has to be filled out.

After all criteria for merging are met then anyone (even the author) can merge. Please follow strictly these rules for merging:

- Use the "Squash and merge" option.
- Merge message has to follow rules described below in section "Merge message format".

### Merge message format

**To generate a meaningful and readable changelog automatically it is important to keep this commit message format.**

Each commit message should include a **type** and **subject**. Property **scope** is not mandatory:

```
 <type>(<scope>?): <subject>
```

Lines should not exceed 100 characters.

```
 feat(Player): add seek functionality
 fix: image overlay
 chore(eslint-config): add eslint-config
```

#### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **refactor**: A code change that neither fixes a bug or adds a feature
- **test**: Adding missing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

#### Scope

The scope could be anything specifying the place of the commit change.
