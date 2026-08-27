# PROJECT RULES & GOVERNANCE

## 1. Immutable Business Logic

### Monetization Rules
- **Vehicles**:
  - 1st Vehicle: **Free for 6 Months**
  - Vehicles 2-25: **Free for 7 Days**
  - Vehicles 26+: **Paid Immediately** (1 Credit/Month)
- **Businesses**:
  - 1st Business: **Free for 3 Months**
  - Businesses 2+: **Paid Immediately** (1 Credit/Month)

### Search Configuration
- **Radius**: Default search radius must start at **25km**.
- **Expansion**: Expansion tiers must start at **25km** (not 12km).

### Pricing
- **Base Price**: Defined in `src/lib/pricing.ts`. Do not change the 20/40 MXN logic.

### AI Configuration
- **Moderation**: "Ruben's Rules" (Cover Photo Sovereignty, Duplicate checks) in `src/lib/ai-moderation.ts` are **IMMUTABLE**.
- **Smart Search**: The "Brain Trust" prompt in `src/app/api/ai/analyze-vehicle-query/route.ts` is fine-tuned and must not be altered.

### Infrastructure & Security
- **Authentication**: Server-side fingerprinting in `src/lib/auth.ts` is vital for preventing fraud.
- **Storage**: Image compression settings in `src/lib/cloudinary.ts` are set to minimize costs. **DO NOT REMOVE**.

## 2. Protected Files
- `.env.local` (secrets - never commit to git, already in .gitignore)

## 3. General Guidelines
- **No Refactoring of Logic**: Do not "clean up" or "optimize" business rules. They are requirements, not just code.
- **Respect Comments**: If a line says `// CRITICAL: DO NOT MODIFY`, believe it.

---
*This file serves as the source of truth for Project Governance.*
