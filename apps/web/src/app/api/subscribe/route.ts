import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Ensure Node runtime (Edge lacks 'crypto')
export const runtime = 'nodejs'

function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function getDCFromKey(apiKey: string) {
  const parts = apiKey.split('-')
  return parts[1] // e.g. "us1", "us21"
}

export async function POST(req: Request) {
  try {
    const { email, role = 'student', source = 'landing-v1' } = await req.json()

    if (!email || !validEmail(email)) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 })
    }
    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    const apiKey = process.env.MC_API_KEY
    const listId = process.env.MC_LIST_ID

    if (!apiKey || !listId) {
      console.error('Missing envs', { hasKey: !!apiKey, hasList: !!listId })
      return NextResponse.json(
        { message: 'Server misconfigured' },
        { status: 500 }
      )
    }

    const dc = getDCFromKey(apiKey)
    if (!dc) {
      return NextResponse.json(
        { message: 'Invalid API key (no dc suffix)' },
        { status: 500 }
      )
    }

    const auth = 'Basic ' + Buffer.from('any:' + apiKey).toString('base64')

    // --- Preflight: verify the Audience exists ---
    const listProbe = await fetch(
      `https://${dc}.api.mailchimp.com/3.0/lists/${listId}`,
      {
        headers: { Authorization: auth },
        cache: 'no-store',
      }
    )
    if (!listProbe.ok) {
      const detail = await listProbe.text().catch(() => '')
      console.error('List probe failed:', listProbe.status, detail)
      return NextResponse.json(
        {
          message:
            'Mailchimp Audience not found (check MC_LIST_ID and account)',
          status: listProbe.status,
          detail: safeDetail(detail),
          hint:
            'Confirm Audience ID in Mailchimp: Audience → Settings → Audience name and defaults. ' +
            'Make sure you’re using the same account as the API key.',
        },
        { status: 500 }
      )
    }

    // Upsert member
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex')
    const upsertUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`
    const upsertBody = {
      email_address: email,
      status_if_new: 'subscribed', // Changed from 'pending' so contacts appear immediately
      merge_fields: { ROLE: role, SOURCE: source },
    }
    
    // Note: If ROLE and SOURCE merge fields don't exist in your Mailchimp audience,
    // the API will return an error. Create these merge fields in Mailchimp:
    // Audience → Settings → Audience fields and |MERGE| tags

    const upsertRes = await fetch(upsertUrl, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(upsertBody),
      cache: 'no-store',
    })

    if (!upsertRes.ok) {
      const errText = await upsertRes.text().catch(() => '')
      console.error('Mailchimp upsert failed:', upsertRes.status, errText)
      return NextResponse.json(
        {
          message: 'Mailchimp upsert failed',
          status: upsertRes.status,
          detail: safeDetail(errText),
        },
        { status: 500 }
      )
    }

    // Tag by role
    const tagName = role === 'teacher' ? 'waitlist-teacher' : 'waitlist-student'
    const tagUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}/tags`
    const tagRes = await fetch(tagUrl, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: [{ name: tagName, status: 'active' }] }),
    })

    if (!tagRes.ok) {
      const errText = await tagRes.text().catch(() => '')
      console.error('Mailchimp tag failed:', tagRes.status, errText)
      return NextResponse.json(
        {
          message: 'Mailchimp tag failed',
          status: tagRes.status,
          detail: safeDetail(errText),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "You're on the list! We'll be in touch soon. ✨",
    })
  } catch (e) {
    console.error('Subscribe route error:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

function safeDetail(text: string) {
  try {
    const obj = JSON.parse(text)
    return obj.detail || text.slice(0, 300)
  } catch {
    return text.slice(0, 300)
  }
}
