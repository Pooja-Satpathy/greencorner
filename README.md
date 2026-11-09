# GreenCorner – Plant & Gardening Hub

> **Bring Nature Closer to Home.**

GreenCorner is a fully responsive, multi-page plant and gardening website built with **HTML5, CSS3 and vanilla JavaScript** (no frameworks, no backend). It combines a curated **"where to buy" guide** for plants and gardening supplies, a plant-care knowledge hub and two interactive tools, and it is set up for SEO and Google Analytics 4 tracking for a Digital Marketing practical assignment.

> **How it works:** GreenCorner does not sell products. Each pick links to the search results of four Indian online stores — **Nurserylive, Ugaoo, Amazon.in and Flipkart** — so visitors can compare price, size and delivery and buy directly. GreenCorner is not affiliated with these stores and earns no commission. Contact details and testimonials are sample content, and form submissions are not sent anywhere.

Planned live URL: **https://pooja-satpathy.github.io/greencorner/** (see [Deploy to GitHub Pages](#4-deploy-to-github-pages)).

---

## 1. Features

| Area | What's included |
|---|---|
| **Where to Buy** | 36 curated picks in 6 categories (Indoor Plants, Outdoor Plants, Succulents, Pots & Planters, Seeds & Soil, Gardening Tools), live search, category filters, sorting (featured, easiest care, category, A–Z), shareable filter URLs, store guide and online-buying tips |
| **Pick details** | Large image, description, **Where to buy** links (Nurserylive, Ugaoo, Amazon.in, Flipkart – open in a new tab), sunlight requirements, watering frequency, plant care instructions, pet notes, "what to look for" for supplies, tips for buying online, related picks, links to related guides |
| **My Plant List** | Replaces a cart: "Save" any pick, open the list from the heart icon, see store links for every saved item, remove (with undo), copy the list or share it on WhatsApp. Saved in `localStorage` |
| **Guides** | Guides hub + 6 long-form articles with tables of contents, comparison tables, internal links to products and other guides |
| **Plant Finder** | 4 questions (location, sunlight, maintenance, space) → scored recommendations with reasons and match percentage |
| **Care Planner** | Add plants, record watering dates, approximate next-watering reminders, overdue alerts, care activity log, optional browser notifications, `.ics` calendar export, JSON backup. Saved in `localStorage` |
| **Marketing** | Announcement bar, seasonal promo banners, Winter Garden Festival content-campaign landing section, popular-picks sections, newsletter on every page, social links, WhatsApp sharing |
| **Forms** | Newsletter and contact forms with accessible inline validation |
| **SEO** | Unique titles & meta descriptions, canonical URLs, Open Graph/Twitter cards, JSON-LD structured data, semantic HTML5, heading hierarchy, descriptive alt text, sitemap.xml, robots.txt |
| **Analytics** | GA4-ready event tracking (e-commerce + custom events) – just add your Measurement ID |
| **Accessibility** | Skip link, keyboard-friendly navigation, focus trapping in the plant list, ARIA live regions, reduced-motion support |

Store links use each store's own search (e.g. `https://nurserylive.com/search?q=snake%20plant`), so they keep working even when individual listings change. Ugaoo is not suggested for a few picks it didn't stock when the links were checked (Nov 2026).

---

## 2. Project structure

```
greencorner/
├── index.html                 Home page
├── shop.html                  Where to Buy (search, filters, sorting, store guide)
├── product.html               Pick details + where to buy (product.html?id=snake-plant)
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
│   ├── products.js            Curated picks, stores, categories, guides, helpers
│   ├── main.js                Shared UI, home/where-to-buy/pick pages, forms
│   ├── plant-list.js          My Plant List (save, store links, copy/share)
│   ├── plant-finder.js        Plant Finder scoring & results
│   └── care-planner.js        Care Planner (localStorage, reminders, .ics)
├── images/                    Logo, favicons, Open Graph image, placeholder
├── fonts/                     Self-hosted Fraunces & DM Sans (SIL OFL)
├── sitemap.xml
├── robots.txt
└── README.md
```

Every page loads the scripts in this order: `analytics.js` (in `<head>`) → `products.js` → `main.js` → `plant-list.js` → page script (`plant-finder.js` or `care-planner.js`).

---

## 3. Run the website locally

**Option A – quickest:** double-click `index.html` to open it in Chrome, Edge or Firefox. Everything works, including the plant list and planner.

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
4. Leave `DEBUG = false` on the live site. Set it to `true` only briefly if you want to watch events in GA4 **DebugView** (GA4 can filter debug traffic out of standard reports).
5. Commit and push. Check **Reports → Realtime** to confirm data is arriving.

Until an ID is added, nothing is sent to Google: every event is pushed to `window.dataLayer` and printed in the console as `[GA4 event] …`, so you can demonstrate the tracking plan locally (open DevTools → Console).

### Tracking plan

