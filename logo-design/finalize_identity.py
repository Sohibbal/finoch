"""
finalize_identity.py
Generates the finalized brand identity for Finoch.id (Direction C: Sonic Prism + Bespoke Isometric Bevel).
Outputs vector SVGs and high-res PNGs to logo-design/brand/ and updates public/ and public/icons/.
"""

import os
import shutil
import subprocess
import sys
from PIL import Image

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BRAND_DIR = "logo-design/brand"
PUBLIC_DIR = "public"
PUBLIC_ICONS_DIR = "public/icons"

os.makedirs(BRAND_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(PUBLIC_ICONS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. GEOMETRY DEFINITIONS (Normalized coordinates)
# -------------------------------------------------------------
# Sonic Prism Symbol:
# Bounds: x in [0, 152], y in [0, 184]
def get_symbol_paths(c_stem, c_top, c_mid, c_node):
    return f'''
    <!-- Anchor Monolith Stem -->
    <path fill="{c_stem}" d="M 0 23 L 40 0 V 184 H 0 Z" />
    <!-- Top Cantilever Facet (60° chamfer) -->
    <path fill="{c_top}" d="M 40 0 H 152 L 126 45 H 40 Z" />
    <!-- Mid Cantilever Facet -->
    <path fill="{c_mid}" d="M 40 78 H 116 L 90 123 H 40 Z" />
    <!-- Satellite Acoustic Node (0.3s Voice Trigger) -->
    <polygon points="126,78 152,78 126,123 100,123" fill="{c_node}" />
'''

# Direction C Wordmark:
# Bounds: x in [0, 510], y in [0, 80]
def get_wordmark_paths(ox, oy, c_text, c_accent, c_badge_text):
    return f'''
    <g id="wordmark-c" transform="translate({ox}, {oy})">
      <!-- F (width 60, height 80) with 60° bevel tips -->
      <path fill="{c_text}" d="
        M 0 80 V 0 H 60 L 42 24 H 22 V 36 H 50 L 36 56 H 22 V 80 Z
      " />
      <!-- I (width 22, height 80) -->
      <rect x="74" y="0" width="22" height="80" rx="3" fill="{c_text}" />
      <!-- N (width 68, height 80) -->
      <path fill="{c_text}" d="
        M 110 80 V 0 H 130 L 158 50 V 0 H 178 V 80 H 158 L 130 30 V 80 Z
      " />
      <!-- O (width 74, height 80) Stadium Squircle -->
      <path fill="{c_text}" fill-rule="evenodd" d="
        M 214 0 H 248 C 268 0 278 10 278 40 C 278 70 268 80 248 80 H 214 C 194 80 184 70 184 40 C 184 10 194 0 214 0 Z
        M 216 22 H 246 C 254 22 258 28 258 40 C 258 52 254 58 246 58 H 216 C 208 58 204 52 204 40 C 204 28 208 22 216 22 Z
      " />
      <!-- C (width 68, height 80) with 60° chamfer mouth -->
      <path fill="{c_text}" fill-rule="evenodd" d="
        M 312 0 H 346 L 332 22 H 314 C 306 22 302 28 302 40 C 302 52 306 58 314 58 H 332 L 346 80 H 312 C 292 80 282 70 282 40 C 282 10 292 0 312 0 Z
      " />
      <!-- H (width 68, height 80) -->
      <path fill="{c_text}" d="
        M 360 80 V 0 H 382 V 30 H 406 V 0 H 428 V 80 H 406 V 50 H 382 V 80 Z
      " />
      <!-- Rhombus AI Dot (60° cut) -->
      <polygon points="444,64 458,64 448,80 434,80" fill="{c_accent}" />
      <!-- ID Pill Badge -->
      <rect x="466" y="18" width="44" height="26" rx="6" fill="{c_accent}" />
      <!-- ID Letters inside badge -->
      <path fill="{c_badge_text}" d="
        M 476 36 V 26 H 480 V 36 Z
        M 486 36 V 26 H 492 C 498 26 500 28 500 31 C 500 34 498 36 492 36 Z
        M 490 28 V 34 H 492 C 494 34 495 33 495 31 C 495 29 494 28 492 28 Z
      " />
    </g>
'''

# -------------------------------------------------------------
# 2. HORIZONTAL MASTER LOGOS
# -------------------------------------------------------------
# Canvas: 720 x 180
# Center Y = 90
# Symbol scaled to 148px height (scale = 148/184 ≈ 0.8043)
# Symbol width = 152 * 0.8043 ≈ 122.26px
# Wordmark height = 80px, width = 510px
# Total content width = 122.26 + 36 (gap) + 510 = 668.26px
# Left margin = (720 - 668.26) / 2 ≈ 25.87px
# Symbol Y = 90 - 74 = 16px
# Wordmark Y = 90 - 40 = 50px

def build_horizontal_logo(theme="dark"):
    is_dark = (theme == "dark")
    c_stem = "#FFFFFF" if is_dark else "#0B192C"
    c_top = "#3B82F6" if is_dark else "#2563EB"
    c_mid = "#FFFFFF" if is_dark else "#0B192C"
    c_node = "#38BDF8" if is_dark else "#0284C7"
    c_text = "#FFFFFF" if is_dark else "#0B192C"
    c_accent = "#38BDF8" if is_dark else "#2563EB"
    c_badge_text = "#0A1120" if is_dark else "#FFFFFF"

    scale = 0.8043
    sym_x = 25.87
    sym_y = 16.0
    gap = 36.0
    wm_x = sym_x + (152 * scale) + gap
    wm_y = 50.0

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" width="720" height="180" role="img">
  <title>Finoch Master Logo ({'Dark' if is_dark else 'Light'})</title>
  <g id="symbol" transform="translate({sym_x:.2f}, {sym_y:.2f}) scale({scale:.4f})">
    {get_symbol_paths(c_stem, c_top, c_mid, c_node)}
  </g>
  {get_wordmark_paths(round(wm_x, 2), wm_y, c_text, c_accent, c_badge_text)}
</svg>'''
    return svg


def build_horizontal_adaptive_logo():
    # Adaptive SVG using CSS media queries
    scale = 0.8043
    sym_x = 25.87
    sym_y = 16.0
    gap = 36.0
    wm_x = sym_x + (152 * scale) + gap
    wm_y = 50.0

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" width="720" height="180" role="img">
  <title>Finoch Master Logo (Adaptive)</title>
  <style>
    :root {{
      --stem: #0B192C;
      --top: #2563EB;
      --mid: #0B192C;
      --node: #0284C7;
      --text: #0B192C;
      --accent: #2563EB;
      --badge-text: #FFFFFF;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --stem: #FFFFFF;
        --top: #3B82F6;
        --mid: #FFFFFF;
        --node: #38BDF8;
        --text: #FFFFFF;
        --accent: #38BDF8;
        --badge-text: #0A1120;
      }}
    }}
    .stem {{ fill: var(--stem); }}
    .top {{ fill: var(--top); }}
    .mid {{ fill: var(--mid); }}
    .node {{ fill: var(--node); }}
    .text {{ fill: var(--text); }}
    .accent {{ fill: var(--accent); }}
    .badge-text {{ fill: var(--badge-text); }}
  </style>
  <g id="symbol" transform="translate({sym_x:.2f}, {sym_y:.2f}) scale({scale:.4f})">
    <path class="stem" d="M 0 23 L 40 0 V 184 H 0 Z" />
    <path class="top" d="M 40 0 H 152 L 126 45 H 40 Z" />
    <path class="mid" d="M 40 78 H 116 L 90 123 H 40 Z" />
    <polygon class="node" points="126,78 152,78 126,123 100,123" />
  </g>
  <g id="wordmark-c" transform="translate({round(wm_x, 2)}, {wm_y})">
    <path class="text" d="M 0 80 V 0 H 60 L 42 24 H 22 V 36 H 50 L 36 56 H 22 V 80 Z" />
    <rect class="text" x="74" y="0" width="22" height="80" rx="3" />
    <path class="text" d="M 110 80 V 0 H 130 L 158 50 V 0 H 178 V 80 H 158 L 130 30 V 80 Z" />
    <path class="text" fill-rule="evenodd" d="M 214 0 H 248 C 268 0 278 10 278 40 C 278 70 268 80 248 80 H 214 C 194 80 184 70 184 40 C 184 10 194 0 214 0 Z M 216 22 H 246 C 254 22 258 28 258 40 C 258 52 254 58 246 58 H 216 C 208 58 204 52 204 40 C 204 28 208 22 216 22 Z" />
    <path class="text" fill-rule="evenodd" d="M 312 0 H 346 L 332 22 H 314 C 306 22 302 28 302 40 C 302 52 306 58 314 58 H 332 L 346 80 H 312 C 292 80 282 70 282 40 C 282 10 292 0 312 0 Z" />
    <path class="text" d="M 360 80 V 0 H 382 V 30 H 406 V 0 H 428 V 80 H 406 V 50 H 382 V 80 Z" />
    <polygon class="accent" points="444,64 458,64 448,80 434,80" />
    <rect class="accent" x="466" y="18" width="44" height="26" rx="6" />
    <path class="badge-text" d="M 476 36 V 26 H 480 V 36 Z M 486 36 V 26 H 492 C 498 26 500 28 500 31 C 500 34 498 36 492 36 Z M 490 28 V 34 H 492 C 494 34 495 33 495 31 C 495 29 494 28 492 28 Z" />
  </g>
</svg>'''
    return svg

# -------------------------------------------------------------
# 3. STANDALONE SYMBOL
# -------------------------------------------------------------
# ViewBox: 0 0 192 192 (Square with nice margins)
# Symbol is 152 x 184 -> scale to 156 height (scale = 156/184 = 0.8478)
# Symbol width = 152 * 0.8478 = 128.87
# X margin = (192 - 128.87) / 2 = 31.56
# Y margin = (192 - 156) / 2 = 18.0

def build_symbol_logo(theme="dark"):
    is_dark = (theme == "dark")
    c_stem = "#FFFFFF" if is_dark else "#0B192C"
    c_top = "#3B82F6" if is_dark else "#2563EB"
    c_mid = "#FFFFFF" if is_dark else "#0B192C"
    c_node = "#38BDF8" if is_dark else "#0284C7"

    scale = 0.8478
    sym_x = 31.56
    sym_y = 18.0

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192" role="img">
  <title>Finoch Sonic Prism Symbol ({'Dark' if is_dark else 'Light'})</title>
  <g transform="translate({sym_x:.2f}, {sym_y:.2f}) scale({scale:.4f})">
    {get_symbol_paths(c_stem, c_top, c_mid, c_node)}
  </g>
</svg>'''
    return svg


def build_symbol_adaptive_logo():
    scale = 0.8478
    sym_x = 31.56
    sym_y = 18.0

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192" role="img">
  <title>Finoch Sonic Prism Symbol (Adaptive)</title>
  <style>
    :root {{
      --stem: #0B192C;
      --top: #2563EB;
      --mid: #0B192C;
      --node: #0284C7;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --stem: #FFFFFF;
        --top: #3B82F6;
        --mid: #FFFFFF;
        --node: #38BDF8;
      }}
    }}
    .stem {{ fill: var(--stem); }}
    .top {{ fill: var(--top); }}
    .mid {{ fill: var(--mid); }}
    .node {{ fill: var(--node); }}
  </style>
  <g transform="translate({sym_x:.2f}, {sym_y:.2f}) scale({scale:.4f})">
    <path class="stem" d="M 0 23 L 40 0 V 184 H 0 Z" />
    <path class="top" d="M 40 0 H 152 L 126 45 H 40 Z" />
    <path class="mid" d="M 40 78 H 116 L 90 123 H 40 Z" />
    <polygon class="node" points="126,78 152,78 126,123 100,123" />
  </g>
</svg>'''
    return svg

# -------------------------------------------------------------
# 4. STANDALONE WORDMARK
# -------------------------------------------------------------
# Wordmark bounds: 510 x 80 -> viewBox 0 0 550 100
# X margin = 20, Y margin = 10
def build_wordmark_logo(theme="dark"):
    is_dark = (theme == "dark")
    c_text = "#FFFFFF" if is_dark else "#0B192C"
    c_accent = "#38BDF8" if is_dark else "#2563EB"
    c_badge_text = "#0A1120" if is_dark else "#FFFFFF"

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 100" width="550" height="100" role="img">
  <title>Finoch Bespoke Wordmark ({'Dark' if is_dark else 'Light'})</title>
  {get_wordmark_paths(20, 10, c_text, c_accent, c_badge_text)}
</svg>'''
    return svg

# -------------------------------------------------------------
# 5. STACKED VERTICAL MASTER LOGO
# -------------------------------------------------------------
# Canvas: 600 x 500
# Top: Symbol (scale 1.2 -> width 182.4, height 220.8, centered horizontally)
# Bottom: Wordmark (scale 0.85 -> width 433.5, height 68, centered horizontally)
# Gap between symbol & wordmark = 40px
def build_stacked_logo(theme="dark"):
    is_dark = (theme == "dark")
    c_stem = "#FFFFFF" if is_dark else "#0B192C"
    c_top = "#3B82F6" if is_dark else "#2563EB"
    c_mid = "#FFFFFF" if is_dark else "#0B192C"
    c_node = "#38BDF8" if is_dark else "#0284C7"
    c_text = "#FFFFFF" if is_dark else "#0B192C"
    c_accent = "#38BDF8" if is_dark else "#2563EB"
    c_badge_text = "#0A1120" if is_dark else "#FFFFFF"

    sym_scale = 1.15
    sym_w = 152 * sym_scale
    sym_h = 184 * sym_scale
    sym_x = (600 - sym_w) / 2
    sym_y = 60

    wm_scale = 0.82
    wm_w = 510 * wm_scale
    wm_x = (600 - wm_w) / 2
    wm_y = sym_y + sym_h + 46

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500" role="img">
  <title>Finoch Stacked Logo ({'Dark' if is_dark else 'Light'})</title>
  <g id="symbol" transform="translate({sym_x:.2f}, {sym_y:.2f}) scale({sym_scale:.4f})">
    {get_symbol_paths(c_stem, c_top, c_mid, c_node)}
  </g>
  <g transform="translate({wm_x:.2f}, {wm_y:.2f}) scale({wm_scale:.4f})">
    {get_wordmark_paths(0, 0, c_text, c_accent, c_badge_text)}
  </g>
</svg>'''
    return svg

# -------------------------------------------------------------
# 6. PWA ICONS MASTER SVGs
# -------------------------------------------------------------
def build_pwa_dark_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img">
  <title>Finoch PWA Icon (Dark Titanium)</title>
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#060B14" />
    </linearGradient>
    <linearGradient id="rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#1E293B" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0A1120" stop-opacity="0.8" />
    </linearGradient>
  </defs>
  <!-- Background Tile -->
  <rect width="512" height="512" rx="112" fill="url(#bg-grad)" />
  <rect x="2" y="2" width="508" height="508" rx="110" fill="none" stroke="url(#rim-grad)" stroke-width="3" />
  <!-- Centered Sonic Prism Symbol (Height 294.4px, centered at 256, 256) -->
  <g transform="translate(134.4, 108.8) scale(1.6)">
    <!-- Anchor Monolith Stem -->
    <path fill="#FFFFFF" d="M 0 23 L 40 0 V 184 H 0 Z" />
    <!-- Top Cantilever Facet -->
    <path fill="#3B82F6" d="M 40 0 H 152 L 126 45 H 40 Z" />
    <!-- Mid Cantilever Facet -->
    <path fill="#FFFFFF" d="M 40 78 H 116 L 90 123 H 40 Z" />
    <!-- Satellite Acoustic Node (0.3s Voice Trigger) -->
    <polygon points="126,78 152,78 126,123 100,123" fill="#38BDF8" />
  </g>
</svg>'''


def build_pwa_maskable_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img">
  <title>Finoch PWA Icon (Maskable Adaptive)</title>
  <defs>
    <linearGradient id="bg-mask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#060B14" />
    </linearGradient>
  </defs>
  <!-- Full-bleed background without border radius -->
  <rect width="512" height="512" fill="url(#bg-mask)" />
  <!-- Centered Sonic Prism Symbol (Scale 1.35 fits in 80% circle safe zone) -->
  <g transform="translate(153.4, 131.8) scale(1.35)">
    <!-- Anchor Monolith Stem -->
    <path fill="#FFFFFF" d="M 0 23 L 40 0 V 184 H 0 Z" />
    <!-- Top Cantilever Facet -->
    <path fill="#3B82F6" d="M 40 0 H 152 L 126 45 H 40 Z" />
    <!-- Mid Cantilever Facet -->
    <path fill="#FFFFFF" d="M 40 78 H 116 L 90 123 H 40 Z" />
    <!-- Satellite Acoustic Node (0.3s Voice Trigger) -->
    <polygon points="126,78 152,78 126,123 100,123" fill="#38BDF8" />
  </g>
</svg>'''


def build_favicon_svg():
    # Scalable vector favicon with auto dark/light support
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192" role="img">
  <title>Finoch Favicon</title>
  <style>
    :root {
      --bg: #FAF8F5;
      --stem: #0B192C;
      --top: #2563EB;
      --mid: #0B192C;
      --node: #0284C7;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0A1120;
        --stem: #FFFFFF;
        --top: #3B82F6;
        --mid: #FFFFFF;
        --node: #38BDF8;
      }
    }
    .bg { fill: var(--bg); }
    .stem { fill: var(--stem); }
    .top { fill: var(--top); }
    .mid { fill: var(--mid); }
    .node { fill: var(--node); }
  </style>
  <rect class="bg" width="192" height="192" rx="42" />
  <g transform="translate(31.56, 18.0) scale(0.8478)">
    <path class="stem" d="M 0 23 L 40 0 V 184 H 0 Z" />
    <path class="top" d="M 40 0 H 152 L 126 45 H 40 Z" />
    <path class="mid" d="M 40 78 H 116 L 90 123 H 40 Z" />
    <polygon class="node" points="126,78 152,78 126,123 100,123" />
  </g>
</svg>'''


# -------------------------------------------------------------
# 7. MAIN EXPORT PIPELINE
# -------------------------------------------------------------
def export_all():
    print("🚀 Generating master brand assets...")

    # 1. SVGs to logo-design/brand/
    svg_files = {
        f"{BRAND_DIR}/finoch-logo-dark.svg": build_horizontal_logo("dark"),
        f"{BRAND_DIR}/finoch-logo-light.svg": build_horizontal_logo("light"),
        f"{BRAND_DIR}/finoch-logo-adaptive.svg": build_horizontal_adaptive_logo(),
        f"{BRAND_DIR}/finoch-symbol-dark.svg": build_symbol_logo("dark"),
        f"{BRAND_DIR}/finoch-symbol-light.svg": build_symbol_logo("light"),
        f"{BRAND_DIR}/finoch-symbol-adaptive.svg": build_symbol_adaptive_logo(),
        f"{BRAND_DIR}/finoch-wordmark-dark.svg": build_wordmark_logo("dark"),
        f"{BRAND_DIR}/finoch-wordmark-light.svg": build_wordmark_logo("light"),
        f"{BRAND_DIR}/finoch-stacked-dark.svg": build_stacked_logo("dark"),
        f"{BRAND_DIR}/finoch-stacked-light.svg": build_stacked_logo("light"),
        f"{BRAND_DIR}/pwa-icon-dark.svg": build_pwa_dark_svg(),
        f"{BRAND_DIR}/pwa-icon-maskable.svg": build_pwa_maskable_svg(),
        f"{BRAND_DIR}/favicon.svg": build_favicon_svg(),
    }

    for path, content in svg_files.items():
        with open(path, "w", encoding="utf-8") as f:
            f.write(content.strip())
        print(f"  ✓ Created {path}")

    # 2. Sync to public/
    public_copies = [
        (f"{BRAND_DIR}/finoch-logo-dark.svg", f"{PUBLIC_DIR}/finoch-logo-dark.svg"),
        (f"{BRAND_DIR}/finoch-logo-light.svg", f"{PUBLIC_DIR}/finoch-logo-light.svg"),
        (f"{BRAND_DIR}/finoch-logo-adaptive.svg", f"{PUBLIC_DIR}/finoch-logo.svg"),
        (f"{BRAND_DIR}/finoch-symbol-dark.svg", f"{PUBLIC_DIR}/finoch-symbol-dark.svg"),
        (f"{BRAND_DIR}/finoch-symbol-light.svg", f"{PUBLIC_DIR}/finoch-symbol-light.svg"),
        (f"{BRAND_DIR}/finoch-symbol-adaptive.svg", f"{PUBLIC_DIR}/finoch-symbol.svg"),
        (f"{BRAND_DIR}/favicon.svg", f"{PUBLIC_DIR}/favicon.svg"),
    ]
    for src, dst in public_copies:
        shutil.copy2(src, dst)
        print(f"  ✓ Copied to {dst}")

    # 3. Render PNGs via render_png.py
    print("🎨 Rendering PNG rasters via Chrome...")
    png_renders = [
        (f"{BRAND_DIR}/finoch-logo-dark.svg", f"{BRAND_DIR}/finoch-logo-dark.png", 1440, 360),
        (f"{BRAND_DIR}/finoch-logo-light.svg", f"{BRAND_DIR}/finoch-logo-light.png", 1440, 360),
        (f"{BRAND_DIR}/finoch-symbol-dark.svg", f"{BRAND_DIR}/finoch-symbol-dark.png", 512, 512),
        (f"{BRAND_DIR}/finoch-symbol-light.svg", f"{BRAND_DIR}/finoch-symbol-light.png", 512, 512),
        (f"{BRAND_DIR}/finoch-stacked-dark.svg", f"{BRAND_DIR}/finoch-stacked-dark.png", 1200, 1000),
        (f"{BRAND_DIR}/finoch-stacked-light.svg", f"{BRAND_DIR}/finoch-stacked-light.png", 1200, 1000),
        # PWA Icons
        (f"{BRAND_DIR}/pwa-icon-dark.svg", f"{PUBLIC_ICONS_DIR}/icon-512.png", 512, 512),
        (f"{BRAND_DIR}/pwa-icon-dark.svg", f"{PUBLIC_ICONS_DIR}/icon-192.png", 192, 192),
        (f"{BRAND_DIR}/pwa-icon-maskable.svg", f"{PUBLIC_ICONS_DIR}/icon-maskable-512.png", 512, 512),
        (f"{BRAND_DIR}/pwa-icon-maskable.svg", f"{PUBLIC_ICONS_DIR}/icon-maskable-192.png", 192, 192),
        (f"{BRAND_DIR}/pwa-icon-dark.svg", f"{PUBLIC_DIR}/apple-touch-icon.png", 180, 180),
        (f"{BRAND_DIR}/pwa-icon-dark.svg", f"{PUBLIC_DIR}/favicon-32x32.png", 32, 32),
        (f"{BRAND_DIR}/pwa-icon-dark.svg", f"{PUBLIC_DIR}/favicon-16x16.png", 16, 16),
    ]

    for src_svg, dst_png, w, h in png_renders:
        cmd = [
            "python", "logo-design/scripts/render_png.py",
            src_svg, "-o", dst_png,
            "--width", str(w), "--height", str(h), "--padding", "0"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"  ❌ Error rendering {dst_png}: {res.stderr}")
        else:
            print(f"  ✓ Rendered {dst_png} ({w}x{h})")

    # 4. Generate multi-resolution favicon.ico
    print("💎 Generating favicon.ico...")
    im512 = Image.open(f"{PUBLIC_ICONS_DIR}/icon-512.png")
    im_sizes = [
        im512.resize((16, 16), Image.Resampling.LANCZOS),
        im512.resize((32, 32), Image.Resampling.LANCZOS),
        im512.resize((48, 48), Image.Resampling.LANCZOS),
    ]
    im_sizes[0].save(
        f"{PUBLIC_DIR}/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=im_sizes[1:],
    )
    print(f"  ✓ Saved multi-resolution {PUBLIC_DIR}/favicon.ico")

    # Sync a backup copy to BRAND_DIR
    shutil.copy2(f"{PUBLIC_DIR}/favicon.ico", f"{BRAND_DIR}/favicon.ico")
    shutil.copy2(f"{PUBLIC_ICONS_DIR}/icon-512.png", f"{BRAND_DIR}/icon-512.png")
    shutil.copy2(f"{PUBLIC_ICONS_DIR}/icon-maskable-512.png", f"{BRAND_DIR}/icon-maskable-512.png")

    print("✨ All master brand assets generated successfully!")


if __name__ == "__main__":
    export_all()
