'use server'

/**
 * CarMatch Marketing Prompt Generator v2.0
 * Generates AI image prompts for social media content creation
 */

import { geminiFlash } from '@/lib/ai/geminiModels'

export async function generateProtocolContent(topic: string) {
  const seed = Date.now();
  try {
    const prompt = `
[ID: ${seed}]
[TASK: GENERATE IMAGE PROMPTS FOR "${topic}"]

You are a marketing creative director for CarMatch, the #1 automotive social network in Mexico.
Generate a COMPLETE set of AI image generation prompts for a marketing campaign about: "${topic}"

### CHARACTER:
Don Match (App-Man) — A friendly Mexican man wearing a CarMatch-branded jacket, holding a phone showing the CarMatch app. He represents trust, honesty, and real value in the automotive world.

### RESPONSE FORMAT (JSON):
{
  "topic": "${topic}",
  "campaign_name": "Short campaign title",
  "accent_color": "#hex",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],

  "image_prompts": {
    "hero_image": {
      "prompt": "Detailed prompt for the main campaign image. Include: subject, setting, lighting, mood, style, camera angle, color palette. Use AUTHENTIC MEXICAN STREET PHOTOGRAPHY style. 8K, cinematic.",
      "aspect_ratio": "16:9",
      "platform": "Instagram/Facebook Cover",
      "description": "What this image shows"
    },
    "story_1": {
      "prompt": "Prompt for Instagram Story 1. Vertical format. Bold text overlay area at top. Don Match pointing at camera. Urban Mexican street background. High energy. 9:16 ratio.",
      "aspect_ratio": "9:16",
      "platform": "Instagram/TikTok Story",
      "description": "Hook image"
    },
    "story_2": {
      "prompt": "Prompt for Instagram Story 2. Show the problem/pain point. Frustrated person at a traditional dealership or mechanic. Dark moody lighting. 9:16 ratio.",
      "aspect_ratio": "9:16",
      "platform": "Instagram/TikTok Story",
      "description": "Problem image"
    },
    "story_3": {
      "prompt": "Prompt for Instagram Story 3. Show the CarMatch solution. Happy person using CarMatch app on phone. Bright, hopeful lighting. 9:16 ratio.",
      "aspect_ratio": "9:16",
      "platform": "Instagram/TikTok Story",
      "description": "Solution image"
    },
    "carousel_1": {
      "prompt": "Prompt for carousel post slide 1. Eye-catching opener. Don Match with arms crossed, confident pose. Bold colors. Square format. 1:1 ratio.",
      "aspect_ratio": "1:1",
      "platform": "Instagram/Facebook Carousel",
      "description": "Carousel opener"
    },
    "carousel_2": {
      "prompt": "Prompt for carousel slide 2. Infographic style. Show data/statistics about the topic. Clean design with CarMatch branding. 1:1 ratio.",
      "aspect_ratio": "1:1",
      "platform": "Instagram/Facebook Carousel",
      "description": "Data slide"
    },
    "carousel_3": {
      "prompt": "Prompt for carousel slide 3. Call to action. Don Match giving thumbs up. Phone showing CarMatch app. 1:1 ratio.",
      "aspect_ratio": "1:1",
      "platform": "Instagram/Facebook Carousel",
      "description": "CTA slide"
    },
    "thumbnail": {
      "prompt": "YouTube thumbnail style. Bold, high contrast. Don Match face with shocked expression. Big text area. Bright colors on dark background. 16:9 ratio.",
      "aspect_ratio": "16:9",
      "platform": "YouTube Thumbnail",
      "description": "Video thumbnail"
    },
    "banner": {
      "prompt": "Facebook/X cover banner. Wide panoramic. CarMatch branding. Don Match walking on Mexican street with phone. Cinematic. 2.61:1 ratio.",
      "aspect_ratio": "2.61:1",
      "platform": "Facebook/X Banner",
      "description": "Profile cover"
    },
    "ad_square": {
      "prompt": "Paid ad image. Clean, professional. Don Match holding phone with CarMatch app visible. White/bright background. Product photography style. 1:1 ratio.",
      "aspect_ratio": "1:1",
      "platform": "Facebook/Instagram Ads",
      "description": "Paid advertisement"
    },
    "meme": {
      "prompt": "Meme format image. Split panel: left side shows the 'old way' (frustration), right side shows the 'CarMatch way' (happiness). Bold contrast. 1:1 ratio.",
      "aspect_ratio": "1:1",
      "platform": "TikTok/Kwai/All",
      "description": "Viral meme"
    }
  },

  "copy": {
    "hook": "One-line viral hook for ${topic}",
    "caption_ig": "Instagram caption (2-3 lines, emojis, CTA)",
    "caption_tiktok": "TikTok caption (short, punchy, hashtag-heavy)",
    "caption_fb": "Facebook post (longer, storytelling, community-focused)",
    "caption_x": "X/Twitter post (under 280 chars, provocative)",
    "caption_kwai": "Kwai caption (emotional, relatable, Brazilian/Mexican style)"
  },

  "video_prompt": {
    "pippit": "Pippit/CapCut video prompt: [STYLE] High-energy viral. [AVATAR] Don Match. [SCENE] Mexican street. [SCRIPT] Short punchy dialogue about ${topic}. [VISUALS] Bold overlays, fast cuts, brand colors. [DURATION] 30 seconds.",
    "voiceover": "Voiceover script for the video (15-20 seconds, natural Mexican Spanish)"
  },

  "storyboard": [
    { "scene": 1, "visual": "Opening shot", "duration": "3s", "overlay": "TEXT", "audio": "Sound" },
    { "scene": 2, "visual": "Problem reveal", "duration": "5s", "overlay": "TEXT", "audio": "Sound" },
    { "scene": 3, "visual": "CarMatch solution", "duration": "8s", "overlay": "TEXT", "audio": "Sound" },
    { "scene": 4, "visual": "CTA close", "duration": "4s", "overlay": "TEXT", "audio": "Sound" }
  ]
}

### RULES:
- All image prompts must be in ENGLISH (for AI generators)
- All copy/captions in SPANISH (for Mexican audience)
- Style: AUTHENTIC, STREET, REAL, HIGH-CONTRAST, CINEMATIC
- NO stock photos, NO generic imagery
- Don Match is always the hero character
- Include specific camera angles, lighting, and mood in prompts
- Each prompt should be 50-100 words optimized for AI image generation
`

    const result = await geminiFlash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
      }
    })
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const data = JSON.parse(jsonMatch[0])
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error generating prompts' }
  }
}

export async function getProtocolMissions() {
  try {
    const prompt = `
[ID: ${Date.now()}]
Generate 4 trending marketing topic ideas for CarMatch automotive social network.

### FORMAT (JSON):
[
  { "id": "m1", "label": "Short catchy title (max 30 chars)", "type": "leak|hero|exclusivity" },
  { "id": "m2", "label": "Short catchy title (max 30 chars)", "type": "leak|hero|exclusivity" },
  { "id": "m3", "label": "Short catchy title (max 30 chars)", "type": "leak|hero|exclusivity" },
  { "id": "m4", "label": "Short catchy title (max 30 chars)", "type": "leak|hero|exclusivity" }
]

Topics: dealership scams, hidden car problems, fair pricing, safety features, community stories, mechanic tips, insurance tricks, electric vehicles, car maintenance secrets.
Style: Provocative, real, attention-grabbing.
`

    const result = await geminiFlash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.0 }
    })
    const text = result.response.text()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON found')
    
    return { success: true, data: JSON.parse(jsonMatch[0]) }
  } catch (error: any) {
    return { success: false, error: 'Error fetching missions' }
  }
}
