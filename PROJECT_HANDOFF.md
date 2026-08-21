# Project Handoff — OA Zone Alignment Manager

> Read this first. It contains everything the next session needs: the goal, current state, what's been done, rules, philosophies, validated results, and what to build next.

---

## 1. Goal

Build and maintain a single-page web tool (`index.html`) that assigns **4,695 stores** (US) to **OA (Operations Advisor) territory zones**. Each OA lives in an **anchor city** and services the stores in their zone. The tool:

- Draws every store on a US map, colored by zone.
- Runs an **Auto-Assign** algorithm with hard guardrails.
- Lets the user manually reassign stores, drag anchors, and edit everything.
- Surfaces violations (DMA splits, area splits, over/under targets) in real time.

The **practical purpose**: the business is planning to grow from the current 24 zones to **50 zones** (15 existing OAs + 35 new hires). The tool is used to decide **which large cities/DMAs to hire in**, by letting planners place anchors, rebalance, and inspect the resulting territories.

---

## 2. Modes

| Mode | Zones | Composition | Targets | Source of assignment |
|------|-------|-------------|---------|----------------------|
| **24** | 24 | 15 named OAs + 9 TBH | min 150 / max 250 / bonus 40 | **Ground truth** — `INITIAL_ZONES_24` (real current assignment). Never re-derived. |
| **50** | 50 | 15 OAs + 35 anchors (9 TBH + 26 suggested new) | min 70 / max 115 / bonus 20 | Computed by Auto-Assign (`runAutoAssign` → `balanceZones`). |

- `STRONGER = [3,4,5,8,1]` — those zones get the STRONG bonus added to their max (i.e., max 135 in 50-mode).
- 24-mode **always** uses ground truth; Auto-Assign only runs in 50-mode.
- Top bar shows: total assigned, σ (std dev — the balance metric), over/under counts, DMA-split violations, locked-store count.

---

## 3. Files

| File | Role |
|------|------|
| `index.html` | The whole app (~2100 lines): data load, Auto-Assign algorithm, map, tables, config panel. **Main file.** |
| `stores_data.js` | `STORES` — 4,695 stores with `id, franchisee, dma, region, area, city, state, lat, lon`. |
| `initial_zones_24.js` | `INITIAL_ZONES_24` — 24-zone ground-truth assignment. |
| `initial_zones.js` | Older/other zone data (24-zone based). |
| `new_zones_50.js` | `NEW_ZONE_DEFS_50` (26 suggested new zones: name, oa, region, fop, parentZone, parentName, estCount) and `NEW_TBH_LOCS_50` (26 anchor lat/lon — **now all real populated cities**, see §6). |
| `INDEX_OVERVIEW.md` | Design docs — architecture, guardrails, config reference. **Keep in sync with code changes.** |
| `us_outline.js`, `zone_manager_v7.html`, `stores_data_v8.*` | Legacy/scratch. `zone_manager_v7.html` is an older copy of the tool. |

---

## 4. Auto-Assign algorithm (`runAutoAssign` → `balanceZones`)

Order of operations:

