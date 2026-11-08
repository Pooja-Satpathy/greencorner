# GreenCorner – Plant & Gardening Hub

> **Bring Nature Closer to Home.**

GreenCorner is a fully responsive, multi-page demo e-commerce website for a plant and gardening brand, built with **HTML5, CSS3 and vanilla JavaScript** (no frameworks, no backend). It combines an online store, a plant-care knowledge hub and two interactive tools, and it is set up for SEO and Google Analytics 4 tracking for a Digital Marketing practical assignment.

> **Demo notice:** GreenCorner is a fictional brand. Products, prices, offers, contact details and testimonials are sample content. No payments are processed and form submissions are not sent anywhere.

Planned live URL: **https://pooja-satpathy.github.io/greencorner/** (see [Deploy to GitHub Pages](#4-deploy-to-github-pages)).

---

## 1. Features

| Area | What's included |
|---|---|
| **Store** | 36 sample products in 6 categories (Indoor Plants, Outdoor Plants, Succulents, Pots & Planters, Seeds & Soil, Gardening Tools), prices in INR, live search, category filters, sorting, shareable filter URLs |
| **Product details** | Large image, description, price/MRP/discount, quantity selector, sunlight requirements, watering frequency, plant care instructions, pet notes, specifications for non-plant items, related products, links to related guides |
| **Cart** | Slide-out cart on every page; add, increase/decrease, remove (with undo); subtotal, coupon discount, delivery fee, total; free-delivery progress bar; coupon codes; demo checkout. Saved in `localStorage` |
| **Guides** | Guides hub + 6 long-form articles with tables of contents, comparison tables, internal links to products and other guides |
| **Plant Finder** | 4 questions (location, sunlight, maintenance, space) → scored recommendations with reasons and match percentage |
| **Care Planner** | Add plants, record watering dates, approximate next-watering reminders, overdue alerts, care activity log, optional browser notifications, `.ics` calendar export, JSON backup. Saved in `localStorage` |
| **Marketing** | Announcement bar, seasonal promo banners, Winter Garden Festival campaign landing section, coupon codes, featured/best-seller sections, newsletter on every page, social links |
| **Forms** | Newsletter and contact forms with accessible inline validation |
| **SEO** | Unique titles & meta descriptions, canonical URLs, Open Graph/Twitter cards, JSON-LD structured data, semantic HTML5, heading hierarchy, descriptive alt text, sitemap.xml, robots.txt |
| **Analytics** | GA4-ready event tracking (e-commerce + custom events) – just add your Measurement ID |
| **Accessibility** | Skip link, keyboard-friendly navigation, focus trapping in the cart, ARIA live regions, reduced-motion support |

**Coupon codes (sample):** `GREEN10` – 10% off any order · `WINTER15` – 15% off orders of ₹999 or more. Delivery is free above ₹999, otherwise ₹79.

---

## 2. Project structure

```
greencorner/
├── index.html                 Home page
├── shop.html                  Shop (search, filters, sorting)
├── product.html               Product details (product.html?id=snake-plant)
├── plant-guide.html           Plant care & gardening guides hub
├── plant-finder.html          Interactive Plant Finder
├── care-planner.html          Plant Care Planner
├── about.html                 Brand story, mission, values, photo credits
├── contact.html               Contact form, details, FAQ
├── 404.html                   Custom "page not found" (used by GitHub Pages)
├── guides/                    SEO-friendly article pages
│   ├── best-indoor-plants-for-beginners.html
│   ├── money-plant-care-guide.html
│   ├── how-often-to-water-indoor-plants.html
│   ├── best-plants-for-small-apartments.html
│   ├── common-gardening-mistakes.html
│   └── balcony-garden-ideas.html
├── css/
│   ├── style.css              Design tokens, components, page layouts
│   └── responsive.css         Tablet & mobile breakpoints
├── js/
│   ├── analytics.js           GA4 loader + track() helper (add your ID here)
│   ├── products.js            Sample catalogue, categories, guides, helpers
│   ├── main.js                Shared UI, home/shop/product pages, forms
│   ├── cart.js                Cart, coupons, totals, drawer, demo checkout
│   ├── plant-finder.js        Plant Finder scoring & results
│   └── care-planner.js        Care Planner (localStorage, reminders, .ics)
├── images/                    Logo, favicons, Open Graph image, placeholder
├── fonts/                     Self-hosted Fraunces & DM Sans (SIL OFL)
├── sitemap.xml
├── robots.txt
└── README.md
```

Every page loads the scripts in this order: `analytics.js` (in `<head>`) → `products.js` → `main.js` → `cart.js` → page script (`plant-finder.js` or `care-planner.js`).

---

## 3. Run the website locally

**Option A – quickest:** double-click `index.html` to open it in Chrome, Edge or Firefox. Everything works, including the cart and planner.

**Option B – recommended (behaves exactly like GitHub Pages):** start a small local web server in the `greencorner` folder.

