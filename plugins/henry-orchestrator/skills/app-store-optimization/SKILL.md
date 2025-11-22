---
name: app-store-optimization
description: This skill should be used when the user asks to "optimize ASO", "improve app store listing", "add keywords", "optimize app description", "create app screenshots", "check App Store compliance", "check Play Store compliance", "fix app rejection", "improve conversion rate", "optimize app metadata", "add privacy policy", or mentions App Store Review Guidelines, Play Store policies, keyword optimization, or app store visibility.
version: 0.1.0
---

# App Store Optimization (ASO)

This skill provides comprehensive guidance for optimizing mobile app visibility, conversion, and compliance across iOS App Store and Google Play Store.

## Purpose

App Store Optimization (ASO) combines search optimization, visual asset design, and policy compliance to maximize app discoverability and downloads. This skill helps with:

1. **Keyword Research & Optimization** - Improving search rankings through strategic keyword placement
2. **Visual Assets** - Creating compelling screenshots, videos, and icons that drive conversions
3. **Compliance** - Ensuring apps meet iOS and Android store policies to avoid rejection
4. **A/B Testing** - Optimizing listings through data-driven experimentation
5. **Metadata Optimization** - Crafting effective titles, descriptions, and promotional content

## When to Use This Skill

Invoke this skill when working on:

- Creating or updating app store listings
- Improving app discoverability and search rankings
- Designing screenshots, icons, or preview videos
- Preparing apps for submission
- Addressing app rejection issues
- Optimizing conversion rates from product page to install
- Conducting competitive app store analysis
- Localizing app listings for international markets

## Core ASO Workflow

### 1. Keyword Optimization

**iOS App Store Keyword Strategy:**

iOS provides distinct fields for keywords, each with different search weight:

- **App Name** (30 chars): Highest search weight
  - Format: "Brand - Primary Keyword"
  - Example: "Headspace - Meditation"

- **Subtitle** (30 chars): High search weight
  - Use for secondary keywords and value proposition
  - Example: "Meditation Made Simple"

- **Keyword Field** (100 chars): Medium weight, not visible to users
  - Comma-separated, no spaces, no need to repeat title/subtitle words
  - Example: "mindfulness,relax,calm,anxiety,stress,yoga,breathe"

**Google Play Store Keyword Strategy:**

Android indexes all visible text, requiring natural keyword integration:

- **Title** (30 chars): Highest weight - include primary keyword
- **Short Description** (80 chars): High weight - integrate 1-2 keywords naturally
- **Full Description** (4000 chars): All indexed
  - First 250 characters critical (visible before "Read more")
  - Primary keywords: 5-7 occurrences naturally distributed
  - Target keyword density: 2-3%
  - Include semantic variations and long-tail keywords

**Keyword Research Process:**

1. Identify seed keywords (core functionality, problems solved)
2. Expand with competitor analysis and search suggestions
3. Analyze volume, competition, and relevance
4. Prioritize: high volume + low competition = opportunities
5. Track rankings weekly and iterate

Use `scripts/keyword-analyzer.py` to check keyword density:

```bash
python scripts/keyword-analyzer.py description.txt --keywords "meditation,mindfulness,sleep"
```

### 2. Visual Asset Optimization

**App Icon Design Principles:**

- Simple and recognizable at small sizes (60x60, 48x48)
- Unique within category
- High contrast for visibility
- Maximum 2-3 colors
- Avoid text (or keep minimal)
- Test in grayscale to verify contrast

**Technical Specs:**

- iOS: 1024x1024 px PNG/JPEG, no transparency
- Android: 512x512 px PNG, transparency allowed

**Screenshot Strategy:**

First 2-3 screenshots are critical (appear "above the fold"). Structure them to tell a story:

**Option A - Feature Flow:**

1. Hero feature (primary value prop)
2. Second key feature
3. Third key feature
4. Supporting features
5. Social proof / CTA

**Option B - Story Flow:**

1. Problem statement
2. Solution (your app)
3. How it works
4. Results/benefits
5. Social proof

**Screenshot Best Practices:**

