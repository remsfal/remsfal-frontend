# Issue Details View - Wireframe

**Version:** 1.0  
**Date:** 2025-12-06  
**Type:** Conceptual Mockup (Non-Implementation)  
**Design Reference:** ProjectSettings View

---

## Overview

This wireframe defines the structural layout for the **Issue Details View** using a card-based design pattern consistent with the ProjectSettings view. All sections use PrimeVue Card components with TailwindCSS utility classes.

**Backend Schema Alignment:**
- Field names and types match the OpenAPI schema definitions from `ticketing-schema.ts`
- Uses `IssueJson` schema fields:
  - `id` (UUID) - Issue identifier
  - `title` (string) - Issue title
  - `description` (string) - Issue description
  - `type` (Type enum: APPLICATION | TASK | DEFECT | MAINTENANCE)
  - `status` (Status enum: PENDING | OPEN | IN_PROGRESS | CLOSED | REJECTED)
  - `ownerId` (UUID) - Issue owner/assignee
  - `reporterId` (UUID) - Issue reporter
  - `projectId` (UUID) - Associated project
  - `tenancyId` (UUID) - Optional tenancy reference
  - `blockedBy` (UUID) - Single issue blocking this one
  - `relatedTo` (UUID) - Single related issue
  - `duplicateOf` (UUID) - Single duplicate issue reference
- Project references use `ProjectItemJson` structure (id, name, memberRole)
- User roles follow `MemberRole` enum values (PROPRIETOR, MANAGER, LESSOR, STAFF, COLLABORATOR)
- Chat/communication endpoint: `/ticketing/v1/issues/{issueId}/chats`

**Navigation:**
- Breadcrumb navigation and previous/next issue navigation are **optional future enhancements**
- Current wireframe includes a "Back" button for basic navigation

---

## Layout Structure

### Page Container
```
<main class="grid grid-cols-12 gap-4">
  <!-- All cards span full width: col-span-12 -->
</main>
```

---

## Card Sections

### 1. Issue Overview Card

**Purpose:** Display key issue identification and status information at a glance.

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Issue Overview" (font-semibold text-xl)
└── Content:
    ├── Issue ID: [Placeholder: UUID from IssueJson.id]
    ├── Issue Title: [Placeholder: "Fix login authentication bug" - IssueJson.title]
    └── Current Status: [Badge: OPEN | IN_PROGRESS | CLOSED | PENDING | REJECTED]
        └── Maps to: IssueJson.status (Status enum)
```

**Placeholder Fields:**
- Issue ID → `id` (UUID, read-only, auto-generated)
- Issue Title → `title` (string, editable)
- Status → `status` (Status enum: PENDING, OPEN, IN_PROGRESS, CLOSED, REJECTED)

---

### 2. Issue Description Card

**Purpose:** Display detailed issue description with markdown support.

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Description" (font-semibold text-xl)
└── Content:
    ├── Markdown Preview Area
    │   └── [Placeholder: Rich text formatted content with headers, lists, code blocks]
    └── Edit Button (icon="pi pi-pencil")
```

**Placeholder Fields:**
- Description text → `description` (string, markdown-enabled)
- Edit/Preview toggle functionality (placeholder only)

**Note:** The `description` field in IssueJson supports markdown formatting. Markdown rendering component to be determined (e.g., vue-markdown or similar).

---

### 3. Metadata Card

