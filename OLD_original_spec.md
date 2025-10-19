# Claude Context - Handmade by Nanny Rae Rae's

## Project Overview
E-commerce website for a grandmother selling handmade modern children's clothing in regional Australia. This is a passion project where she previously made clothes for her grandchildren and now wants to share her exclusive, high-quality creations with others. **Each piece is one-of-a-kind and unique.**

## Brand Identity
- **Business Name**: Handmade by Nanny Rae Rae's
- **Tagline**: "Modern handmade clothing with a grandmother's love"
- **Value Proposition**: Extremely well-made, exclusive, one-of-a-kind modern fashion-forward children's clothing
- **Unique Selling Point**: Every piece is unique - once it's sold, it's gone forever
- **Target Audience**: Parents/grandparents buying for newborns to 10-year-olds, gift buyers seeking unique pieces
- **Brand Voice**: Warm but professional, proud of quality and exclusivity, fashion-conscious

## Business Model Specifics
- **Inventory Type**: Stock-based, ONE-OF-A-KIND pieces
- **Product Availability**: Each item is unique with quantity of 1
- **Restocking**: No restocking of exact items (may create similar but not identical)
- **Pricing**: Premium pricing reflecting uniqueness and quality
- **International**: Yes, multi-currency support needed

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe (Australian configuration with GST)
- **Hosting**: Vercel/Cloudflare Pages
- **Email**: Resend (confirmed)
- **State Management**: Zustand (cart management)
- **Language**: TypeScript
- **Currency**: Multi-currency with exchange rates

## Updated Database Schema (Supabase)

