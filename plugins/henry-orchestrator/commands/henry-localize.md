---
description: Adds i18n; extracts strings, translates via API.
argument-hint: Optional target languages (e.g., "es fr de") or project path
allowed-tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash", "TodoWrite", "AskUserQuestion", "WebFetch"]
---

# Internationalization (i18n) & Localization Setup

Guide the user through adding internationalization support to their project, extracting translatable strings, and translating them via translation APIs.

## Core Principles

- **Auto-detect framework**: Analyze existing project to determine appropriate i18n library
- **Extract systematically**: Find all user-facing strings in code
- **Use TodoWrite**: Track all phases and steps throughout the process
- **API translation**: Use translation services (Google Translate, DeepL, etc.) for initial translations
- **Best practices**: Follow framework-specific i18n patterns and conventions

**Initial request:** $ARGUMENTS

---

## Phase 1: Project Analysis & i18n Library Selection

**Goal**: Understand the project structure and select the appropriate i18n solution

**Actions**:

1. Create todo list with all phases:
   - Analyze project structure
   - Select i18n library
   - Install i18n dependencies
   - Configure i18n setup
   - Extract translatable strings
   - Translate strings via API
   - Apply translations to code
   - Verify and test

2. Analyze existing project:
   - Check package.json for framework (React, Vue, Angular, Next.js, etc.)
   - Look for existing i18n setup (i18next, vue-i18n, @angular/localize, etc.)
   - Check project structure (src/, components/, pages/, etc.)
   - Identify file types (.jsx, .tsx, .vue, .html, .ts, etc.)

3. Parse user arguments from $ARGUMENTS:
   - Target languages (e.g., "es", "fr", "de", "ja", "zh")
   - Project path (if different from current directory)
   - Translation API preference (Google, DeepL, OpenAI)

4. Select i18n library based on framework:

   **React / Next.js**:
   - `react-i18next` (most popular)
   - `next-intl` (Next.js specific)
   - `react-intl` (formatjs)

   **Vue / Nuxt**:
   - `vue-i18n` (official)
   - `@nuxtjs/i18n` (Nuxt specific)

   **Angular**:
   - `@angular/localize` (official)
   - `@ngx-translate/core`

   **Svelte / SvelteKit**:
   - `svelte-i18n`
   - `sveltekit-i18n`

   **Plain JavaScript/TypeScript**:
   - `i18next`
   - `@formatjs/intl`

5. Determine translation API to use:
   - Default: Google Translate API (free tier available)
   - Alternative: DeepL API (higher quality)
   - Alternative: OpenAI GPT (context-aware)

**Output**: Selected i18n library and translation approach

---

## Phase 2: User Confirmation

**Goal**: Confirm the i18n setup plan with the user

**Actions**:

1. Present the auto-selected configuration:
   ```
   Internationalization Setup Plan:

   Detected Framework: [React/Vue/Angular/etc.]
   Selected i18n Library: [library-name]
   Target Languages: [list of languages]
   Translation Service: [Google Translate/DeepL/OpenAI]

   Base Language: en (English) - detected from current code
   ```

2. Use AskUserQuestion to confirm or modify:
   - Confirm detected framework is correct
   - Add/remove target languages
   - Choose translation API preference
   - Ask about custom translation requirements (formal/informal, domain-specific terms)

3. Update configuration based on user feedback

**Output**: Confirmed i18n setup configuration

---

## Phase 3: Install Dependencies

**Goal**: Install the necessary i18n libraries and dependencies

**Actions**:

1. Update TodoWrite: Mark "Install i18n dependencies" as in_progress

2. Install core i18n library based on selection:

   **For React/Next.js (react-i18next)**:
   ```bash
   npm install react-i18next i18next i18next-browser-languagedetector
   ```

   **For Vue (vue-i18n)**:
   ```bash
   npm install vue-i18n@9
   ```

   **For Angular (@angular/localize)**:
   ```bash
   ng add @angular/localize
   npm install @ngx-translate/core @ngx-translate/http-loader
   ```

   **For Svelte (svelte-i18n)**:
   ```bash
   npm install svelte-i18n
   ```

