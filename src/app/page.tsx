import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { H1, H2, H3, P, Large, Small, Muted } from "@/components/ui/typography";

export default function Home() {
  return (
    <main className="container mx-auto p-8 space-y-12">
      <div className="space-y-4">
        <H1>UI Components Showcase</H1>
        <P>This is a temporary page to showcase the shared UI components we built for Task 1.5.</P>
      </div>

      <section className="space-y-6">
        <H2>Typography</H2>
        <div className="space-y-4 border p-6 rounded-lg bg-slate-50 dark:bg-slate-900">
          <H1>Heading 1 (H1)</H1>
          <H2>Heading 2 (H2)</H2>
          <H3>Heading 3 (H3)</H3>
          <P>This is a standard paragraph component (P). It's great for long-form text and general descriptions.</P>
          <Large>This is the Large component, good for subtitles.</Large>
          <Small>This is the Small component, great for legal text or fine print.</Small>
          <Muted>This is the Muted component, perfect for subtle hints.</Muted>
        </div>
      </section>

      <section className="space-y-6">
        <H2>Buttons</H2>
        <div className="flex flex-wrap gap-4 border p-6 rounded-lg bg-slate-50 dark:bg-slate-900">
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </section>

      <section className="space-y-6">
        <H2>Inputs</H2>
        <div className="max-w-sm space-y-4 border p-6 rounded-lg bg-slate-50 dark:bg-slate-900">
          <div className="space-y-1">
            <Large>Standard Input</Large>
            <Input type="text" placeholder="Enter your name..." />
          </div>
          <div className="space-y-1">
            <Large>Disabled Input</Large>
            <Input type="email" placeholder="Email address..." disabled />
          </div>
        </div>
      </section>
    </main>
  );
}
