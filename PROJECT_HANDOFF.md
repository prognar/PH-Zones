# Project Handoff — OA Zone Alignment Manager

> Read this first. It contains everything the next session needs: the goal, current state, what's been done, rules, philosophies, validated results, and what to build next.

---

## 1. Goal

Build and maintain a single-page web tool (`index.html`) that assigns **4,695 stores** (US) to **OA (Operations Advisor) territory zones**. Each OA lives in an **anchor city** and services the stores in their zone. The tool:

- Draws every store on a US map, colored by zone.
- Loads pre-computed assignments (ground-truth 24-zone; the 50-zone Option 1 plan).
- Runs an **Auto-Assign** algorithm with hard guardrails for interactive rebalancing.
- Lets the user manually reassign stores, drag anchors, and edit everything.
- Surfaces violations (DMA splits, area splits, over/under targets) in real time.

The **practical purpose**: the business is growing from the current 24 zones to **50 zones** (15 existing OAs + 35 new-hire OAs). Option 1 · Geographic is the concrete 50-spot plan (the user's 49 + a 2nd Chicago OA); Option 2 · Performance is the weighted variant.

---

## 2. Modes & options

| Mode | Option | Zones | Source of assignment | Load targets |
|------|--------|-------|----------------------|--------------|
| **24** | 1 · Original / 2 · Manual | 15 OA + 9 TBH = 24 | **Ground truth** — `INITIAL_ZONES_24` (never re-derived) | min 150 / max 250 / bonus 40 |
| **50** | **1 · Geographic** (default) | 15 OA + 35 new hire = 50 | **Pre-computed** — `OPT1_ZONES_50` (`opt1_zones_50.js`) | juniors **90–100**, seniors **70–90** |
| **50** | 2 · Performance | 15 OA + 26 weighted | `OPTION2_ZONES_50_PERF` (`perf_zones_50.js`) | min 70 / max 115 / bonus 20 |

- `STRONGER = [3, 4, 5, 8, 1]` — Danielle, AKM, Dustin, Derron, Hellen (Strong bonus on target max).
- 24-mode always uses ground truth. 50-mode Option 1 loads a pre-computed map — no startup Auto-Assign.

### Key plan rules (Option 1 · Geographic)
1. Juniors 90–100 stores; seniors (Dustin Patton, Danielle Hudson, Derron Spencer) 70–90.
2. **1 OA per Area** — whole-Area assignment, whole-Area rebalancing. **0 non-generic area splits** (only generic filler `N/A`, `Open`, `South` span zones).
3. **No Philadelphia zone** — Tim King services the Philadelphia market from the New York City zone (all 58 Philadelphia-DMA stores → zone 12).
4. **Alaska → Seattle (11)**; **Hawaii/Guam → Sacramento (44)**.

---

## 3. Files & git

| File | Role |
|------|------|
| `index.html` | The whole app (~2,900 lines): data load, assignment loading, Auto-Assign, map, tables, config panel. **Main file.** |
| `stores_data.js` | `STORES` — 4,695 stores with `id, franchisee, dma, region, area, city, state, lat, lon`. |
| `initial_zones_24.js` | `INITIAL_ZONES_24` — 24-zone ground-truth assignment. |
| **`opt1_zones_50.js`** | **Option 1 (Geographic) 50-zone plan.** `OPT1_ZONE_DEFS_50` (50 defs incl. `senior`, `estCount`), `OPT1_TBH_LOCS_50` (35 new-hire anchors, zones 15–49), `OPT1_ZONES_50` (store id → 0–49). **Pre-computed; regeneration lives in the Python generator.** |
| `option2_zones.js` | `OPTION2_ZONES` — 24-zone Option 2 (Manual) map. |
| `new_zones_50.js` | `NEW_ZONE_DEFS_50` / `NEW_TBH_LOCS_50` — 26 suggested new territories (legacy Option 2 Geographic). |
| `perf_zones_50.js` | `NEW_ZONE_DEFS_50_PERF` / `NEW_TBH_LOCS_50_PERF` — Option 2 · Performance assignments. |
| `zones_15.js` | `INITIAL_ZONES_15` — original 15-zone assignments (15→24 transition). |
| `INDEX_OVERVIEW.md` / `PROJECT_HANDOFF.md` | Design + handoff docs. **Tracked and kept in sync.** |
| `.gitignore` | Whitelist: only the files that serve `index.html`, the two docs, and `.gitignore` are tracked. Everything else (CSVs, `archive/`, `us_outline.js`, scratch) is ignored. |

**Git:** remote `origin` = https://github.com/prognar/PH-Zones, branch `main` tracks `origin/main`. Credentials via Git Credential Manager (no `gh` CLI). The project folder IS the repo (worktree matches `HEAD`, so always `git status` before working). Latest commit `d7f898c` — with the area-split fix it will be regenerated and pushed.

All zone/anchor data (the 50-spot table, region/FOP, anchors, current store counts) is documented in `INDEX_OVERVIEW.md` §5.

---

## 4. Inline app data (in `index.html`)

- `OAS` — the 15 named OAs with lat/lon (Jiselle Medina–LA … Paul Inacio–Pensacola). Zones 0–14 in the 50 plan are exactly these 15 people, in the same order, anchored at their real coords.
- `ZONE_DATA_24` (24-zone names/OA/region/FOP), `ZONE_DATA_EXP` (Option 2 renames), `TBH_INIT_24`, `TBH_INIT_EXP`.
- `OPT1_*` lives in `opt1_zones_50.js` (external). `NEW_*`/`PERF` variants in `new_zones_50.js` / `perf_zones_50.js`.
- `MODES` — per-mode config (zone counts, `tbhCount`, targets); `getTarget50Zone()` chooses the map: experimental → `OPTION2_ZONES_50_PERF`, else `OPT1_ZONES_50`.

---

## 5. Auto-Assign algorithm (`runAutoAssign` → `balanceZones`)

Interactive/50-Option-2 path (Option 1 uses the pre-computed map):

1. **`findOaDmas`** — each OA's home DMA = DMA of the nearest store.
2. **`lockOaDmas`** — force-assign home-DMA stores to their OA (unless lock disabled).
3. **`assignAreas`** — group by Area; area votes for its nearest zone (crossover limit `max(1, min(5, 25%))`; drive-cap 200 mi fallback; absolute nearest last).
4. **`balanceZones`** — iterative, coherence-constrained (a store may only move toward one of its 8 nearest anchors): Pass A over-capacity shed (farthest-first to nearest under-capacity local receiver), Pass B mean-equalization (donate above `mean+2` to below-mean zones ≤ 400 mi), Pass C under-min fill (natural-zone stores within 350 mi), final crossover correction. Skips locked-DMA stores and any move that would split an Area across more than `AREA_MAX` zones.

### DMA lock
- **ABSOLUTE** (default): home DMAs never split. **SOFT**/shed-when-over: dense DMAs (LA, Dallas, NYC) can split across zones when over target. Per-OA 🔒/🔓 toggles override.

---

## 6. Philosophy / rules the next session must respect

1. **Area integrity is the top priority (now).** 1 OA per Area in all but the forced/generic exceptions. Never regress to per-store fragmentation to hit counts — a 276-area-split build was rejected. Current target: **0 non-generic splits**, and zones stay inside their load windows (90–100 junior / 70–90 senior) via *whole-area* moves.
2. **Coherence over balance.** Zones must remain geographically coherent. If a choice must be made, prefer coherent whole-area territories over exact counts.
3. **DMA is a geographic separator, not part of the hierarchy.** Hierarchy is Franchisee → Region → Area → Store.
4. **The plan's hard rules are fixed:** no Philadelphia zone (Tim King services Philly from NYC); AK→Seattle, HI/GU→Sacramento; juniors 90–100, seniors 70–90.
5. **24-mode ground truth is sacred.** Auto-Assign never touches it; Option 2 · Manual is the 24-zone alternative.
6. **Anchors are the plan.** Zones 0–14 anchors = the OAs' real coords; zones 15–49 anchors = the 35 new-hire anchor cities (in `OPT1_TBH_LOCS_50` and documented in `INDEX_OVERVIEW.md` §5).
7. **Docs stay in sync.** Update `INDEX_OVERVIEW.md` & `PROJECT_HANDOFF.md` whenever behavior changes; keep them tracked.
8. **Validate in Python before touching the app.** No Node.js is installed — don't rely on it.

---

## 7. Recent work

1. **Implemented Option 1 · Geographic 50-zone plan** (`opt1_zones_50.js`, regenerated via `gen_opt1_50.py`): the 50 spots (49 + 2nd Chicago OA), flat anchors, load windows 90–100/70–90, no Philadelphia zone, AK/HI/GU west-coast mapping.
2. **Fixed area splits (276 → ~0).** The first generation assigned stores individually, creating 276 area splits. Generator rewritten for **whole-Area assignment/rebalancing**: an Area is placed in the zone minimizing its total distance; rebalancing moves whole Areas until every zone is within its window. Only generic filler names (`N/A`, `Open`, `South`) span zones.
3. **Validated on disk** (independent Python, not the generator's own printout):
   - 50 defs / 35 anchors / 4,695 map entries; all 50 zones used.
   - Zone sizes min 85 max 100; juniors all 90–100; seniors Dallas 86, Tampa 87, Raleigh 85 (70–90 window).
   - **0 non-generic area splits** (24-zone plan has 15; we're tighter).
   - All 58 Philadelphia-DMA stores → NYC (12); AK → Seattle (11) 7 stores; HI → Sacramento (44) 27 stores.
4. **Git repo normalized & pushed** to github.com/prognar/PH-Zones: whitelist `.gitignore` (only files serving `index.html` + the two docs), removed legacy cruft from tracking (`oa_zone_planner.html`, `stores_data_v8.*`, `initial_zones.js`, old report), docs rewritten and tracked.

---

## 8. Next steps / open items

1. **Rebuild & push the fixed plan.** `opt1_zones_50.js` now has 0 non-generic area splits; commit (`opt1_zones_50.js`, `INDEX_OVERVIEW.md`, `PROJECT_HANDOFF.md`, `.gitignore`). Then `git push`.
2. **Review on the map.** Open `index.html` → 50 mode → Option 1 · Geographic: confirm the zone cards/counts (85–100), no Philadelphia card, and that the 3 generic splits (`N/A`, `Open`, `South`) look right.
3. **Big western zones** (Phoenix/SLC/Boise far-store counts) are inherent to sparse-western geography; decide later whether anchor/area nudges are wanted (go through the generator, not the app).
4. Any future rebalance/plan tuning flows through `gen_opt1_50.py` → validate → regenerate → push.

---

## 9. Tooling & verification

- **No Node.js/deno/bun.** Python 3.13 is available (incl. `esprima`).
- Regenerate: `C:\Users\axc1195\AppData\Local\Temp\opencode\gen_opt1_50.py` — outputs `C:\projects\OA Assignments\opt1_zones_50.js`. Cf. `analyze_splits.py` (area-split analysis) and `validate_opt1.py` (independent on-disk checks incl. per-zone distance/far counts).
- Quick app-JS sanity check: pull the inline `<script>` and `esprima.parseScript()` it (neutralize the pre-existing `?.` — Python esprima 4.0.1 doesn't support optional chaining). Brace/paren balance via the earlier `tokscan.py`-style counter.
- Temp work goes in `C:\Users\axc1195\AppData\Local\Temp\opencode\` (pre-approved external dir).

---

## 10. Environment facts

- OS **Windows**, shell **PowerShell 5.1** (no `&&`; use `;` / `if ($?)`). Paths contain spaces (`C:\projects\OA Assignments\`).
- Git: repo has commits now; branch `main`; do not force-push. Commit/push only when asked.
- `esprima` (Python) is used for syntax checks because no Node.js exists.
- Don't add comments to code unless asked; don't commit unless explicitly asked; don't create docs unless asked.