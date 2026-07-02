# ApnaKart - Marketplace Adapters Official Integration Guide

This guide documents the technical requirements, connection endpoints, and step-by-step procedures to swap out the sandbox scrapers stubs in `backend/src/services/adapters/` with official production API integrations.

---

## 📦 1. Amazon India Integration (AmazonAssociatesAdapter)

### Legal & Technical Pre-requisites
- **Access Route**: Amazon Product Advertising API (PA-API v5).
- **Credentials Required**:
  - `AMAZON_ACCESS_KEY`
  - `AMAZON_SECRET_KEY`
  - `AMAZON_ASSOCIATE_TAG` (affiliate tracker tag, e.g. `apnakart-21`)

### Implementation Instructions
1. Perform HTTP POST requests to the Amazon PA-API host `webservices.amazon.in`.
2. Targets must be signed with AWS Signature Version 4.
3. Payload example for `GetItems` request:
   ```json
   {
     "ItemIds": ["B0CHX1W1YW"],
     "Resources": [
       "Images.Primary.Medium",
       "ItemInfo.Title",
       "Offers.Listings.Price"
     ],
     "PartnerTag": "apnakart-21",
     "PartnerType": "Associates",
     "Marketplace": "www.amazon.in"
   }
   ```

---

## 📦 2. Flipkart India Integration (FlipkartAffiliateAdapter)

### Legal & Technical Pre-requisites
- **Access Route**: Flipkart Affiliate API Portal.
- **Credentials Required**:
  - `FLIPKART_TRACKING_ID`
  - `FLIPKART_TOKEN`

### Implementation Instructions
1. Flipkart exposes programmatic GET feeds for category pull.
2. Endpoint: `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query={searchTerm}&resultCount=10`
3. Request headers:
   ```http
   Fk-Affiliate-Id: <FLIPKART_TRACKING_ID>
   Fk-Affiliate-Token: <FLIPKART_TOKEN>
   ```

---

## 📦 3. General Scraping Policy (No Public APIs)

For platforms that do not offer public API feeds (e.g. Ajio, Blinkit, Jiomart, Meesho):
1. **Legal Constraint**: Scraping public web listings is restricted by rate limits, web application firewalls, and cloud protection providers (e.g. Cloudflare, Akamai).
2. **Architecture Strategy**: Keep the abstract adapter layer (`BaseAdapter`) intact.
3. **Scraping Proxies**: If scraping is authorized under Terms of Service, route requests through premium residential proxy rotators (like ScrapingBee or Crawlbase) using custom header overrides to bypass Akamai/Cloudflare walls:
   ```typescript
   const response = await fetch(`https://app.scrapingbee.com/api/v1?url=${encodeURIComponent(targetUrl)}&api_key=${process.env.SCRAPINGBEE_API_KEY}`);
   ```
