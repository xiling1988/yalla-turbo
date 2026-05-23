'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Manrope, Caveat } from 'next/font/google'
import Image from 'next/image'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

type Profile = {
  name: string
  style: string
  locationPrompt: string
  sub: string
  portrait: string
  backdrop: string
}

const PROFILES: Profile[] = [
  {
    name: 'Lucy',
    style: 'Morning Flow',
    locationPrompt: 'Book a lesson with Lucy at Burj Khalifa Park',
    sub: 'Sunrise Vinyasa • Beginner–Intermediate • English',
    portrait:
      'https://images.pexels.com/photos/9136265/pexels-photo-9136265.jpeg',
    backdrop:
      'https://images.pexels.com/photos/9272796/pexels-photo-9272796.jpeg',
  },
  {
    name: 'Omar',
    style: 'Evening Vinyasa',
    locationPrompt: 'Evening Vinyasa with Omar on Kite Beach',
    sub: 'Sunset sessions • Strength & Mobility • English/Arabic',
    portrait:
      'https://images.pexels.com/photos/6725907/pexels-photo-6725907.jpeg',
    backdrop:
      'https://images.pexels.com/photos/6224937/pexels-photo-6224937.jpeg',
  },
  {
    name: 'Aisha',
    style: 'Prenatal Calm',
    locationPrompt: 'Prenatal calm with Aisha in Creek Harbour',
    sub: 'Gentle prenatal • Breathwork • English/Urdu',
    portrait:
      'https://images.pexels.com/photos/8436761/pexels-photo-8436761.jpeg',
    backdrop:
      'https://images.pexels.com/photos/8436724/pexels-photo-8436724.jpeg',
  },
  {
    name: 'Miguel',
    style: 'Power Yoga',
    locationPrompt: 'Power Yoga with Miguel in Alserkal Avenue',
    sub: 'Dynamic strength • Advanced options • English/Spanish',
    portrait:
      'https://images.pexels.com/photos/8174432/pexels-photo-8174432.jpeg',
    backdrop:
      'https://images.pexels.com/photos/8173538/pexels-photo-8173538.jpeg',
  },
]

