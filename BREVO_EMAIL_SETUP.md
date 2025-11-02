# Brevo Email Integration Setup

## Environment Variables Required

Add these environment variables to your Vercel deployment or local `.env` file:

### Required for Shipping Confirmation Emails

```bash
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SHIPPING_TEMPLATE_ID=2
BREVO_FROM_EMAIL=noreply@nannyraerae.com
BREVO_FROM_NAME=Nanny Rae Rae
```

## How to Get These Values

### 1. BREVO_API_KEY
1. Log into your Brevo account
2. Go to Settings > API Keys
3. Create a new API key or use existing one
4. Copy the key value

### 2. BREVO_SHIPPING_TEMPLATE_ID
1. Go to Campaigns > Templates in Brevo
2. Find your shipping confirmation template
3. Click on it to view details
4. The template ID will be shown in the URL or template details
5. Use just the numeric ID (e.g., `2`, not `template_2`)

### 3. BREVO_FROM_EMAIL & BREVO_FROM_NAME
- Set these to match your verified sender email in Brevo
- Default values are provided but should be customized

## Shipping Email Template Variables

The following variables are passed to the Brevo template:

```
CUSTOMER_NAME - Full customer name
ORDER_ID - Short order ID (last 8 characters)
TRACKING_NUMBER - Australia Post tracking number
SHIPPED_DATE - Formatted shipping date (e.g., "30 October 2024")
PRODUCTS - Array of products with name, image, quantity, price
ADDRESS_LINE1 - Shipping address line 1
ADDRESS_LINE2 - Shipping address line 2 (optional)
CITY - Shipping city
STATE - Shipping state
POSTCODE - Shipping postcode
COUNTRY - Shipping country (defaults to "Australia")
TOTAL - Order total amount
```

## Supabase Function Deployment

Deploy the shipping email function to Supabase:

```bash
supabase functions deploy send-shipping-email
```

## Testing

1. Create a test order in the admin panel
2. Use the "Ship Order" button to enter a tracking number
3. Check the Supabase function logs for any errors
4. Verify the email is received by the customer

## Troubleshooting

### Common Issues

1. **Email not sending**: Check Brevo API key and template ID
2. **Template variables not showing**: Verify variable names match exactly
3. **From email rejected**: Ensure sender email is verified in Brevo
4. **Function timeout**: Check Supabase function logs for errors

### Error Messages

- "Missing Brevo configuration" - Check environment variables are set
- "Failed to fetch order" - Order ID may be incorrect
- "Brevo API error" - Check API key and template ID
- "Template not found" - Verify template ID exists in Brevo

## Email Flow

1. Admin enters tracking number and clicks "Mark as Fulfilled & Send Email"
2. Order status updated to "shipped" in database
3. Shipping confirmation function called via Supabase
4. Email sent to customer via Brevo API
5. Success/error message shown to admin
6. Order list refreshed with tracking information

## Features

- Automatic customer notification when order ships
- Tracking number included in email
- Order details and shipping address in email
- Graceful error handling (order still marked as shipped if email fails)
- Toast notifications for admin feedback
- Tracking link in admin interface