3. Install translation API client:
   ```bash
   npm install @google-cloud/translate   # for Google Translate
   # OR
   npm install deepl-node                 # for DeepL
   # OR use OpenAI SDK for GPT-based translation
   ```

4. Install development dependencies:
   ```bash
   npm install -D i18next-parser          # for extracting translation keys
   ```

5. Verify installation:
   ```bash
   npm list | grep i18n
   ```

**Output**: All dependencies installed successfully

---

## Phase 4: Configure i18n Setup

**Goal**: Set up the i18n configuration files and initialize the library

**Actions**:

1. Update TodoWrite: Mark "Configure i18n setup" as in_progress

2. Create i18n configuration file based on framework:

   **For React/Next.js (i18n.ts or i18n.js)**:
   ```typescript
   import i18n from 'i18next';
   import { initReactI18next } from 'react-i18next';
   import LanguageDetector from 'i18next-browser-languagedetector';

   i18n
     .use(LanguageDetector)
     .use(initReactI18next)
     .init({
       fallbackLng: 'en',
       supportedLngs: ['en', 'es', 'fr', 'de'],
       debug: process.env.NODE_ENV === 'development',
       interpolation: {
         escapeValue: false,
       },
       resources: {
         en: { translation: {} },
         // Other languages will be loaded
       },
     });

   export default i18n;
   ```

   **For Vue (i18n.ts)**:
   ```typescript
   import { createI18n } from 'vue-i18n';

   const i18n = createI18n({
     legacy: false,
     locale: 'en',
     fallbackLocale: 'en',
     messages: {
       en: {},
       // Other languages will be loaded
     },
   });

   export default i18n;
   ```

3. Create locale directory structure:
   ```
   src/
     locales/
       en/
         translation.json
       es/
         translation.json
       fr/
         translation.json
   ```

4. Initialize empty translation files for base language (en):
   ```json
   {}
   ```

5. Update main app file to initialize i18n:
   - Import i18n configuration
   - Wrap app with i18n provider (React) or use i18n plugin (Vue)
   - Add language switcher component location suggestions

6. Create i18next-parser config (i18next-parser.config.js):
   ```javascript
   module.exports = {
     locales: ['en', 'es', 'fr', 'de'],
     output: 'src/locales/$LOCALE/translation.json',
     input: ['src/**/*.{js,jsx,ts,tsx,vue}'],
     defaultNamespace: 'translation',
     keySeparator: '.',
     namespaceSeparator: ':',
     useKeysAsDefaultValue: true,
   };
   ```

**Output**: i18n configuration complete and ready to use

---

## Phase 5: Extract Translatable Strings

**Goal**: Scan the codebase and extract all user-facing strings

**Actions**:

1. Update TodoWrite: Mark "Extract translatable strings" as in_progress

2. Use Grep to find hardcoded strings in code:
   - Search for strings in JSX/TSX: `Grep pattern="['\"]([^'\"]+)['\"]" type="tsx"`
   - Search in Vue templates: Look for text content in `<template>` sections
   - Search in HTML templates: Angular templates with text content
   - Exclude: console.log, debug strings, test files, node_modules

3. Identify string categories:
   - UI labels and buttons
   - Error messages
   - Validation messages
   - Page titles and headings
   - Notifications and alerts
   - Placeholder text
   - Alt text for images

4. Create a mapping of strings to translation keys:
   ```
   "Welcome to our app" -> "welcome.title"
   "Sign In" -> "auth.signIn"
   "Email address" -> "form.email"
   ```

5. Generate base translation file (en/translation.json):
   ```json
   {
     "welcome": {
       "title": "Welcome to our app",
       "subtitle": "Get started by creating an account"
     },
     "auth": {
       "signIn": "Sign In",
       "signOut": "Sign Out",
       "register": "Register"
     },
     "form": {
       "email": "Email address",
       "password": "Password",
       "submit": "Submit"
     }
   }
   ```

6. Use i18next-parser to automatically extract keys:
   ```bash
   npx i18next-parser
   ```

**Output**: Base translation file (en) with all extracted strings

---

## Phase 6: Translate Strings via API

**Goal**: Use translation API to generate translations for target languages

