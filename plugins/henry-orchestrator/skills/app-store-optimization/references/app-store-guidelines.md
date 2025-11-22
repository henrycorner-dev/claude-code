# iOS App Store Review Guidelines Reference

This document provides detailed information about Apple App Store Review Guidelines for compliance checking.

## Critical Rejection Categories

### 1. Safety (Guideline 1)

**Objectionable Content (1.1)**
- No offensive, discriminatory, or mean-spirited content
- No realistic portrayals of violence toward specific groups
- No defamatory, discriminatory, or bullying content
- Religious commentary must be informative and educational

**User Generated Content (1.2)**
- Implement content filtering and reporting mechanisms
- Remove objectionable content within 24 hours
- Block abusive users
- Publish contact information for reporting concerns
- Use machine learning and human review for moderation

**Kids Category (1.3)**
- No direct links out of the app
- No personalized ads or behavioral tracking
- No third-party analytics
- Follow COPPA and privacy laws
- Parental gates for purchases or external links

**Physical Harm (1.4)**
- Medical apps must have disclaimers and comply with regulations
- Drug dosage calculators must be from approved entities
- No apps encouraging dangerous behavior
- Apps dealing with health data need privacy policies

**Developer Information (1.5)**
- Apps must be published under correct developer name
- Organizations must use their registered business name
- No impersonating others

### 2. Performance (Guideline 2)

**App Completeness (2.1)**
- Submit complete apps with all features functional
- Include necessary metadata and URLs
- Enable backend services before submission
- Demo account required if login needed
- Include detailed explanation of non-obvious features

**Beta Testing (2.2)**
- Use TestFlight for beta versions
- No public distribution of beta builds
- Apps still in development will be rejected

**Accurate Metadata (2.3)**
- Keep app description, screenshots, and previews accurate
- Screenshots must show the app in use
- No placeholder or mock content
- App name should match the actual app

**Hardware Compatibility (2.4)**
- Apps must run on currently shipping hardware
- Use native iOS APIs
- Optimize for device capabilities
- Include features appropriate for device type

**Software Requirements (2.5)**
- Use only public APIs
- No private API usage
- Apps must be self-contained
- No downloading executable code
- Interpreted code frameworks allowed (React Native, etc.)

### 3. Business (Guideline 3)

**Payments (3.1)**
- In-app purchases required for digital content
- No alternative payment mechanisms for digital goods
- Physical goods/services can use external payments
- Free apps with paid features must use IAP
- Subscriptions must use App Store payment system

**Other Business Model Issues (3.2)**
- No unfair pricing or spam
- No app discovery apps
- No cryptocurrency mining
- Charity apps must be from certified nonprofits
- Sweepstakes must have free entry method

### 4. Design (Guideline 4)

**Copycats (4.1)**
- No copying popular apps
- Create original designs
- No misleading similarity to other apps

**Minimum Functionality (4.2)**
- Apps must provide substantial functionality
- No apps that are simply websites
- No single function marketing materials
- Template apps must be unique

**Spam (4.3)**
- No creating multiple Bundle IDs of the same app
- No flooding with similar apps
- App should provide unique value

**Extensions (4.4)**
- Extensions must provide value in host app
- No marketing or ads
- Limited functionality in Today widget

**Apple Sites and Services (4.5)**
- No misusing Apple services
- Follow Apple Music API rules
- Push Notifications must provide value
- No VoIP for tracking or advertising

### 5. Legal (Guideline 5)

**Privacy (5.1)**
- Must have privacy policy URL
- Describe data collection and usage clearly
- User consent required before collecting data
- No tracking without user permission
- Third-party analytics must comply with policies
- Kids apps: strict privacy requirements

**Intellectual Property (5.2)**
- Must own or license all content
- No unauthorized use of copyrighted material
- No trademark violations
- Provide proof of rights if requested

**Gaming, Gambling, and Lotteries (5.3)**
- Sweepstakes must be free to enter
- Gambling apps need licensing
- Follow local gambling laws
- Lottery apps must be from official providers

**VPN Apps (5.4)**
- Use NEVPNManager API
- No selling user data
- Clear privacy policy about data handling