- Use text overlays with large fonts (min 40pt)
- High contrast captions at top or bottom
- Keep text to 5-10 words max
- Show actual app UI
- Consistent visual style across all
- Localize text for each market

**Technical Specs:**

- iOS: 2-10 screenshots, portrait for phones
  - 6.7" iPhone: 1290x2796 px (portrait)
  - 6.5" iPhone: 1242x2688 px (portrait)
- Android: 2-8 screenshots
  - Recommended: 1080x1920 px (portrait)

**App Preview Video:**

30-second videos focusing on core value:

- 0-3 sec: Hook (grab attention immediately)
- 3-10 sec: Solution (show your app)
- 10-25 sec: Key features (2-3 maximum)
- 25-30 sec: Call to action

Design for silent viewing (many users watch muted). Show actual app interactions, not talking heads or tutorials.

### 3. Compliance Checking

**iOS App Store Critical Requirements:**

Before submission, verify:

**Privacy (Guideline 5.1):**

- [ ] Privacy policy URL provided and accessible
- [ ] Policy describes all data collection and usage
- [ ] User consent obtained before collecting data
- [ ] App Tracking Transparency implemented (iOS 14.5+)
- [ ] Purpose strings for all requested permissions

**App Completeness (Guideline 2.1):**

- [ ] All features functional
- [ ] No placeholder content
- [ ] Demo account provided if login required
- [ ] Review notes explain non-obvious features

**Payments (Guideline 3.1):**

- [ ] In-app purchases used for digital content
- [ ] No alternative payment mechanisms for digital goods
- [ ] Subscriptions use App Store payment system

**Metadata Accuracy (Guideline 2.3):**

- [ ] Screenshots show actual app usage
- [ ] Description matches functionality
- [ ] No misleading marketing

**Google Play Store Critical Requirements:**

**Data Safety (Required):**

- [ ] Data Safety form completed accurately in Play Console
- [ ] All data types collected declared
- [ ] Data usage purposes explained
- [ ] Third-party data sharing disclosed
- [ ] Security practices described

**Privacy Policy:**

- [ ] Provided both in-app AND on store listing
- [ ] Accessible without login
- [ ] Covers all data collection

**Permissions:**

- [ ] Only necessary permissions requested
- [ ] Prominent disclosure for sensitive permissions
- [ ] Clear explanation for each permission

**Payments:**

- [ ] Google Play Billing for digital goods/services
- [ ] Physical goods may use alternative payment
- [ ] Clear pricing information

**Content Quality:**

- [ ] App stable and responsive
- [ ] Accurate description and screenshots
- [ ] No spam or copycat behavior
- [ ] Appropriate content rating

Use `examples/compliance-checklist.md` for comprehensive pre-submission review.

### 4. Description Optimization

**iOS Description (Not indexed for search):**

Focus on conversion, not keywords. Structure:

1. Hook (1-2 sentences, first 250 chars visible)
2. Key benefits (3-5 bullet points)
3. Main features (detailed list)
4. Social proof (ratings, awards, users)
5. Subscription information (if applicable)
6. Support and policy links
7. Call to action

**Google Play Description (Fully indexed):**

Balance searchability with readability. Structure:

1. Hook with primary keywords (first 250 chars critical)
2. Key benefits with natural keyword integration
3. Features with semantic keyword variations
4. Use cases with long-tail keywords
5. Social proof
6. Subscription information
7. Call to action

**Key Differences:**

- iOS: Optimize for persuasion and conversion
- Android: Optimize for search while maintaining readability
- Android: Strategic keyword placement throughout
- iOS: Keywords go in separate field

### 5. A/B Testing

**iOS Product Page Optimization:**

Available in App Store Connect:

- Test: app icon, screenshots, app preview video
- Up to 3 variations
- 90 days maximum per test
- Statistical significance indicators

**Google Play Store Experiments:**

Available in Play Console:

- Test: icon, feature graphic, screenshots, video, short description
- Up to 3 variants + control
- 90 days maximum per test
- Localized experiments supported

**Testing Best Practices:**