| Requirement | GA4 event | Where it fires | Key parameters |
|---|---|---|---|
| Page views | `page_view` (automatic) | Every page | page_title, page_location |
| Product views | `view_item` | Pick details page | items[] |
| Product lists | `view_item_list`, `select_item` | Home, Where to Buy, related picks, finder | item_list_name, items[] |
| **Store clicks (outbound)** | `where_to_buy_click` | Store buttons on pick pages and in My Plant List | store, item_id, item_name, link_location, link_url |
| Save clicks | `add_to_wishlist`, `remove_from_wishlist` | Any "Save" button | items[] |
| Plant list | `view_plant_list`, `share_plant_list` | My Plant List drawer | items_count, method (copy / whatsapp) |
| Newsletter submissions | `newsletter_signup` | Newsletter form (all pages) | form_location |
| Plant Finder usage | `plant_finder_submit` | Plant Finder | location, light, maintenance, space, results_count, top_result |
| Contact form submissions | `generate_lead`, `contact_form_submit` | Contact page | form_name, topic |
| Site search | `search` | Shop search & header search | search_term |
| Promotions | `view_promotion`, `select_promotion` | Offer banners & campaign section | promotion_id, promotion_name, creative_slot |
| Care Planner | `care_planner_add_plant`, `care_planner_watered`, `care_planner_log_activity`, `care_planner_calendar_export` | Care Planner | plant_type, interval_days, activity |

**Recommended GA4 configuration**

- Mark `where_to_buy_click`, `newsletter_signup`, `generate_lead` and `plant_finder_submit` as **Key events** (Admin → Events).
- Register custom dimensions (Admin → Custom definitions) for `store`, `link_location`, `form_location`, `topic`, `location`, `light`, `maintenance`, `space` and `top_result` to use them in reports — e.g. "store clicks by store".
- GA4 Enhanced Measurement also records outbound link clicks automatically as `click` events.
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
| Unique titles & meta descriptions | Every page and article (≈50–75 / 120–160 characters). The pick page updates its title, description, canonical and OG tags for each pick |
| Semantic HTML5 | `header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer` |
| Heading hierarchy | One `h1` per page, `h2` for sections, `h3` for cards/sub-sections (no skipped levels) |
| Image ALT text | Descriptive alt text on all content images; decorative images use empty alt |
| SEO-friendly URLs | Readable, keyword-based file names, e.g. `/guides/how-often-to-water-indoor-plants.html`; category filters use `shop.html?category=indoor-plants` |
| Internal & outbound linking | Guides ↔ picks ↔ tools, breadcrumbs, related picks & related guides, footer links, descriptive anchor text; store links open in a new tab with `rel="noopener"` |
| Open Graph & Twitter Cards | Title, description, URL, 1200×630 image on every page |
| Structured data (JSON-LD) | Organization, WebSite + SearchAction, BreadcrumbList (incl. per pick), Article, ItemList, FAQPage, ContactPage, WebApplication. Product markup is intentionally not used because GreenCorner doesn't sell or price products |
| Crawling | `sitemap.xml` (pages, guides, categories, products), `robots.txt`, canonical URLs, custom 404 with `noindex` |
| Performance | Self-hosted fonts with `font-display: swap`, responsive `srcset` images, lazy loading below the fold, preloaded hero image, no frameworks |
| Content quality | Practical guides, no keyword stuffing, cautious plant-care claims (watering intervals presented as starting points; pet safety referenced to the ASPCA; "air-purifying" claims explained honestly) |

### Keyword map

| Page | Primary keyword(s) |
|---|---|
| Home | indoor plants online, buy plants online India |
| Where to Buy | where to buy plants online India, buy indoor plants online, buy gardening tools online |
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

- **Picks:** edit the `GC.products` list in `js/products.js` (name, description, care fields, `search` term sent to the stores, `stores` to suggest, `finder` attributes for the Plant Finder and `waterDays` for the Care Planner). New picks automatically appear on Where to Buy, search, filters, the pick page, related picks and the Plant Finder. Add new pick URLs to `sitemap.xml`.
- **Stores:** `GC.stores` in `js/products.js` holds each store's name and search-URL pattern. Add or remove a store there.
- **Images:** product photos use Unsplash photo IDs (`photoId`). To use your own photos, put them in `images/` and change `GC.imageUrl()` in `js/products.js` to return your file path.
- **Colours & fonts:** change the CSS custom properties at the top of `css/style.css` (`--forest-700`, `--sage-500`, `--cream-100`, `--beige-300`, …).
- **Header & footer:** they are written into each HTML page (so they work without JavaScript and are fully crawlable). If you change a menu link, update it in every page — use Find in Files.
- **Making the forms real:** connect the contact form to a service such as Formspree or Google Forms, and the newsletter to an email platform (e.g. Mailchimp or Brevo). The places to do this are marked in `js/main.js`.

---

## 8. Known limitations

- GreenCorner doesn't sell products, so there are no prices, stock or orders; prices and availability are whatever each store shows.
- Store links open search results, not specific listings, so visitors still choose the exact item themselves.
- Pick details are rendered with JavaScript from `product.html?id=…`. Google renders JavaScript, but a static HTML page per pick would be even stronger for SEO.
- Care Planner reminders are approximate and appear when the page is open (or via the exported calendar file). Data lives only in the visitor's browser.

---

## 9. Credits

- **Photography:** [Unsplash](https://unsplash.com) (free Unsplash License). Individual photographer credits are listed on the About page (`about.html#photo-credits`).
- **Fonts:** [Fraunces](https://github.com/undercasetype/Fraunces) and [DM Sans](https://github.com/googlefonts/dm-fonts), SIL Open Font License 1.1 (licence files in `/fonts`).
- **Icons & logo:** custom inline SVG.

Built for a Digital Marketing practical assignment.
