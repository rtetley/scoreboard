# BJJ Scoreboard

A real-time Brazilian Jiu-Jitsu scoreboard that communicates over MQTT. Open a **Display** view on any screen and control it remotely from a **Controller** view on any other device — phones, tablets, laptops — over Wi-Fi or the internet.

---

## Features

- **Multi-device**: display and controller run in separate browser windows/devices
- **MQTT-based**: all state is published as retained messages so any late-joining controller immediately gets the current score
- **Presence discovery**: controllers scan the broker for available displays and list them by name with online/offline status
- **Graceful offline**: displays publish a Last Will & Testament so the controller list updates automatically if a display disconnects
- **No backend required**: works with any public or private MQTT broker that exposes a WebSocket endpoint

---

## Tech Stack

| | |
|---|---|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router v7 |
| Build | Vite |
| Messaging | MQTT.js (`mqtt` package) over WebSockets |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An MQTT broker with WebSocket support (see [Broker](#broker) below)

### Install & run

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Usage

### 1. Open a Display

Navigate to **Display View** from the home screen.

You will be prompted to enter:

- **Display Name** — a human-readable label (e.g. *Mat 1*, *Main Screen*)
- **MQTT Broker URL** — a WebSocket endpoint (defaults to the public EMQX test broker)

Once submitted, the display connects to the broker, publishes its presence as online, and starts listening for score/timer updates. A small status indicator in the top-right corner shows the connection state.

### 2. Open a Controller

Navigate to **Controller View** from the home screen.

You will see the **Display Selector** screen:

1. Enter the same MQTT broker URL
2. Click **Connect**
3. Wait for available displays to appear — online displays are listed in green
4. Click a display to open the controller interface for that display

The controller will subscribe to the display's retained state topics and immediately reflect the current scoreboard, even if it connects mid-match.

### 3. Control the scoreboard

The controller interface provides:

- **Timer** — Start / Pause / Reset (5 minutes default), broadcasts every tick
- **Competitor names** — editable inline, synced live
- **Points** — +2, +3, +4, -2 buttons
- **Advantages** — increment / decrement
- **Penalties** — increment / decrement
- **Reset All** — resets everything to defaults on the display

---

## MQTT Topic Structure

All topics are prefixed with `scoreboard/displays/{displayId}/` where `displayId` is a UUID generated when the display first loads.

```
scoreboard/displays/{id}/presence               ← retained JSON {name, online}
scoreboard/displays/{id}/competitor1/name
scoreboard/displays/{id}/competitor1/score
scoreboard/displays/{id}/competitor1/advantages
scoreboard/displays/{id}/competitor1/penalties
scoreboard/displays/{id}/competitor2/name
scoreboard/displays/{id}/competitor2/score
scoreboard/displays/{id}/competitor2/advantages
scoreboard/displays/{id}/competitor2/penalties
scoreboard/displays/{id}/timer/seconds
scoreboard/displays/{id}/timer/running
```

All state messages are published with `retain: true` and `qos: 1` so that:
- A newly connected controller instantly receives the full current state
- A reloaded display recovers the last known state

The `presence` topic is also set as the MQTT **Last Will & Testament** with `{online: false}`, so the controller's display list updates automatically if the display tab is closed or loses connectivity.

---

## Broker

### Public test broker (default)

The app defaults to `wss://broker.emqx.io:8084/mqtt` — a free public broker run by EMQX. It is suitable for development and demos but **not recommended for production** as all topics are publicly readable/writable.

### Self-hosted (recommended for production)

Any MQTT broker with WebSocket support works. Popular options:

| Broker | WebSocket port | Notes |
|---|---|---|
| [Mosquitto](https://mosquitto.org/) | configurable | add `listener 9001` + `protocol websockets` |
| [EMQX](https://www.emqx.io/) | 8083 (ws) / 8084 (wss) | out of the box |
| [HiveMQ](https://www.hivemq.com/) | 8000 (ws) / 8884 (wss) | cloud or self-hosted |

Point both the Display and Controller at the same broker URL (e.g. `wss://your-broker.example.com:8084/mqtt`).

---

## Project Structure

```
src/
├── components/
│   ├── Display.tsx          # Display view (MQTT subscriber)
│   ├── DisplaySetup.tsx     # Setup form shown before a display connects
│   ├── DisplaySelector.tsx  # Controller's discovery screen
│   └── Controller.tsx       # Controller interface (MQTT publisher)
├── hooks/
│   ├── useMqttClient.ts     # MQTT connection lifecycle hook
│   └── useDisplayDiscovery.ts  # Discovers online displays via presence topics
├── lib/
│   └── mqttTopics.ts        # Topic helpers, ScoreboardState type, applyMessage()
├── App.tsx                  # Routing
└── main.tsx
```

---

## Scripts

```bash
npm run dev      # Start dev server (HMR)
npm run build    # Type-check + production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