```bash
cd greencorner
python -m http.server 8000        # use python3 on macOS/Linux
```

Then open **http://localhost:8000** in your browser. Press `Ctrl + C` in the terminal to stop the server.

**Option C – VS Code:** install the *Live Server* extension, right-click `index.html` → **Open with Live Server**.

> Product photos load from the Unsplash image CDN, so you need an internet connection to see them. If a photo can't load, a local placeholder image is shown instead.

---

## 4. Deploy to GitHub Pages

### Using the GitHub website (no Git required)

1. Sign in to GitHub and click **New repository**. Name it **`greencorner`**, set it to **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**.
3. Open the `greencorner` folder on your computer, select **all of its contents** (not the folder itself) and drag them into the upload area. Make sure `index.html` ends up at the top level of the repository.
4. Click **Commit changes**.
5. Go to **Settings → Pages**. Under **Build and deployment**, choose **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`**, and click **Save**.
6. Wait 1–2 minutes and refresh the page. Your site will be live at
   `https://<your-username>.github.io/greencorner/`

### Using Git on the command line

```bash
cd greencorner
git init
git add .
git commit -m "GreenCorner website"
git branch -M main
git remote add origin https://github.com/<your-username>/greencorner.git
git push -u origin main
```

Then enable Pages as in step 5 above.

### Update the site URL (important for SEO)

Canonical links, Open Graph tags, `sitemap.xml`, `robots.txt` and `404.html` use the full site URL:

```
https://pooja-satpathy.github.io/greencorner/
```

If your GitHub username or repository name is different, use your editor's **Find in Files → Replace All** (VS Code: `Ctrl + Shift + H`) to replace that text with your own URL in all files, then commit again.

### After going live

1. Add the site to **Google Search Console** (URL-prefix property), verify ownership (HTML tag method works on GitHub Pages) and submit `sitemap.xml`.
2. Test social previews with the Facebook Sharing Debugger or LinkedIn Post Inspector.
3. Run **Lighthouse** in Chrome DevTools (Performance, Accessibility, Best Practices, SEO).
4. Validate structured data with Google's **Rich Results Test** or the **Schema Markup Validator**.

---

## 5. Google Analytics 4 setup

