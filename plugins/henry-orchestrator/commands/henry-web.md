---
description: Scaffolds/boots full-stack web app (React/Next/Remix/Angular/Vue/Nuxt/Svelte/SvelteKit/Astro + Node/Express/Nestjs); auto-selects stack.
argument-hint: Optional project name or configuration preferences
allowed-tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "TodoWrite", "AskUserQuestion"]
---

# Full-Stack Web Application Scaffolding

Guide the user through scaffolding a complete full-stack web application by intelligently auto-selecting the appropriate technology stack based on project context, existing files, and user preferences.

## Core Principles

- **Auto-select intelligently**: Analyze existing project files, package.json, git history, and user preferences to determine the best stack
- **Verify before scaffolding**: Always confirm the selected stack with the user before running any scaffold commands
- **Use TodoWrite**: Track all phases and steps throughout the process
- **Handle existing projects**: Detect if scaffolding into existing project vs new project and adapt accordingly
- **Follow best practices**: Use official scaffolding tools and current best practices for each framework

**Initial request:** $ARGUMENTS

---

## Phase 1: Context Analysis & Stack Selection

**Goal**: Understand the project context and auto-select the most appropriate technology stack

**Actions**:

1. Create todo list with all phases:
   - Analyze project context
   - Auto-select technology stack
   - Confirm stack with user
   - Prepare scaffolding environment
   - Scaffold application
   - Install dependencies
   - Verify installation
   - Provide next steps

2. Analyze existing project context:
   - Check if package.json exists (existing project vs new)
   - Check for existing framework files (.next, vite.config, angular.json, etc.)
   - Check git history for clues about preferences
   - Look for existing configuration files (tsconfig.json, etc.)
   - Check current directory structure

3. Parse user arguments from $ARGUMENTS:
   - Project name (if provided)
   - Stack preferences (if mentioned: "Next.js", "Vue", "Express", etc.)
   - TypeScript preference
   - Any specific requirements

4. Auto-select stack based on:
   - **Existing project indicators**: If package.json exists with React, continue with React
   - **User preferences**: If user mentioned specific framework in arguments, prioritize that
   - **Modern defaults**: For new projects, default to popular, well-supported stacks:
     - Frontend: Next.js (React-based, full-stack capable)
     - Backend: Node.js with Express (if separate backend needed)
   - **TypeScript**: Default to TypeScript unless user specifies JavaScript

5. Determine project type:
   - **Full-stack monolith**: Single framework handling both (Next.js, Remix, Nuxt, SvelteKit, Astro SSR)
   - **Separate frontend/backend**: React/Vue/Angular + Express/NestJS
   - **Static site**: Astro, SvelteKit static, Next.js static

**Output**: Auto-selected stack recommendation with reasoning

---

## Phase 2: Stack Confirmation

**Goal**: Present the auto-selected stack to the user and get confirmation or adjustments

**Actions**:

1. Present the auto-selected stack in a clear format:
   ```
   Auto-Selected Technology Stack:

   Frontend: [Framework Name] ([reason])
   Backend: [Framework/Runtime] ([reason])
   Language: TypeScript ([reason])
   Package Manager: [npm/yarn/pnpm] ([detected or default])

   Project Structure: [monolith/separate/static]
   ```

2. Use AskUserQuestion to confirm or modify:
   - Ask if the selected stack is acceptable
   - Offer to change frontend framework
   - Offer to change backend approach
   - Ask about TypeScript preference
   - Ask about additional features (auth, database, etc.)

3. Update stack based on user feedback

**Output**: Confirmed technology stack ready for scaffolding

---

## Phase 3: Environment Preparation

**Goal**: Prepare the environment and determine the correct scaffolding commands

**Actions**:

1. Determine project name:
   - Use from $ARGUMENTS if provided
   - Use current directory name if scaffolding in place
   - Ask user if unclear

2. Check for required tools:
   - Node.js version (check with `node --version`)
   - npm/yarn/pnpm availability
   - Git installation

3. Determine scaffolding commands based on confirmed stack:

   **Next.js**:
   ```bash
   npx create-next-app@latest [project-name] --typescript --tailwind --app --src-dir
   ```

   **React + Vite**:
   ```bash
   npm create vite@latest [project-name] -- --template react-ts
   ```

   **Remix**:
   ```bash
   npx create-remix@latest [project-name]
   ```

   **Vue + Vite**:
   ```bash
   npm create vue@latest [project-name]
   ```

   **Nuxt**:
   ```bash
   npx nuxi@latest init [project-name]
   ```

   **Angular**:
   ```bash
   npx @angular/cli@latest new [project-name]
   ```

   **Svelte + Vite**:
   ```bash
   npm create vite@latest [project-name] -- --template svelte-ts
   ```

   **SvelteKit**:
   ```bash
   npm create svelte@latest [project-name]
   ```

   **Astro**:
   ```bash
   npm create astro@latest [project-name]
   ```

   **Express (separate backend)**:
   ```bash
   mkdir [project-name]-backend && cd [project-name]-backend
   npm init -y
   npm install express cors dotenv
   npm install -D typescript @types/node @types/express nodemon ts-node
   ```

   **NestJS (separate backend)**:
   ```bash
   npm i -g @nestjs/cli
   nest new [project-name]-backend
   ```

4. Prepare working directory:
   - If new project: Ensure parent directory is appropriate
   - If existing project: Warn about potential conflicts
   - Create backup if modifying existing files

**Output**: Environment ready with scaffolding commands prepared

---

## Phase 4: Scaffolding Execution

