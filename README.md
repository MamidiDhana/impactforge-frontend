# ImpactForge: National Civic Innovation & Capability Matching Platform

> **Bridging Grassroots Civic Challenges with Academic Research, Government Accountability, and Industry Capabilities.**

ImpactForge is an ecosystem platform designed to turn localized community grievances and civic problems into structured, validated, and verifiable student-faculty-partner research projects with measurable field impact.

---

## 🌟 Executive Summary & Problem Context

Traditional public grievance portals often operate as one-way filing cabinets: issues are logged, queued, and frequently closed without sustainable technical solutions. Simultaneously, thousands of university engineering and science students look for meaningful capstone projects, while CSR foundations and industry partners search for verified grassroots initiatives to support.

**ImpactForge completes this loop:**
1. **Citizens** surface localized problems with geo-coordinates, urgency signals, and evidence.
2. **AI Engines** cluster duplicate issues via semantic embeddings, identify category taxonomies, and extract required capabilities.
3. **Government Validators** verify ground-truth priority and grant administrative approval.
4. **Universities (HEIs)** claim challenges and allocate expert faculty mentors and interdisciplinary student teams.
5. **Capability-Gap Analysis** identifies missing equipment, testing facilities, or skill shortages before development begins.
6. **Industry & CSR Partners** sponsor equipment, provide technical mentorship, and fund deployments.
7. **Verified Projects** track milestones, deliver working prototypes, and quantify community impact.

---

## 🚀 Key Platform Features

### 1. Intelligent Grievance & Challenge Intake
- Multi-step civic submission wizard with category classification, urgency levels, and file attachment simulations.
- Real-time character counter and validation schemas via **Zod** and **React Hook Form**.

### 2. AI-Assisted Similarity & Deduplication
- Natural language vector search clustering that prevents duplicate complaints across districts.
- Semantic similarity scoring with visual threshold indicators and previous project linkage.

### 3. Government Verification Queue
- District Innovation Cell dashboard for validating community need, setting priority tiers, and initiating HEI matching.
- Compliance audit logging for government transparency.

### 4. HEI & Academic R&D Assignment
- Recommends university departments and specialized faculty based on domain capability match scores.
- Manages university institutional profiles, lab facilities, and expert faculty rosters.

### 5. Automated Capability-Gap Analysis
- Uncovers missing specialized equipment, software licenses, testing kits, or regulatory clearances before project kickoff.
- Generates targeted collaboration solicitations for external partners.

### 6. Industry & CSR Partner Collaboration
- Discovers vetted university research projects seeking sponsorships or corporate mentoring.
- Tracks CSR fund allocation, resource utilization, and community reach.

### 7. End-to-End Project Workspace (10 Integrated Modules)
- **Overview**: Problem context, project health, stage, and completion percentage.
- **Team**: Faculty mentors, student leads, and interdisciplinary contributors.
- **Milestones**: Verification statuses (Completed, In Progress, Pending).
- **Tasks**: Kanban-style activity tracking.
- **Documents**: Technical specs, field test data, and reports.
- **Discussions**: Multi-party communication channel.
- **Capability Gaps**: Open resource requests.
- **Partners**: Active industry/CSR sponsors.
- **Feedback**: Community and beneficiary evaluation.
- **Impact Report**: Quantified outcomes, beneficiary tallies, and SDG alignment.

### 8. Super Admin Governance Console
- Complete user management across all 7 platform roles.
- Granular Role-Based Access Control (RBAC) permission matrix (Read, Create, Update, Delete, Approve, Export).
- Organization onboarding and compliance document approvals.
- Global taxonomy & knowledge graph management.
- Live telemetry for 6 core AI models (Similarity Detection, Categorization, Capability Extraction, HEI Matching, Gap Analysis, Partner Matching).
- Real-time system health diagnostics and audit event trails.

---

## 🏛️ Available Portals & Routes