### Core Tables (Revised for One-of-a-Kind Model)
```sql
-- Products table (simplified - no variants needed for unique pieces)
products (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  story text, -- Personal story about this specific piece
  price decimal NOT NULL,
  price_usd decimal, -- For international customers
  price_eur decimal,
  price_gbp decimal,
  size text NOT NULL, -- Single size for this unique piece
  age_group text NOT NULL,
  color_primary text,
  color_secondary text,
  fabric text,
  care_instructions text,
  measurements jsonb, -- Detailed measurements for this piece
  is_featured boolean DEFAULT false,
  is_sold boolean DEFAULT false, -- Critical for one-of-a-kind
  sold_at timestamp,
  is_reserved boolean DEFAULT false, -- For cart holds
  reserved_until timestamp,
  category_id uuid REFERENCES categories(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
)

-- Product images
product_images (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0
)

-- Categories
categories (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  age_group text[], -- Array of age groups
  display_order integer DEFAULT 0
)

-- Customer reviews
reviews (
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  customer_id uuid REFERENCES auth.users(id),
  order_id uuid REFERENCES orders(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT true,
  helpful_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
)

-- Wishlist/Watch list (important for one-of-a-kind items)
wishlists (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  product_id uuid REFERENCES products(id),
  notify_similar boolean DEFAULT false, -- Notify when similar item added
  created_at timestamp DEFAULT now()
)

-- Similar item notifications
similarity_notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  original_product_id uuid REFERENCES products(id),
  size_preference text,
  age_group_preference text,
  color_preference text,
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
)

-- Orders
orders (
  id uuid PRIMARY KEY,
  customer_id uuid REFERENCES auth.users(id),
  status text NOT NULL, -- pending, processing, shipped, delivered
  currency text DEFAULT 'AUD',
  subtotal decimal NOT NULL,
  gst_amount decimal, -- Only for Australian orders
  shipping_cost decimal NOT NULL,
  total_amount decimal NOT NULL,
  exchange_rate decimal DEFAULT 1, -- For currency conversion
  shipping_address jsonb NOT NULL,
  billing_address jsonb NOT NULL,
  tracking_number text,
  stripe_payment_intent_id text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
)

-- Order items (simplified for unique pieces)
order_items (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id), -- Direct product reference
  price_at_purchase decimal NOT NULL,
  currency_at_purchase text NOT NULL,
  created_at timestamp DEFAULT now()
)

-- Cart items (with reservation system)
cart_items (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_id text, -- For guest carts
  product_id uuid REFERENCES products(id),
  reserved_at timestamp DEFAULT now(),
  expires_at timestamp DEFAULT now() + interval '15 minutes', -- 15-min hold
  created_at timestamp DEFAULT now()
)
Key Features to Implement (Prioritized)
Phase 1: Core E-commerce with One-of-a-Kind Focus

 Homepage with hero, featured unique pieces
 Product listing pages
 Product detail pages
 "SOLD" badge overlay system
 Cart reservation system (15-minute hold)
 Real-time stock checking
 Shopping cart with reservation timer
 Checkout flow with Stripe
 Multi-currency selector (AUD, USD, EUR, GBP)
 GST calculation (10% for Australian orders only)

Phase 2: Admin Dashboard (PRIORITY)

 Product upload interface (TOP PRIORITY)

 Drag-and-drop multiple images
 Auto-generate SKU
 Size/measurement inputs
 Story/description editor
 Price in multiple currencies
 One-click publish


 View sold items archive
 Simple inventory dashboard showing available pieces
 Mark items as featured

Phase 3: Customer Features

 Customer reviews/ratings system
 "Notify me of similar items" feature
 Wishlist for saving favorites
 "This item is one-of-a-kind" messaging
 Recently viewed items
 Size guide with measurements

Phase 4: Email System (Resend)

 Order confirmation with product photos
 Shipping notification
 Review request after delivery
 "Similar item available" notifications
 Cart abandonment (if item still available)
 Welcome email for new customers

Phase 5: Shipping (Australia Post - Setup Later)

 Manual shipping calculation for now
 Prepare for API integration when business account obtained
 International shipping zones
 Free shipping over $100 AUD

Environment Variables Required
env# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Currency Exchange Rates (update periodically)
EXCHANGE_RATE_USD=0.65
EXCHANGE_RATE_EUR=0.61
EXCHANGE_RATE_GBP=0.52

# Site Configuration
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME="Handmade by Nanny Rae Rae's"
One-of-a-Kind Specific Features
Product Display

Large "ONE OF A KIND" badge on product cards
"SOLD" overlay when item purchased
"IN SOMEONE'S CART" indicator during reservation
Countdown timer showing reservation expiry
"Get Notified of Similar Items" button on sold products

Cart Behavior

15-minute reservation when added to cart
Visual countdown timer in cart
Automatic release if not purchased
Warning before expiry (2-minute warning)
Can't add already reserved items

Admin Product Upload Flow (Priority)
typescript// Simple product upload interface
interface ProductUpload {
  name: string;
  description: string;
  story: string; // "I made this piece thinking about..."
  size: string; // Single size
  ageGroup: '0-3m' | '3-12m' | '1-3y' | '3-5y' | '5-10y';
  measurements: {
    chest?: number;
    length?: number;
    sleeve?: number;
    waist?: number;
  };
  fabric: string;
  careInstructions: string;
  price_aud: number;
  // Auto-calculate other currencies
  images: File[]; // Multiple images
  category: string;
  colors: string[];
}
Unique Messaging Throughout Site

"Each piece is one-of-a-kind"
"Once it's gone, it's gone"
"Handmade and unique, just like your little one"
"No two pieces are exactly alike"
"Reserved for you for 15 minutes"
"Join the waitlist for similar items"

Implementation Priority Order

Admin Product Upload (Week 1)

Simple, user-friendly interface
Bulk image upload
Auto-save drafts
Preview before publish


One-of-a-Kind Cart System (Week 1)

Reservation system
Real-time availability
Timer display
Stock checking


Multi-Currency Support (Week 2)

Currency selector
Automatic conversion
Display preferences
Geo-detection for default


Review System (Week 2)

Post-purchase review requests
Photo uploads with reviews
Helpful voting
Display on product pages


Customer Notifications (Week 3)

Similar item alerts
Back in stock (for similar)
Price drops
New arrivals matching preferences



Testing Checklist for One-of-a-Kind Model

 Can't purchase already sold items
 Cart reservation prevents double-booking
 Timer correctly releases items
 Sold items show as unavailable
 Currency conversion works correctly
 GST only applies to Australian orders
 Reviews link to actual purchases
 Similar item notifications work
 Admin can easily upload products
 Product images upload and display correctly

Notes for Implementation
Critical Business Logic

Never allow double-booking of unique items
Clear reservation system to prevent cart abandonment issues
Prominent "one-of-a-kind" messaging to justify pricing
Fast, simple product upload for non-technical user
Automatic currency conversion based on user location
Reviews are crucial for trust with one-of-a-kind items

UX Considerations

Make the uniqueness a selling point, not a limitation
Create urgency without being pushy
Clear communication about reservation system
Beautiful sold items gallery (shows quality/demand)
Easy way to find similar items when something is sold

Future Considerations

Custom order requests for "similar to sold item"
Pre-order/commission system
VIP early access to new items
Instagram integration to show items being made
Story behind each piece (video/photos)