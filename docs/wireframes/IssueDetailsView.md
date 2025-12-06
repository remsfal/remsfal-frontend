# Issue Details View - Wireframe

**Version:** 1.0  
**Date:** 2025-12-06  
**Type:** Conceptual Mockup (Non-Implementation)  
**Design Reference:** ProjectSettings View

---

## Overview

This wireframe defines the structural layout for the **Issue Details View** using a card-based design pattern consistent with the ProjectSettings view. All sections use PrimeVue Card components with TailwindCSS utility classes.

**Backend Schema Alignment:**
- Field names and types match the OpenAPI schema definitions
- Uses `IssueJson` schema fields: `ownerId`, `reporterId`, `projectId`, `status`, `type`
- Project references use `ProjectItemJson` structure
- User roles follow `MemberRole` enum values (PROPRIETOR, MANAGER, LESSOR, STAFF, COLLABORATOR)

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
    ├── Issue ID: #[ISSUE-123]
    ├── Issue Title: [Placeholder: "Fix login authentication bug"]
    └── Current Status: [Badge/Tag: OPEN | IN_PROGRESS | CLOSED]
```

**Placeholder Fields:**
- Issue ID (read-only, auto-generated)
- Issue Title (editable text)
- Status (dropdown or badge)

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
- Description text (markdown-enabled)
- Edit/Preview toggle functionality (placeholder only)

**Note:** Markdown rendering component to be determined (e.g., vue-markdown or similar).

---

### 3. Metadata Card

**Purpose:** Display issue metadata including people, dates, and classification.

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Metadata" (font-semibold text-xl)
└── Content: (grid layout for field-value pairs)
    ├── Reporter: [Placeholder: "John Doe" with avatar icon]
    │   └── Maps to: reporterId (UUID from IssueJson)
    ├── Owner/Assignee: [Placeholder: "Jane Smith" with avatar + dropdown]
    │   └── Maps to: ownerId (UUID from IssueJson)
    ├── Project: [Placeholder: "Building A Renovation" - read-only link]
    │   └── Maps to: projectId (UUID, displayed via ProjectItemJson)
    ├── Issue Type: [Placeholder: "TASK" - badge or label]
    │   └── Maps to: type (from IssueJson)
    ├── Status: [Placeholder: "IN_PROGRESS" - colored badge]
    │   └── Maps to: status (PENDING, OPEN, IN_PROGRESS, CLOSED, REJECTED)
    ├── Created At: [Placeholder: "2025-12-01 10:30:00"]
    │   └── Backend timestamp field
    └── Last Modified: [Placeholder: "2025-12-05 14:22:15"]
        └── Backend timestamp field
```

**Placeholder Fields:**
- Reporter → `reporterId` (user reference with avatar, UUID)
- Owner/Assignee → `ownerId` (user dropdown/autocomplete, UUID)
- Project → `projectId` (displayed using ProjectItemJson with name and memberRole)
- Issue Type → `type` (badge, from Type enum)
- Status → `status` (colored badge: PENDING, OPEN, IN_PROGRESS, CLOSED, REJECTED)
- Created timestamp (from backend)
- Modified timestamp (from backend)

**Note:** "Assignee" in UI maps to `ownerId` field in IssueJson schema.

---

### 4. Relations Card

**Purpose:** Manage relationships between issues (blocks, duplicates, related).

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Related Issues" (font-semibold text-xl)
└── Content:
    ├── Section: "Blocks" (collapsed by default)
    │   ├── List item 1: "#ISSUE-156: Implement OAuth2 token refresh mechanism"
    │   │   └── Status badge: IN_PROGRESS | Priority: HIGH
    │   ├── List item 2: "#ISSUE-178: Create API endpoint for user preferences"
    │   │   └── Status badge: OPEN | Priority: MEDIUM
    │   ├── List item 3: "#ISSUE-192: Add database migration for settings table"
    │   │   └── Status badge: OPEN | Priority: HIGH
    │   └── Action: [+ Add Blocking Issue button]
    │
    ├── Section: "Blocked By" (collapsed by default)
    │   ├── List item 1: "#ISSUE-89: Setup Redis caching infrastructure"
    │   │   └── Status badge: IN_PROGRESS | Priority: HIGH | Assignee: M. Schmidt
    │   ├── List item 2: "#ISSUE-134: Deploy staging environment configuration"
    │   │   └── Status badge: IN_PROGRESS | Priority: MEDIUM | Assignee: A. Weber
    │   └── Action: [Remove icon button for each item]
    │
    ├── Section: "Duplicate Of" (collapsed by default)
    │   ├── List item: "#ISSUE-67: Fix authentication timeout on login page"
    │   │   └── Status badge: CLOSED | Resolution: FIXED
    │   └── Note: "This issue will be closed automatically when marked as duplicate"
    │
    └── Section: "Related To" (collapsed by default)
        ├── List item 1: "#ISSUE-201: Update user documentation for login flow"
        │   └── Status badge: OPEN | Priority: LOW
        ├── List item 2: "#ISSUE-145: Implement password strength indicator"
        │   └── Status badge: CLOSED | Priority: MEDIUM
        ├── List item 3: "#ISSUE-223: Add two-factor authentication support"
        │   └── Status badge: OPEN | Priority: HIGH
        └── Action: [+ Add Related Issue button]
```

**Example Placeholder Content:**

**Blocks Section:**
- #ISSUE-156: Implement OAuth2 token refresh mechanism (IN_PROGRESS, HIGH)
- #ISSUE-178: Create API endpoint for user preferences (OPEN, MEDIUM)
- #ISSUE-192: Add database migration for settings table (OPEN, HIGH)

**Blocked By Section:**
- #ISSUE-89: Setup Redis caching infrastructure (IN_PROGRESS, HIGH) - M. Schmidt
- #ISSUE-134: Deploy staging environment configuration (IN_PROGRESS, MEDIUM) - A. Weber

**Duplicate Of Section:**
- #ISSUE-67: Fix authentication timeout on login page (CLOSED, FIXED)

**Related To Section:**
- #ISSUE-201: Update user documentation for login flow (OPEN, LOW)
- #ISSUE-145: Implement password strength indicator (CLOSED, MEDIUM)
- #ISSUE-223: Add two-factor authentication support (OPEN, HIGH)

**Placeholder Elements:**
- Accordion/Expandable sections for each relation type
- Issue list items (clickable links) with status badges
- Add/Remove action buttons
- Empty state messaging for sections without relations

---

### 5. Chats Section (PrimeVue TabView Concept)

**Purpose:** Display different communication channels using tabbed interface.

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
- **Status Badges:**
  - OPEN: Blue/Info color
  - IN_PROGRESS: Orange/Warning color
  - CLOSED: Green/Success color
  - REJECTED: Red/Danger color
- **Priority Badges:**
  - HIGH: Red
  - MEDIUM: Orange
  - LOW: Green

### Responsive Behavior
- All cards: `col-span-12` (full width)
- Use PrimeVue's responsive components
- Stack elements vertically on mobile

---

## Questions / Assumptions

### 1. **Issue Relations Management**
**Question:** Should users be able to create new relation types beyond the standard ones (blocks, blocked by, duplicate of, related to)? Or should these be fixed categories?

**Current Assumption:** Using fixed relation categories as shown in IssueEdit.vue (blockedBy, duplicateOf, relatedTo).

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

### 7. **Attachment Handling**
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

---

**End of Wireframe Document**