1. **`findOaDmas`** — each OA's "home DMA" = the DMA of the store nearest to that OA's anchor.
2. **`buildDmaIndex`** — map DMA → store indices.
3. **`lockOaDmas`** — every store in an OA's home DMA is force-assigned to that OA's zone.
4. **`assignAreas`** — groups unassigned stores by **Area**; each area votes for its nearest zone (crossover limit `max(1, min(5, 25%))` of the area's stores may prefer a different zone), then drive-cap fallback (200 mi), then absolute nearest.
5. **`balanceZones`** — iterative rebalance (default 10 iterations; early-stops when a pass makes no moves). All moves are **coherence-constrained**:

   - **Rank cache**: for every store, all zones sorted by anchor distance (`topRank(si, n)`). Built once per call; valid across iterations because it only depends on store + anchor coordinates, not assignments.
   - **`isLocal(si, uz, k=8)`** — zone `uz` must be among the store's 8 nearest anchors.
   - **Pass A — over-capacity shed**: zones above their max donate stores **farthest-first** to the **nearest under-capacity local receiver** (top-8 nearest anchors only). Shedding can't cross the country.
   - **Pass B — mean-equalization**: zones above `mean + 2` donate to zones below the mean, local-only, receiver search bounded to **400 mi**.
   - **Pass C — under-min fill**: under-min zones may pull **only** stores whose **natural (nearest) zone is the under-min target itself**, within **350 mi**. Never drags cross-country stores to hit the floor.
   - **Final crossover correction**: stores return to their true nearest zone when that zone has headroom and the current zone is above min (never exceeds capacity).
   - Every move skips locked-DMA stores (`isLockedStore`) and any move that would split an **Area** across more than `AREA_MAX` zones (`wouldSplitArea`, default max 2).

### DMA lock — two modes (the key configurable rule)

- **ABSOLUTE** (`cfg-lock-dma` checked, default): an OA's home DMA can **never** be split; those stores are immovable.
- **SOFT / shed-when-over** (`cfg-lock-dma` unchecked): OA keeps its home-DMA stores **while its zone ≤ target max**; when the zone exceeds its max, the dense excess **can be rebalanced into neighboring zones**.
- Per-OA 🔒/🔓 toggles (`dmaLocksDisabled`) override individually. All the stats/badges (`isDmaLocked`, locked-count, DMA-split `⚠` vs informational `🔓`) follow the effective rule. Toggling requires **↺ Reset to Initial** to re-run Auto-Assign.

### Other guardrails

- `DRIVE_CAP = 200` mi (4h @ 50mph) for initial area assignment.
- Honolulu/Guam/Fairbanks/Anchorage DMAs are **cap-exempt** (remote outliers never force their own zone; may sit far from anchor).
- `optimizeTBHLocations()` (k-means, 15 iters): snaps each centroid to the **nearest store** and names it `City, ST (N stores)` — **never** overwrites names with `TBH n`.

---

## 5. Philosophy / rules the next session must respect

1. **Coherence over balance.** Zones must be geographically coherent, non-fragmented territories. A zone named "Las Vegas" must look like the Vegas/SLC corridor — never contain LA, Memphis, and Detroit strays. It's better to have 4 rural zones slightly under the 70-store floor than to pad them with cross-country steals.
2. **Honest limits.** Sparse rural zones (Albuquerque, Lubbock, Las Vegas, Amarillo) may sit below Target Min. This is expected, logged as a console warning, and documented — not "fixed" by fragmenting.
3. **DMA is a geographic separator, not part of the hierarchy.** Hierarchy is Franchisee → Region → Area → Store. The 15 OA home DMAs are the only lockable entities.
4. **Areas may span >1 zone only when necessary** (max `AREA_MAX`, default 2). Fragmentation is acceptable **only** when an Area constraint requires it.
5. **Anchors are real populated cities.** New-hire anchors/names come from actual cities (see §6). Zone names on the map/tables must show city names, not `TBH n`.
6. **24-mode ground truth is sacred.** Never re-derive or overwrite it; Auto-Assign touches only 50-mode.
7. **Docs stay in sync.** When behavior changes, update `INDEX_OVERVIEW.md` (algorithm, guardrails, config, new-hire section).
8. **Validate in Python before touching the app.** A Python harness mirrors `balanceZones`; verify stats/DMA/coherence there, then port, then verify brace/paren balance (see §8). No Node.js is installed — do not rely on it.

---

## 6. Recent work (this handoff's starting point)

1. **New `balanceZones`** (in `index.html`, ~line 824): greedy 3-pass + crossover with **coherence layer** (rank cache, `isLocal` top-5, Pass C natural-zone ≤300 mi). Replaced the old "headroom − dist×0.05" Pass A that dumped excess into far empty zones (root cause of the fragmentation complaints).
2. **Configurable DMA lock** implemented (ABSOLUTE / SOFT shed-when-over) across `onLockDmaToggle` (~line 701), `isDmaLocked` (~1875), `updateStats` (~1523), constraint list, guardrail banner.
3. **`new_zones_50.js`** — 21 anchors moved from tiny towns to **real populated cities** (kept College Station, Odessa, Sioux Falls, Silver Spring); additional fixes: Escondido→**San Diego**, Pembroke Pines→**Fort Myers**, Bristol→**Asheville NC**, Alexandria→**Lafayette**:
   Ruidoso→**Albuquerque**, Walton→**Cincinnati**, Slaton→**Lubbock**, Greenwood→**Shreveport**, Fort Johnson→**Lafayette**, Murphy→**Knoxville**, Perrysburg→**Toledo**, Chester→**Richmond**, Marysville→**Wichita**, Fremont→**Grand Rapids**, Hamilton→**Spokane**, Claremont→**Albany NY**, Byhalia→**Memphis**, Columbia→**New Orleans**, Afton→**Cheyenne**, West Wendover→**Las Vegas**, Pampa→**Amarillo**, Greenbrier→**Little Rock**, Sylvania→**Savannah**, Abingdon→**Asheville NC**, Escondido→**San Diego**, Pembroke Pines→**Fort Myers**. `estCount` updated to validated run counts.
4. **`optimizeTBHLocations()`** fixed to preserve city names and snap anchors to real stores.
5. **`INDEX_OVERVIEW.md`** updated (algorithm, guardrails, anchors, honest limits).

### Validated results (Python harness, SOFT-B = shed-when-over, real-city anchors)

- **50-zone**: std dev **22.8** (base was 26.8), min 36, max 135, **0 over-capacity zones**, 0 areas split >2 zones, avg extra crossover mi **67** (was 271), 6 DMAs split (soft — expected), **no coast-to-coast fragments**.
- **Under-min zones (4, all rural/honest):** `25` Albuquerque 42 · `27` Lubbock 36 · `42` Las Vegas 67 · `44` Amarillo 43.
- **Hard-lock mode**: 0 DMA violations; over-cap zones are only those whose home DMA itself exceeds max (0/3/4/6) — unavoidable under ABSOLUTE.
- Coherence examples after the fix: West Wendover zone = Vegas 34 / SLC 27 / Twin Falls 6 (was LA 41 / SLC 25 / Bakersfield 9 / Memphis 1); Murphy zone = Knoxville/Appalachia (was Philly/Cleveland/DC contamination); Odessa = all-Texas.

---

## 7. Next steps / open items (start here)

1. **Map markers in 50-mode — FIXED.** Added `rebuildMarkers()` call in `switchMode()` (after setting mode data and before render) so markers update when switching to 50-mode. Also added `rebuildMarkers(); render();` after `runAutoAssign()` completes.
2. **Anchor cities updated to be largest city in zone.** Changed: Escondido→San Diego, Pembroke Pines→Fort Myers (was wrong coast for Gulf zone!), Bristol→Asheville NC, Alexandria→Lafayette. Updated `new_zones_50.js` and docs.
3. **DMA locks disabled for 50-mode.** When switching to 50-mode, DMA lock checkbox is automatically unchecked (SOFT mode). Dense DMAs like LA, Dallas, NYC can now split across multiple OAs. Reverts to ABSOLUTE when switching back to 24-mode.
4. **Balance algorithm tightened.** `isLocal` k increased from 5→8 (stores can move to more zones). Pass B threshold lowered from mean+4→mean+2 (more aggressive equalization). Pass B distance cap raised 350→400 mi. Pass C distance cap raised 300→350 mi.
5. **Zone Transition (15→24) implemented.** New feature allows incremental activation of TBH zones as new OAs come online. When a zone is activated, stores are carved out from their current zones based on the 24-zone plan (`INITIAL_ZONES_24`). Features:
   - Transition panel in Config showing all 9 TBH zones with status (Active/Pending)
   - Activate/Deactivate buttons for each zone
   - "Reset to 15 Zones" and "Activate All Pending" buttons
   - Loads original 15-zone assignments from `Alignments - 15 zones.csv`
   - Current zone count displayed (e.g., "18 of 24 zones active")
6. Consider whether to nudge the 4 under-min rural zones via anchor placement (e.g., confirm Albuquerque/Lubbock/Amarillo anchors are in the right spot) rather than relaxing coherence.
7. Any future balance tuning should go through the Python harness first (§8).
8. Keep `INDEX_OVERVIEW.md` in sync with any further changes.

---

## 8. Tooling & verification

- **No Node.js/deno/bun** on this machine. Python 3.13 is available.
- Python harness (mirrors `balanceZones`): `C:\Users\axc1195\AppData\Local\Temp\opencode\` — `balance_coherent.py` (the validated coherent algorithm + SOFT-B/HARD modes, loads `new_zones_50.js` fresh), `balance_fix.py`, `balance_soft.py`, `zone_dump.py`, `make_coherent.py`, `make_cities.py`, `balance_cities.py` (real-city anchor tests). The dump script prints per-zone `far(>=300mi)` counts and DMA-spread dicts — the fast way to spot fragmentation.
- **Flow to change the algorithm**: edit the Python harness → run it → confirm stats (std, over/under, DMA violations, avg extra mi, far-store counts) → port to `index.html` `balanceZones()` → verify brace/paren balance with `C:\Users\axc1195\AppData\Local\Temp\opencode\tokscan.py <file>` (a real string/comment-aware tokenizer; output must be `balanced: True`).
- Temp work goes in `C:\Users\axc1195\AppData\Local\Temp\opencode\` (pre-approved external dir).

---

## 9. Environment facts

- OS: **Windows**, shell: **PowerShell 5.1** (no `&&`; use `;`/`if ($?)`). Paths often contain spaces (`C:\projects\OA Assignments\`).
- Git repo exists but has **no commits yet** (`master`, everything untracked). Use `git status` freely; don't rely on `git diff HEAD`/`git show HEAD` (will fail).
- Don't add comments to code unless asked; don't commit unless explicitly asked; don't create docs unless asked.
