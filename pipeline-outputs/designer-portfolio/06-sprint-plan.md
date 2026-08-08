# Sprint & Task Plan: Luxury Designer Portfolio

This document splits the entire project into equal, end-to-end tasks (Vertical Slices) assigned to Menna and Naira. Each developer is responsible for their feature from the Database level all the way to the Public UI.

## Overview of Division
- **Menna:** Responsible for "Projects & Case Studies" and "Contact/Lead Generation".
- **Naira:** Responsible for "Testimonials", "Blog", and "Dynamic Layout Manager".
- **Shared / Initial:** Both will initially collaborate on the base setup (Next.js config, Auth, Shared UI components) before splitting off into their independent features.

---

## Sprint 1: Foundation & Base Setup (Shared Work)
*Goal: Setup the repository, database connection, authentication, and core UI components so both developers can work independently afterward.*

- [ ] **Task 1.1 (Shared):** Initialize Next.js App Router, Tailwind CSS, and GSAP. Set up folder structure.
- [ ] **Task 1.2 (Shared):** Configure MongoDB Atlas and set up Mongoose connection utility.
- [ ] **Task 1.3 (Shared):** Implement NextAuth.js for the Admin Dashboard (Email/Password).
- [ ] **Task 1.4 (Shared):** Build the Base Dashboard Layout (Sidebar, Header, Auth protection).
- [x] **Task 1.5 (Shared):** Build Shared Public UI Components (Buttons, Inputs, Base Typography).

---

## Sprint 2: Core Vertical Slices (Parallel Development)

### Epic A: Projects & Case Studies (Assigned strictly to Menna)
*Menna takes full ownership of this feature.*
- [ ] **Task 2.A.1 (Menna - DB):** Create the Mongoose `Project` Schema.
- [ ] **Task 2.A.2 (Menna - API):** Build GET, POST, PUT, DELETE routes for `/api/projects` and `/api/admin/projects`.
- [ ] **Task 2.A.3 (Menna - Infra):** Implement Cloudinary upload logic specifically for massive Full-Page Screenshots and videos.
- [ ] **Task 2.A.4 (Menna - Dashboard UI):** Build the Admin "Add/Edit Project" form with image uploaders and dynamic fields.
- [ ] **Task 2.A.5 (Menna - Public UI):** Build the public "Portfolio List" page (filtering, GSAP animations for cards).
- [ ] **Task 2.A.6 (Menna - Public UI):** Build the dynamic "Project Case Study" page (`app/work/[slug]`), including the **Browser Mockup Component** with internal scroll behavior.

### Epic B: Testimonials & Blog (Assigned strictly to Naira)
*Naira takes full ownership of these features.*
- [x] **Task 2.B.1 (Naira - DB):** Create the Mongoose `Testimonial` and `Blog` Schemas.
- [x] **Task 2.B.2 (Naira - API):** Build CRUD API routes for Testimonials and Blogs.
- [x] **Task 2.B.3 (Naira - Infra):** Implement Cloudinary upload logic specifically for Audio files (Voice Testimonials).
- [x] **Task 2.B.4 (Naira - Dashboard UI):** Build the Admin panels for creating Blog posts (Rich Text Editor) and adding Testimonials.
- [ ] **Task 2.B.5 (Naira - Public UI):** Build the Testimonials section with the custom **Audio Player UI**.
- [ ] **Task 2.B.6 (Naira - Public UI):** Build the public Blog index and dynamic Post pages.

---

## Sprint 3: Advanced Features & Polish (Parallel Development)

### Epic C: Dynamic Layout & UI Master (Assigned to Naira)
- [ ] **Task 3.C.1 (Naira - DB/API):** Create Schema and API for `SectionLayout` to store the order and visibility of homepage sections.
- [ ] **Task 3.C.2 (Naira - Dashboard UI):** Build a Drag-and-Drop interface in the dashboard to reorder sections and toggle them on/off.
- [ ] **Task 3.C.3 (Naira - Public UI):** Wire the public Homepage to dynamically render sections based on the DB order instead of hardcoded components.
- [ ] **Task 3.C.4 (Naira - Public UI):** Build the 3D Interactive Hero section (using Three.js / React Three Fiber).

### Epic D: Lead Generation & SEO (Assigned to Menna)
- [ ] **Task 3.D.1 (Menna - DB/API):** Create Schema and API for `Inquiries` (Contact Form submissions).
- [ ] **Task 3.D.2 (Menna - API):** Implement email notification trigger when a new inquiry is submitted (e.g., using Resend or NodeMailer).
- [ ] **Task 3.D.3 (Menna - Public UI):** Build the complex Contact Request Form with validation (Budget, Timeline, Service selection).
- [ ] **Task 3.D.4 (Menna - Dashboard UI):** Build a "Leads/Inquiries" viewer in the Admin Dashboard.
- [ ] **Task 3.D.5 (Menna - Global):** Implement Next.js SEO Metadata API for dynamic pages (Projects) so the client can edit Meta Titles/Descriptions.

---

## Sprint 4: Final Assembly & Testing
- [ ] **Task 4.1 (Menna):** Test Project case studies on mobile (ensure the Browser Mockup is responsive).
- [ ] **Task 4.2 (Naira):** Test the Audio player on iOS/Android browsers.
- [ ] **Task 4.3 (Shared):** End-to-end testing of the complete Dashboard.
- [ ] **Task 4.4 (Shared):** Final Vercel deployment and database index optimization.