**Actions**:

1. Update TodoWrite: Mark "Translate strings via API" as in_progress

2. Load the base translation file (en/translation.json)

3. For each target language, use translation API:

   **Using Google Translate API**:
   ```javascript
   const { Translate } = require('@google-cloud/translate').v2;
   const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });

   async function translateText(text, targetLang) {
     const [translation] = await translate.translate(text, targetLang);
     return translation;
   }
   ```

   **Using DeepL API**:
   ```javascript
   const deepl = require('deepl-node');
   const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

   async function translateText(text, targetLang) {
     const result = await translator.translateText(text, null, targetLang);
     return result.text;
   }
   ```

4. Create a translation script:
   - Read base translation file (en)
   - For each string value, call translation API
   - Preserve JSON structure and keys
   - Write translated content to target language files

5. Handle translation API limitations:
   - Respect rate limits (add delays between requests)
   - Handle API errors gracefully
   - Cache translations to avoid redundant calls
   - Preserve placeholders and variables (e.g., {{name}}, %s, {0})

6. Generate translation files for each language:
   - `src/locales/es/translation.json`
   - `src/locales/fr/translation.json`
   - `src/locales/de/translation.json`
   - etc.

7. Review translations:
   - Flag potentially problematic translations
   - Note cultural considerations
   - Suggest human review for critical strings

**Output**: Complete translation files for all target languages

---

## Phase 7: Apply Translations to Code

**Goal**: Replace hardcoded strings in the codebase with translation function calls

**Actions**:

1. Update TodoWrite: Mark "Apply translations to code" as in_progress

2. Replace hardcoded strings based on framework:

   **For React/Next.js**:
   ```tsx
   // Before
   <h1>Welcome to our app</h1>
   <button>Sign In</button>

   // After
   import { useTranslation } from 'react-i18next';

   function Component() {
     const { t } = useTranslation();
     return (
       <>
         <h1>{t('welcome.title')}</h1>
         <button>{t('auth.signIn')}</button>
       </>
     );
   }
   ```

   **For Vue**:
   ```vue
   <!-- Before -->
   <h1>Welcome to our app</h1>
   <button>Sign In</button>

   <!-- After -->
   <h1>{{ $t('welcome.title') }}</h1>
   <button>{{ $t('auth.signIn') }}</button>
   ```

   **For Angular**:
   ```html
   <!-- Before -->
   <h1>Welcome to our app</h1>

   <!-- After -->
   <h1>{{ 'welcome.title' | translate }}</h1>
   ```

3. Use Edit tool to systematically replace strings:
   - Start with most common components
   - Replace one file at a time
   - Verify syntax after each change
   - Handle interpolation (e.g., `t('greeting', { name: userName })`)

4. Handle special cases:
   - Pluralization: `t('items', { count: 5 })`
   - Date/time formatting: Use i18n formatting helpers
   - Number formatting: Currency, decimals
   - Dynamic content: Ensure variables are properly interpolated

5. Create language switcher component:
   ```tsx
   function LanguageSwitcher() {
     const { i18n } = useTranslation();

     return (
       <select
         value={i18n.language}
         onChange={(e) => i18n.changeLanguage(e.target.value)}
       >
         <option value="en">English</option>
         <option value="es">Español</option>
         <option value="fr">Français</option>
       </select>
     );
   }
   ```

**Output**: Code updated with translation function calls

---

## Phase 8: Verification & Testing

**Goal**: Ensure translations work correctly across the application

**Actions**:

1. Update TodoWrite: Mark "Verify and test" as in_progress

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Test language switching:
   - Verify default language loads correctly
   - Switch to each target language
   - Check that all strings are translated
   - Look for missing translations (fallback to base language)

4. Test edge cases:
   - Long strings (UI layout)
   - Special characters
   - RTL languages (if applicable)
   - Pluralization rules
   - Date/number formatting

5. Check for issues:
   - Missing translation keys
   - Broken interpolation
   - Layout problems with longer translated text
   - Console errors or warnings

6. Generate translation coverage report:
   - List all translation keys
   - Identify missing translations
   - Note completion percentage per language

**Output**: Verified working i18n implementation

