# Issue Details View - Wireframe

**Version:** 1.0  
**Date:** 2025-12-06  
**Type:** Conceptual Mockup (Non-Implementation)  
**Design Reference:** ProjectSettings View

---

## Overview

This wireframe defines the structural layout for the **Issue Details View** using a card-based design pattern consistent with the ProjectSettings view. All sections use PrimeVue Card components with TailwindCSS utility classes.

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
    ├── Assignee: [Placeholder: "Jane Smith" with avatar + dropdown]
    ├── Project: [Placeholder: "Building A Renovation" - read-only link]
    ├── Issue Type: [Placeholder: "TASK" - badge or label]
    ├── Priority: [Placeholder: "HIGH | MEDIUM | LOW" - colored badge]
    ├── Created At: [Placeholder: "2025-12-01 10:30:00"]
    └── Last Modified: [Placeholder: "2025-12-05 14:22:15"]
```

**Placeholder Fields:**
- Reporter (user reference with avatar)
- Assignee (user dropdown/autocomplete)
- Project (link to project details)
- Issue Type (badge)
- Priority (colored badge)
- Created timestamp
- Modified timestamp

---

### 4. Relations Card

**Purpose:** Manage relationships between issues (blocks, duplicates, related).

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full")
├── Title: "Related Issues" (font-semibold text-xl)
└── Content:
    ├── Section: "Blocks" (collapsed by default)
    │   ├── [Placeholder: List item - "#ISSUE-45: Setup database schema"]
    │   └── Action: [+ Add Blocking Issue button]
    │
    ├── Section: "Blocked By" (collapsed by default)
    │   ├── [Placeholder: List item - "#ISSUE-12: API authentication"]
    │   └── Action: [Remove icon button]
    │
    ├── Section: "Duplicate Of" (collapsed by default)
    │   └── [Placeholder: Empty state or single issue reference]
    │
    └── Section: "Related To" (collapsed by default)
        ├── [Placeholder: List item - "#ISSUE-67: User profile page"]
        ├── [Placeholder: List item - "#ISSUE-89: Password reset flow"]
        └── Action: [+ Add Related Issue button]
```

**Placeholder Elements:**
- Accordion/Expandable sections for each relation type
- Issue list items (clickable links)
- Add/Remove action buttons
- Empty state messaging

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
        │       │   ├── Avatar + Username: [Placeholder: "Alice Johnson"]
        │       │   ├── Timestamp: [Placeholder: "2025-12-05 09:15"]
        │       │   └── Message: [Placeholder: "This looks like a duplicate of #ISSUE-23"]
        │       │
        │       ├── Comment Item 2
        │       │   ├── Avatar + Username: [Placeholder: "Bob Williams"]
        │       │   ├── Timestamp: [Placeholder: "2025-12-05 10:30"]
        │       │   └── Message: [Placeholder: "I've started working on this, ETA 2 days"]
        │       │
        │       └── Add Comment Section:
        │           ├── Textarea: [Placeholder: "Write a comment..."]
        │           └── Button: "Post Comment"
        │
        └── Tab 2: "Activity Log" (inactive)
            └── Content:
                ├── Activity Entry 1
                │   ├── Icon: [Status change icon]
                │   ├── User: [Placeholder: "Jane Smith"]
                │   ├── Action: [Placeholder: "changed status from OPEN to IN_PROGRESS"]
                │   └── Timestamp: [Placeholder: "2025-12-04 16:45"]
                │
                └── Activity Entry 2
                    ├── Icon: [Assignment icon]
                    ├── User: [Placeholder: "John Doe"]
                    ├── Action: [Placeholder: "assigned to Jane Smith"]
                    └── Timestamp: [Placeholder: "2025-12-03 11:20"]
```

**Placeholder Elements:**
- PrimeVue TabView with 2 tabs
- Comment/message cards with user info
- Timestamp formatting
- Activity timeline entries
- Comment input area

**Implementation Note:** Use `primevue/tabview` and `primevue/tabpanel` components.

---

### 6. Future Fields Placeholder

**Purpose:** Reserve space for backend-provided fields that will be added later.

**Structure:**
```
Card (class="flex flex-col gap-4 basis-full border-dashed")
├── Title: "Additional Information" (font-semibold text-xl text-gray-400)
└── Content:
    └── Placeholder Message:
        "This section is reserved for future fields that will be 
        provided by the backend API, such as:
        - Custom fields
        - Integration data
        - Workflow-specific metadata
        - Attachments
        - Time tracking information"
```

**Visual Style:**
- Dashed border to indicate placeholder nature
- Muted colors (gray-400, gray-500)
- Italic text for description

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

### 5. **Navigation & Context**
**Question:** Should this view include breadcrumb navigation showing Project > Issues > [Issue Title]? Should there be "Previous/Next Issue" navigation buttons?

**Current Assumption:** Including a "Back" button (as in IssueEdit.vue) but no breadcrumbs or issue navigation in this wireframe. These can be added to the layout wrapper.

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
