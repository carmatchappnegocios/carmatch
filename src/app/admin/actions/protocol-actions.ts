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
Don Match (App-Man) — A friendly Mexican man in his 30s wearing a dark blue CarMatch-branded jacket over a white t-shirt, holding a modern smartphone showing the CarMatch app interface. Short black hair, warm smile, trustworthy appearance. He represents honesty and real value in the automotive world.

### IMAGE PROMPT FORMAT FOR GEMINI:
Each prompt should be a NATURAL LANGUAGE description (2-4 sentences) optimized for Gemini image generation.
Write prompts as if describing a photo to a photographer. Include: subject, action, setting, lighting, mood, style.
DO NOT use technical摄影术语. Write naturally.
DO NOT include aspect ratios in the prompt text (Gemini handles that separately).

### RESPONSE FORMAT (JSON):
{
  "topic": "${topic}",
  "campaign_name": "Short campaign title in Spanish",
  "accent_color": "#hex",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],

  "image_prompts": {
    "hero_image": {
      "prompt": "Natural language description of the main campaign image. 2-4 sentences. Describe what you see: Don Match standing in a specific location, doing a specific action, with specific lighting and mood. Make it feel like a real photograph.",
      "aspect_ratio": "16:9",
      "platform": "Instagram/Facebook Cover",
      "description": "What this image shows and why it works"
    },
    "story_1": {
      "prompt": "Vertical story image. Describe Don Match in an engaging pose, pointing at the camera or making eye contact. Urban Mexican street or auto shop background. Energetic mood, natural lighting.",
      "aspect_ratio": "9:16",
      "platform": "Instagram/TikTok Story",
      "description": "Hook image - stops the scroll"
    },
    "story_2": {
      "prompt": "Vertical story image showing frustration or problem. A person looking stressed at a mechanic shop or dealership. Darker mood, dramatic lighting. Show the pain point visually.",
      "aspect_ratio": "9:16",
      "platform": "Instagram/TikTok Story",
      "description": "Problem image - creates empathy"
    },
    "story_3": {
      "prompt": "Vertical story image showing the solution. A happy person using CarMatch on their phone, bright smile. Warm, hopeful lighting. Clean modern setting.",
      "aspect_ratio": "9:16",
      "platform": "Instagram/TikTok Story",
      "description": "Solution image - shows the better way"
    },
    "carousel_1": {
      "prompt": "Square format image. Don Match with confident pose, arms crossed or thumbs up. Bold solid color background matching the campaign accent color. Clean, modern, eye-catching.",
      "aspect_ratio": "1:1",
      "platform": "Instagram/Facebook Carousel",
      "description": "Carousel opener - grabs attention"
    },
    "carousel_2": {
      "prompt": "Square format infographic-style image. Clean design with bold text areas and data visualization space. CarMatch branding colors. Modern, professional look.",
      "aspect_ratio": "1:1",
      "platform": "Instagram/Facebook Carousel",
      "description": "Data slide - builds credibility"
    },
    "carousel_3": {
      "prompt": "Square format call-to-action image. Don Match giving a thumbs up or pointing at a phone showing the CarMatch app. Bright, inviting colors. Clear CTA feeling.",
      "aspect_ratio": "1:1",
      "platform": "Instagram/Facebook Carousel",
      "description": "CTA slide - drives action"
    },
    "thumbnail": {
      "prompt": "YouTube thumbnail style. Bold, high contrast. Don Match face with expressive reaction. Space for large text overlay. Vibrant colors that pop on dark background.",
      "aspect_ratio": "16:9",
      "platform": "YouTube Thumbnail",
      "description": "Video thumbnail - maximizes clicks"
    },
    "banner": {
      "prompt": "Wide panoramic banner image. CarMatch branding visible. Don Match walking confidently on a Mexican street with phone in hand. Cinematic wide angle, golden hour lighting.",
      "aspect_ratio": "2.61:1",
      "platform": "Facebook/X Banner",
      "description": "Profile cover - establishes brand"
    },
    "ad_square": {
      "prompt": "Clean professional ad image. Don Match holding phone with CarMatch app clearly visible on screen. Minimal background, product photography style. trustworthy and premium feel.",
      "aspect_ratio": "1:1",
      "platform": "Facebook/Instagram Ads",
      "description": "Paid ad - converts viewers"
    },
    "meme": {
      "prompt": "Meme-style split image. Left side: dark, frustrated person at old mechanic. Right side: bright, happy person using CarMatch. Strong visual contrast between problem and solution.",
      "aspect_ratio": "1:1",
      "platform": "TikTok/Kwai/All",
      "description": "Viral meme format - shareable content"
    }
  },

  "copy": {
    "hook": "One-line viral hook about ${topic} in Spanish",
    "caption_ig": "Instagram caption (2-3 lines, emojis, CTA) in Spanish",
    "caption_tiktok": "TikTok caption (short, punchy, hashtag-heavy) in Spanish",
    "caption_fb": "Facebook post (longer, storytelling, community-focused) in Spanish",
    "caption_x": "X/Twitter post (under 280 chars, provocative) in Spanish",
    "caption_kwai": "Kwai caption (emotional, relatable) in Spanish"
  },

  "video_prompt": {
    "pippit": "Pippit/CapCut video prompt: [STYLE] High-energy viral. [AVATAR] Don Match. [SCENE] Mexican street. [SCRIPT] Short punchy dialogue about ${topic}. [VISUALS] Bold overlays, fast cuts, brand colors. [DURATION] 30 seconds.",
    "voiceover": "Voiceover script for the video (15-20 seconds, natural Mexican Spanish)"
  },

  "storyboard": [
    { "scene": 1, "visual": "Opening shot description", "duration": "3s", "overlay": "TEXT", "audio": "Sound" },
    { "scene": 2, "visual": "Problem reveal description", "duration": "5s", "overlay": "TEXT", "audio": "Sound" },
    { "scene": 3, "visual": "CarMatch solution description", "duration": "8s", "overlay": "TEXT", "audio": "Sound" },
    { "scene": 4, "visual": "CTA close description", "duration": "4s", "overlay": "TEXT", "audio": "Sound" }
  ]
}

### RULES FOR IMAGE PROMPTS:
- Write in ENGLISH (for Gemini image generation)
- Each prompt: 2-4 natural sentences, like describing a photo
- Be SPECIFIC: exact location, exact action, exact lighting
- Style: AUTHENTIC, STREET, REAL, CINEMATIC
- Don Match is always the hero character
- NO stock photo vibes, NO generic imagery
- Make it feel like a real photograph, not AI art
- Include emotional details: facial expressions, body language, atmosphere
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
