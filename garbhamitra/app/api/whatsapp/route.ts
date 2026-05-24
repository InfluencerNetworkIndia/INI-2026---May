import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { WhatsAppHandler } from '@/lib/whatsapp/handler'

let _redis: Redis | null = null
function getRedis() {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

type MetaMessage = {
  from: string
  id: string
  timestamp: string
  text?: { body: string }
  type: string
}

type MetaBody = {
  object: string
  entry: Array<{
    changes: Array<{
      value: {
        messages?: MetaMessage[]
      }
    }>
  }>
}

// GET — webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// POST — incoming messages
export async function POST(request: NextRequest) {
  let body: MetaBody
  try {
    body = await request.json() as MetaBody
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  // Extract message from nested Meta payload
  const entry   = body.entry?.[0]
  const change  = entry?.changes?.[0]
  const messages = change?.value?.messages

  if (!messages?.length) {
    // Status updates / delivery receipts — just ack
    return new Response('OK', { status: 200 })
  }

  const msg = messages[0]

  // Only handle text messages
  if (msg.type !== 'text' || !msg.text?.body) {
    return new Response('OK', { status: 200 })
  }

  const from        = msg.from
  const messageId   = msg.id
  const messageText = msg.text.body

  // Deduplicate using Redis (Meta may retry on slow responses)
  const dedupKey = `wa:msg:${messageId}`
  const exists = await getRedis().get(dedupKey)
  if (exists) {
    return new Response('OK', { status: 200 })
  }
  await getRedis().set(dedupKey, '1', { ex: 60 })

  // Process message (synchronous — Anthropic call typically < 3s,
  // well within Meta's 15s webhook timeout)
  try {
    await WhatsAppHandler.processMessage(from, messageText)
  } catch (err) {
    console.error('WhatsApp handler error:', err)
    // Still return 200 so Meta doesn't retry infinitely
  }

  return new Response('OK', { status: 200 })
}