- Test one element at a time for clear insights
- Run to statistical significance
- Start with highest-impact elements (icon, first 3 screenshots)
- Implement winners and continue testing
- Track conversion rate as primary metric

**Key Metrics:**

- Conversion Rate: Product page views → installs (target: 20-30%+)
- Tap-Through Rate: Search impressions → page visits (target: 5-10%+)
- Performance by traffic source (browse vs. search)

## Additional Resources

### Reference Files

For detailed guidance and specifications, consult:

- **`references/app-store-guidelines.md`** - Complete iOS App Store Review Guidelines, common rejection reasons, pre-submission checklist, and appeals process
- **`references/play-store-policies.md`** - Google Play Store policies, Data Safety requirements, common rejection reasons, and resolution process
- **`references/aso-strategies.md`** - Advanced keyword research techniques, competitive analysis, seasonal optimization, featured placement strategies, and ASO tools
- **`references/visual-assets-guide.md`** - Detailed specifications, design best practices, screenshot content strategies, video production methods, and localization approach

### Example Files

Working templates and checklists in `examples/`:

- **`examples/app-listing-template.md`** - Complete templates for iOS and Android listings with examples, screenshot caption templates, and category selection guide
- **`examples/compliance-checklist.md`** - Comprehensive pre-submission checklist for both platforms, common rejection quick reference, and post-submission monitoring

### Scripts

Utility tools in `scripts/`:

- **`scripts/keyword-analyzer.py`** - Analyze keyword density, distribution, and optimization opportunities in app descriptions

## Platform-Specific Considerations

### iOS Unique Features

**Promotional Text (170 chars):**

- Updatable without new app review
- Appears above description
- Use for limited-time offers or feature highlights

**App Store Connect Analytics:**

- Track impressions, product page views, downloads
- Monitor conversion rates
- Analyze traffic sources

**Product Page Optimization:**

- Built-in A/B testing tool
- Test icon and screenshots
- Statistical analysis provided

### Android Unique Features

**Feature Graphic (1024x500 px):**

- Banner at top of listing
- First visual impression
- Should include app name and key visual

**Early Access / Beta Programs:**

- Internal testing (100 testers)
- Closed testing tracks
- Open testing for public betas
- Test in production-like environment

**Pre-Launch Report:**

- Automated testing on real devices
- Identifies crashes and issues
- Security vulnerability scanning
- Available in Play Console

## Common Scenarios

### Scenario: App Rejected for Privacy Policy

**Diagnosis:**
Check rejection reason for specific issue:

- Privacy policy URL not provided
- URL not accessible
- Policy doesn't cover data collection
- No user consent for tracking

**Solution:**

1. Create comprehensive privacy policy covering:
   - All data types collected
   - How data is used
   - Third-party sharing
   - User rights and controls
   - Contact information
2. Host on accessible URL (not PDF download)
3. Add URL to store listing and in-app
4. Implement consent dialogs before data collection
5. For iOS: Implement App Tracking Transparency
6. For Android: Complete Data Safety form accurately
7. Resubmit with clear review notes

Consult `references/app-store-guidelines.md` (section 5.1) or `references/play-store-policies.md` (Privacy & Security section) for detailed requirements.

### Scenario: Low Conversion Rate

**Diagnosis:**
Compare conversion rate (page views → installs) to benchmarks:

- Below 20%: Significant optimization opportunity
- 20-30%: Good, room for improvement
- 30%+: Excellent

**Solution:**

1. Analyze first impressions:
   - Is icon distinctive and clear?
   - Do first 2-3 screenshots highlight key value?
   - Is value proposition immediately clear?

2. Test hypotheses:
   - Create icon variations focusing on simplicity
   - Redesign first screenshot with stronger benefit messaging
   - Test benefit-focused vs. feature-focused captions
   - Add or improve app preview video

3. Run A/B tests:
   - iOS: Product Page Optimization in App Store Connect
   - Android: Store Listing Experiments in Play Console
   - Focus on highest-impact elements first

4. Implement winners and iterate

Consult `references/aso-strategies.md` (A/B Testing section) for detailed testing strategies.

### Scenario: Improving Search Rankings