**Purpose:** Display issue metadata including people, dates, and classification.

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Metadata" (font-semibold text-xl)
└── Content: (grid layout for field-value pairs)
    ├── Reporter: [Placeholder: "John Doe" with avatar icon]
    │   └── Maps to: IssueJson.reporterId (UUID, optional)
    ├── Owner/Assignee: [Placeholder: "Jane Smith" with avatar + dropdown]
    │   └── Maps to: IssueJson.ownerId (UUID, optional)
    ├── Project: [Placeholder: "Building A Renovation" - read-only link]
    │   └── Maps to: IssueJson.projectId (UUID, displayed via ProjectItemJson)
    ├── Issue Type: [Placeholder: "TASK" - badge or label]
    │   └── Maps to: IssueJson.type (Type enum: APPLICATION | TASK | DEFECT | MAINTENANCE)
    ├── Status: [Placeholder: "IN_PROGRESS" - colored badge]
    │   └── Maps to: IssueJson.status (Status enum: PENDING | OPEN | IN_PROGRESS | CLOSED | REJECTED)
    ├── Tenancy: [Placeholder: "Apartment 3B - Smith Family" - optional link]
    │   └── Maps to: IssueJson.tenancyId (UUID, optional)
    ├── Created At: [Placeholder: "2025-12-01 10:30:00"]
    │   └── Backend timestamp field (not in IssueJson - from audit metadata)
    └── Last Modified: [Placeholder: "2025-12-05 14:22:15"]
        └── Backend timestamp field (not in IssueJson - from audit metadata)
```

**Placeholder Fields:**
- Reporter → `reporterId` (UUID, optional - resolves to user with avatar)
- Owner/Assignee → `ownerId` (UUID, optional - user dropdown/autocomplete)
- Project → `projectId` (UUID, optional - displayed using ProjectItemJson structure with name and memberRole)
- Issue Type → `type` (Type enum: APPLICATION, TASK, DEFECT, MAINTENANCE - displayed as badge)
- Status → `status` (Status enum: PENDING, OPEN, IN_PROGRESS, CLOSED, REJECTED - colored badge)
- Tenancy → `tenancyId` (UUID, optional - links to associated tenancy)
- Created timestamp (from backend audit metadata)
- Modified timestamp (from backend audit metadata)

**Schema Notes:**
- All UUID fields are optional in IssueJson
- "Assignee" in UI terminology maps to `ownerId` field in backend schema
- ProjectItemJson provides: `id` (UUID), `name` (string), `memberRole` (MemberRole enum)

---

### 4. Relations Card

**Purpose:** Manage relationships between issues (blocks, duplicates, related).

**Important Schema Note:**  
In `IssueJson`, the relation fields (`blockedBy`, `relatedTo`, `duplicateOf`) each store a **single UUID**, not an array. The wireframe shows multiple items for UI illustration purposes, but the backend currently supports only one relation per type.

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Related Issues" (font-semibold text-xl)
└── Content:
    ├── Section: "Blocks" (collapsed by default)
    │   ├── Note: "Issues that this issue blocks (reverse lookup, not in IssueJson)"
    │   ├── List placeholder: Display issues where their blockedBy field equals this issue's ID
    │   └── Action: [Informational only - managed from blocked issues]
    │
    ├── Section: "Blocked By" (collapsed by default)
    │   ├── Maps to: IssueJson.blockedBy (single UUID, optional)
    │   ├── Placeholder: "#ISSUE-89: Setup Redis caching infrastructure"
    │   │   └── Status badge: IN_PROGRESS | Owner: M. Schmidt
    │   └── Action: [Change/Remove button to update blockedBy field]
    │
    ├── Section: "Duplicate Of" (collapsed by default)
    │   ├── Maps to: IssueJson.duplicateOf (single UUID, optional)
    │   ├── Placeholder: "#ISSUE-67: Fix authentication timeout on login page"
    │   │   └── Status badge: CLOSED
    │   └── Action: [Change/Remove button - sets this issue to duplicate]
    │
    └── Section: "Related To" (collapsed by default)
        ├── Maps to: IssueJson.relatedTo (single UUID, optional)
        ├── Placeholder: "#ISSUE-201: Update user documentation for login flow"
        │   └── Status badge: OPEN
        └── Action: [Change/Remove button to update relatedTo field]
```

**Example Placeholder Content:**