### Public Portal
- `/` — Homepage with interactive 7-stage engine overview and stakeholder gateways.
- `/about` — Platform mission and ecosystem model.
- `/how-it-works` — Detailed methodology walkthrough.
- `/problems` — Public problem repository with search and multi-facet filters.
- `/problems/:id` — Public problem details and progress tracking.
- `/universities` — Accredited university and research institute directory.
- `/partners` — Industry, MSME, and CSR partner catalog.

### Authentication & Shared Fallbacks
- `/login` — Login screen with one-click demo login buttons for all roles.
- `/register` — New organization or individual registration wizard.
- `/forgot-password` & `/reset-password` — Password recovery simulation.
- `/profile` — Smart route redirecting users to their role-specific profile page.
- `/notifications` — Smart route redirecting users to their role-specific notification stream.
- `/unauthorized` — Role-aware boundary displaying current permissions with direct recovery paths.
- `*` — 404 Not Found fallback page.

### Citizen Portal (`/citizen/*`)
- `/citizen/dashboard` — Personal activity, submitted grievances, and community updates.
- `/citizen/submit-problem` — Comprehensive problem reporting wizard.
- `/citizen/problems` & `/citizen/problems/:id` — Status of submitted challenges.
- `/citizen/problems/:id/similar` — AI similarity inspection and deduplication view.
- `/citizen/projects` — Projects addressing citizen's problems.
- `/citizen/feedback` — Field solution evaluation and comments.
- `/citizen/notifications` — Status alerts and milestone announcements.
- `/citizen/profile` — Citizen account and locality preferences.

### Government Portal (`/government/*`)
- `/government/dashboard` — Intake statistics, validation queue status, and district metrics.
- `/government/problem-queue` & `/government/problems/:id/review` — Review and triage submissions.
- `/government/validation` — Official problem verification pipeline.
- `/government/duplicate-analysis` — AI cluster review and deduplication merge actions.
- `/government/validated-problems` — Registry of authorized challenges.
- `/government/hei-matching` — Capability-based academic dispatch.
- `/government/projects` — District-level project monitoring.
- `/government/analytics` — Geospatial distribution and resolution metrics.
- `/government/audit-logs` — Administrative traceability logs.
- `/government/users` — Regional coordinators and organization directory.
- `/government/notifications` — Priority escalations and validation alerts.
- `/government/profile` & `/government/settings` — Officer credentials and jurisdictional settings.

### HEI / University Portal (`/hei/*`)
- `/hei/dashboard` — University research activity, accepted challenges, and student engagements.
- `/hei/profile` — University accreditation, research centers, and contact info.
- `/hei/recommended-problems` & `/hei/problems/:id` — AI-recommended challenges matched to institutional profile.
- `/hei/accepted-challenges` — Accepted challenges preparing for project launch.
- `/hei/faculty` — Roster of expert faculty mentors and departments.
- `/hei/resources` — Available lab machinery, prototyping tools, and computing clusters.
- `/hei/teams` — Student interdisciplinary innovation teams.
- `/hei/capability-gaps` — Institutional resource deficits needing partner sponsorship.
- `/hei/projects` — University-led research initiatives.
- `/hei/collaboration-requests` — Inbound and outbound partnership requests.
- `/hei/notifications` — Academic matches and milestone reviews.

### Faculty & Student Workspaces (`/faculty/*` & `/student/*`)
- `/faculty/dashboard`, `/faculty/profile`, `/faculty/projects`, `/faculty/projects/:id`, `/faculty/teams`, `/faculty/milestones`, `/faculty/capability-gaps`, `/faculty/notifications`
- `/student/dashboard`, `/student/profile`, `/student/projects`, `/student/projects/:id`, `/student/teams`, `/student/tasks`, `/student/outputs`, `/student/notifications`

### Industry & CSR Partner Portal (`/partner/*`)
- `/partner/dashboard` — CSR expenditure, active partnerships, and beneficiary reach.
- `/partner/profile` — Company profile, focus domains, and CSR mandate.
- `/partner/recommended-projects` — Vetted university projects seeking capital or equipment.
- `/partner/project-details` & `/partner/project-details/:id` — Deep-dive into technical project workspaces.
- `/partner/collaboration-requests` — Inbound requests from university teams.
- `/partner/active-collaborations` — Ongoing joint ventures and pilot testing.
- `/partner/supported-projects` — Portfolio of sponsored field projects.
- `/partner/resources` — Catalog of corporate resources, equipment, and lab access offered.
- `/partner/impact` — ESG and CSR compliance metrics.
- `/partner/notifications` & `/partner/settings` — Partnership notifications and configuration.

