# BatchTrace Agent — Brand Assets & Provenance Registry

## Visual Identity & Color Palette Tokens

| Token | Hex | Role | Source / Standard |
|---|---|---|---|
| Forest Green | `#173D32` | Primary brand accent & main buttons | BatchTrace Identity System |
| Deep Forest | `#102C25` | 3D Canvas environment & dark contrast hero | BatchTrace Identity System |
| Warm Ivory | `#F7F6F0` | Main light workspace background | Curated neutral canvas |
| Pure White | `#FFFFFF` | Cards, modals, data tables | W3C High-Contrast Standard |
| Soft Sage | `#DCE8DF` | Selected state chips & avatar badge | Complementary green tone |
| Muted Green | `#527D68` | Secondary icons and chart series | Data visualization accent |
| Dark Slate | `#27343A` | Primary typography & headings | High legibility text token |
| Muted Slate | `#66746F` | Metadata and secondary descriptions | Sub-heading & label token |
| Border Gray | `#E2E6DF` | Subdued borders & table dividers | Neutral separator |
| Signal Amber | `#E9A23B` | Possible links, reviews required, warnings | Industry caution standard |
| Risk Red | `#B94343` | High-severity alerts & quarantine states | Food safety recall standard |

---

## Typography
- **Primary Interface**: [Geist Sans](https://vercel.com/font) (SIL Open Font License 1.1)
- **Monospace Coordinates**: [Geist Mono](https://vercel.com/font) (SIL Open Font License 1.1) for lot codes (`L-204`), batch codes (`PB-031`), finished lot codes (`FP-101`), order numbers (`ORD-101`), and timestamps.

---

## 3D Visual Experience (TraceSphere)
- Built with **Three.js**, `@react-three/fiber`, and `@react-three/drei`.
- Restrained procedural node network with zero external copyrighted 3D meshes or proprietary textures.
- Complete deterministic WebGL canvas with fallback poster state when WebGL is disabled or on reduced-motion devices.

---

## Iconography
- **Lucide React** (ISC License) — Accessible, clean SVG iconography used across the dashboard, graph explorer, and incident dossiers.
