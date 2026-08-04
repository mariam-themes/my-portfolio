# Implementation Plan: Luxury Designer Portfolio

## Project Structure
We are using Next.js App Router. The folder structure strictly separates Menna and Naira's features.

```text
designer-portfolio-app/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public website routes
│   │   │   ├── projects/          # Menna's Feature
│   │   │   ├── blog/              # Naira's Feature
│   │   │   ├── testimonials/      # Naira's Feature
│   │   │   └── page.tsx           # Homepage (Dynamic Layout)
│   │   ├── admin/                 # Dashboard routes (Protected)
│   │   │   ├── projects/          # Menna's Admin UI
│   │   │   ├── layout/            # Naira's Admin UI
│   │   │   └── page.tsx           # Dashboard Home
│   │   └── api/
│   │       ├── projects/          # Menna's APIs
│   │       ├── admin/projects/    # Menna's Auth APIs
│   │       └── layout/            # Naira's APIs
│   ├── components/
│   │   ├── shared/                # UI used by both (Buttons, Inputs, Navbar)
│   │   ├── projects/              # Browser Mockup, Project Cards (Menna)
│   │   └── layout/                # Audio Player, Section Dragger (Naira)
│   ├── lib/
│   │   ├── mongodb.ts             # DB Connection (Shared)
│   │   ├── auth.ts                # NextAuth Config (Shared)
│   │   └── cloudinary.ts          # Upload utility (Shared)
│   └── models/                    # Mongoose Schemas
│       ├── Project.ts             # Menna
│       ├── SectionLayout.ts       # Naira
│       └── Testimonial.ts         # Naira
```

## Development Setup
### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Account (or local MongoDB for testing)
- Cloudinary Account (for media uploads)

### Environment Configuration
Create a `.env.local` file:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@designer.com
ADMIN_PASSWORD=secure_password_hash
```

## Coding Standards
- **Styling:** Use Tailwind CSS for all utility styling. For complex GSAP animations, you may use CSS Modules.
- **Data Fetching:** Use Next.js App Router Server Components wherever possible to reduce client-side JavaScript. Only use `"use client"` for interactive components (e.g., GSAP Canvas, Browser Mockup, Audio Player).
- **Branching Strategy (GitHub):** 
  - `main`: Stable production branch.
  - `menna/projects-feature`: Menna's working branch.
  - `naira/layout-feature`: Naira's working branch.

## Implementation Order
### Phase 1: Foundation (Sprint 1)
1. Run `npx create-next-app@latest`.
2. Install dependencies: `mongoose`, `next-auth`, `gsap`, `three`, `@react-three/fiber`, `cloudinary`.
3. Set up `src/lib/mongodb.ts`.
4. Create the base layout for `/admin` (Sidebar + Auth wrapper).
5. Push to GitHub so the other developer can pull.

### Phase 2: Parallel Core (Sprint 2)
- Menna builds the `Project` model, the `/api/admin/projects` routes, and the Admin UI for uploading projects.
- Naira builds the `Testimonial` model, the `/api/admin/testimonials` routes, and the Admin UI for managing reviews.

### Phase 3: Public UI Integration (Sprint 2 & 3)
- Menna builds the `app/(public)/projects/[slug]` route with the Three.js and GSAP Browser Mockup.
- Naira builds the `app/(public)/page.tsx` dynamic layout fetcher and the Audio Player component.

## Key Implementation Notes
### Menna's Browser Mockup Component
To ensure performance, the "long screenshot" must be optimized using Cloudinary's dynamic resizing. The internal scroll should be managed using GSAP `ScrollTrigger` pinned inside a container, rather than native overflow scrolling, to ensure smooth momentum on all devices.

### Naira's Section Reordering
The `SectionLayout` model should just be an array of section names with an `order` integer and `isVisible` boolean. On the public homepage, fetch this array and `map()` over it, dynamically importing the corresponding React components.

## Testing Strategy
- Test the DB connections first.
- Manually test the Cloudinary upload limits (Next.js API limits payloads to 4MB by default. For large videos/mockups, Menna MUST implement signed uploads directly from the client browser to Cloudinary).

## Next Steps to Start Coding
1. Run `npx create-next-app`.
2. Setup Git and push to GitHub.
3. Split the Sprint 1 tasks.
