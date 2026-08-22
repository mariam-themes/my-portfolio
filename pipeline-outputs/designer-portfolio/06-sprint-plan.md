# Sprint & Task Plan: Luxury Designer Portfolio

This document splits the entire project into equal, end-to-end tasks (Vertical Slices) assigned to Menna and Naira. Each developer is responsible for their feature from the Database level all the way to the Public UI.

## Overview of Division
- **Menna:** Projects & Case Studies | Contact/Lead Generation | About Me | Deployment.
- **Naira:** Testimonials & Blog | Content/Visibility/Services Manager | Homepage UI Sections (Services, Footer, Other Projects) | i18n.
- **Shared / Initial:** Both collaborate on base setup before splitting independently.

---

## Sprint 1: Foundation & Base Setup (Shared Work)
*Goal: Setup the repository, database connection, authentication, and core UI components.*

- [✓] **Task 1.1 (Shared - Menna):** Initialize Next.js App Router, Tailwind CSS, and GSAP. Set up folder structure.
- [✓] **Task 1.2 (Shared - Menna):** Configure MongoDB Atlas and set up Mongoose connection utility.
- [✓] **Task 1.3 (Shared - Naira):** Implement NextAuth.js for the Admin Dashboard (Email/Password).
- [✓] **Task 1.4 (Shared - Menna):** Build the Base Dashboard Layout (Sidebar, Header, Auth protection).
- [✓] **Task 1.5 (Shared - Naira):** Build Shared Public UI Components (Buttons, Inputs, Base Typography).

---

## Sprint 2: Core Vertical Slices (Parallel Development)

### Epic A: Projects & Case Studies (Assigned to Menna)
*Menna takes full ownership of this feature. (8 tasks)*
- [✓] **Task 2.A.1 (Menna - DB):** Create the Mongoose `Project` Schema.
- [✓] **Task 2.A.1.b (Menna - DB):** Refactor `Project` Schema to support Arabic/English (i18n) objects for title, description, platform, etc.
- [✓] **Task 2.A.2 (Menna - API):** Build GET, POST, PUT, DELETE routes for `/api/projects` and `/api/admin/projects`.
- [✓] **Task 2.A.3 (Menna - Infra):** Implement Cloudinary upload logic specifically for massive Full-Page Screenshots and videos.
- [✓] **Task 2.A.4 (Menna - Dashboard UI):** Build the Admin "Add/Edit Project" form with image uploaders and dynamic fields.
- [~] **Task 2.A.4.b (CANCELED):** ~~Refactor `ProjectForm` UI to include Arabic fields (side-by-side or Tabs).~~ → Superseded by the decision to implement a full language toggle (i18n) across the entire Dashboard and Portfolio — no per-field Arabic duplication needed.
- [✓] **Task 2.A.5 (Menna - Public UI):** Build the public "Portfolio List" page — full `/work` page with filtering and GSAP animations for cards.
- [✓] **Task 2.A.6 (Menna - Public UI):** Build the dynamic "Project Case Study" page (`app/work/[slug]`), including the **Browser Mockup Component** with internal scroll behavior.
- [✓] **Task 2.A.7 (Menna - Public UI):** Build the **"Projects Preview Section"** on the Homepage — displays only the 4 most recent projects, with a "See All Work →" button that navigates to the full `/work` page.

### Epic B: Testimonials & Blog (Assigned to Naira)
*Naira takes full ownership of these features. (7 tasks)*
- [✓] **Task 2.B.1 (Naira - DB):** Create the Mongoose `Testimonial` and `Blog` Schemas.
- [✓] **Task 2.B.2 (Naira - API):** Build CRUD API routes for Testimonials and Blogs.
- [✓] **Task 2.B.3 (Naira - Infra):** Implement Cloudinary upload logic specifically for Audio files (Voice Testimonials).
- [✓] **Task 2.B.4 (Naira - Dashboard UI):** Build the Admin panels for creating Blog posts (Rich Text Editor) and adding Testimonials.
- [✓] **Task 2.B.5 (Naira - Public UI):** Build the Testimonials section with the custom **Audio Player UI**.
- [✓] **Task 2.B.6 (Naira - Public UI):** Build the public Blog index (`/blog`) and dynamic Post pages (`/blog/[slug]`).
- [✓] **Task 2.B.7 (Naira - Public UI):** Build the **"Blog Preview Section"** on the Homepage — displays recent posts with a "See All Articles" button that navigates to the full `/blog` page.

---

## Sprint 3: Advanced Features & Polish (Parallel Development)

