# Interview Brief: Luxury Designer Portfolio

## Idea Summary
A professional, high-end, and dark luxury creative agency-style portfolio website for a designer specializing in Branding, Web/E-commerce design, and AI services. The platform will feature advanced 3D elements, GSAP animations, and a fully custom Next.js/MongoDB CMS dashboard for the client to manage all content dynamically.

## Problem Statement
The client needs a portfolio that isn't just a standard template, but an immersive visual experience that demonstrates their capabilities as a top-tier designer. The site needs to handle complex project presentations (like full-page scrollable mockups) and be completely manageable by the client without developer intervention.

## Target Users
- **Primary Users (Visitors):** Potential high-end clients, agencies, and businesses looking for premium branding, web design, or AI integration services.
- **Secondary Users (Admin):** The designer (client), using the custom dashboard to manage portfolio pieces, services, testimonials, blog posts, and dynamic UI elements like navbar and sections.

## Proposed Solution
A custom-built Next.js application with a dark luxury aesthetic (burgundy/wine red accents). 
Key features include:
- Interactive 3D Hero section with depth and typography.
- Scroll-driven animations, parallax, and custom cursor using GSAP/Three.js.
- Independent, detailed Project Case Study pages featuring video, images, full-page scrolling browser mockups, and audio testimonials.
- A comprehensive Custom Dashboard (CMS) to manage projects, services, blogs, testimonials, SEO, and even section visibility/ordering.
- A robust Contact/Project Request form capturing detailed client needs (budget, timeline, service type).

## Key Constraints
- **Performance:** Must maintain high performance and responsiveness across devices despite heavy animations and 3D rendering.
- **Workflow / Team Constraint:** Development must be cleanly split between two developers (Menna and Naira) in parallel vertical slices (Full-stack feature ownership from DB to UI), avoiding merge conflicts and architecture bleed.
- **Scalability:** The architecture must be designed to easily expand in the future to include a Digital Store, Courses, and additional Landing Pages.

## Technology Preferences
### Frontend
Next.js, TypeScript, Tailwind CSS, GSAP / ScrollTrigger, Three.js / React Three Fiber.

### Backend
Next.js API Routes (or custom Node backend).

### Database
MongoDB with Mongoose.

### Infrastructure
Cloudinary (for optimized image/video hosting).

### Mobile
Responsive design supporting Mobile, Tablet, and Desktop.

### Team Constraints
Menna and Naira must be able to work in complete parallel on independent modules. The AI agent acts as the orchestrator to enforce boundaries and ensure architectural cohesion.

## Success Criteria
- The client can independently manage all content via the dashboard.
- The site achieves a "wow" factor with its animations without lagging on standard devices.
- Menna and Naira successfully deliver their respective modules without blocking each other.

## Must-Have Features
- Home, About, Services, Portfolio, Case Studies, Testimonials, Blog, Contact.
- Project pages with full-page scrollable browser frames and Live URL buttons.
- Audio player for voice testimonials.
- Custom CMS Dashboard (CRUD for all major content types, section ordering, featured projects).

## Nice-to-Have Features (Future Scope)
- Digital Store
- Courses
- Landing Pages
- Additional Services

## Competitive Landscape
Top-tier global creative agencies (e.g., Awwwards-winning sites). The differentiator is the blend of highly customized 3D/animation with a completely tailored, easy-to-use bespoke CMS.

## Open Questions
- None.

## Technical Decisions Made
- **3D Assets:** No ready-made 3D files. We will program abstract 3D shapes and particles (using Three.js / React Three Fiber) that fit the Dark Luxury theme.
- **Authentication:** Standard email/password authentication for the admin dashboard.

## Interview Notes
- User provided an extremely detailed and clear brief upfront, allowing us to skip the basic discovery questions.
- High emphasis on "Dark Luxury" design.
- The division of labor between Menna and Naira is a critical project management requirement that I will enforce as the pipeline continues.
