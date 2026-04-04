# GigShield — AI-Powered Income Protection for India's Gig Workers

> When it rains in Bellandur, delivery riders don't earn. GigShield fixes that.

---

## The Problem We're Solving

India's gig economy employs over 15 million workers — delivery riders on Swiggy and Zomato, cab drivers on Uber and Ola, and hyperlocal agents on Zepto, Blinkit, and Dunzo. Unlike salaried employees, these workers have absolutely no income safety net.

When it pours during monsoon season, when a heat wave makes it unsafe to ride, when a platform goes down for maintenance, or when a zone gets locked due to waterlogging — they simply stop earning. There's no sick leave, no insurance claim they can file, and no employer to fall back on.

**The numbers paint a clear picture:**
- 68% of gig workers report significant income loss during monsoon months
- Workers lose 6 to 10 earning days per month due to factors entirely outside their control
- Less than 3% have any form of income protection whatsoever

Traditional insurance doesn't work here — it's too slow, too expensive, and designed for annual claims, not daily disruptions.

---

## What GigShield Does

GigShield is a **parametric micro-insurance platform** built specifically for gig workers. It monitors real-world conditions in real time and automatically pays workers when verified disruptions hit their zone — no paperwork, no waiting, no manual claims.

Here's how a typical payout works:

1. **A disruption hits** — heavy rain starts in Bellandur, Bengaluru. IMD confirms 42mm/hr rainfall.
2. **AI detects the impact** — order volume in the zone drops 68%. The worker's GPS confirms they're in the affected area.
3. **Composite triggers validate** — rainfall threshold crossed AND income drop exceeds 30% AND worker was active in zone AND community peers confirm the disruption. All conditions must be true simultaneously.
4. **The worker taps once to confirm** — a bottom sheet shows the payout amount, AI confidence score, and trigger details.
5. **Money hits their UPI in 90 seconds** — no forms, no waiting period, no questions asked.

The key innovation is **composite triggers** — payouts don't fire on a single signal. Multiple independent data sources must agree before any money moves, which keeps fraud near zero while making legitimate payouts instant.

---

## Adversarial Defense & Anti-Spoofing Strategy

We designed GigShield knowing that any system that sends money automatically will be a target. The specific threat we're defending against: coordinated fraud rings — groups of workers who use GPS spoofing apps, organise via Telegram, and fake their presence in disruption zones to drain the liquidity pool while sitting safely at home.

Simple GPS verification is not enough. Our defense is layered, behavioural, and designed to catch coordinated attacks without punishing honest workers.

### 1. How We Tell a Real Worker from a Spoofer

GPS coordinates are just one of many signals. A spoofed phone can fake its lat-long, but it cannot fake the full environmental fingerprint of actually being outside in a storm:

**Sensor Fusion Layer** — Every claim is validated against multiple on-device signals that GPS spoofing apps cannot replicate:

| Signal | What it reveals | Why spoofers can't fake it |
|--------|----------------|---------------------------|
| Accelerometer + Gyroscope | Walking/riding motion patterns | A phone lying on a table shows zero motion variance, even if GPS says it's moving at 20km/hr |
| Barometric pressure | Altitude consistency + weather correlation | If IMD says atmospheric pressure dropped to 1002 hPa in the zone, the phone's barometer should agree |
| Cell tower triangulation | Independent location verification | The phone connects to towers near its real location, not the spoofed GPS coordinates |
| WiFi BSSID scan | Neighbourhood-level positioning | Home WiFi networks are fingerprinted during onboarding — if the same home SSID appears during a "stranded in rain" claim, it's flagged |
| Ambient light + noise | Environmental conditions | Heavy rain produces distinct audio signatures and reduced ambient light — a phone indoors in a lit room fails this check |
| Battery temperature | Thermal stress from outdoor conditions | Phones exposed to rain, heat, or direct sun show measurably different thermal profiles than indoor phones |

No single sensor is definitive, but a spoofer would need to simultaneously fake GPS, motion patterns, barometric pressure, cell tower connections, WiFi environment, ambient audio, and battery thermal data. That's practically impossible.

**Platform Activity Cross-Reference** — We pull the worker's real-time status from Swiggy, Zomato, or whichever platform they're registered with. If a worker claims they're stranded in a red-alert zone but their platform dashboard shows they went offline 3 hours ago (before the disruption even started), the claim is flagged. A genuinely stranded worker would show a pattern of: active → orders dropping → forced idle.

