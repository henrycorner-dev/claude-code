# User Story Examples

This document provides examples of well-written user stories across different domains and project types.

## User Story Format

```
As a [type of user]
I want to [action or feature]
So that [benefit or value]

Acceptance Criteria:
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]
```

---

## E-Commerce Platform

### US-001: Product Search

**Story:**
```
As a customer
I want to search for products by name or keyword
So that I can quickly find items I'm interested in purchasing
```

**Acceptance Criteria:**
- [ ] Given I'm on any page, when I enter a search term in the search box and press Enter, then I see a list of matching products
- [ ] Given I've entered a search term, when there are no matching products, then I see a "no results found" message with suggestions
- [ ] Given I'm viewing search results, when I see products, then each result shows product image, name, price, and rating
- [ ] Given I've searched for a product, when I navigate away and return, then my search term is preserved in the search box

**Priority:** Must have
**Effort:** 5 story points
**Dependencies:** Product catalog API (US-050)

---

### US-002: Add to Cart

**Story:**
```
As a customer
I want to add products to my shopping cart
So that I can purchase multiple items in a single checkout
```

**Acceptance Criteria:**
- [ ] Given I'm viewing a product, when I click "Add to Cart", then the product is added and I see a confirmation message
- [ ] Given I've added a product, when I view my cart, then I see the product with correct name, price, quantity, and image
- [ ] Given I've added a product, when I add it again, then the quantity increases instead of creating a duplicate entry
- [ ] Given I'm not logged in, when I add products to cart, then my cart persists when I log in later
- [ ] Given I'm on mobile, when I add to cart, then the cart icon shows an updated item count badge

**Priority:** Must have
**Effort:** 8 story points
**Dependencies:** User authentication (US-100), Cart persistence (US-003)

---

### US-003: Guest Checkout

**Story:**
```
As a customer who doesn't have an account
I want to complete my purchase without creating an account
So that I can buy quickly without the overhead of registration
```

**Acceptance Criteria:**
- [ ] Given I have items in my cart, when I click checkout, then I see an option for "Guest Checkout"
- [ ] Given I choose guest checkout, when I proceed, then I can enter shipping and payment info without creating an account
- [ ] Given I'm checking out as a guest, when I complete payment, then I receive an order confirmation email
- [ ] Given I've completed a guest order, when I receive my confirmation, then it includes a link to create an account for order tracking

**Priority:** Should have
**Effort:** 13 story points
**Dependencies:** Checkout flow (US-010), Email service integration (US-150)

---

## Project Management Tool

### US-010: Create Task

**Story:**
```
As a project manager
I want to create tasks with title, description, assignee, and due date
So that I can organize work for my team
```

**Acceptance Criteria:**
- [ ] Given I'm viewing a project, when I click "New Task", then a task creation form appears
- [ ] Given the task form is open, when I enter a title and click Save, then the task is created (title is required)
- [ ] Given I'm creating a task, when I fill in optional fields (description, assignee, due date), then those values are saved
- [ ] Given I've created a task, when I view the project task list, then my new task appears at the top
- [ ] Given I'm on mobile, when I create a task, then the form is optimized for touch input

**Priority:** Must have
**Effort:** 5 story points
**Dependencies:** Project structure (US-005)

---

### US-011: Task Comments

**Story:**
```
As a team member
I want to add comments to tasks
So that I can communicate context, updates, and questions about the work
```

**Acceptance Criteria:**
- [ ] Given I'm viewing a task, when I type a comment and click Post, then the comment appears in the activity feed
- [ ] Given a task has comments, when I view the task, then comments are displayed in chronological order with author and timestamp
- [ ] Given I wrote a comment, when I hover over it, then I see options to edit or delete
- [ ] Given someone comments on a task I'm assigned to, when the comment is posted, then I receive a notification
- [ ] Given I'm writing a comment, when I type "@username", then I can mention other users and they receive notifications

**Priority:** Should have
**Effort:** 8 story points
**Dependencies:** User authentication (US-100), Notification system (US-120)

---

### US-012: Kanban Board View

**Story:**
```
As a project manager
I want to view and organize tasks in a Kanban board layout
So that I can visualize workflow stages and move tasks through the process
```

