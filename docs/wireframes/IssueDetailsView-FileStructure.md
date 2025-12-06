# Issue Details View - Vue 3 File Structure

**Version:** 1.0  
**Date:** 2025-12-06  
**Purpose:** Component organization for Issue Details View implementation  
**Reference:** Based on IssueDetailsView.md wireframe

---

## File Structure

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

---

## Component Hierarchy

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
│   ├── AccordionSection.vue (for "Blocks")
│   │   └── IssueRelationItem.vue (multiple, reverse lookup)
│   │       └── StatusBadge.vue
│   │
│   ├── AccordionSection.vue (for "Blocked By")
│   │   └── IssueRelationItem.vue (single UUID)
│   │       └── StatusBadge.vue
│   │
│   ├── AccordionSection.vue (for "Duplicate Of")
│   │   └── IssueRelationItem.vue (single UUID)
│   │       └── StatusBadge.vue
│   │
│   └── AccordionSection.vue (for "Related To")
│       └── IssueRelationItem.vue (single UUID)
│           └── StatusBadge.vue
│
├── IssueCommunicationCard.vue
│   ├── PrimeVue TabView
│   │   ├── Tab 1: "Comments"
│   │   │   ├── CommentItem.vue (multiple)
│   │   │   │   ├── UserAvatar.vue
│   │   │   │   ├── MemberRoleBadge.vue
│   │   │   │   └── (displays: user, role, timestamp, message)
│   │   │   └── AddCommentForm.vue
│   │   │
│   │   └── Tab 2: "Activity Log"
│   │       └── ActivityLogItem.vue (multiple)
│   │           ├── UserAvatar.vue
│   │           ├── MemberRoleBadge.vue
│   │           └── (displays: icon, user, role, action, timestamp, changes)
│   │
│   └── (endpoint: GET /ticketing/v1/issues/{issueId}/chats)
│
└── IssueFutureFieldsCard.vue
    ├── AttachmentItem.vue (multiple)
    │   └── (displays: icon, filename, size, upload date, user)
    │
    ├── TimeTrackingItem.vue (multiple)
    │   ├── UserAvatar.vue
    │   └── (displays: user, hours, description)
    │
    ├── WorkflowStageItem.vue
    │   └── (displays: current stage, progress, timeline visual)
    │
    ├── TagItem.vue (multiple)
    │   └── (displays: colored badge, clickable)
    │
    └── CustomFieldItem.vue (multiple)
        └── (displays: field name, field value)