---

## Phase 9: Documentation & Next Steps

**Goal**: Document the i18n setup and provide guidance for maintenance

**Actions**:

1. Mark all todos as completed

2. Create i18n documentation (I18N_GUIDE.md):
   ```markdown
   # Internationalization Guide

   ## Supported Languages
   - English (en) - Base language
   - Spanish (es)
   - French (fr)
   - German (de)

   ## Setup
   This project uses [library-name] for internationalization.

   ## Adding New Translations

   ### 1. Add strings to base file
   Edit `src/locales/en/translation.json`

   ### 2. Run translation script
   \`\`\`bash
   npm run translate
   \`\`\`

   ### 3. Use in code
   \`\`\`tsx
   const { t } = useTranslation();
   <div>{t('your.new.key')}</div>
   \`\`\`

   ## Language Switching
   Users can switch languages using the language selector in the header.

   ## Translation API
   We use [API name] for automatic translations.
   API Key: Set in environment variable `TRANSLATE_API_KEY`

   ## Best Practices
   - Keep translation keys descriptive and hierarchical
   - Use namespaces for different sections
   - Always add new strings to base file first
   - Have native speakers review auto-translations
   - Test UI layout with all languages
   ```

3. Add translation scripts to package.json:
   ```json
   {
     "scripts": {
       "translate": "node scripts/translate.js",
       "i18n:extract": "i18next-parser",
       "i18n:check": "node scripts/check-translations.js"
     }
   }
   ```

4. Create translation script (scripts/translate.js):
   - Script to automate translation of new strings
   - Handles API calls, rate limiting, caching
   - Updates only missing translations

5. Present summary to user:
   ```
   Internationalization Setup Complete!

   Configuration:
   - Library: [library-name]
   - Supported Languages: [list]
   - Translation API: [API name]

   Files Created/Modified:
   - src/i18n.ts - i18n configuration
   - src/locales/[lang]/translation.json - Translation files
   - scripts/translate.js - Translation automation script

   Translation Coverage:
   - English (en): 100% (base)
   - Spanish (es): 100%
   - French (fr): 100%
   - German (de): 100%

   Next Steps:
   1. Review auto-generated translations for accuracy
   2. Consider hiring native speakers for review
   3. Test the application in each language
   4. Set up continuous localization workflow
   5. Add more languages as needed

   Usage:
   - Switch languages using the language selector
   - Add new strings to src/locales/en/translation.json
   - Run `npm run translate` to generate translations
   - Import and use `t()` function in components

   Best Practices:
   - Always add base strings in English first
   - Use namespaced keys (e.g., 'auth.login')
   - Test UI layout with longer translations
   - Keep translation files in version control
   - Consider using translation management platform for teams
   ```

**Output**: Complete i18n setup with documentation

---

## Important Notes

### Translation Quality

- Automated translations are a starting point, not final
- Always have native speakers review critical content
- Consider cultural context, not just literal translation
- Some strings may need manual adjustment for tone/formality

### API Keys & Security

- Never commit API keys to version control
- Use environment variables: `.env.local`
- Add to `.env.example` with placeholder values
- Consider rate limits and costs of translation APIs

### Framework-Specific Considerations

**React/Next.js**:
- Use `useTranslation` hook in functional components
- For Next.js SSR, configure language detection
- Consider next-intl for better Next.js integration

**Vue**:
- Use `$t()` in templates, `t()` in script
- Configure vue-i18n in main.js/main.ts
- Use composition API: `useI18n()`

**Angular**:
- Use `translate` pipe in templates
- Lazy load translations for better performance
- Configure localeId for date/number formatting

### Performance Optimization

- Lazy load translations (don't load all languages upfront)
- Use namespaces to split large translation files
- Cache translations in localStorage
- Consider CDN for translation files in production

### Common Pitfalls to Avoid

- Don't concatenate translated strings
- Avoid hardcoding dates/numbers (use formatters)
- Don't translate technical terms unnecessarily
- Be careful with variable interpolation order
- Watch for layout breaks with longer text
- Handle missing translations gracefully

---

**Begin with Phase 1: Project Analysis & i18n Library Selection**