**Acceptance Criteria:**
- [ ] Given I'm viewing a project, when I switch to Board view, then I see columns for each workflow stage (To Do, In Progress, Done)
- [ ] Given I'm in Board view, when I drag a task from one column to another, then the task status updates automatically
- [ ] Given a column has many tasks, when I scroll within the column, then other columns remain visible (independent scrolling)
- [ ] Given I'm viewing the board, when tasks have assignees, then I see the assignee avatar on each task card
- [ ] Given I'm on a tablet, when I use Board view, then drag-and-drop works with touch gestures

**Priority:** Must have
**Effort:** 13 story points
**Dependencies:** Task status workflow (US-015), Drag-and-drop library evaluation

---

## Banking Application

### US-020: View Account Balance

**Story:**
```
As an account holder
I want to view my current account balance
So that I know how much money I have available
```

**Acceptance Criteria:**
- [ ] Given I'm logged in, when I navigate to the dashboard, then I see my account balance prominently displayed
- [ ] Given I have multiple accounts, when I view the dashboard, then I see balances for all my accounts
- [ ] Given my balance is negative, when I view it, then it's displayed in red with a negative sign
- [ ] Given I'm viewing my balance, when it's refreshed, then I see a timestamp of when the balance was last updated
- [ ] Given I'm on mobile, when I view my balance, then I can tap to toggle between showing and hiding the amount (privacy mode)

**Priority:** Must have
**Effort:** 3 story points
**Dependencies:** Account data API (US-100)

---

### US-021: Transfer Funds

**Story:**
```
As an account holder
I want to transfer money between my accounts
So that I can move funds where I need them
```

**Acceptance Criteria:**
- [ ] Given I'm viewing an account, when I click "Transfer", then I see a form to select source account, destination account, and amount
- [ ] Given I'm entering a transfer amount, when the amount exceeds my available balance, then I see an error message and cannot proceed
- [ ] Given I've filled in the transfer form, when I click Submit, then I see a confirmation screen showing all details before finalizing
- [ ] Given I've confirmed a transfer, when it's processed, then both account balances update immediately
- [ ] Given a transfer is completed, when I check my transaction history, then I see the transfer recorded in both accounts

**Priority:** Must have
**Effort:** 13 story points
**Dependencies:** Account balance (US-020), Transaction processing service (US-110)

---

### US-022: Transaction History Export

**Story:**
```
As an account holder
I want to export my transaction history to CSV or PDF
So that I can use it for personal budgeting or tax preparation
```

**Acceptance Criteria:**
- [ ] Given I'm viewing transaction history, when I click "Export", then I see options for CSV and PDF formats
- [ ] Given I select a date range, when I export, then only transactions within that range are included
- [ ] Given I choose CSV format, when the export completes, then I receive a file with columns for date, description, amount, balance
- [ ] Given I choose PDF format, when the export completes, then I receive a formatted document with my account information and transaction table
- [ ] Given my transaction history is large, when I request an export, then I see a progress indicator and receive an email when ready

**Priority:** Should have
**Effort:** 8 story points
**Dependencies:** Transaction history query (US-025), Export service (US-200)

---

## Healthcare Portal

### US-030: Book Appointment

**Story:**
```
As a patient
I want to book an appointment with my doctor
So that I can receive medical care at a convenient time
```

**Acceptance Criteria:**
- [ ] Given I'm logged in, when I navigate to Appointments, then I see a calendar view of available time slots
- [ ] Given I select a date, when available slots are shown, then I only see times when my doctor is available
- [ ] Given I select a time slot, when I confirm, then the appointment is booked and I receive a confirmation email
- [ ] Given I've booked an appointment, when it's within 24 hours of the appointment, then I receive a reminder notification
- [ ] Given I need to cancel, when I view my upcoming appointments, then I see a "Cancel" option that prompts for confirmation

**Priority:** Must have
**Effort:** 13 story points
**Dependencies:** Provider schedule integration (US-300), Calendar component, Email/SMS service

---

### US-031: View Test Results

**Story:**
```
As a patient
I want to view my lab test results online
So that I can access my health information quickly without calling the office
```

