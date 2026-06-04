# QR Code Task Manager — Dispensary Onboarding Workflow

## Purpose
After the client list is compiled, this agent generates per-dispensary task packages:
- A unique QR code URL for each dispensary
- Employee instruction sheet (printable)
- Customer-facing review prompt
- Admin tracking record

## QR Code design
Each dispensary gets a unique URL:
```
https://untappedmarket.app/review/{dispensary_slug}?ref=qr&loc={location_id}
```
The QR encodes to this URL. On scan:
1. User lands on dispensary's Untapped Market listing
2. Prompted to leave a strain-specific review
3. Employee code variant: adds `?role=staff` — logs internal feedback separately

## Per-dispensary task package

### Task 1 — QR code asset generation
- Generate QR code PNG for customer-facing URL (300×300px, high error correction)
- Generate QR code PNG for employee URL (same size, different color scheme — brand teal)
- Embed Untapped Market logo in QR center (if logo asset available)

### Task 2 — Employee instruction sheet
Generate a printable markdown/PDF with:
```
UNTAPPED MARKET — [DISPENSARY NAME]
Employee Quick-Start Guide

1. Scan the STAFF QR code with your phone
2. Select the strain you're recommending
3. Leave a 1-sentence note on effects/flavor
4. That's it — your reviews help customers find the right product

Staff QR: [QR image]
Questions? team@untappedmarket.app
```

### Task 3 — Customer card copy
Generate a small card (3.5"×2") insert for product bags:
```
TRIED THIS STRAIN?
Tell others what you think →
[Customer QR image]
untappedmarket.app
```

### Task 4 — Admin tracking record
For each dispensary, write a record to `dispensary-client-list.json`:
```json
{
  "qr_onboarding": {
    "customer_url": "https://untappedmarket.app/review/{slug}?ref=qr",
    "staff_url": "https://untappedmarket.app/review/{slug}?ref=qr&role=staff",
    "assets_generated": "YYYY-MM-DD",
    "outreach_status": "pending" | "sent" | "active",
    "outreach_contact": "name@dispensary.com",
    "notes": ""
  }
}
```

## Agent execution steps

1. Read `dispensary-client-list.json` — get all dispensaries with `client_status: "active"`
2. For each dispensary without a `qr_onboarding` record:
   a. Generate customer + staff QR URL strings
   b. Write URLs to client list record
   c. Generate markdown employee instruction sheet → save to
      `Untapped-market/src/data/qr-assets/{slug}-employee-sheet.md`
   d. Generate customer card copy → save to
      `Untapped-market/src/data/qr-assets/{slug}-customer-card.md`
3. Write summary: how many new QR packages generated, how many already active
4. Output outreach list: dispensaries with `outreach_status: "pending"` → ready for email campaign

## Outreach email template (for CRM use)
```
Subject: [Dispensary Name] — Your Untapped Market QR Assets Are Ready

Hi [contact_name],

Your dispensary is now listed on Untapped Market, the PNW's cannabis discovery app.
We've generated custom QR codes so your customers and staff can leave strain reviews
directly from your store.

Attached:
- Customer bag insert (print-ready)
- Employee quick-start card

Questions? Reply here or call [phone].

— Untapped Market Team
```

## Triggering
This task runs as Step 3 of the daily sync routine, after menu pull and compliance check complete.
It only generates new packages — existing ones are not overwritten unless `force_regenerate: true` is set.