**Historical Behaviour Model** — Every worker builds a behavioural baseline over time: their typical working hours, their regular delivery routes, how they respond to past weather events. A worker who has never once operated in Bellandur suddenly filing a claim from Bellandur during a storm is statistically suspicious. The model computes a deviation score — high deviation triggers additional verification, not automatic denial.

### 2. How We Detect Coordinated Fraud Rings

Individual spoofers are relatively easy to catch. The harder problem is 500 workers coordinating via Telegram to file simultaneous claims from the same zone. Here's how we detect that:

**Temporal Clustering Detection** — We monitor claim submission timestamps across the entire zone. Organic claims during a real disruption follow a natural distribution — some workers file immediately, some wait, some don't file at all. A coordinated ring produces a statistically unnatural spike: dozens of claims within a 30-second window, all from workers who weren't showing active delivery patterns beforehand.

**Social Graph Analysis** — Over time, we build an implicit social graph: which workers tend to file claims in similar patterns, from similar locations, at similar times. When a cluster of workers who have historically correlated claim behaviour all file simultaneously from a zone where none of them have regular delivery history, the entire cluster gets flagged for review.

**Device Fingerprinting** — Each device has a unique fingerprint: hardware model, OS version, installed apps, screen resolution, and dozens of other signals. We look for anomalies: multiple "different" workers filing from devices that share suspicious similarities (same spoofing app installed, same VPN exit node, same device configuration patterns). One phone cannot easily pretend to be 50 different phones.

**Peer Disagreement Signals** — In a genuine disruption, most workers in the zone agree that conditions are bad. If 30 workers claim a zone is completely flooded but 200 other active workers in the same zone are still completing deliveries normally, the math doesn't add up. We compare claim density against actual delivery activity — and a real storm suppresses activity uniformly, not selectively.

**Liquidity Pool Velocity Monitor** — We track the rate at which the payout pool is being drained. Organic claims during a genuine monsoon event drain the pool gradually over hours. A coordinated attack drains it in minutes. If the pool velocity exceeds 3 standard deviations from the historical mean for that zone and weather severity, all pending payouts are paused for a 15-minute human review window.

### 3. Handling Flagged Claims Without Punishing Honest Workers

This is the hardest design problem. A genuine worker stuck in rain with a phone that has a weak GPS signal looks, on paper, similar to a spoofer. We refuse to build a system that denies legitimate claims out of paranoia.

**Tiered Verification, Not Binary Rejection:**

- **Green (Trust Score 80+, all sensors consistent)** — instant payout, no friction. This is the experience for the vast majority of honest workers.
- **Amber (1-2 signals anomalous, moderate deviation)** — the worker sees a brief additional step: a photo of their current surroundings, uploaded in-app. We use a lightweight image classifier to check for weather consistency (rain visible, wet roads, etc). Takes 15 seconds, payout within 3 minutes.
- **Red (3+ signals failed, or matched to a known fraud cluster)** — the claim is escalated to a human reviewer. The worker is told: "Your claim is being reviewed — expected resolution within 2 hours." They are NOT told they're suspected of fraud. If the review clears them, they get paid with a bonus trust score bump and a small inconvenience credit.

**Trust Score Rehabilitation** — A single false positive doesn't permanently damage a worker's standing. Trust scores recover over time through consistent legitimate behaviour. A worker who was wrongly flagged once will be back to green-tier within 2 weeks of normal activity.

**Transparent Appeals** — Any denied claim can be appealed with supporting evidence (screenshots of weather apps, photos, platform delivery history). Appeals are reviewed by a different human reviewer than the one who made the initial decision. If the appeal succeeds, the worker receives the full payout plus a compensation bonus.

**The Core Principle** — We'd rather let a few marginal fraud cases through than deny a single genuine worker who's stuck in the rain with no money. The system is deliberately calibrated to favour false negatives (paying a few spoofers) over false positives (denying real workers). The fraud detection model tightens over time as it sees more data, but the worker experience always leans toward trust.

---

## What's Inside the App

### For Workers

