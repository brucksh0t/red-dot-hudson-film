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

## Film edition (v5 "red-dot-film", r7, Oct 23 2026)
The opening and two pinned scenes are **scroll-scrubbed frame films** cut from Red Dot's own full-size photos: each scroll position maps to exactly one frame (canvas engine from e40d5d9: micro ladder, previews, sharp frames near the reader, nothing requested before the first scroll). Every frame is a real camera move over the photo (push-in, truck, pan) rendered with Lanczos from a source window at least as large as the frame, so no output pixel is upscaled (build script: `build-frames.py`). Frames are drawn 1:1 into a canvas the size of the frame and never shown wider than the frame in CSS px. Where the photo is smaller than the screen (the bar), the frame is shown at its own size on a solid red field. Each moving section is labelled "Photo: Red Dot".

| Film | Tiers (frame px) | Source (Red Dot gallery, `:original`) | Move |
|---|---|---|---|
| frames/hero (90 frames) | m 390x694, t 760x694, d 1100x600 | the bar, `spots/63/5f9b86b31749b09b43e5ff3283a00b` (1522x694) | m/t: lateral truck along the bar at 1.0 source px per frame px; d: push-in 1.16x while trucking right |
| frames/frites (72) | m 560x1212, d 1600x900 | frites and fried egg, `spots/6b/d7ba0c532947debe063317f74c6696` (2000x1331) | push-in and pan |
| frames/brunch (72) | m 560x1212, d 1600x900 | eggs Benedict, `spots/79/3e16ef4cef4fe582ae876ba454ba24` (2000x1331) | pan and push-in |

Design rules: no gradients or faded edges behind titles; type over film sits on crisp solid backings; sections change with hard-edged masked wipes; headings rise word by word; the frites scene cuts FRITES out of solid red (two lines on portrait screens) and scrolling drives through the I. Reduced motion, `?static=1` and JavaScript-off get the static page with stills; Save-Data/2G get posters only (no frames).

- img/logo-light.png: the Red Dot wordmark with white letters (dot kept red), for dark backgrounds only.
- Fonts (SIL Open Font License, Google Fonts), self-hosted latin subsets: Fraunces (display, 400 and 700 only, no italic) and Instrument Sans (text and buttons). Two families only.
- GSAP 3 + ScrollTrigger, self-hosted in vendor/ (standard GSAP license).