export default function YallasanaComingSoon() {
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState<string>('')

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = useMemo(() => PROFILES[index % PROFILES.length], [index])

  useEffect(() => {
    if (paused) return
    const id = setInterval(
      () => setIndex((i) => (i + 1) % PROFILES.length),
      4500
    )
    return () => clearInterval(id)
  }, [paused])

  // Handle anchor link clicks manually to prevent scroll shifting
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href === '#') return

      e.preventDefault()
      const targetId = href.slice(1)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        const headerOffset = 64 // navbar height (h-16 = 64px)
        const elementPosition = targetElement.getBoundingClientRect().top
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'auto',
        })
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, source: 'landing-v1' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Show actual error message from API for better debugging
        setStatus('error')
        setMessage(
          data?.message ||
            data?.detail ||
            'Something went wrong. Please try again or DM us on Instagram.'
        )
        console.error('Subscribe API error:', res.status, data)
        return
      }
      setStatus('success')
      setMessage(
        data && data.message
          ? data.message
          : "You're on the list. We'll be in touch soon! ✨"
      )
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
      console.error('Subscribe error:', err)
    }
  }

  return (
    <div
      className={`${manrope.className} relative min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-stone-50 text-neutral-900 overflow-hidden`}
    >
      {/* Scattered animated blurred blobs (purplish palette) */}
      {[
        {
          cls: '-top-32 -left-24 h-[28rem] w-[28rem] bg-purple-300',
          anim: { y: [0, 40, 0], x: [0, 25, 0] },
          dur: 28,
        },
        {
          cls: '-bottom-32 -right-32 h-[30rem] w-[30rem] bg-fuchsia-300',
          anim: { y: [0, -36, 0], x: [0, -28, 0] },
          dur: 32,
        },
        {
          cls: 'top-[20%] right-[10%] h-[18rem] w-[18rem] bg-violet-300',
          anim: { y: [0, 22, 0], x: [0, -12, 0] },
          dur: 24,
        },
        {
          cls: 'bottom-[15%] left-[20%] h-[16rem] w-[16rem] bg-indigo-300',
          anim: { y: [0, -18, 0], x: [0, 14, 0] },
          dur: 26,
        },
        {
          cls: 'top-1/2 left-1/3 h-[22rem] w-[22rem] bg-purple-200',
          anim: { scale: [1, 1.08, 1] },
          dur: 20,
        },
        {
          cls: 'top-8 right-1/3 h-[14rem] w-[14rem] bg-fuchsia-200',
          anim: { rotate: [0, 6, -4, 0] },
          dur: 30,
        },
      ].map((b, i) => (
        <motion.div
          key={i}
          className={`pointer-events-none absolute ${b.cls} rounded-full opacity-30 blur-3xl mix-blend-multiply`}
          animate={b.anim}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* NAV */}
      <header className='sticky top-0 z-50 mx-auto flex h-16 w-full max-w-6xl items-center justify-between bg-transparent backdrop-blur-md px-4 pt-10 mb-3'>
        <div className='flex items-center gap-3 bg-transparent'>
          <Image
            src='/yallasana-icon.png'
            alt='Yallasana logo'
            width={64}
            height={64}
            className='object-contain h-16 w-16'
            priority
          />
          <span className='text-xl font-semibold tracking-tight'>
            Yallasana
          </span>
        </div>
        <nav className='hidden gap-6 md:flex'>
          <a
            className='text-sm text-neutral-600 hover:text-neutral-900'
            href='#students'
          >
            Students
          </a>
          <a
            className='text-sm text-neutral-600 hover:text-neutral-900'
            href='#teachers'
          >
            Teachers
          </a>
          <a
            className='text-sm text-neutral-600 hover:text-neutral-900'
            href='#faqs'
          >
            FAQ
          </a>
        </nav>
      </header>

      {/* HERO with slideshow */}
      <main
        className='relative mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pt-16'
        style={{ willChange: 'auto' }}
      >
        <div className='grid items-center gap-10 md:grid-cols-2'>
          {/* Left: Slideshow */}
          <div
            className='relative aspect-[16/12] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm'
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Backdrop image */}
            <div className='absolute inset-0'>
              <div
                className='absolute inset-0 bg-center bg-cover'
                style={{
                  backgroundImage: `url(${current.backdrop})`,
                  willChange: 'auto',
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent' />
            </div>

            {/* Foreground content */}
            <div className='relative z-10 flex h-full flex-col justify-end p-5'>
              <div className='flex items-end gap-3'>
                <img
                  src={current.portrait}
                  alt={`${current.name} portrait`}
                  className='h-16 w-16 rounded-2xl object-cover ring-2 ring-white/80 shadow'
                  width={64}
                  height={64}
                  loading='lazy'
                />
                <div className='rounded-2xl bg-white/90 px-4 py-3 shadow backdrop-blur'>
                  <p className='text-sm font-semibold leading-tight text-neutral-900'>
                    {current.locationPrompt}{' '}
                    <span className='align-middle'>🌿</span>
                  </p>
                  <p className='mt-0.5 text-xs text-neutral-600'>
                    {current.sub}
                  </p>
                </div>
              </div>

              {/* Indicators & controls */}
              <div className='mt-3 flex items-center justify-between'>
                <div className='flex gap-2'>
                  {PROFILES.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index
                          ? 'w-6 bg-white'
                          : 'w-3 bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
                <div className='flex gap-2'>
                  <button
                    className='rounded-full bg-white/80 p-2 shadow hover:bg-white'
                    aria-label='Previous'
                    onClick={() =>
                      setIndex(
                        (i) => (i - 1 + PROFILES.length) % PROFILES.length
                      )
                    }
                  >
                    ‹
                  </button>
                  <button
                    className='rounded-full bg-white/80 p-2 shadow hover:bg-white'
                    aria-label='Next'
                    onClick={() => setIndex((i) => (i + 1) % PROFILES.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Copy + form */}
          <div>
            <div className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs text-sky-700'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-sky-500' />
              Coming soon across the UAE
            </div>
            <h1
              className={`${caveat.className} mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl`}
            >
              Find and book trusted{' '}
              <span className='text-sky-700'>yoga teachers</span> near you
            </h1>
            <p className='mt-4 max-w-[50ch] text-neutral-600'>
              Real teachers. Real places. Real sessions. Join the early list and
              help shape Yallasana.
            </p>

            {/* ROLE TOGGLE */}
            <div className='mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white p-1 text-sm shadow-sm'>
              <button
                onClick={() => setRole('student')}
                className={`rounded-xl px-4 py-2 transition ${
                  role === 'student'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                I’m a Student
              </button>
              <button
                onClick={() => setRole('teacher')}
                className={`rounded-xl px-4 py-2 transition ${
                  role === 'teacher'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                I’m a Teacher
              </button>
            </div>

            {/* EMAIL CAPTURE */}
            <form
              onSubmit={handleSubmit}
              className='mt-4 flex max-w-md items-center gap-2'
            >
              <input
                type='email'
                required
                placeholder={role === 'teacher' ? 'Work email' : 'Your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='h-12 flex-1 rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500'
              />
              <input
                type='text'
                name='company'
                className='hidden'
                onChange={() => {}}
              />
              <motion.button
                type='submit'
                disabled={status === 'loading'}
                className='h-12 rounded-xl bg-sky-700 px-5 font-medium text-white shadow-sm transition hover:bg-sky-800 disabled:opacity-60'
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {status === 'loading'
                  ? 'Joining…'
                  : role === 'teacher'
                  ? 'Join as Teacher'
                  : 'Join Waitlist'}
              </motion.button>
            </form>
            {message && (
              <p
                className={`mt-2 text-sm ${
                  status === 'error' ? 'text-rose-600' : 'text-sky-700'
                }`}
              >
                {message}
              </p>
            )}

            {/* SOCIAL */}
            <div className='mt-6 flex items-center gap-4 text-sm text-neutral-600'>
              <a
                href='https://www.instagram.com/yallasana.app/'
                aria-label='Instagram'
                className='hover:text-neutral-900 hover:underline'
              >
                Instagram
              </a>
              <span className='h-1 w-1 rounded-full bg-neutral-300' />
              <a
                href='https://www.tiktok.com/@yallasana'
                aria-label='TikTok'
                className='hover:text-neutral-900 hover:underline'
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* SPLIT VALUE PROPS */}
        <section
          id='students'
          className='mx-auto mt-20 grid max-w-5xl gap-10 md:grid-cols-2'
        >
          <ValueBlock
            eyebrow='For Students'
            title='Book better yoga, faster'
            points={[
              'Search by location, style, level, and availability',
              'Upfront prices and clear cancellation terms',
              'DM teachers or book instantly (when live)',
            ]}
          />
          <ValueBlock
            id='teachers'
            eyebrow='For Teachers'
            title='Fill your schedule, minus the admin'
            points={[
              'Get discovered by nearby yogis',
              'Set your rates, travel radius, and calendar',
              'Keep cash or accept in‑app payments (optional)',
            ]}
          />
        </section>

        {/* FAQ */}
        <section id='faqs' className='mx-auto mt-20 max-w-3xl'>
          <h2
            className={`${caveat.className} text-2xl font-semibold tracking-tight`}
          >
            Quick questions
          </h2>
          <div className='mt-6 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white'>
            <FAQ
              q='When will Yallasana launch?'
              a='We’re opening invites in phases across Dubai and Abu Dhabi. Join the waitlist and you’ll be first to know.'
            />
            <FAQ
              q='Is it free to join the waitlist?'
              a='Yes. We’ll email you when we’re ready for early access.'
            />
            <FAQ
              q='I’m a teacher without a freelance license—can I still join?'
              a='Yes. You can list your profile and take cash payments off‑platform. In‑app payments will be optional for licensed teachers.'
            />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className='relative mx-auto w-full max-w-6xl px-4 pb-10 pt-6 text-sm text-neutral-500'>
        <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
          <p>© {new Date().getFullYear()} Yallasana. All rights reserved.</p>
          <div className='flex items-center gap-4'>
            <a
              href='https://www.instagram.com/yallasana.app/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
              className='text-neutral-500 transition-colors hover:text-neutral-800'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='h-5 w-5'
              >
                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
              </svg>
            </a>
            <a
              href='https://www.tiktok.com/@yallasana'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='TikTok'
              className='text-neutral-500 transition-colors hover:text-neutral-800'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='h-5 w-5'
              >
                <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
              </svg>
            </a>
            <a
              href='https://wa.me/971526254042'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='WhatsApp'
              className='text-neutral-500 transition-colors hover:text-neutral-800'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='h-5 w-5'
              >
                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ValueBlock({
  id,
  eyebrow,
  title,
  points,
}: {
  id?: string
  eyebrow: string
  title: string
  points: string[]
}) {
  return (
    <motion.div
      id={id}
      className='rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm'
    >
      <p className='text-md font-medium uppercase tracking-wider text-sky-700'>
        {eyebrow}
      </p>
      <h3 className={`${caveat.className} mt-1 text-2xl font-semibold`}>
        {title}
      </h3>
      <ul className='mt-3 space-y-2 text-md text-neutral-700'>
        {points.map((p) => (
          <li key={p} className='flex items-start gap-2'>
            <span className='mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-700' />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className='group p-4'>
      <summary className='cursor-pointer list-none font-medium text-neutral-900'>
        <span className='mr-2 inline-block h-1.5 w-1.5 rounded-full bg-sky-700 align-middle' />
        {q}
      </summary>
      <p className='mt-2 text-sm text-neutral-600'>{a}</p>
    </details>
  )
}