**Goal**: Run the scaffolding commands and create the project structure

**Actions**:

1. Update TodoWrite: Mark "Scaffold application" as in_progress

2. Execute the scaffolding command:
   - Run the appropriate command from Phase 3
   - If scaffolding tool asks questions interactively, choose sensible defaults:
     - TypeScript: Yes (unless user specified JS)
     - ESLint: Yes
     - Tailwind CSS: Yes for Next.js, optional for others
     - src/ directory: Yes
     - App Router: Yes (Next.js)
     - Import alias: Yes (@/*)

3. For separate frontend/backend setups:
   - Scaffold frontend first
   - Scaffold backend second
   - Create root package.json with workspace configuration if using monorepo

4. Handle errors gracefully:
   - If command fails, read error output
   - Suggest solutions (Node version, permissions, network)
   - Retry with adjustments if needed

**Output**: Project scaffolded successfully

---

## Phase 5: Dependencies & Setup

**Goal**: Install dependencies and perform initial setup

**Actions**:

1. Update TodoWrite: Mark "Install dependencies" as in_progress

2. Navigate to project directory and install dependencies:
   ```bash
   cd [project-name]
   npm install
   ```

3. For separate frontend/backend:
   - Install frontend dependencies
   - Install backend dependencies
   - Set up root workspace if monorepo

4. Add commonly useful packages based on stack:

   **For all projects**:
   - ESLint, Prettier (if not included)
   - Git hooks: husky, lint-staged

   **For frontend**:
   - axios or fetch wrapper for API calls
   - React Query or SWR for data fetching (if React-based)
   - Zustand or Jotai for state management (if complex)

   **For backend**:
   - Validation: zod or joi
   - ORM: Prisma, Drizzle, or TypeORM
   - dotenv for environment variables

5. Set up environment files:
   - Create .env.example with common variables
   - Create .env (add to .gitignore)
   - Document required environment variables

6. Initialize Git if not already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Scaffold [stack-name] application"
   ```

**Output**: Dependencies installed and project configured

---

## Phase 6: Verification

**Goal**: Verify the scaffolded application works correctly

**Actions**:

1. Update TodoWrite: Mark "Verify installation" as in_progress

2. Run development server to verify:
   ```bash
   npm run dev
   ```

3. Check that server starts without errors:
   - Note the local URL (usually http://localhost:3000 or similar)
   - Verify no compilation errors
   - Check for any warnings

4. If separate backend:
   - Start backend server
   - Verify it runs on expected port
   - Test basic endpoint if available

5. Stop servers after verification

**Output**: Verified working application

---

## Phase 7: Next Steps & Documentation

**Goal**: Provide clear next steps and document the setup

**Actions**:

1. Mark all todos as completed

2. Create a project summary document in the project root (PROJECT_SETUP.md):
   ```markdown
   # [Project Name] - Setup Summary

   ## Technology Stack
   - Frontend: [framework]
   - Backend: [framework/runtime]
   - Language: [TypeScript/JavaScript]
   - Package Manager: [npm/yarn/pnpm]

   ## Project Structure
   [Brief overview of directory structure]

   ## Getting Started

   ### Development
   \`\`\`bash
   npm run dev
   \`\`\`

   ### Build
   \`\`\`bash
   npm run build
   \`\`\`

   ## Environment Variables
   [List required env vars]

   ## Next Steps
   1. [Suggested next tasks]
   2. [...]
   ```

3. Present summary to user:
   ```
   Full-Stack Application Scaffolded Successfully!

   Stack:
   - Frontend: [framework]
   - Backend: [framework]
   - Language: TypeScript

   Project Location: [path]

   Quick Start:
   cd [project-name]
   npm run dev

   Next Steps:
   1. Review environment variables in .env.example
   2. Set up your database (if using one)
   3. Explore the scaffolded code structure
   4. Start building your features!

   Additional Recommendations:
   - Set up authentication (NextAuth.js, Clerk, etc.)
   - Configure a database (Postgres, MongoDB, etc.)
   - Add API routes/endpoints
   - Set up CI/CD pipeline
   - Configure deployment (Vercel, Railway, etc.)
   ```

4. Suggest immediate improvements based on common needs:
   - Database setup (Prisma + PostgreSQL)
   - Authentication (NextAuth, Auth0, Clerk)
   - UI component library (shadcn/ui, Material-UI, etc.)
   - API documentation (Swagger/OpenAPI)
   - Testing setup (Vitest, Jest, Playwright)

**Output**: Complete project summary with clear next steps

---

## Important Notes

### Stack Selection Priority

1. Explicit user preference in $ARGUMENTS
2. Existing project indicators (package.json, config files)
3. Modern best practices (Next.js for React, Nuxt for Vue)
4. TypeScript by default

### Default Recommendations

For new projects without specific requirements:
- **Simple full-stack**: Next.js 14+ (App Router)
- **Complex enterprise**: NestJS backend + Next.js frontend
- **Content-heavy**: Astro or Next.js
- **Highly interactive**: SvelteKit or Remix
- **Mobile-first**: Next.js or Remix with PWA

### Error Handling

- Always check tool availability before running commands
- Provide clear error messages with solutions
- Offer to retry with different configurations
- Fall back to simpler alternatives if advanced tools fail

### Best Practices Applied

- Use latest stable versions
- TypeScript by default for type safety
- ESLint + Prettier for code quality
- Git initialization for version control
- Environment variable templates
- Clear project documentation

---

**Begin with Phase 1: Context Analysis & Stack Selection**