```

---

## Component Responsibilities

### Views
- **IssueDetailsView.vue**
  - Main container using PrimeVue Card layout
  - Grid layout: `grid grid-cols-12 gap-4`
  - All cards span full width: `col-span-12`
  - Fetches issue data via IssueService
  - Passes data down to card components

### Card Components
- **IssueOverviewCard.vue**
  - Displays: `id`, `title`, `status`
  - Uses: StatusBadge

- **IssueDescriptionCard.vue**
  - Displays: `description` (markdown)
  - Edit/Preview toggle functionality
  - Markdown rendering component (TBD)

- **IssueMetadataCard.vue**
  - Displays: `reporterId`, `ownerId`, `projectId`, `type`, `status`, `tenancyId`, timestamps
  - Uses: UserAvatar, TypeBadge, StatusBadge
  - Grid layout for field-value pairs

- **IssueRelationsCard.vue**
  - Manages: `blockedBy`, `relatedTo`, `duplicateOf` (single UUIDs)
  - "Blocks" section: reverse lookup query
  - Uses: AccordionSection, IssueRelationItem
  - Change/Remove actions for relations

- **IssueCommunicationCard.vue**
  - PrimeVue TabView with 2 tabs
  - Comments tab: list of CommentItem + AddCommentForm
  - Activity Log tab: list of ActivityLogItem
  - Endpoint: `/ticketing/v1/issues/{issueId}/chats`

- **IssueFutureFieldsCard.vue**
  - Dashed border styling: `border-dashed`
  - Muted colors: `text-gray-400`, `text-gray-500`
  - Displays future/optional fields
  - Uses: AttachmentItem, TimeTrackingItem, WorkflowStageItem, TagItem, CustomFieldItem

### Badge Components (Reusable)
- **StatusBadge.vue**
  - Props: `status` (Status enum)
  - Color mapping: PENDING (gray), OPEN (blue), IN_PROGRESS (orange), CLOSED (green), REJECTED (red)

- **TypeBadge.vue**
  - Props: `type` (Type enum)
  - Color mapping: APPLICATION (purple), TASK (blue), DEFECT (red), MAINTENANCE (orange)

- **MemberRoleBadge.vue**
  - Props: `role` (MemberRole enum)
  - Small gray badge for user roles

### User Components
- **UserAvatar.vue**
  - Props: `userId`, `userName`, `size`
  - Circular with initials in colored background
  - Reusable across metadata, comments, activity log

### Communication Components
- **CommentItem.vue**
  - Props: `comment` (user, role, timestamp, message)
  - Uses: UserAvatar, MemberRoleBadge
  - Supports @mentions

- **ActivityLogItem.vue**
  - Props: `activity` (icon, user, role, action, timestamp, changes)
  - Uses: UserAvatar, MemberRoleBadge
  - Icon from PrimeIcons (e.g., pi-refresh, pi-user)

- **AddCommentForm.vue**
  - Textarea with markdown support
  - Formatting toolbar: Bold, Italic, Code, Link
  - "Post Comment" button

### Relations Components
- **IssueRelationItem.vue**
  - Props: `issueId`, `issueTitle`, `status`
  - Clickable link to related issue
  - Uses: StatusBadge

- **AccordionSection.vue**
  - Props: `title`, `collapsed`
  - Expandable/collapsible container
  - Used for each relation type

### Future Fields Components
- **AttachmentItem.vue**
  - Props: `filename`, `size`, `uploadDate`, `uploadedBy`
  - Icon: pi-paperclip
  - Download/remove actions

- **TimeTrackingItem.vue**
  - Props: `user`, `hours`, `description`
  - Uses: UserAvatar

- **WorkflowStageItem.vue**
  - Props: `currentStage`, `stages`, `progress`
  - Visual timeline: [✓ Stage1] → [✓ Stage2] → [• Stage3] → [Stage4] → [Stage5]

- **TagItem.vue**
  - Props: `label`, `color`
  - Colored badge, clickable
  - Remove icon on hover

- **CustomFieldItem.vue**
  - Props: `fieldName`, `fieldValue`
  - Simple key-value display

---

## Styling & Conventions

### PrimeVue Components Used
- Card
- TabView / TabPanel
- Button
- InputText / Textarea
- Badge (for custom badges)
- Dialog (for modals)

### TailwindCSS Classes
- Card layout: `flex flex-col gap-4 basis-full`
- Grid container: `grid grid-cols-12 gap-4`
- Full width: `col-span-12`
- Typography: `font-semibold text-xl` (titles), `font-medium text-gray-700` (labels)

### Component Naming
- Views: PascalCase with "View" suffix
- Components: PascalCase (e.g., IssueOverviewCard)
- Organized in feature folders (issue-details/)
- Subfolders by type (badges/, user/, communication/, etc.)

---

## Data Flow

### Props Down
```
IssueDetailsView
  ↓ (issue data from IssueService)
Card Components
  ↓ (specific fields)
Subcomponents
```

### Events Up
```
Subcomponents
  ↑ (user actions: edit, change, remove)
Card Components
  ↑ (aggregated actions)
IssueDetailsView
  → API calls via IssueService
```

### Services Used
- **IssueService**: CRUD operations for issues
  - `getIssue(projectId, issueId)`
  - `modifyIssue(projectId, issueId, body)`
- **Chat/Communication**: Endpoint TBD
  - `GET /ticketing/v1/issues/{issueId}/chats`

---

## Implementation Notes

1. **Component Composition**: Use `<script setup>` syntax with TypeScript
2. **Props Definition**: Use `defineProps<T>()` with interfaces
3. **State Management**: Local reactive state with `ref()` and `computed()`
4. **Slots**: Card components may use slots for flexible content
5. **Accessibility**: Proper ARIA labels, keyboard navigation
6. **Internationalization**: All user-facing text via `$t()` from vue-i18n
7. **Schema Alignment**: All components respect IssueJson field types and enums

---

**End of File Structure Document**