**Diagnosis:**
Identify ranking position for target keywords:

- Not ranking: Keyword not present or insufficient
- Ranking 50+: Present but low optimization
- Ranking 11-50: Moderate optimization
- Top 10: Good optimization

**Solution for iOS:**

1. Review current keywords in App Name, Subtitle, and Keyword Field
2. Identify high-volume, low-competition opportunities
3. Update App Name or Subtitle if not using primary keyword
4. Optimize 100-char Keyword Field:
   - Remove words already in Name/Subtitle
   - Use comma-separated, no spaces
   - Include semantic variations
5. Submit update
6. Monitor rankings weekly

**Solution for Android:**

1. Analyze description with keyword analyzer:
   ```bash
   python scripts/keyword-analyzer.py description.txt -k "target,keywords,here"
   ```
2. Optimize for 2-3% keyword density
3. Place primary keywords in first 250 characters
4. Distribute keywords naturally throughout description
5. Include semantic variations and long-tail phrases
6. Update Title and Short Description with keywords
7. Monitor rankings weekly

Consult `references/aso-strategies.md` (Keyword Research & Optimization section) for advanced techniques.

### Scenario: Creating Effective Screenshots

**Process:**

1. Determine approach:
   - Device frames with UI + text overlays (most common)
   - Full-screen UI with captions
   - Lifestyle/contextual (for social, fitness apps)
   - Illustrated/graphic (for games, creative apps)

2. Plan screenshot order:
   - Screenshot 1: Hero feature or primary benefit
   - Screenshot 2-3: Key features/benefits
   - Screenshot 4-7: Supporting features
   - Last screenshot: Social proof or CTA

3. Design captions:
   - Large font (min 40pt)
   - High contrast
   - 5-10 words maximum
   - Benefit-focused preferred over feature-focused
   - Example: "Save 10 Hours Every Week" vs. "Time Tracking"

4. Create assets:
   - Use design templates for consistency
   - iOS: Start with 1290x2796 px (6.7" iPhone)
   - Android: Use 1080x1920 px
   - Export high-quality PNG or JPEG

5. Test variations:
   - Different messaging approaches
   - Feature vs. benefit focus
   - With/without device frames
   - Various color schemes

Consult `references/visual-assets-guide.md` for detailed specifications and design strategies.

## Optimization Workflow

**Regular Schedule:**

**Weekly:**

- Monitor keyword rankings (top 10-20 keywords)
- Track conversion metrics
- Respond to user reviews
- Check competitor changes

**Monthly:**

- Comprehensive metrics review
- Plan metadata updates
- Research new keywords
- Analyze A/B test results

**Quarterly:**

- Major optimization cycle
- Update screenshots/video if needed
- Complete metadata refresh
- Competitive landscape analysis
- Plan seasonal campaigns

**With Each App Update:**

- Update "What's New" section (highlight features, not just "bug fixes")
- Consider adding new screenshots for major features
- Update promotional text (iOS)
- Refresh keywords if features changed

## Best Practices Summary

**Keyword Optimization:**

- iOS: Front-load keywords in Name/Subtitle, use full 100-char Keyword Field
- Android: Strategic placement throughout description, 2-3% density
- Both: Research competitors, track rankings, iterate based on data

**Visual Assets:**

- Icon: Simple, recognizable, high contrast, unique in category
- Screenshots: First 2-3 critical, benefit-focused captions, consistent style
- Video: 30 seconds, grab attention in first 3 seconds, design for silent viewing

**Compliance:**

- Privacy policy required and comprehensive
- iOS: App Tracking Transparency, In-App Purchase for digital goods
- Android: Data Safety form accurate, Google Play Billing
- Use compliance checklist before every submission

**Testing:**

- Test one element at a time
- Start with highest-impact items (icon, first 3 screenshots)
- Run to statistical significance
- Implement winners and continue testing

**Description:**

- iOS: Focus on conversion (not indexed)
- Android: Balance search optimization with readability
- Both: Front-load key benefits, include social proof, clear CTA

Use this skill's references, examples, and scripts to implement these strategies effectively and maintain compliant, high-converting app store listings.
