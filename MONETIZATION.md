# SHAX PUBG Marketplace — Monetization System

## Revenue Streams

### 1. Account Marketplace Commission
- **Rate**: 8% of final sale price
- **Minimum**: 5,000 UZS per transaction
- **Implementation**: Auto-deducted at order completion (`calculate_platform_fee()`)
- **Payout**: Weekly to seller wallet

### 2. UC Sales Margin
- Buy UC at wholesale price → sell at 10-15% markup
- Direct margin since Shax is the UC supplier
- **Delivery**: Semi-automated (admin panel confirms delivery)

### 3. Featured Listings
Premium placement for seller accounts:
| Slot | Position | Duration | Price |
|------|----------|----------|-------|
| Homepage Hero | Hero section slider | 7 days | 150,000 UZS |
| Homepage Grid | Featured accounts grid | 7 days | 80,000 UZS |
| Search Top | Top of search results | 7 days | 100,000 UZS |
| Category Top | Category page top | 7 days | 60,000 UZS |

### 4. Advertising Banners
| Placement | Format | Monthly Price |
|-----------|--------|---------------|
| Header banner | 970×90px | 500,000 UZS |
| Sidebar | 300×250px | 300,000 UZS |
| Content (in-feed) | 640×200px | 250,000 UZS |
| Mobile popup | 320×480px | 400,000 UZS |

### 5. Seller Subscription (future)
- **Basic** (free): 3 active listings, standard search placement
- **Pro** (99,000 UZS/month): 20 active listings, boosted placement, analytics
- **Elite** (299,000 UZS/month): Unlimited listings, hero placement 1x/month, priority support

## Revenue Projections

### Conservative (Year 1)
| Source | Monthly |
|--------|---------|
| Commissions (500 sales × avg 400K × 8%) | 16,000,000 UZS |
| UC margins (200 orders × avg profit 15K) | 3,000,000 UZS |
| Featured listings (20 slots) | 1,600,000 UZS |
| Ad banners (3 advertisers) | 1,050,000 UZS |
| **Total** | **~21,650,000 UZS (~$1,700/mo)** |

### Growth (Year 2 — post SEO traffic)
| Source | Monthly |
|--------|---------|
| Commissions (2,000 sales × avg 500K × 8%) | 80,000,000 UZS |
| UC margins | 15,000,000 UZS |
| Featured + ads | 10,000,000 UZS |
| Seller subs (100 Pro) | 9,900,000 UZS |
| **Total** | **~115M UZS (~$9,000/mo)** |

## Wallet System

```
User wallet flow:
Buyer pays → Order total deducted from wallet / payment gateway
Sale completes → Seller receives (total - 8% fee)
Seller withdraws → Bank transfer / Payme withdrawal
```

## Implementation Notes

### Commission auto-calculation
```sql
-- In orders table, platform_fee is auto-calculated:
platform_fee = calculate_platform_fee(total_amount)
-- = MAX(total_amount * 0.08, 5000)
```

### Featured slot purchase
- Handled in `/seller-dashboard/boost/[account-id]`
- Insertes into `featured_slots` with validity period
- Middleware checks `featured_slots` table for active slots

### Ad banner management
- Managed in Admin Panel → Banners
- `<AdBanner placement="sidebar" />` components scattered in layout
- Tracks views + clicks via API route
