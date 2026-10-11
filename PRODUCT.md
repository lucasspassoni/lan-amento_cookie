# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Tailwind CSS + shadcn/ui + Framer Motion, explicitly requested for this greenfield landing page.

## Users

People in Jundiaí and the surrounding region discovering Cookie Pitada de Amor on a phone and deciding whether to reserve a pre-launch Crookie.

## Product Purpose

Cookie Pitada de Amor is a physical artisanal-cookie shop. Its pre-launch page builds appetite and directs visitors toward the forthcoming product showcase and reservation flow.

## Positioning

The launch centers on the Crookie: a croissant combined with cookie dough and chocolate filling, reserved for in-store pickup.

## Operating Context

The first route is `/`. It reads the single campaign's status and slogan from Supabase; later prompts will add the product showcase, ordering and payment.

## Capabilities and Constraints

- The opening runs only on a device's first visit, can be skipped, and never blocks scrolling.
- Motion-reduced visitors see complete, static content.
- The fixed CTA varies with the campaign status and points to `#vitrine`.
- No data may be written in this stage.
- The final Crookie cutout assets and a high-resolution logo have not been supplied yet.

## Brand Commitments

Dark, sensual and gourmet; permanent dark theme; near-black chocolate, brand pink, cookie brown, peach and cream. Rounded, heavy display typography is part of the identity.

## Evidence on Hand

- Two supplied Crookie photographs: `C:\Users\lucas.passoni\Downloads\WhatsApp Image 2026-10-08 at 21.36.59.jpeg` and `C:\Users\lucas.passoni\Downloads\WhatsApp Image 2026-10-08 at 21.37.00.jpeg`.
- Supabase contains a single `store_settings` campaign row and its public `slogan` and `status` fields.
- No logo file or third provisional photo was provided in the workspace.

## Product Principles

- Make the product itself the first proof of desire.
- Keep the visitor in control of movement and navigation.
- Treat campaign content as live operational data.
- Reserve complexity for the purchase journey that follows.

## Accessibility & Inclusion

Respect reduced motion, keyboard access, visible focus, descriptive image alternatives and stable layouts on small screens.
