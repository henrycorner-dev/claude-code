---
description: Integrates IAP/ads; balances progression.
allowed-tools: ['Read', 'Glob', 'Grep', 'Write', 'Edit', 'Bash', 'TodoWrite']
---

You are tasked with integrating monetization features into a game project, including In-App Purchases (IAP) and ads, while maintaining balanced progression. Follow these steps:

## 1. Identify Game Engine and Existing Structure

First, ask the user:

- Which game engine are they using (Unity, Godot, Unreal Engine, or other)?
- What type of game is it (mobile, PC, console)?
- What platforms are they targeting (iOS, Android, Steam, etc.)?
- Do they have existing monetization systems in place?

## 2. Choose Monetization Strategy

Based on the game type, recommend and implement appropriate monetization:

### Free-to-Play (F2P) Model:

- Freemium with IAP (consumables, cosmetics, convenience items)
- Ad-supported with optional ad removal via IAP
- Battle Pass / Season Pass system
- Gacha / Loot box system (if appropriate and legal in target regions)

### Premium Model:

- One-time purchase with optional DLC/expansions
- Cosmetic-only IAP
- Ad-free experience

### Hybrid Model:

- Initial purchase + cosmetic IAP
- Premium currency system

## 3. Implement In-App Purchases (IAP)

### For Unity:

- Integrate Unity IAP package (com.unity.purchasing)
- Create an IAP Manager script to handle:
  - Product catalog setup (consumable, non-consumable, subscriptions)
  - Purchase initialization and restoration
  - Receipt validation
  - Transaction callbacks
- Set up platform-specific stores (Apple App Store, Google Play, etc.)
- Create product definitions in code or via Unity IAP Catalog
- Implement purchase UI and confirmation dialogs

### For Godot:

- Use Godot's in-app purchase plugins for iOS/Android
- Create a singleton/autoload for IAP management
- Implement purchase flow with proper error handling
- Set up receipt verification (server-side recommended)
- Handle purchase restoration for non-consumables

### For Unreal Engine:

- Use platform-specific plugins (Apple StoreKit, Google Play)
- Implement IAP blueprint nodes or C++ classes
- Create purchase manager subsystem
- Handle transaction states and callbacks
- Implement receipt validation

## 4. Implement Ad Integration

### Common Ad Networks:

- Unity Ads (Unity)
- Google AdMob (cross-platform)
- IronSource / AppLovin MAX (mediation)
- Facebook Audience Network

### Ad Types to Implement:

1. **Rewarded Video Ads**: Grant in-game rewards (currency, lives, boosts)
   - Place at strategic points (after level failure, low resources, optional boosts)
   - Ensure rewards are balanced and meaningful

2. **Interstitial Ads**: Full-screen ads at natural breaks
   - Show between levels or after game sessions
   - Implement frequency capping (e.g., max 1 per 3 minutes)

3. **Banner Ads**: Persistent small ads
   - Place at top/bottom of screen
   - Consider hiding during gameplay for better UX

4. **Native Ads**: Integrated into UI
   - Make them feel natural to the game's aesthetic

### Implementation Steps:

- Add ad SDK to the project (Unity Ads SDK, AdMob SDK, etc.)
- Create an Ad Manager singleton to handle:
  - Ad initialization
  - Loading and caching ads
  - Showing ads with callbacks
  - Reward distribution for rewarded ads
  - Frequency capping and cooldowns
- Implement ad UI integration points
- Handle ad load failures gracefully
- Add ad removal IAP option (if using F2P model)

## 5. Design Balanced Progression System

A well-balanced progression system is crucial for monetization without frustrating players:

### Currency System:

- **Soft Currency**: Earned through gameplay (coins, gold)
  - Should be reasonably attainable through play
  - Can be boosted via ads or IAP

- **Hard Currency**: Premium currency (gems, diamonds)
  - Primarily obtained through IAP
  - Small amounts from daily rewards, achievements, or ads
  - Should offer meaningful shortcuts but not be required

### Progression Balance:

1. **Early Game (Tutorial & Hook)**:
   - Fast progression to hook players
   - Generous rewards to build habit
   - No monetization pressure

2. **Mid Game (Engagement)**:
   - Gradual difficulty curve increase
   - Introduce optional monetization (cosmetics, convenience)
   - Rewarded ads for optional boosts

3. **Late Game (Retention)**:
   - Steady but slower progression
   - Challenging but achievable goals
   - Premium options for time-saving, not pay-to-win

### Implement Economy Formulas:

Create scripts/configurations for:

- Level reward scaling: `base_reward * (1 + level * 0.1)`
- Upgrade costs: `base_cost * (multiplier ^ upgrade_level)`
- Time gates with optional skips (via ads or premium currency)
- Energy/stamina systems with natural regeneration

## 6. Create Monetization Manager System

Implement a centralized monetization manager that coordinates:

- IAP system
- Ad system
- Player inventory/wallet
- Analytics tracking for:
  - Purchase conversions
  - Ad impressions and completions
  - Revenue per user metrics
  - Progression funnel drop-offs

Example structure:

```
MonetizationManager
├── IAPManager (handles purchases)
├── AdManager (handles ads)
├── CurrencyManager (tracks soft/hard currency)
├── ProgressionManager (balances economy)
└── AnalyticsManager (tracks monetization events)
```

## 7. Implement Safety and Compliance Features

- **Parental Controls**: Age-gate purchases for games with younger audiences
- **Spending Limits**: Optional spending caps
- **COPPA Compliance**: No behavioral ads for children under 13
- **GDPR Compliance**: User consent for targeted ads in EU
- **Refund Handling**: Proper receipt validation to prevent fraud
- **Loot Box Regulations**: Display odds where legally required
- **Currency Clarity**: Clear communication of virtual vs real currency

## 8. User Interface for Monetization

Create or update UI elements:

- Shop/Store interface with tabs (IAP, currency packs, items)
- Ad button for rewarded videos with countdown timer
- Currency display (soft and hard currency)
- Purchase confirmation dialogs
- "No ads" toggle indicator (if purchased)
- Special offer popups (daily deals, limited time offers)
- Battle Pass/Season Pass UI (if applicable)

## 9. Testing and Optimization

Before launch:

- Test all IAP products on development/sandbox accounts
- Verify ad loading and display on different devices
- A/B test pricing tiers and offer placement
- Balance check: Ensure free players can progress without excessive grind
- Test edge cases (no internet, failed transactions, ad load failures)
- Implement analytics to track conversion rates and optimize

## 10. Documentation

Create or update documentation:

- Monetization strategy overview
- IAP product catalog and pricing tiers
- Ad placement strategy and frequency caps
- Economy balance formulas and parameters
- Testing procedures for IAP and ads
- Compliance checklist for target regions

## Output

After implementation is complete:

1. Show the created/modified file structure
2. List all integrated systems (IAP products, ad types)
3. Provide testing instructions for sandbox/development mode
4. Document the progression balance formulas and currency economy
5. Share best practices for ethical monetization
6. Recommend analytics tools for tracking monetization performance

## Best Practices

- **Player-First Design**: Never make the game pay-to-win; monetization should enhance, not gate, the core experience
- **Respect Player Time**: Offer time-saving options, not time-wasting mechanics designed to frustrate
- **Transparency**: Clearly communicate what players are buying
- **Value Proposition**: Ensure all IAP and ad rewards provide genuine value
- **Regular Updates**: Keep the store fresh with seasonal content and limited offers
- **Community Feedback**: Monitor player sentiment and adjust monetization based on feedback