### Epic C: Content, Visibility & Homepage Sections (Assigned to Naira)
*All homepage section UI designs + their dynamic data controls. (9 tasks)*
- [✓] **Task 3.C.1 (Naira - DB/API):** Create Schema and API for `GlobalSettings` (section visibility toggles, Hero text, Footer content, "Other Projects" gallery).
- [✓] **Task 3.C.2 (Naira - Dashboard UI):** Build "Site Settings" panel to toggle sections on/off and edit Hero & Footer text content.
- [✓] **Task 3.C.3 (Naira - DB/API):** Create Schema and API for `Services` (Title, description, icon, order).
- [✓] **Task 3.C.4 (Naira - Dashboard UI):** Build "Services Manager" in the Admin Dashboard (CRUD for services + "Other Projects" image uploader).
- [✓] **Task 3.C.5 (Naira - Public UI):** Build the 3D Interactive Hero section (using Three.js / React Three Fiber).
- [✓] **Task 3.C.6 (Naira - Public UI):** Design and build the **Services section** on the public homepage (animated cards, icons, dynamic data from API).
- [✓] **Task 3.C.7 (Naira - Public UI):** Design and build the **"Other Projects" gallery section** on the public homepage (image grid, dynamic from DB).
- [✓] **Task 3.C.8 (Naira - Public UI):** Design and build the **Footer** on the public site (links, social icons, dynamic content from `GlobalSettings`).
- [✓] **Task 3.C.9 (Naira - Public UI):** Wire the complete Homepage to respect section visibility toggles from `GlobalSettings`.
- [ ] **Task 3.C.10 (Naira - Full Stack):** **SEO Retrofit:** Add `seoTitle` and `seoDescription` fields to the `Blog` and `GlobalSettings` models. Update the Admin panels to let the client edit them, and implement Next.js Metadata in the Blog and Homepage to read these values (following Menna's pattern in Projects).

### Epic D: Lead Generation & SEO (Assigned to Menna)
*(5 tasks)*
- [✓] **Task 3.D.1 (Menna - DB/API):** Create Schema and API for `Inquiries` (Contact Form submissions).
- [✓] **Task 3.D.2 (Menna - API):** Implement email notification trigger when a new inquiry is submitted (using Resend or NodeMailer).
- [✓] **Task 3.D.3 (Menna - Public UI):** Build the **Contact Section** on the homepage with the complex Request Form — includes a **Service input field (free text)**, plus Budget, Timeline fields and full validation.
- [✓] **Task 3.D.4 (Menna - Dashboard UI):** Build a "Leads/Inquiries" viewer in the Admin Dashboard.
- [✓] **Task 3.D.5 (Menna - Global):** Implement Next.js SEO Metadata API for dynamic pages (Projects) so the client can edit Meta Titles/Descriptions.

### Epic F: About Me (Assigned to Naira)
*Full ownership of the About Me feature — DB to Public Page. (4 tasks)*
- [ ] **Task 3.F.1 (Naira - DB/API):** Create Schema and API for `AboutMe` (bio, photo, skills, experience, CV link).
- [ ] **Task 3.F.2 (Naira - Dashboard UI):** Build "About Me Editor" in the Admin Dashboard to update bio, upload photo, add/remove skills.
- [ ] **Task 3.F.3 (Naira - Public UI):** Design and build the **About Me Section** on the homepage — animated, cinematic layout pulling dynamic data from the API.

### Epic E: i18n (Assigned to Menna)
*(1 task — already done)*
- [✓] **Task 3.E.1 (Menna - Infra):** Setup Next.js `[locale]` routing, `next-intl` configuration, and Middleware for language detection.
- [✓] **Task 3.E.2 (Menna - Public UI):** Build the public **Navbar (Header) component** (logo, links: About / Work / Contact / Blog, locale switcher button) and wire it with smooth-scroll anchor navigation — links scroll to their corresponding section on the homepage if already there, or navigate to homepage then scroll if coming from another page. Add it to the public layout so it appears on all public pages.

---

> **Workload Summary:**
> - **Menna:** 3 (Sprint 1) + 7 (Epic A) + 5 (Epic D) + 1 (Epic E) + 2 (Sprint 3.5 Vercel) + 3 (Sprint 4 Testing/Shared) + 1 (Transferred UI task) = **22 tasks**
> - **Naira:** 2 (Sprint 1) + 7 (Epic B) + 9 (Epic C) + 4 (Epic F) + 0 (Sprint 3.5) + 2 (Sprint 4 Testing/Shared) = **23 tasks**
>
> *(Note: Menna takes ownership of overarching homepage routing/layout tasks (3.F.4) to perfectly balance the total count, while keeping Vercel deployment exclusively hers. Naira has an extra SEO task added.)*

---

## Sprint 3.5: Deployment (Before Testing)
*Must be done BEFORE Sprint 4 testing — you can't test on mobile/iOS without a live URL.*

- [ ] **Task 3.5.1 (Menna - Infra):** Configure Vercel project, connect GitHub repo, set all `.env` variables (MongoDB URI, NextAuth, Cloudinary, Resend keys).
- [ ] **Task 3.5.2 (Menna - Infra):** First production deploy to Vercel and verify all pages are accessible on the live URL.

---

## Sprint 4: Final Assembly & Testing
*Requires live Vercel URL from Sprint 3.5.*

- [ ] **Task 4.1 (Menna):** Test all Project Case Study pages on mobile (responsive layout, Browser Mockup behavior).
- [ ] **Task 4.2 (Naira):** Test the Audio Testimonials player on iOS/Android browsers (Safari compatibility).
- [ ] **Task 4.3 (Menna):** Test the About Me, Contact, Work, and Blog public pages across devices.
- [ ] **Task 4.4 (Shared):** End-to-end testing of the complete Admin Dashboard (CRUD for all features).
- [ ] **Task 4.5 (Shared):** Final Vercel deployment with database index optimization and performance audit.
- [✓] **Task 4.6 (Menna):** Wire up the Admin Dashboard Homepage to fetch and display real statistics (Projects, Blogs, Inquiries) and Recent Activity.
- [✓] **Task 4.7 (Menna):** Implement a live Notification Dropdown in the Admin Header to show incoming leads/inquiries in real-time.
- [✓] **Task 4.8 (Menna):** Build Global Search API and integrate bilingual, debounced search UI in the Admin Header.