**Acceptance Criteria:**
- [ ] Given I have new test results, when I log in, then I see a notification badge on the Test Results section
- [ ] Given I navigate to Test Results, when I view the list, then I see test name, date, and status (normal/abnormal)
- [ ] Given I select a test result, when I view details, then I see individual result values with reference ranges
- [ ] Given a result is abnormal, when I view it, then it's highlighted and includes doctor's notes if available
- [ ] Given I want to share results, when I click "Share", then I can download a PDF or send via secure message to my doctor

**Priority:** Should have
**Effort:** 8 story points
**Dependencies:** EHR integration (US-350), PDF generation service

---

### US-032: Medication Refill Request

**Story:**
```
As a patient
I want to request prescription refills online
So that I can renew my medications without calling the pharmacy
```

**Acceptance Criteria:**
- [ ] Given I'm viewing my medications, when I see a prescription, then I see a "Request Refill" button for refillable prescriptions
- [ ] Given I click "Request Refill", when I submit, then my pharmacy receives the request and I see a confirmation message
- [ ] Given I've requested a refill, when I check status, then I see whether it's pending, approved, or ready for pickup
- [ ] Given a prescription has no refills remaining, when I view it, then I see "Request Renewal" which contacts my doctor
- [ ] Given my refill is ready, when the pharmacy updates status, then I receive a notification

**Priority:** Should have
**Effort:** 13 story points
**Dependencies:** Pharmacy integration (US-360), Prescription data, Notification service

---

## SaaS Analytics Platform

### US-040: Custom Dashboard

**Story:**
```
As a data analyst
I want to create custom dashboards with multiple widgets
So that I can monitor the metrics most important to my role
```

**Acceptance Criteria:**
- [ ] Given I'm viewing dashboards, when I click "Create Dashboard", then I can name it and add it to my list
- [ ] Given I'm editing a dashboard, when I click "Add Widget", then I see a catalog of available widget types (chart, table, metric, etc.)
- [ ] Given I've added a widget, when I configure it, then I can select data source, metrics, filters, and visualization options
- [ ] Given I have multiple widgets, when I'm in edit mode, then I can drag to reposition and resize widgets
- [ ] Given I've created a dashboard, when I share it with teammates, then they can view it but only I can edit (unless I grant permission)

**Priority:** Must have
**Effort:** 21 story points
**Dependencies:** Widget library (US-045), Data source connectors (US-400)

---

### US-041: Real-Time Alerts

**Story:**
```
As a product manager
I want to set up alerts that notify me when metrics cross thresholds
So that I can respond quickly to important changes in user behavior
```

**Acceptance Criteria:**
- [ ] Given I'm viewing a metric, when I click "Create Alert", then I can define a threshold condition (greater than, less than, percent change)
- [ ] Given I'm creating an alert, when I set parameters, then I can choose notification channels (email, Slack, SMS)
- [ ] Given an alert is triggered, when the condition is met, then I receive a notification with metric value and link to dashboard
- [ ] Given I have multiple alerts, when I view my alerts list, then I see which are active, triggered recently, or paused
- [ ] Given an alert is too noisy, when I edit it, then I can add a "cooldown period" to avoid repeated notifications

**Priority:** Should have
**Effort:** 13 story points
**Dependencies:** Notification infrastructure (US-420), Metric evaluation engine (US-410)

---

### US-042: SQL Query Builder

**Story:**
```
As a data analyst
I want to write custom SQL queries against my data warehouse
So that I can perform ad-hoc analysis beyond pre-built reports
```

**Acceptance Criteria:**
- [ ] Given I'm on the Explore page, when I open the SQL editor, then I can write and execute SQL queries
- [ ] Given I'm writing a query, when I type table or column names, then I get autocomplete suggestions based on schema
- [ ] Given I execute a query, when it completes, then results are displayed in a table with pagination for large result sets
- [ ] Given my query has an error, when I execute it, then I see a helpful error message indicating the problem
- [ ] Given I've written a useful query, when I save it, then I can name it, add to a folder, and share with my team

**Priority:** Should have
**Effort:** 13 story points
**Dependencies:** Data warehouse connection (US-400), Query execution service (US-430)

