# IT Helpdesk · AI Support

A sleek, AI-powered IT helpdesk chat interface. Users describe a tech issue in
natural language and get instant troubleshooting, with automatic support-ticket
creation and escalation to a human agent when needed.

The frontend is a single-page React app; the conversational logic, ticketing, and
escalation are handled by an [n8n](https://n8n.io) workflow reached over a webhook.

## Features

- 💬 Conversational chat UI with typing indicator and quick-prompt suggestions
- 🎫 Automatic ticket creation surfaced inline in the conversation
- 🧑‍💼 Escalation to a human agent (system notice in the thread)
- 🎨 "Midnight" dark theme — glassmorphic surfaces, aurora background, Inter + Space Grotesk
- ♿ Accessible: semantic roles, `aria-live` thread, focus-visible rings, `prefers-reduced-motion`
- 📱 Responsive: full-screen on mobile, centered reading column on desktop

## Getting started

```bash
npm install
cp .env.example .env   # then set REACT_APP_WEBHOOK_URL to your n8n webhook
npm start
```

The app runs at http://localhost:3000.

## Configuration

| Variable | Description |
| --- | --- |
| `REACT_APP_WEBHOOK_URL` | n8n webhook endpoint the chat POSTs messages to |

The frontend sends `{ sessionId, message, userId }` and expects a JSON response of
`{ reply, ticketId?, status? }` (where `status: "escalated"` adds a handoff notice).

## Tech stack

React 19 · Create React App · n8n (workflow backend)