- **Onboarding** — pick your city, zone (flood-prone zones are clearly marked), platform, and plan in under a minute
- **Dashboard** — see your active plan, earnings protected this week, trust score, zone risk status, and recent payouts at a glance
- **Plan Selection** — three weekly plans (Starter at Rs.50/week, Standard at Rs.80/week, Pro at Rs.120/week) with clear breakdown of daily payout, weekly cap, and payout days
- **Disruption Simulation** — tap the orange FAB button to see the full trigger-to-payout flow in action, with AI confidence scoring and UPI payout confirmation

### For Operators

- **Admin Console** — platform-wide stats including total users, active claims, fraud alerts, and average trust scores
- **Claims Table** — every recent claim with worker name, zone, trigger type, payout amount, status, and AI confidence score
- **Excel Export** — one-click download of a 4-sheet report covering platform summary, all claims, worker profile, and a complete zone risk map across all 7 cities

---

## Zone Coverage

We mapped **84 real zones across 7 major Indian cities**, split into flood-prone and normal categories based on actual geographic and historical flooding data:

| City | Flood-Prone Zones | Normal Zones |
|------|------------------|-------------|
| **Bengaluru** | Bellandur, Varthur, Mahadevapura, HSR Layout, Koramangala, Electronic City | Indiranagar, Whitefield, Jayanagar, Marathahalli, Rajajinagar, BTM Layout |
| **Mumbai** | Kurla, Sion, Dharavi, Wadala, Chembur, Govandi | Bandra, Andheri West, Borivali, Dadar, Malad, Thane |
| **Chennai** | Velachery, Tambaram, Pallikaranai, Perungudi, Adyar, Thiruvanmiyur | Anna Nagar, T.Nagar, Mylapore, Porur, Nungambakkam, Chromepet |
| **Delhi** | Yamuna Khadar, Burari, Mustafabad, Gokulpuri, Usmanpur, Bhalaswa | Lajpat Nagar, Dwarka, Rohini, Saket, Karol Bagh, Janakpuri |
| **Hyderabad** | Malkajgiri, Saroornagar, Nagole, LB Nagar, Uppal, Moosarambagh | Banjara Hills, Jubilee Hills, Madhapur, Gachibowli, Kukatpally, Secunderabad |
| **Pune** | Hadapsar, Kondhwa, Wanowrie, Bibwewadi, Katraj, Ambegaon | Koregaon Park, Viman Nagar, Kothrud, Baner, Aundh, Wakad |
| **Kolkata** | Tiljala, Topsia, Tangra, Kasba, Behala, Garden Reach | Salt Lake, New Town, Park Street, Ballygunge, Jadavpur, Dum Dum |

Flood-prone zones get rain and flood triggers. Normal zones are covered for heat waves, platform outages, and traffic disruptions.

---

## Pricing Model

| Plan | Weekly Premium | Daily Payout | Weekly Cap | Max Payout Days |
|------|---------------|-------------|-----------|----------------|
| Starter | Rs.50 | Rs.200 | Rs.1,000 | 2 per week |
| Standard | Rs.80 | Rs.300 | Rs.1,500 | 3 per week |
| Pro | Rs.120 | Rs.400 | Rs.2,500 | 4 per week |

Workers pay a small weekly premium and receive automatic payouts whenever a verified disruption hits their zone. They can switch plans or cancel anytime with no fees.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6 |
| Styling | CSS-in-JS (inline styles + injected stylesheet) |
| Charts | SVG-based inline visualisations |
| Data Export | SheetJS (xlsx) loaded via CDN |
| Typography | Plus Jakarta Sans (Google Fonts) |
| Architecture | Single-file React app (App.jsx) |

---

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Fill in the onboarding form, pick a zone (try a flood-prone one), and tap the orange lightning button on the dashboard to see the full payout flow.

---

## Project Structure

```
src/
  App.jsx          — entire application (data, components, screens, routing)
  main.jsx         — React DOM entry point
  index.css        — base reset (minimal, most styles are in App.jsx)
```

Everything lives in a single `App.jsx` file — data constants, design tokens, CSS string, utility functions, Excel export logic, micro-components, all four screens (Onboarding, Dashboard, Plans, Admin), the trigger bottom sheet, bottom navigation, and the root App component.

---

## What Makes This Hackathon-Ready

