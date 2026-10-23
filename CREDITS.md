# Red Dot Restaurant & Bar: concept redesign preview

Unofficial concept. Not affiliated with or endorsed by Red Dot Restaurant & Bar, 321 Warren St, Hudson, NY.

## Photos (all from Red Dot's own website gallery, retrieved Oct 12, 2026)
| File | What it shows (site's own alt text) | Source URL |
|---|---|---|
| img/bar-frame-504.jpg, img/bar-frame-504.webp | The bar (site alt: "gallery photo number 7"). Cropped to 504x630 (4:5) from the 800x800 original, no upscaling; the gallery `/full` URL is the largest version served (800px). Shown in a frame at max 400px wide. | https://static.spotapps.co/spots/63/5f9b86b31749b09b43e5ff3283a00b/full (gallery on https://reddothudson.net/) |
| img/salmon.jpg | Seared salmon on chickpeas & spinach | https://static.spotapps.co/spots/68/d714926ba5453cb10c42284d2e1139/full |
| img/shishito.jpg | Shishito peppers, feta, lemon | https://static.spotapps.co/spots/74/7b09708c0545c787e0f005f08566e7/full |
| img/french-toast.jpg | Challah French toast | https://static.spotapps.co/spots/7b/c416e565a846d984342cb7c08449b2/full |
| img/benedict-latke.jpg | Smoked salmon Benedict on latke | https://static.spotapps.co/spots/89/1ee1ec118845b8a0027ba13ed680d9/full |
| img/favicon.png | 32px red dot favicon, drawn for this concept (not a photo) | n/a |
| img/logo.png | Red Dot wordmark | https://static.spotapps.co/website_images/ab_websites/149842_website_v1/logo.png |

The three party-space cards (garden, dance floor, screening room) are typographic color blocks. No real photo of those spaces was found. Template images on the current site were left out because they may be stock.

## Content sources
- Hours, address, phone, About text (1999 founding, 2002 expansion, garden with outdoor fire, dance floor, screening room, Halloween parties): https://reddothudson.net/ (retrieved Oct 12, 2026)
- Menu & prices: https://reddothudson.net/hudson-red-dot-restaurant-and-bar-food-menu and ...-drink-menu (retrieved Oct 12, 2026)
- Raymakers origin: Main Street Magazine, Oct 2017; Visit Hudson listing (via revenue-ops/community/red-dot.md)
- Winter Walk Dec 5: https://gossipsofrivertown.blogspot.com/2026/09/the-word-on-winter-walk.html (via community brief)
- Reservation and party links: the existing request forms embedded on reddothudson.net/hudson-red-dot-restaurant-and-bar-reservations and ...-party

## Scene edition (v5 "red-dot-film", Oct 23 rework)
The Three.js opening of v4 and the generated films are gone. The opening and two pinned scenes use **slow camera moves across Red Dot's own full-resolution photos** (pan / Ken Burns only), built frame by frame with every output pixel drawn from at least one source pixel (no upscaling), then encoded as H.264 MP4 and VP9 WebM with a poster (AVIF/WebP/JPG). Each moving section carries the label "Photo: Red Dot · a slow move across their photo".

| Clip | Size | Source (Red Dot gallery, `:original`) | Move |
|---|---|---|---|
| vid/bar-584 | 1280x584 | the bar, `spots/63/5f9b86b31749b09b43e5ff3283a00b` (1522x694) | a slow truck right along the bar (window 1400→1400 px of 1522) |
| vid/frites-1080, -720 | 1920x1080, 1280x720 | frites and fried egg, `spots/6b/d7ba0c532947debe063317f74c6696` (2000x1331) | slow push and drift |
| vid/brunch-1080, -720 | 1920x1080, 1280x720 | eggs Benedict, `spots/79/3e16ef4cef4fe582ae876ba454ba24` (2000x1331) | slow push and drift |

Each clip plays its move forward and back, so the loop has no jump. The bar photo is too small to fill a screen, so it is shown smaller, in a crisp frame. Every reel is capped at its clip width divided by devicePixelRatio, so it is never shown above 1.0x. Build script: /workspace/rd6/kb.py.

Design rules for this edition: no gradients, feathered edges, vignettes or blurred fills; sections change with hard-edged masked wipes; headings rise word by word through a line mask; the frites scene cuts the word FRITES out of solid red and scrolling drives through the I. Reduced motion, `?static=1` and JavaScript-off get the static page with stills.

- img/logo-light.png: the Red Dot wordmark with white letters (dot kept red), for dark backgrounds only.
- Fonts (SIL Open Font License, Google Fonts), self-hosted latin subsets: Fraunces (display) and Instrument Sans (text). Two families only.
- GSAP 3 + ScrollTrigger, self-hosted in vendor/ (standard GSAP license).
