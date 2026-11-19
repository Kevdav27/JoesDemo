# Joe's Roofing & Building website

A static website in plain HTML, CSS and JavaScript, laid out the same way as
the Maiya's Landscaping & Tree Surgeons site. No build step, no frameworks, no
trackers. Upload the whole folder to any static host (Cloudflare Pages,
Netlify, IIS). Opening `index.html` straight from the folder works for a
quick look, but the fonts only load when the site is served from a web
address.

## What is where

| File or folder | What it is |
| --- | --- |
| `index.html` | Home: photo hero, badges, services, on site, before/after, how it works, reviews and socials, map, call to action |
| `about.html` | About |
| `services.html` | Services overview, with the clickable house drawing |
| `roof-installations.html`, `roof-repairs.html`, `flat-roofing.html`, `guttering-fascias-soffits.html`, `chimney-work.html`, `building-extensions.html` | One page per service (the Services dropdown) |
| `locations.html` | Areas covered, with the Google map |
| `gallery.html` | Photo gallery with filters and before/after sliders |
| `reviews.html` | Reviews |
| `contact.html` | Contact form (opens WhatsApp or email) |
| `quote.html` | Four-step quote request |
| `privacy.html`, `404.html` | Privacy notice and "page not found" |
| `css/styles.css` | All styling. Brand colours are at the top under "tokens" |
| `css/noscript.css` | Only used when JavaScript is off: shows the menu as a plain list |
| `js/main.js` | All behaviour: menu, hero photos, tabs, sliders, map, gallery, forms, chat |
| `images/photos/` | Job photos, each at three sizes (`-sm`, `-md`, `-lg`) |
| `sitemap.xml`, `robots.txt` | For search engines |
| `_headers`, `web.config`, `.well-known/security.txt` | Security headers for the host |

The header, menu and footer are repeated in every page. To change a menu
link, find and replace it across the whole folder.

## Before the site goes live

1. **Social pages.** Open `js/main.js` and fill in `SOCIAL` near the top with
   Joe's Facebook, Instagram and TikTok addresses. Every social button on
   every page takes its address from there. They are placeholders for now.
2. **Domain.** The pages use `https://www.joesroofingandbuilding.co.uk` as a
   stand-in. Find and replace it across the whole folder with the real domain.
3. **Reviews.** The reviews on `index.html` and `reviews.html` are labelled
   samples. Replace them with genuine customer reviews or remove them.
   Publishing invented reviews breaks UK consumer law and Google's rules.
4. **Photos.** The job photos came from the earlier `roofing-company` folder.
   Confirm each one is Joe's own work, and swap any that are not.
5. **Wording.** Ask Joe to read the service pages. They make no claims about
   insurance, guarantees, accreditation or years in business. Add those only
   if they are true.
6. **Address.** The yard address (Rear Unit/Yard, Pemberton, Wigan WN5 8DH)
   is taken from Joe's flyer. It must match his Google Business Profile
   exactly, along with the name and phone number.
7. **HTTPS.** Once the live site serves HTTPS, uncomment the
   `Strict-Transport-Security` line in `_headers`.

## Google: Search, Business Profile and Local Services Ads

- Submit `sitemap.xml` in Google Search Console after launch.
- The business name, phone number and address must be identical on the site,
  the Google Business Profile and anywhere else Joe is listed.
- Local Services Ads are set up in Google Ads, not on the website. Google
  verifies the business itself (identity, and insurance for trades). The
  website helps by matching the profile and giving each service its own page.
- Every page has one title, one description, one `<h1>`, a canonical address
  and structured data marking the business as a roofing contractor in Wigan.

## The Google map

The home and Locations pages embed Google Maps without an API key. Choosing a
town moves the map. The map is the only outside content on the site, so it is
the only extra address allowed in the Content-Security-Policy (`frame-src`).
The privacy notice explains that Google may set cookies when the map loads.

## Hero photos

The home hero steps through four of Joe's photos: before, stripped, felt and
battens, finished. To change them, edit `SLIDES` in the generator, or swap the
four `hf-slide` images in `index.html`, keeping the same order as the labels
in the story bar. Visitors who ask their device to reduce motion see the
finished roof only. The two videos in the old `roofing-company` folder were
not used: one is stock footage of an American timber-frame build, the other is
AI-generated with "Luma AI" watermarks.

## Chat assistant

The chat button opens an automated assistant that answers from a fixed list
of topics in `js/main.js` (search for `CHAT_TOPICS`). It runs in the visitor's
browser and sends nothing anywhere. It says it is automated and hands people
to phone, WhatsApp or email for anything it does not know.

To connect a real AI model later, set `CHAT_ENDPOINT` in `js/main.js` to a
path on this same website that forwards the conversation to your AI provider.
Keep the API key on the server, never in `main.js`. Update `privacy.html` at
the same time, because messages would then leave the visitor's browser.

## Colours and logo

All colours are set once at the top of `css/styles.css`:

| Name | Value | Used for |
| --- | --- | --- |
| `--blue` | `#1769AA` | Buttons, links, navigation, logo roof |
| `--navy` | `#0D3B66` | Headings, hover states, footer, dark bands |
| `--white` | `#FFFFFF` | Main background, cards |
| `--grey` | `#F3F5F7` | Alternate section backgrounds |
| `--ink` | `#252525` | Body text |
| `--green` | `#277A43` | Ticks, WhatsApp buttons |
| `--gold` | `#D99A32` | Stars, badges, highlights |
| `--logo-black` | `#111111` | The J and "JOE'S" in the logo, as printed on the flyer |
| `--logo-amber` | `#A36A12` | "Property Improvements" in the logo, deepened from the gold so it stays readable at small size |
