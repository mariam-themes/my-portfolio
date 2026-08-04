# Product Requirements: Luxury Designer Portfolio

## BRD — Business Requirements Document
### Business Objectives
- Establish a premium digital presence for the designer that competes with top-tier creative agencies.
- Generate high-quality inbound leads and convert visitors into high-ticket clients.
- Provide a completely custom, easy-to-use CMS dashboard tailored specifically to the designer's workflow, eliminating reliance on generic platforms like WordPress.

### Success Metrics
- Increase in qualified leads via the Project Request Form.
- Average session duration increase (due to immersive 3D/scroll-driven animations).
- Dashboard efficiency: Time taken to publish a new Project Case Study is under 10 minutes.

### Scope
- **In-Scope:** Custom frontend with 3D (Three.js) and GSAP animations. Full Next.js Admin Dashboard. Dynamic Page Sections, Navbar Builder, Project Case Studies, Blog, Testimonials (Text + Audio), Contact Form, SEO management.
- **Out-of-Scope (Phase 1):** Digital Store (E-commerce cart/checkout), Courses, Landing Page Builder (these are Phase 2).

### Stakeholders
- **The Client (Designer):** Primary stakeholder and admin user.
- **Menna & Naira:** Development team (Full-Stack Vertical Slice Owners).

### Timeline
- MVP delivery timeline to be determined during Sprint Planning.

## PRD — Product Requirements Document
### Overview
A highly interactive, performant, "Dark Luxury" themed portfolio and CMS. Built on Next.js, it offers an Awwwards-level frontend with a highly tailored, easy-to-use backend dashboard.

### Target Release
Phase 1 (Core Website & CMS)

### Assumptions
- Hosting will be on Vercel or similar Next.js-optimized platform.
- MongoDB will be hosted on MongoDB Atlas.
- Media (Images, Videos, Audio) will be managed via Cloudinary.

### Feature List
- **F1: Dynamic Frontend Architecture** (Must)
- **F2: 3D & Interactive Hero** (Must)
- **F3: Custom Case Study Engine** (Must)
- **F4: Voice & Text Testimonials** (Must)
- **F5: Advanced Lead Capture Form** (Must)
- **F6: Section & Navbar Manager (Dashboard)** (Must)
- **F7: SEO & Theme Manager (Dashboard)** (Should)
- **F8: Dynamic Blog Engine** (Should)

## Functional Requirements
### FR-001: 3D & Interactive Hero (F2)
- **Description:** The homepage hero must include 3D depth, interactive typography, and a custom cursor that reacts to user movement.
- **Priority:** Must Have
- **Dependencies:** Three.js / GSAP setup.

### FR-002: Browser Mockup Component (F3)
- **Description:** Project pages must feature a "Browser Mockup" component containing a full-page long screenshot that users can scroll internally, accompanied by a "Live URL" button.
- **Priority:** Must Have
- **Dependencies:** Cloudinary integration for large image delivery.

### FR-003: Project Details Data Model (F3)
- **Description:** Projects must support fields: Images, Video, Before/After, Services used, Tools, Platform, Year, Description.
- **Priority:** Must Have
- **Dependencies:** MongoDB schema.

### FR-004: Voice Testimonials Player (F4)
- **Description:** A custom audio player UI for voice reviews alongside written reviews.
- **Priority:** Must Have
- **Dependencies:** Cloudinary audio hosting.

### FR-005: Section & Navbar Reordering (F6)
- **Description:** The admin must be able to drag-and-drop to reorder sections on the homepage and links in the navbar, as well as toggle visibility (Show/Hide).
- **Priority:** Must Have
- **Dependencies:** Dashboard UI, Next.js revalidation.

## Non-Functional Requirements
### Performance
- Time to Interactive (TTI) < 2.5s on desktop, despite 3D elements.
- Lighthouse scores > 90 in SEO and Best Practices.

### Security
- Admin dashboard protected by Next.js middleware and encrypted Email/Password auth.
- Form inputs sanitized to prevent XSS/Injection.

### Scalability
- Image and video delivery must utilize Cloudinary CDN to prevent bandwidth throttling.

### Usability
- The dashboard must be visually clean and not require HTML/CSS knowledge to format case studies.
- Animations must gracefully degrade on lower-end devices or users with "prefers-reduced-motion".

## User Stories
### Epic 1: The "Projects & Case Studies" Feature (Assigned to Menna)
*Menna owns this entire feature from end-to-end: MongoDB Schema -> API -> Dashboard UI for Projects -> Public Portfolio UI.*
#### US-001: Create Case Study
`As an Admin, I want to create a detailed project case study with images, videos, and metadata, so I can showcase my work.`
#### US-002: Browser Mockup Viewer
`As a Visitor, I want to scroll through a full-page screenshot inside a realistic browser frame, so I can experience the web design without leaving the portfolio.`

### Epic 2: The "Testimonials & Blog" Feature (Assigned to Naira)
*Naira owns this entire feature from end-to-end: MongoDB Schema -> API -> Dashboard UI for Testimonials/Blog -> Public UI.*
#### US-003: Testimonial Audio Player
`As a Visitor, I want to play voice notes from previous clients, so I can hear authentic reviews.`
#### US-004: Manage Blog Posts
`As an Admin, I want to write and publish blog posts with rich text, so I can improve SEO and share insights.`

### Epic 3: The "Dynamic Layout & Services" Feature (Shared / Next Phase)
#### US-005: Section Reordering
`As an Admin, I want to drag and drop sections to change their order on the live site, so I can easily update my homepage layout.`
#### US-006: Detailed Contact Form
`As a Visitor, I want to submit a detailed project inquiry (Budget, Timeline, Service), so I can request a quote accurately.`

## Acceptance Criteria
### AC for US-002 (Browser Mockup Viewer)
- **Given** I am on a project case study page
- **When** I scroll over the browser mockup component
- **Then** the internal screenshot scrolls independently of the main page, until it reaches the bottom.
- **Edge Case:** If the image is shorter than the frame, internal scroll is disabled.

### AC for US-003 (Testimonial Audio Player)
- **Given** I am on the testimonials section
- **When** I click the play button on a voice review
- **Then** the custom audio player plays the clip seamlessly without opening a new tab.

## Traceability Matrix
- **FR-002** -> US-002 -> AC for US-002
- **FR-005** -> US-003 -> AC for US-003
