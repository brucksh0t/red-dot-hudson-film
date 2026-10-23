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

## Film edition (v5 "red-dot-film")
The Three.js opening of the v4 build is replaced by scroll-scrubbed film. Everything after it (menu, story, parties, reserve, visit, the panels/sheets, the soft rise of the page over the opening) is kept from v4.

### Motion: illustrative, generated from Red Dot's photos, not filmed
Every film carries the on-screen label "Illustrative motion generated from Red Dot’s photos, not filmed". The footage was made with image-to-video from Red Dot's own gallery photos, using crops of those photos as the first and last frames, then upscaled 2x with a commercial video upscaler. Small generated details (bottle labels, parallax) can differ from the real room.

Only one photo of the place itself exists in Red Dot's gallery: the bar (`https://static.spotapps.co/spots/63/5f9b86b31749b09b43e5ff3283a00b/:original`, 1522x694). No photo of the exterior, the sign or Warren Street was found, so none is shown or generated: the film begins inside, on the real bar photo.

| Film | Frames | Made from |
|---|---|---|
| frames/hero (top of page) | 150 | Clip 1: a slow truck right along the bar, first frame = left crop of the bar photo, last frame = right crop. Clip 2: a slow push to the BAR sign over the back bar, first frame = that same right crop, last frame = a crop around the BAR sign. The two clips meet on the same real frame. |
| frames/frites (between Menu and Story) | 61 | Slow push in on the frites and fried-egg plate (gallery `spots/6b/d7ba0c532947debe063317f74c6696`), wide crop to a 1.3x crop. |
| frames/brunch (between Parties and Reserve) | 61 | Slow push in on eggs Benedict (gallery `spots/79/3e16ef4cef4fe582ae876ba454ba24`), wide crop to a 1.3x crop. |

Rejected clips: a single 10-second bar-to-sign move (the ceiling lamps doubled mid-clip), and a first frites clip (invented steam haze over the egg, exposure swing, fries morphing).

Frame tiers: `x/` 2560x1440, `d/` 1920x1080, `m/` 1080x1440 (a true centre crop of the 2x frame, no resize). Each frame is AVIF at the lowest quality whose SSIM against the lossless master stays at or above 0.97 (0.965 for `x/`), with a quality floor, plus a WebP fallback. A micro WebP ladder (`dt/` 240x135, `mt/` 180x240, every 6th frame, about 3 KB each) loads first for every film once scrolling starts, then light previews (`dq/` 480x270, `mq/` 360x480, every 3rd frame) and sharp frames around where the reader is heading; requests the reader has scrolled past are dropped. The page picks the tier from the canvas size x devicePixelRatio (capped at 2); portrait screens get `m/`. Nothing in `frames/` is requested before the first scroll; films load within 2.5 screens; the canvas always draws the nearest loaded frame over the poster (frame 1). With Save-Data or a 2G connection only the posters show. With reduced motion, JavaScript off, or `?static=1`, the page is the full static page with the real bar photo, no film.

- img/logo-light.png: the Red Dot wordmark with white letters (dot kept red), for dark backgrounds only.
- Fonts (SIL Open Font License, Google Fonts), self-hosted latin subsets: Fraunces, Instrument Sans, Big Shoulders Display (v1's display face, used on the film hero).
- GSAP 3 + ScrollTrigger, self-hosted in vendor/ (standard GSAP license).