- **Solves a real problem** — 15M+ gig workers in India with zero income protection
- **Novel approach** — parametric insurance with composite triggers is a genuine fintech innovation
- **Working prototype** — full onboarding-to-payout flow, not just mockups
- **Adversarial resilience** — multi-layered anti-spoofing defense that doesn't sacrifice UX for honest workers
- **AI/ML integration** — fraud detection, trust scoring, income prediction, sensor fusion
- **Real geographic data** — 84 actual zones across 7 cities with accurate flood-prone classification
- **Financial inclusion** — targets underserved daily-wage workers, not the already-insured middle class
- **Instant value** — 90-second UPI payouts vs weeks-long traditional insurance claims

---

## Future Implementation

### Phase 1 — Live Data Integration (Weeks 1-4)

Right now, the app runs on mock data. The first thing we'd build in production is real-time data pipelines:

- **Weather API (OpenWeatherMap + IMD)** — pull live rainfall, temperature, and flood alerts per zone every 5 minutes. Triggers fire automatically when rainfall exceeds zone-specific thresholds (e.g., 35mm/hr for Bellandur, 50mm/hr for Indiranagar based on drainage capacity).
- **Traffic and Road Conditions (HERE API + Google Roads)** — detect waterlogging, road closures, and traffic jams that prevent deliveries. Critical for normal zones where disruptions are traffic-based.
- **Platform API Integration** — connect directly with Swiggy, Zomato, Zepto, and Blinkit APIs to verify real-time order volume, rider availability, and platform outage status.
- **Air Quality (CPCB Sensors)** — AQI readings above 350 would activate health-hazard triggers, especially relevant for Delhi and Kolkata during winter months.

### Phase 2 — Real Payments and Identity (Weeks 5-8)

- **UPI Disbursement via Razorpay/PayU** — replace the simulated payout with actual UPI transfers using Razorpay's Route API for instant splits, keeping disbursement under 90 seconds.
- **Aadhaar eKYC** — lightweight identity verification during onboarding to satisfy IRDAI regulatory requirements and prevent duplicate accounts.
- **UPI Autopay for Premiums** — weekly premium collection via UPI autopay mandates.
- **Payout History and Tax Statements** — downloadable transaction history and annual tax summaries.

### Phase 3 — Anti-Spoofing ML Pipeline in Production (Weeks 9-12)

- **Sensor Fusion Model** — deploy the multi-signal verification engine (accelerometer, barometer, cell tower, WiFi, ambient sensors) as a real-time inference service, scoring every claim in under 200ms.
- **Fraud Ring Detection** — graph neural network trained on the worker social graph to identify coordinated claim clusters. Temporal clustering + device fingerprinting + peer disagreement signals feed into an ensemble model.
- **Dynamic Trust Scoring** — trust scores updated in real-time based on claim legitimacy, peer validation, GPS consistency, and platform activity logs.
- **Zone Risk Prediction** — time-series model predicting disruption probability 6-12 hours ahead using weather forecasts, historical patterns, and satellite imagery.

### Phase 4 — Mobile App and Scale (Weeks 13-20)

- **React Native App** — lightweight mobile app with offline-first architecture and push notifications for disruption alerts.
- **Regional Languages** — full UI translation into Hindi, Tamil, Kannada, Telugu, Bengali, and Marathi with culturally adapted onboarding flows.
- **Community Shield** — peer validation system where workers in the same zone confirm or dispute disruptions, adding a human layer to composite triggers.
- **City Expansion** — extend beyond 7 cities to cover Ahmedabad, Jaipur, Lucknow, Kochi, Chandigarh, and other Tier-2 cities.

### Phase 5 — Partnerships and Compliance (Months 6-12)

- **Platform Partnerships** — direct integration with Swiggy, Zomato, Uber, Ola, Dunzo, and Porter for automatic rider enrollment and verified income data.
- **IRDAI Sandbox** — apply for the Insurance Regulatory Authority's sandbox program to operate as a licensed parametric insurance product.
- **Reinsurance Tie-ups** — partner with reinsurers (Swiss Re, Munich Re) who already have parametric insurance expertise to share the risk pool.
- **On-Chain Audit Trail** — every trigger event, validation step, and payout logged to an immutable audit trail for regulatory transparency and dispute resolution.
- **Employer-Sponsored Plans** — allow platforms to sponsor GigShield coverage for their top riders as a retention tool.

---

## License

MIT

---

*Built to protect the people who deliver through the storm — and resilient enough to stop those who pretend to.*