**Blocks Section (Reverse Lookup):**
- This section shows issues that are blocked by THIS issue
- Populated by querying other issues where their `blockedBy` UUID equals this issue's `id`
- Example: "#ISSUE-156: Implement OAuth2 token refresh mechanism" (IN_PROGRESS)
- Not directly stored in this issue's IssueJson

**Blocked By Section:**
- Maps to: IssueJson.blockedBy (single UUID)
- Example: #ISSUE-89: Setup Redis caching infrastructure (IN_PROGRESS) - Owner: M. Schmidt
- Action: Change or remove the blocking issue reference

**Duplicate Of Section:**
- Maps to: IssueJson.duplicateOf (single UUID)
- Example: #ISSUE-67: Fix authentication timeout on login page (CLOSED)
- Note: Marking as duplicate may auto-close this issue

**Related To Section:**
- Maps to: IssueJson.relatedTo (single UUID)
- Example: #ISSUE-201: Update user documentation for login flow (OPEN)
- Action: Change or remove the related issue reference

**Placeholder Elements:**
- Accordion/Expandable sections for each relation type
- Issue reference with clickable link to navigate to related issue
- Status badges showing current state of related issues
- Change/Remove action buttons to modify relation fields
- Empty state messaging when no relation is set

**Backend Schema Constraints:**
- Each relation type (`blockedBy`, `relatedTo`, `duplicateOf`) stores only a **single UUID**
- "Blocks" section requires reverse lookup (query issues where their `blockedBy` equals this issue's `id`)
- All relation fields are optional in IssueJson

---

### 5. Chats Section (PrimeVue TabView Concept)

**Purpose:** Display different communication channels using tabbed interface.

**Backend Integration:**
- Endpoint: `GET /ticketing/v1/issues/{issueId}/chats`
- Returns chat sessions for the issue
- Schema details to be determined (currently returns `unknown` type in API spec)

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Communication" (font-semibold text-xl)
└── Content:
    └── TabView Component
        ├── Tab 1: "Comments" (active)
        │   └── Content:
        │       ├── Comment Item 1
        │       │   ├── Avatar: [Circle with initials "AJ" in blue]
        │       │   ├── Username: "Alice Johnson" (font-medium text-gray-900)
        │       │   ├── Role badge: "STAFF" (small gray badge - from MemberRole enum)
        │       │   ├── Timestamp: "Dec 5, 2025 at 9:15 AM" (text-gray-500 text-sm)
        │       │   └── Message: "I reviewed the authentication flow and noticed this 
        │       │       issue is similar to #ISSUE-67. The root cause appears to be 
        │       │       session timeout handling. I recommend checking the Redis 
        │       │       configuration before proceeding with the fix."
        │       │
        │       ├── Comment Item 2
        │       │   ├── Avatar: [Circle with initials "BW" in green]
        │       │   ├── Username: "Bob Williams" (font-medium text-gray-900)
        │       │   ├── Role badge: "MANAGER" (small gray badge - from MemberRole enum)
        │       │   ├── Timestamp: "Dec 5, 2025 at 10:30 AM" (text-gray-500 text-sm)
        │       │   └── Message: "@Alice Johnson Good catch! I've started working on 
        │       │       this issue. Planning to implement the token refresh mechanism 
        │       │       first, then update the session management. ETA: 2 business days."
        │       │
        │       └── Add Comment Section:
        │           ├── Textarea: [Placeholder: "Write a comment..." with markdown support icon]
        │           ├── Formatting toolbar: [Bold, Italic, Code, Link buttons]
        │           └── Button: "Post Comment" (primary button, right-aligned)
        │
        └── Tab 2: "Activity Log" (inactive)
            └── Content:
                ├── Activity Entry 1
                │   ├── Icon: [pi pi-refresh in orange circle]
                │   ├── User avatar: [Circle with initials "JS" in purple]
                │   ├── User: "Jane Smith" (font-medium) - Role: MANAGER
                │   ├── Action: "changed status from OPEN to IN_PROGRESS"
                │   ├── Timestamp: "Dec 4, 2025 at 4:45 PM" (text-gray-500)
                │   └── Additional info: Previous: OPEN → Current: IN_PROGRESS
                │
                ├── Activity Entry 2
                │   ├── Icon: [pi pi-user in blue circle]
                │   ├── User avatar: [Circle with initials "JD" in red]
                │   ├── User: "John Doe" (font-medium) - Role: PROPRIETOR
                │   ├── Action: "assigned this issue to Jane Smith (updated ownerId)"
                │   ├── Timestamp: "Dec 3, 2025 at 11:20 AM" (text-gray-500)
                │   └── Additional info: ownerId: null → Jane Smith's UUID
```

**Example Placeholder Content:**

**Comments Tab (2 example messages):**

1. **Comment by Alice Johnson** (STAFF)
   - Avatar: Circle with "AJ" initials (blue background)
   - Role: STAFF (MemberRole enum)
   - Posted: Dec 5, 2025 at 9:15 AM
   - Message: "I reviewed the authentication flow and noticed this issue is similar to #ISSUE-67. The root cause appears to be session timeout handling. I recommend checking the Redis configuration before proceeding with the fix."

2. **Comment by Bob Williams** (MANAGER)
   - Avatar: Circle with "BW" initials (green background)
   - Role: MANAGER (MemberRole enum)
   - Posted: Dec 5, 2025 at 10:30 AM
   - Message: "@Alice Johnson Good catch! I've started working on this issue. Planning to implement the token refresh mechanism first, then update the session management. ETA: 2 business days."

**Activity Log Tab (2 example entries):**

1. **Status Change Activity**
   - Icon: pi pi-refresh (orange)
   - User: Jane Smith (avatar with "JS") - Role: MANAGER
   - Action: "changed status from OPEN to IN_PROGRESS"
   - Timestamp: Dec 4, 2025 at 4:45 PM
   - Details: Previous: OPEN → Current: IN_PROGRESS

2. **Assignment Activity**
   - Icon: pi pi-user (blue)
   - User: John Doe (avatar with "JD") - Role: PROPRIETOR
   - Action: "assigned this issue to Jane Smith (ownerId updated)"
   - Timestamp: Dec 3, 2025 at 11:20 AM
   - Details: ownerId: null → Jane Smith's UUID

**Placeholder Elements:**
- PrimeVue TabView with 2 tabs
- Comment cards with user avatars (circular with initials)
- User role badges using MemberRole enum (PROPRIETOR, MANAGER, LESSOR, STAFF, COLLABORATOR)
- Timestamp formatting (relative or absolute)
- Activity timeline entries with icons
- Comment input area with markdown support
- Mention support (@username)

**Implementation Note:** Use `primevue/tabview` and `primevue/tabpanel` components.

---

### 6. Future Fields Placeholder

**Purpose:** Reserve space for backend-provided fields that will be added later.

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full border-dashed")
├── Title: "Additional Information" (font-semibold text-xl text-gray-400)
└── Content:
    ├── Placeholder Section Header: "Future Backend Fields" (text-gray-500 italic)
    │
    ├── Example Item 1: Attachments
    │   ├── Icon: [pi pi-paperclip]
    │   ├── Label: "Attachments" (text-gray-600)
    │   └── Placeholder content:
    │       ├── File 1: "screenshot-login-error.png" (2.4 MB) - Uploaded Dec 3, 2025
    │       ├── File 2: "authentication-flow-diagram.pdf" (856 KB) - Uploaded Dec 4, 2025
    │       └── Action: [+ Upload Attachment button]
    │
    ├── Example Item 2: Time Tracking
    │   ├── Icon: [pi pi-clock]
    │   ├── Label: "Time Tracking" (text-gray-600)
    │   └── Placeholder content:
    │       ├── Estimated time: 8 hours
    │       ├── Time logged: 5.5 hours
    │       ├── Remaining: 2.5 hours
    │       └── Action: [Log Time button]
    │
    ├── Example Item 3: Workflow Stage
    │   ├── Icon: [pi pi-sitemap]
    │   ├── Label: "Workflow Stage" (text-gray-600)
    │   └── Placeholder content:
    │       ├── Current Stage: "In Development"
    │       ├── Stage Progress: 3 of 5 stages completed
    │       ├── Stage Timeline: [Backlog → Analysis → Development → Testing → Done]
    │       └── Next Stage: "Testing" (available when development complete)
    │
    ├── Example Item 4: Tags
    │   ├── Icon: [pi pi-tag]
    │   ├── Label: "Tags" (text-gray-600)
    │   └── Placeholder content:
    │       ├── Tags: [authentication] [security] [backend] [high-priority]
    │       └── Action: [+ Add Tag button with autocomplete]
    │
    └── Example Item 5: Custom Fields / Metadata
        ├── Icon: [pi pi-tags]
        ├── Label: "Custom Metadata" (text-gray-600)
        └── Placeholder content:
            ├── Field: "Affected Modules" → Value: "Authentication, Session Management"
            ├── Field: "Client Environment" → Value: "Production, Staging"
            └── Field: "Severity Level" → Value: "Critical - affects user login"
```

**Example Placeholder Content:**

**1. Attachments**
- Icon: pi pi-paperclip (gray)
- Files:
  - screenshot-login-error.png (2.4 MB) - Uploaded by A. Johnson on Dec 3, 2025
  - authentication-flow-diagram.pdf (856 KB) - Uploaded by B. Williams on Dec 4, 2025
  - session-logs.txt (124 KB) - Uploaded by J. Smith on Dec 5, 2025
- Action: Upload Attachment button

**2. Time Tracking**
- Icon: pi pi-clock (gray)
- Estimated Time: 8 hours
- Time Logged: 5.5 hours (by 2 team members)
- Remaining: 2.5 hours
- Action: Log Time button
- Time entries:
  - Bob Williams: 3 hours - "Initial investigation and setup"
  - Jane Smith: 2.5 hours - "Implementation of token refresh"

**3. Workflow Stage**
- Icon: pi pi-sitemap (gray)
- Current Stage: "In Development"
- Stage Progress: 3 of 5 stages completed
- Stage Timeline Visual: [✓ Backlog] → [✓ Analysis] → [• Development] → [Testing] → [Done]
- Next Stage: "Testing" (available when development work is complete)
- Stage Description: "Development phase includes coding, unit testing, and code review"

**4. Tags**
- Icon: pi pi-tag (gray)
- Comma-separated labels for categorization and filtering
- Example Tags: 
  - [authentication] - blue badge
  - [security] - red badge
  - [backend] - green badge
  - [high-priority] - orange badge
- Action: Add Tag button with autocomplete dropdown
- Use case: Filter and search issues by tags across the project

**5. Custom Fields / Metadata**
- Icon: pi pi-tags (gray)
- Affected Modules: "Authentication, Session Management, User Service"
- Client Environment: "Production, Staging"
- Severity Level: "Critical - affects user login functionality"
- Browser Compatibility: "All modern browsers (Chrome, Firefox, Safari)"
- API Version: "v2.3.1"

**Visual Style:**
- Dashed border (border-dashed border-gray-300) to indicate placeholder nature
- Muted colors (gray-400, gray-500) for all text
- Italic text for section descriptions
- Icons with reduced opacity (opacity-50)
- "Future field" badge in top-right corner of card
- Light gray background (bg-gray-50) for the entire card content

**Note:** These fields represent examples of what might be added in future iterations. Actual fields will be determined by backend API capabilities and business requirements.

---

## Visual Design Guidelines

### Card Styling
- **Container:** `Card` component from PrimeVue
- **Layout:** `class="flex flex-col gap-4 basis-full"`
- **Spacing:** Consistent `gap-4` between elements
- **Typography:**
  - Card titles: `font-semibold text-xl`
  - Field labels: `font-medium text-gray-700`
  - Values: Regular text weight

### Colors & States
- **Primary Actions:** Default PrimeVue button styling
- **Status Badges** (from Status enum: PENDING | OPEN | IN_PROGRESS | CLOSED | REJECTED):
  - PENDING: Gray/Neutral color
  - OPEN: Blue/Info color
  - IN_PROGRESS: Orange/Warning color
  - CLOSED: Green/Success color
  - REJECTED: Red/Danger color
- **Type Badges** (from Type enum: APPLICATION | TASK | DEFECT | MAINTENANCE):
  - APPLICATION: Purple/Primary color
  - TASK: Blue/Info color
  - DEFECT: Red/Danger color
  - MAINTENANCE: Orange/Warning color

### Responsive Behavior
- All cards: `col-span-12` (full width)
- Use PrimeVue's responsive components
- Stack elements vertically on mobile

---

## Questions / Assumptions

### 1. **Issue Relations Management**
**Question:** The backend schema (`IssueJson`) currently stores only **single UUIDs** for relations (`blockedBy`, `relatedTo`, `duplicateOf`). Should the UI support:
- (A) Only one relation per type (matching backend schema exactly)?
- (B) Multiple relations per type (requiring backend schema expansion to arrays)?
- (C) A "Blocks" section via reverse lookup (querying issues where their `blockedBy` equals this issue's ID)?

**Current Assumption:** Using single relations as defined in IssueJson schema. "Blocks" section would require reverse lookup query.

---

### 2. **Markdown Editor vs. Preview**
**Question:** For the Description Card, should there be inline editing with live preview, or separate Edit/Preview modes? Should we use a specific markdown library recommendation?

**Current Assumption:** Using a toggle between Preview and Edit modes, similar to GitHub's issue description editor pattern.

---

### 3. **Communication Tabs**
**Question:** Are "Comments" and "Activity Log" the only two tabs needed, or should we plan for additional tabs like "Attachments" or "History"?

**Current Assumption:** Two tabs only (Comments, Activity Log) based on common issue tracking patterns. Activity log auto-generates from system events.

---

### 4. **Permissions & Edit Controls**
**Question:** Should edit permissions be field-level (e.g., only assignees can change status) or role-based at the view level? How should read-only states be indicated?

**Current Assumption:** All fields are editable for demonstration purposes. Actual permissions will be enforced by backend and reflected in UI.

---

### 5. **Navigation & Context (Optional Future Enhancement)**
**Question:** Should this view include breadcrumb navigation showing Project > Issues > [Issue Title]? Should there be "Previous/Next Issue" navigation buttons?

**Current Assumption:** Including a "Back" button (as in IssueEdit.vue) for basic navigation. Breadcrumb navigation and previous/next issue navigation are considered **optional future enhancements** and are not included in this initial wireframe. These can be added to the layout wrapper when needed.

---

### 6. **Real-time Updates**
**Question:** Should the Activity Log and Comments sections support real-time updates (e.g., WebSocket), or is manual refresh/polling sufficient?

**Current Assumption:** Manual refresh for this wireframe. Real-time updates are a future enhancement requiring backend support.

---

### 7. **Chat/Comments Schema**
**Question:** The chat endpoint (`GET /ticketing/v1/issues/{issueId}/chats`) currently returns type `unknown` in the schema. What is the expected structure for:
- Chat messages (user, timestamp, content, attachments)?
- Activity log entries (action type, actor, timestamp, changes)?
- Should comments support threading/replies?

**Current Assumption:** Placeholder structure with user info, timestamps, and text content. Actual schema needs definition.

---

### 8. **Attachment Handling**
**Question:** Should attachments be part of the "Future Fields" section, or should they have a dedicated card/tab in the initial implementation?

**Current Assumption:** Attachments are deferred to "Future Fields" section. If needed urgently, they can be added as a new card or integrated into the Comments tab.

---

## Implementation Notes (For Future Development)

- This wireframe should **NOT** be implemented as code yet
- Component selection (markdown editor, avatar components) pending decision
- Data fetching strategy (single endpoint vs. multiple) to be determined
- Form validation rules to be defined based on backend API schema
- Internationalization (i18n) keys to be added during implementation phase
- All placeholder text should be replaced with actual i18n keys
- **Backend Schema Constraints:**
  - IssueJson relation fields (`blockedBy`, `relatedTo`, `duplicateOf`) are single UUIDs, not arrays
  - Chat/message schema needs definition (currently `unknown` type)
  - All IssueJson fields are optional except for constraints defined in backend validation

---

## Vue 3 Component File Structure

### Folder Organization

```
src/
├── views/
│   └── IssueDetailsView.vue                    # Parent view component
│
└── components/
    └── issue-details/                          # Issue Details feature folder
        │
        ├── cards/                              # Main card components
        │   ├── IssueOverviewCard.vue           # Card 1: Issue ID, title, status
        │   ├── IssueDescriptionCard.vue        # Card 2: Markdown description
        │   ├── IssueMetadataCard.vue           # Card 3: Reporter, owner, project, type, status, tenancy
        │   ├── IssueRelationsCard.vue          # Card 4: Blocks, Blocked By, Duplicate Of, Related To
        │   ├── IssueCommunicationCard.vue      # Card 5: Comments & Activity Log (TabView)
        │   └── IssueFutureFieldsCard.vue       # Card 6: Attachments, time tracking, workflow, tags
        │
        ├── badges/                             # Badge components (reusable)
        │   ├── StatusBadge.vue                 # Status enum badge (PENDING, OPEN, IN_PROGRESS, CLOSED, REJECTED)
        │   ├── TypeBadge.vue                   # Type enum badge (APPLICATION, TASK, DEFECT, MAINTENANCE)
        │   └── MemberRoleBadge.vue             # MemberRole enum badge (PROPRIETOR, MANAGER, LESSOR, STAFF, COLLABORATOR)
        │
        ├── user/                               # User-related components
        │   └── UserAvatar.vue                  # Circular avatar with initials
        │
        ├── communication/                      # Communication tab components
        │   ├── CommentItem.vue                 # Single comment with avatar, role, timestamp, message
        │   ├── ActivityLogItem.vue             # Single activity entry with icon, user, action, timestamp
        │   └── AddCommentForm.vue              # Textarea + formatting toolbar + Post button
        │
        ├── relations/                          # Relations card sub-components
        │   ├── IssueRelationItem.vue           # Single related issue link with status badge
        │   └── AccordionSection.vue            # Expandable/collapsible section (Blocks, Blocked By, etc.)
        │
        └── future-fields/                      # Future fields sub-components
            ├── AttachmentItem.vue              # Single file attachment with icon, name, size, date
            ├── TimeTrackingItem.vue            # Time tracking entry with user, hours, description
            ├── WorkflowStageItem.vue           # Workflow stage progress indicator
            ├── TagItem.vue                     # Single tag badge (clickable)
            └── CustomFieldItem.vue             # Key-value pair for custom metadata
```

### Component Hierarchy

```
IssueDetailsView.vue
│
├── IssueOverviewCard.vue
│   ├── StatusBadge.vue
│   └── (displays: id, title, status)
│
├── IssueDescriptionCard.vue
│   └── (markdown preview/edit toggle)
│
├── IssueMetadataCard.vue
│   ├── UserAvatar.vue (for reporter)
│   ├── UserAvatar.vue (for owner/assignee)
│   ├── TypeBadge.vue
│   ├── StatusBadge.vue
│   └── (displays: reporterId, ownerId, projectId, type, status, tenancyId, timestamps)
│
├── IssueRelationsCard.vue
│   ├── AccordionSection.vue (for "Blocks" - reverse lookup)
│   │   └── IssueRelationItem.vue (multiple)
│   │       └── StatusBadge.vue
│   ├── AccordionSection.vue (for "Blocked By" - single UUID)
│   │   └── IssueRelationItem.vue
│   │       └── StatusBadge.vue
│   ├── AccordionSection.vue (for "Duplicate Of" - single UUID)
│   │   └── IssueRelationItem.vue
│   │       └── StatusBadge.vue
│   └── AccordionSection.vue (for "Related To" - single UUID)
│       └── IssueRelationItem.vue
│           └── StatusBadge.vue
│
├── IssueCommunicationCard.vue
│   ├── PrimeVue TabView
│   │   ├── Tab 1: "Comments"
│   │   │   ├── CommentItem.vue (multiple)
│   │   │   │   ├── UserAvatar.vue
│   │   │   │   ├── MemberRoleBadge.vue
│   │   │   │   └── (message content)
│   │   │   └── AddCommentForm.vue
│   │   └── Tab 2: "Activity Log"
│   │       └── ActivityLogItem.vue (multiple)
│   │           ├── UserAvatar.vue
│   │           ├── MemberRoleBadge.vue
│   │           └── (action details)
│   └── (endpoint: GET /ticketing/v1/issues/{issueId}/chats)
│
└── IssueFutureFieldsCard.vue
    ├── AttachmentItem.vue (multiple)
    ├── TimeTrackingItem.vue (multiple)
    │   └── UserAvatar.vue
    ├── WorkflowStageItem.vue
    ├── TagItem.vue (multiple)
    └── CustomFieldItem.vue (multiple)
```

### Component Responsibilities

**Views:**
- **IssueDetailsView.vue**: Main container, fetches issue data via IssueService, grid layout with full-width cards

**Card Components:**
- **IssueOverviewCard.vue**: Displays `id`, `title`, `status`
- **IssueDescriptionCard.vue**: Displays `description` with markdown support
- **IssueMetadataCard.vue**: Displays all metadata fields (reporter, owner, project, type, status, tenancy, timestamps)
- **IssueRelationsCard.vue**: Manages relations (`blockedBy`, `relatedTo`, `duplicateOf` as single UUIDs, "Blocks" as reverse lookup)
- **IssueCommunicationCard.vue**: PrimeVue TabView with Comments and Activity Log tabs
- **IssueFutureFieldsCard.vue**: Placeholder for future fields with dashed border styling

**Reusable Subcomponents:**
- **StatusBadge.vue**: Color-coded badge for Status enum values
- **TypeBadge.vue**: Color-coded badge for Type enum values
- **MemberRoleBadge.vue**: Small badge for MemberRole enum values
- **UserAvatar.vue**: Circular avatar with user initials
- **CommentItem.vue**: Single comment display with user info
- **ActivityLogItem.vue**: Single activity log entry with icon and details
- **AddCommentForm.vue**: Textarea with formatting toolbar
- **IssueRelationItem.vue**: Clickable link to related issue
- **AccordionSection.vue**: Expandable/collapsible container
- **AttachmentItem.vue**: File attachment display with actions
- **TimeTrackingItem.vue**: Time entry with user and hours
- **WorkflowStageItem.vue**: Stage progress indicator
- **TagItem.vue**: Colored tag badge
- **CustomFieldItem.vue**: Key-value field display

### Data Flow & Conventions

- **Props Down, Events Up**: Parent passes data via props, children emit events for actions
- **Component Syntax**: Use `<script setup>` with TypeScript
- **Props**: Define with `defineProps<T>()`
- **State**: Local reactive state with `ref()` and `computed()`
- **Styling**: PrimeVue Card + TailwindCSS utilities
- **Layout**: `grid grid-cols-12 gap-4`, cards span `col-span-12`
- **Typography**: Titles `font-semibold text-xl`, labels `font-medium text-gray-700`
- **i18n**: All user-facing text via `$t()` from vue-i18n

---

**End of Wireframe Document**
