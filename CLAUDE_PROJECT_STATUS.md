Nanny Rae Rae's Crafted Closet - Development Progress
Project Overview
E-commerce platform for handmade children's clothing by Rae. One-of-a-kind pieces with Australian focus.
Timeline: 5-day sprint (Days 1-2 completed)
Status: Pre-launch refinements in progress
Target: Launch-ready within 8 hours

Tech Stack
Frontend

React + TypeScript + Vite
TailwindCSS + shadcn/ui components
React Router for navigation
Context API for cart/auth state

Backend

Supabase (PostgreSQL database)
Supabase Edge Functions (Deno runtime)
Supabase Storage for product images
Row Level Security (RLS) enabled

Payment & Email

Stripe Checkout (test mode → switch to live for production)
Brevo (formerly Sendinblue) for transactional emails
Stripe webhooks for order processing


Features Implemented
✅ Core E-commerce (Day 1)

Product catalog with real database
Shopping cart with localStorage persistence
Stripe checkout integration ($12 flat shipping, no GST)
Order processing via webhook
Customer + Admin email notifications
Order storage in database with full customer/shipping details

✅ Admin Dashboard (Day 1-2)

Admin authentication (Supabase Auth + admin_users table)
Order management page

View all orders with customer details
Full shipping addresses
Mark orders as fulfilled
Filter by status


Product management

Add/Edit/Delete products
Image upload to Supabase Storage
Soft delete (sets is_active = false)
Available/Sold status (stock = 1/0 for one-of-a-kind items)



✅ Product Categorization (Day 2)

Gender: Boys/Girls/Gender Neutral
Product Type: Top/Dress/Overalls/Romper/Pants/Jacket/Accessories/Other
Age Groups: 0-3m, 3-12m, 1-3y, 3-5y, 5-10y, All Ages
Collections: Free text field
Gift Ideas: Toggle + category selection (Birthday, Baby Shower, Christmas, etc.)

✅ Customer Experience (Day 2)

Product detail pages with routing
Similar products section (matches collection/gender/type)
Product accordions:

Sizing guide with measurements table
Delivery information
Returns & exchanges policy
Contact form (sends email via Brevo)


Value proposition cards (3 sections at bottom of product pages)
Email notification signup modal (Coming Soon section)
Standardized product cards across entire site

✅ Email System

Customer: Order confirmation with details
Admin (Rae): New order notification with full info
Subscriber: Confirmation email on signup
All via Brevo API (300 emails/day free tier)


Database Schema
Core Tables
sqlproducts
- id, name, description, price, image_url
- age_group, gender, product_type, collection
- is_active (boolean), stock (1 = available, 0 = sold)
- is_gift_idea (boolean), gift_category
- created_at, updated_at

orders
- id, customer_id, customer_email, customer_first/last_name, customer_phone
- shipping_address_line1/line2, shipping_city/state/postcode/country
- status ('paid', 'fulfilled')
- subtotal, shipping_cost (12.00), gst (0.00), total
- stripe_payment_intent_id, stripe_checkout_session_id
- tracking_number, shipped_at
- created_at, updated_at

order_items
- id, order_id, product_name, product_price, quantity

customers
- id, email, first_name, last_name, phone
- created_at, updated_at

admin_users
- id (matches auth.users.id), email

subscribers
- id, email, subscribed (boolean), created_at
Supabase Storage

Bucket: product-images (public read)
Files named with crypto.randomUUID()


Supabase Edge Functions
1. create-checkout-session
URL: https://kqshrevhtrusxrwkgdmd.supabase.co/functions/v1/create-checkout-session

Creates Stripe checkout session
Adds $12 flat shipping
No GST calculation
Collects shipping address (AU only)
Deployed with --no-verify-jwt flag

2. stripe-webhook
URL: https://kqshrevhtrusxrwkgdmd.supabase.co/functions/v1/stripe-webhook

Listens for checkout.session.completed events
Extracts shipping from session.collected_information.shipping_details.address
Creates customer, order, and order_items records
Sends 2 emails (customer + admin)
Deployed with --no-verify-jwt flag

Secrets Set:
bashSTRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BREVO_API_KEY=xkeysib-...
ADMIN_EMAIL=hello@bynannyraerae.com.au

Key Design Decisions
Pricing & Tax

No GST: Business under $75k threshold, removed entirely
Flat shipping: $12 AUD all orders (Australia Post integration deferred to post-launch)
One-of-a-kind: Stock tracking simplified to Available (1) / Sold (0)

Cart Hold Timer

Deferred: Not implementing 10-minute cart reservation pre-launch
Rationale: Premature optimization, adds complexity, may hurt conversions
Decision: Add only if stock conflicts become a real problem

Email Automation

