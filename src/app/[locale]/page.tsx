import { getTranslations } from 'next-intl/server';
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { H1, H2, H3, P, Large, Small, Muted } from "@/components/ui/typography";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function Home() {
  const t = await getTranslations('HomePage');
  const ct = await getTranslations('Contact');

  return (
    <main className="container mx-auto p-8 space-y-12" dir="auto">
      <div className="flex items-center justify-between">
        <LocaleSwitcher />
        <div className="flex items-center gap-6">
          <Link
            href="/contact"
            className="text-sm font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-400"
          >
            {ct('title')}
          </Link>
          <P>/{t('title')}</P>
        </div>
      </div>
      <div className="space-y-4">
        <H1>{t('title')}</H1>
        <P>{t('tagline')}</P>
      </div>

      <section className="space-y-6">
        <H2>Typography</H2>
        <div className="space-y-4 border p-6 rounded-lg bg-slate-50 dark:bg-slate-900">
          <H1>Heading 1 (H1)</H1>
          <H2>Heading 2 (H2)</H2>
          <H3>Heading 3 (H3)</H3>
          <P>This is a standard paragraph component (P). It&apos;s great for long-form text and general descriptions.</P>
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