1. In [Google Analytics](https://analytics.google.com/), create a **GA4 property** and a **Web data stream** for your GitHub Pages URL.
2. Copy the **Measurement ID** (format `G-XXXXXXXXXX`).
3. Open `js/analytics.js` and paste it:
   ```js
   var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
   ```
4. Set `DEBUG = false` for production (or keep it `true` to see events in the browser console and in GA4 **DebugView**).
5. Commit and push. Check **Reports → Realtime** to confirm data is arriving.

Until an ID is added, nothing is sent to Google: every event is pushed to `window.dataLayer` and printed in the console as `[GA4 event] …`, so you can demonstrate the tracking plan locally (open DevTools → Console).

### Tracking plan

| Requirement | GA4 event | Where it fires | Key parameters |
|---|---|---|---|
| Page views | `page_view` (automatic) | Every page | page_title, page_location |
| Product views | `view_item` | Product details page | items[], value, currency |
| Product lists | `view_item_list`, `select_item` | Home, shop, related products, finder | item_list_name, items[] |
| Add-to-cart clicks | `add_to_cart` | Any "Add to Cart" button | items[], value, currency |
| Cart activity | `view_cart`, `remove_from_cart`, `coupon_applied` | Cart drawer | items[], coupon |
| Checkout intent | `begin_checkout`, `demo_checkout_complete` | Demo checkout | value, coupon |
| Newsletter submissions | `newsletter_signup` | Newsletter form (all pages) | form_location |
| Plant Finder usage | `plant_finder_submit` | Plant Finder | location, light, maintenance, space, results_count, top_result |
| Contact form submissions | `generate_lead`, `contact_form_submit` | Contact page | form_name, topic |
| Site search | `search` | Shop search & header search | search_term |
| Promotions | `view_promotion`, `select_promotion` | Offer banners & campaign section | promotion_id, promotion_name, creative_slot |
| Care Planner | `care_planner_add_plant`, `care_planner_watered`, `care_planner_log_activity`, `care_planner_calendar_export` | Care Planner | plant_type, interval_days, activity |

**Recommended GA4 configuration**

- Mark `add_to_cart`, `newsletter_signup`, `generate_lead` and `plant_finder_submit` as **Key events** (Admin → Events).
- Register custom dimensions (Admin → Custom definitions) for `form_location`, `topic`, `location`, `light`, `maintenance`, `space` and `top_result` to use them in reports.
- Before using analytics with real visitors, add a privacy policy and a cookie/consent banner (for example Google Consent Mode) as required by applicable laws such as India's DPDP Act or the GDPR.

### Campaign tracking with UTM links

Use UTM parameters when sharing the Winter Garden Festival campaign so GA4 can attribute traffic:

```
https://pooja-satpathy.github.io/greencorner/index.html?utm_source=instagram&utm_medium=social&utm_campaign=winter_garden_festival_2026#winter-garden-festival
https://pooja-satpathy.github.io/greencorner/shop.html?category=seeds-soil&utm_source=newsletter&utm_medium=email&utm_campaign=winter_garden_festival_2026
https://pooja-satpathy.github.io/greencorner/guides/balcony-garden-ideas.html?utm_source=pinterest&utm_medium=social&utm_campaign=balcony_content
```

---

## 6. SEO implementation

| Item | Implementation |
|---|---|
| Unique titles & meta descriptions | Every page and article (≈50–75 / 120–160 characters). The product page updates its title, description, canonical and OG tags for each product |
| Semantic HTML5 | `header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer` |
| Heading hierarchy | One `h1` per page, `h2` for sections, `h3` for cards/sub-sections (no skipped levels) |
| Image ALT text | Descriptive alt text on all content images; decorative images use empty alt |
| SEO-friendly URLs | Readable, keyword-based file names, e.g. `/guides/how-often-to-water-indoor-plants.html`; category filters use `shop.html?category=indoor-plants` |
| Internal linking | Guides ↔ products ↔ tools, breadcrumbs, related products & related guides, footer links, descriptive anchor text |
| Open Graph & Twitter Cards | Title, description, URL, 1200×630 image on every page |
| Structured data (JSON-LD) | Organization, WebSite + SearchAction, BreadcrumbList, Article, ItemList, FAQPage, ContactPage, WebApplication, Product (generated per product) |
| Crawling | `sitemap.xml` (pages, guides, categories, products), `robots.txt`, canonical URLs, custom 404 with `noindex` |
| Performance | Self-hosted fonts with `font-display: swap`, responsive `srcset` images, lazy loading below the fold, preloaded hero image, no frameworks |
| Content quality | Practical guides, no keyword stuffing, cautious plant-care claims (watering intervals presented as starting points; pet safety referenced to the ASPCA; "air-purifying" claims explained honestly) |

### Keyword map

| Page | Primary keyword(s) |
|---|---|
| Home | indoor plants online, buy plants online India |
| Shop | buy gardening tools online, pots and planters, seeds and soil |
| Plant Guides hub | plant care tips, gardening guides |
| Best Indoor Plants for Beginners | best indoor plants for beginners, low-maintenance indoor plants |
| How to Care for a Money Plant | money plant care, pothos care |
| How Often Should Indoor Plants Be Watered? | how often to water indoor plants |
| Best Plants for Small Apartments | best plants for small apartments, hanging plants |
| 10 Common Gardening Mistakes | common gardening mistakes |
| How to Create a Balcony Garden | balcony gardening ideas, balcony garden India |
| Plant Finder | which plant should I buy, plant finder |
| Care Planner | plant watering tracker, watering reminder |

---

## 7. Customising the site

- **Products:** edit the `GC.products` list in `js/products.js` (name, price, MRP, description, care fields, `finder` attributes for the Plant Finder and `waterDays` for the Care Planner). New products automatically appear in the shop, search, filters, product page, related items and Plant Finder. Add new product URLs to `sitemap.xml`.
- **Images:** product photos use Unsplash photo IDs (`photoId`). To use your own photos, put them in `images/` and change `GC.imageUrl()` in `js/products.js` to return your file path.
- **Colours & fonts:** change the CSS custom properties at the top of `css/style.css` (`--forest-700`, `--sage-500`, `--cream-100`, `--beige-300`, …).
- **Coupons & delivery fee:** `COUPONS`, `FREE_SHIPPING_MIN` and `SHIPPING_FEE` at the top of `js/cart.js`.
- **Header & footer:** they are written into each HTML page (so they work without JavaScript and are fully crawlable). If you change a menu link, update it in every page — use Find in Files.
- **Making the forms real:** connect the contact form to a service such as Formspree or Google Forms, and the newsletter to an email platform (e.g. Mailchimp or Brevo). The places to do this are marked in `js/main.js`.

---

## 8. Known limitations

- Demo store only: no payment gateway, accounts, stock management or order emails.
- Product details are rendered with JavaScript from `product.html?id=…`. Google renders JavaScript, but for a production store, generating a static HTML page per product would be even stronger for SEO.
- Care Planner reminders are approximate and appear when the page is open (or via the exported calendar file). Data lives only in the visitor's browser.

---

## 9. Credits

- **Photography:** [Unsplash](https://unsplash.com) (free Unsplash License). Individual photographer credits are listed on the About page (`about.html#photo-credits`).
- **Fonts:** [Fraunces](https://github.com/undercasetype/Fraunces) and [DM Sans](https://github.com/googlefonts/dm-fonts), SIL Open Font License 1.1 (licence files in `/fonts`).
- **Icons & logo:** custom inline SVG.

Built for a Digital Marketing practical assignment.