## Common Rejection Reasons

### Metadata Rejection (2.3)
- Screenshots don't match app
- App name misleading
- Keywords stuffing or irrelevant
- Category doesn't match functionality

**Fix:**
- Ensure screenshots show actual app usage
- Use accurate, descriptive app name
- Choose relevant keywords only
- Select appropriate category

### Incomplete Information (2.1)
- Demo account doesn't work
- Features require external setup
- Contact information missing
- No explanation of special features

**Fix:**
- Provide working demo credentials
- Include setup instructions in review notes
- Add support URL and email
- Explain non-obvious features clearly

### Privacy Policy Issues (5.1.1)
- No privacy policy provided
- Privacy policy URL doesn't work
- Privacy policy doesn't cover data collection
- No user consent for tracking

**Fix:**
- Create comprehensive privacy policy
- Host on accessible URL
- Describe all data collection
- Implement consent dialogs

### 4.3 Spam
- Multiple similar apps
- Low-quality content
- Minimal functionality
- Template app without differentiation

**Fix:**
- Consolidate similar apps
- Add substantial features
- Create unique value proposition
- Differentiate from templates

### 5.2 IP Violations
- Using copyrighted images
- Unauthorized brand usage
- Celebrity names/images
- Popular character references

**Fix:**
- Use only owned/licensed content
- Remove unauthorized trademarks
- Get permission for any third-party content
- Use generic references

## Pre-Submission Checklist

**Binary Checks:**
- [ ] App runs without crashing
- [ ] All advertised features work
- [ ] No placeholder content
- [ ] Tested on current iOS version
- [ ] No private API usage

**Metadata Checks:**
- [ ] Screenshots show actual app
- [ ] App description accurate
- [ ] Keywords relevant
- [ ] Category appropriate
- [ ] Privacy policy URL works
- [ ] Support URL works

**Content Checks:**
- [ ] All content owned/licensed
- [ ] No offensive material
- [ ] Age rating accurate
- [ ] Complies with local laws

**Business Checks:**
- [ ] Payment methods compliant
- [ ] IAP for digital content
- [ ] Subscriptions properly configured
- [ ] Pricing appropriate

**Privacy Checks:**
- [ ] Privacy policy complete
- [ ] User consent implemented
- [ ] Data collection disclosed
- [ ] Tracking transparency in place

## App Store Connect Configuration

**App Information:**
- Name: 30 characters max
- Subtitle: 30 characters max
- Privacy Policy URL: Required if collecting data
- Category: Choose most relevant
- Content Rights: Must own/license

**Version Information:**
- What's New: Describe updates clearly
- Promotional Text: Can update without review
- Description: Up to 4000 characters
- Keywords: 100 characters, comma-separated

**Age Rating:**
- Complete questionnaire accurately
- Consider all content types
- Choose appropriate rating
- Update if content changes

**Review Information:**
- Notes: Explain non-obvious features
- Demo Account: Provide working credentials
- Contact: Valid email and phone
- Attachments: Supporting documentation

## Recent Guideline Updates

**iOS 14.5+ (April 2021):**
- App Tracking Transparency required
- Must request permission to track
- Honor user's tracking preferences

**iOS 15+ (September 2021):**
- In-app events support
- Product page optimization
- Custom product pages

**iOS 16+ (September 2022):**
- Enhanced privacy requirements
- Additional data disclosure
- Improved metadata guidelines

**iOS 17+ (September 2023):**
- Updated privacy nutrition labels
- Enhanced child safety features
- Stricter data handling requirements

## Resources

**Official Documentation:**
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store Connect Help: https://help.apple.com/app-store-connect/
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

**Important Sections:**
- Privacy Policy Requirements: https://developer.apple.com/app-store/review/guidelines/#privacy
- In-App Purchase: https://developer.apple.com/app-store/review/guidelines/#payments
- Business Models: https://developer.apple.com/app-store/review/guidelines/#business

**Appeals Process:**
- Resolution Center: In App Store Connect
- App Review Board: For guideline disputes
- Contact: https://developer.apple.com/contact/app-store/