Phase 1 (Done): Email capture with confirmation
Phase 2 (Post-launch): Weekly digest of new products
Phase 3 (Post-launch): Admin subscriber management
Rationale: Manual sends work initially, automate when there's demand


Pre-Launch Checklist
✅ Completed

 Database schema with all product fields
 Admin product management (full CRUD)
 Image upload to Supabase Storage
 Product detail pages with routing
 Similar products section
 Product page accordions (sizing, delivery, returns, contact)
 Email capture modal for subscribers
 Homepage collection cards redesigned
 Value proposition section on product pages
 Standardized product cards sitewide
 Gift idea categorization system

🔄 In Progress

 Logo integration (replace text with image in nav/footer)
 Final UI polish
 Mobile responsiveness check
 Complete purchase flow testing

⏳ Before Going Live (30-60 mins)

 Test full checkout flow (add product → cart → checkout → verify emails)
 Verify order appears in admin dashboard
 Test on mobile device
 Check all product images load correctly
 Test admin product management (add/edit/delete)


Production Deployment Steps
1. Stripe Live Mode

Switch from test to live mode in Stripe dashboard
Update STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET with live keys
Update webhook URL to production domain
Test with real card (small amount)

2. Environment Variables
Production values needed:
bashVITE_SUPABASE_URL=https://kqshrevhtrusxrwkgdmd.supabase.co
VITE_SUPABASE_ANON_KEY=[existing key]
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
Supabase secrets (already set, verify live keys):
bashSTRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
BREVO_API_KEY=[same as test]
ADMIN_EMAIL=hello@bynannyraerae.com.au
3. Brevo Email Verification

Verify sender domain: bynannyraerae.com.au
Confirm orders@bynannyraerae.com.au is verified
Test transactional emails in production

4. Domain & Hosting

Deploy frontend to Vercel/Netlify
Update Stripe webhook URL to production domain
Configure DNS if needed
SSL certificate (automatic on most platforms)


Post-Launch Roadmap
Week 1

Monitor real transactions
Gather customer feedback
Fix any critical bugs
Add featured products selector (if needed)

Week 2-3

Implement weekly new arrivals email digest
Add subscriber management in admin
Evaluate need for cart hold timer based on actual stock conflicts

Future Features (Deferred)
Custom Order Waitlist System:

Email signup for custom made-to-order pieces
Questionnaire about child's personality/preferences
Scarcity design: display waitlist position count
Exclusivity marketing angle
Admin tools to manage custom order queue

Australia Post Integration:

Real-time shipping rate calculation
MyPost Business API integration
Automatic label generation
Tracking number updates


Important URLs
Admin

Login: https://yourdomain.com/admin/login
Dashboard: https://yourdomain.com/admin/dashboard
Orders: https://yourdomain.com/admin/orders
Products: https://yourdomain.com/admin/products

Supabase

Project: https://supabase.com/dashboard/project/kqshrevhtrusxrwkgdmd
Storage: https://supabase.com/dashboard/project/kqshrevhtrusxrwkgdmd/storage/buckets
Edge Functions: https://supabase.com/dashboard/project/kqshrevhtrusxrwkgdmd/functions

Stripe

Dashboard: https://dashboard.stripe.com/test (switch to live mode)
Webhooks: https://dashboard.stripe.com/test/webhooks

Brevo

Dashboard: https://app.brevo.com
Transactional logs: https://app.brevo.com/campaign/list/email → Transactional tab


Known Issues & Limitations
Current State

Homepage uses placeholder/demo images for collection cards
Logo not yet integrated (pending file upload)
No real-time shipping calculations (flat $12 rate)
Manual weekly emails for new product announcements
No product variants (size/color) - each item is unique
Simple soft-delete for products (not full archival system)

Technical Debt

Cart reservations not implemented
Email automation requires manual sending
Product images not optimized/resized on upload
No image gallery (single image per product)
Sizing guide is static table (not product-specific)


Testing Stripe Test Cards
Card Number: 4242 4242 4242 4242
Expiry: Any future date (12/34)
CVC: Any 3 digits (123)
ZIP: Any 5 digits (12345)

Critical Success Metrics
Week 1 Goals:

10+ products listed
3+ completed orders
Zero payment failures
All emails delivering successfully
Admin can manage orders/products independently

Month 1 Goals:

50+ email subscribers
20+ orders processed
Average order value $80+
Customer feedback collected
Mobile traffic > 60%


Contact & Support
Admin User: hello@bynannyraerae.com.au
Project Ref: kqshrevhtrusxrwkgdmd
Developer Notes: All webhook logs in Supabase Functions dashboard

Last Updated: 2025-10-01
Status: Pre-launch polish phase
Next Milestone: Logo integration + final testing