---

## Mobile Fitness App

### US-050: Log Workout

**Story:**
```
As a fitness enthusiast
I want to log my workouts with exercises, sets, reps, and weight
So that I can track my progress over time
```

**Acceptance Criteria:**
- [ ] Given I'm on the home screen, when I tap "Log Workout", then I can start a new workout session
- [ ] Given I'm logging a workout, when I add an exercise, then I can search or browse from a library of exercises
- [ ] Given I've selected an exercise, when I log sets, then I can record reps, weight, and rest time for each set
- [ ] Given I'm in an active workout, when I complete it, then I see a summary with total volume, duration, and exercises
- [ ] Given I've completed a workout, when I view history, then I see it listed with date and can view full details

**Priority:** Must have
**Effort:** 13 story points
**Dependencies:** Exercise library (US-055), Workout data model

---

### US-051: Progress Photos

**Story:**
```
As a user working towards fitness goals
I want to take and store progress photos
So that I can visually track my physical transformation
```

**Acceptance Criteria:**
- [ ] Given I'm in the Progress section, when I tap "Add Photo", then my camera opens to take a photo
- [ ] Given I've taken a photo, when I save it, then I can add a date and optional note
- [ ] Given I have multiple photos, when I view them, then they're displayed in chronological order in a grid
- [ ] Given I'm viewing photos, when I select before/after dates, then I can see side-by-side comparison
- [ ] Given I want privacy, when I enable Privacy Mode in settings, then photos require Face ID/fingerprint to view

**Priority:** Should have
**Effort:** 8 story points
**Dependencies:** Image storage (US-500), Camera integration

---

### US-052: Workout Reminders

**Story:**
```
As a user with fitness goals
I want to set reminders for my workout schedule
So that I stay consistent with my training routine
```

**Acceptance Criteria:**
- [ ] Given I'm in Settings, when I go to Reminders, then I can enable workout notifications
- [ ] Given I enable reminders, when I set a schedule, then I can choose days of week and times
- [ ] Given a reminder is scheduled, when the time arrives, then I receive a push notification
- [ ] Given I receive a reminder, when I tap it, then the app opens to start logging a workout
- [ ] Given I've worked out already, when a reminder fires, then it's automatically dismissed (don't remind twice)

**Priority:** Could have
**Effort:** 5 story points
**Dependencies:** Push notification service (US-510), Workout detection logic

---

## Key Characteristics of Good User Stories

Based on these examples, effective user stories:

1. **Follow the standard format:** "As a [user], I want [action], so that [benefit]"
2. **Focus on user value:** The "so that" explains why the feature matters
3. **Include specific acceptance criteria:** Testable conditions using Given-When-Then format
4. **Are appropriately sized:** Not too large (epic) or too small (task)
5. **Specify priority:** Must/Should/Could have based on value and dependencies
6. **Note dependencies:** Call out what else must exist for this story to work
7. **Consider all users:** Account for different personas, devices, and contexts
8. **Include edge cases:** Cover error states, validation, and boundary conditions
9. **Address non-functional aspects:** Performance, security, accessibility as relevant

## Anti-Patterns to Avoid

❌ **Too technical:** "Implement OAuth 2.0 authentication flow"
✅ **User-focused:** "As a user, I want to log in securely with my email, so that my account is protected"

❌ **No clear value:** "As a user, I want a settings page"
✅ **Clear benefit:** "As a user, I want to customize notification preferences, so that I only receive alerts I care about"

❌ **Implementation-specific:** "As a developer, I want to use Redis for caching"
✅ **Outcome-focused:** "As a user, I want pages to load in under 2 seconds, so that I don't waste time waiting"

❌ **Too vague:** "Improve the checkout process"
✅ **Specific action:** "As a customer, I want to save my payment method, so that I can check out faster on future purchases"

## Using These Examples

When writing your own user stories:
1. Review examples in a similar domain for inspiration
2. Adapt the format and acceptance criteria to your context
3. Ensure stories are testable and provide clear user value
4. Collaborate with stakeholders to refine and validate
5. Break down epics into appropriately-sized stories