### Super Admin Console (`/admin/*`)
- `/admin/dashboard` — Platform-wide telemetry, verification approvals, and activity feed.
- `/admin/users` — Multi-facet user management, activation toggles, and view/edit actions.
- `/admin/roles` — RBAC matrix across 7 modules with custom role authoring.
- `/admin/organizations` — Verification workflows for universities, government departments, and CSRs.
- `/admin/taxonomy` — National classification taxonomy and skill tagging management.
- `/admin/ai-models` — Telemetry and parameter controls for 6 internal AI models.
- `/admin/audit-logs` — Immutable compliance event ledger with export simulation.
- `/admin/system-health` — Infrastructure diagnostics across 7 critical services.
- `/admin/settings` — Global platform parameters, AI threshold tuning, and maintenance mode.

### Project Workspace (`/projects/:id/*`)
- `/projects/:id/overview`
- `/projects/:id/team`
- `/projects/:id/milestones`
- `/projects/:id/tasks`
- `/projects/:id/documents`
- `/projects/:id/discussions`
- `/projects/:id/capability-gaps`
- `/projects/:id/partners`
- `/projects/:id/feedback`
- `/projects/:id/impact`

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with Rolldown/ESBuild
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with curated Indian civic color palette (`#12365a`, `#187e8d`, `#e8f5f5`)
- **Typography**: [Manrope](https://fonts.google.com/specimen/Manrope) & Inter
- **Form Handling & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/) with role-based route guards
- **Code Quality**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) (Zero warnings, Zero errors)

---

## 💻 Getting Started & Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation
```bash
# Clone or navigate to the repository
git clone https://github.com/example/impactforge.git
cd ImpactForge

# Install dependencies
npm install
```

### Development Server
```bash
# Start Vite development server
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).

### Linting
```bash
# Run oxlint across all source files
npm run lint
```

### Production Build & Typecheck
```bash
# Run TypeScript typechecker and Vite production bundler
npm run build
```

---

## 🔑 Demo Login Accounts

ImpactForge provides instantaneous one-click role switching on the `/login` screen:

| Role | Demo Persona | Default Organization | Starting Route |
| :--- | :--- | :--- | :--- |
| **Citizen** | Asha Rao | Community Member | `/citizen/dashboard` |
| **Government Validator** | Vikram Singh | District Innovation Cell | `/government/dashboard` |
| **University / HEI Admin** | Dr. Meera Nair | NIT Karnataka | `/hei/dashboard` |
| **Faculty Mentor** | Dr. Arjun Menon | Tata Institute of Social Sciences | `/faculty/dashboard` |
| **Student Researcher** | Riya Shah | Symbiosis Institute of Design | `/student/dashboard` |
| **Industry / CSR Partner** | Karan Patel | CivicGrid Technologies | `/partner/dashboard` |
| **Super Administrator** | ImpactForge Admin | ImpactForge National Mission | `/admin/dashboard` |

---

## ⚡ Current MVP Limitations & Next Steps

This project is currently implemented as a comprehensive, fully responsive frontend prototype with realistic mock data and live local UI state:

1. **Mock Data Persistence**: State updates (approving applications, toggling model status, editing taxonomy) are handled in React component state and will reset upon hard browser reloads.
2. **Backend Services**: Real integration with external vector databases (Milvus/Pinecone), LLM inference providers, and relational SQL databases is designed and typed via TypeScript models, ready for backend API connection.
3. **File Uploads**: Attachment components simulate document intake and upload preview without transmitting raw binary blobs to cloud storage.
4. **Authentication**: Uses local session storage to facilitate rapid hackathon demonstration and role switching without requiring SMS OTP gateways.

---

## 📄 License

ImpactForge is released under the **MIT License**.
