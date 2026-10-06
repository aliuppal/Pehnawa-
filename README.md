# Pehnawa

A wardrobe app: photograph yourself and your clothes, get outfit ideas for today, try pieces on,
and browse Pakistani clothing brands for men and women.

Built with Expo (React Native). Runs on iOS and Android through Expo Go, and as a web app.

## Features

- **Today** – ranked outfits for the occasion (Casual, Office, Jummah, Dawat) and weather.
  An offline engine scores colour harmony, fabric weight and recent wear; **Ask AI stylist** uses Claude.
- **Closet** – add clothes by camera or gallery. With a Claude key, photos are named and tagged automatically.
- **Try On** – *Quick* mode drags garments over your photo; *AI* mode does a photo-real try-on via fal.ai.
  Import screenshots from brand sites to try them too.
- **Brands** – Pakistani labels filtered by gender and type, with store links.
- **Me** – your photo, name, a gender switch for testing, AI keys and a sample closet.

## Run

```bash
npm install
npx expo start          # scan the QR code with Expo Go
npx expo start --web    # browser
```

## AI keys

Add them on the **Me** tab. They are stored on the device and sent only to Anthropic (Claude) and fal.ai.
That is fine for personal testing; a public release should proxy these calls through a server you control.

## Deploy (web)

`vercel.json` builds the static web export (`npx expo export --platform web` → `dist/`).
