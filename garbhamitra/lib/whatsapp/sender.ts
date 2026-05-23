const GRAPH_API = 'https://graph.facebook.com/v18.0'

async function postToMeta(body: object, attempt = 0): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    console.warn('WhatsApp env vars not set — skipping send')
    return
  }

  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    if (res.status >= 500 && attempt < 1) {
      await new Promise(r => setTimeout(r, 1500))
      return postToMeta(body, attempt + 1)
    }
    throw new Error(`Meta API ${res.status}: ${text}`)
  }
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  await postToMeta({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body: message, preview_url: false },
  })
}

export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  params: string[]
): Promise<void> {
  await postToMeta({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: params.map(p => ({ type: 'text', text: p })),
        },
      ],
    },
  })
}
