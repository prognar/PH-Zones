# `index.html` — OA Zone Alignment Manager

A single-page tool for **assigning ~4,600 stores to OA (Operations Advisor) territory zones** across the US. Each OA lives in an anchor city and services the stores in their zone. The tool draws every store on a map colored by zone, runs an auto-assign algorithm that respects hard rules, lets you manually reassign stores, and surfaces any violations.

Version title: **"OA Zone Alignment Manager v9"** / header shows "OA Zone Alignment v9".

---

## 1. Business model & data hierarchy

**Store alignment file** columns (the input CSV): `CHAINED_STORE_ID`, `FRANCHISEE`, `DMA`, `REGION`, `AREA`, `CITY`, `STATE`, `LATITUDE`, `LONGITUDE`.

Hierarchy (parent → child):

```
Franchisee
  └─ Region
       └─ Area
            └─ Store
```

- **Store** — a single location, uniquely identified by `CHAINED_STORE_ID`, with lat/lon for mapping.
- **Area** — a group of stores (named after a person, e.g., "Brundage, Christina"). **Rule: an Area should stay in one zone.** There are a few unavoidable exceptions where an area must span 2 zones.
- **Region** — a group of areas (e.g., "MIDWEST SOUTH", "MCVAY, ANGELA", "Ted Edwards PH SA").
- **Franchisee** — the owner of a group of regions (e.g., "THOMAS JORGENSEN", "MICHAEL CHERNEY", "KAMAL SINGH").
- **DMA (Designated Marketing Area)** — a **geographic separator, not part of the alignment hierarchy**. It groups smaller cities into a media market (e.g., "SAN ANTONIO", "DENVER", "CASPER-RIVERTON"). Used only as a hard constraint (see §5 guardrails).
- **OA (Operations Advisor)** — a person based in an anchor city who services all stores in their zone.

---

## 2. Zones & the two planning modes

- **24-Zone mode** (current plan): **15 named OAs** + **9 TBH (To-Be-Hired)** territories = 24 zones. This matches the real, current assignment (`INITIAL_ZONES_24` is the ground truth). Each of the 24 zones has an anchor city where the OA resides.
- **50-Zone mode** (future plan): the same 15 OAs + **35 new-hire anchors** (9 TBH + 26 suggested new territories). The 26 suggestions split existing zones proportionally (~94 stores/zone target) — **the tool is used to decide which large cities/DMAs to hire in**.

**Targets (24-zone mode):** min **150** stores, max **250** stores per zone (targets are lower in 50-zone mode). Zones should be split **fairly evenly, but not strictly** — a "strong" OA can carry more (see Strong OA Bonus). The current state varies from as low as **70** to as high as **177** per zone — too wide a variance, which is why the balance algorithm exists.

---

## 3. Data inputs (local script files)

| File | Contents |
|---|---|
| `stores_data.js` | `STORES` array — one object per store: `id` (= CHAINED_STORE_ID), `franchisee`, `dma`, `region`, `area`, `city`, `state`, `lat`, `lon` |
| `initial_zones_24.js` | `INITIAL_ZONES_24` — map of store id → zone index (the real current 24-zone assignment / ground truth) |
| `new_zones_50.js` | `NEW_ZONE_DEFS_50` (26 suggested new zones with `name`, `parentName`, `oa`, `region`, `fop`, `estCount`) and `NEW_TBH_LOCS_50` (anchor locations for the extra new-hire zones) |

External (CDN): D3 v7 + topojson (map geometry), and the US-states topoJSON atlas for state outlines.

---

## 4. Inline data

Defined directly in the HTML `<script>`:

- **`OAS`** — the 15 named OAs with lat/lon (e.g., Jiselle Medina – LA, Tim King – NY, Dustin Patton – Tampa).
- **`ZONE_DATA_24`** — 24 zones: name, OA (or `TBD`), region (`West`/`East`), FOP (Field Operations Partner / manager).
- **`ZONE_DATA_50`** — the same 24 + the 26 generated zones.
- **`TBH_INIT_24`** — 9 starter TBH anchors (Denver, Sacramento, San Antonio, OKC, St. Louis, Minneapolis, Jacksonville, Charlotte, Pittsburgh).
- **`MAJOR_CITIES`** — ~90 cities drawn as map labels.
- **Palettes** — `zoneColors24` (24 distinct colors), `zoneColors50` (24 + 26 generated HSL hues).
- **`MODES`** — per-mode config: zone count, TBH count, target min/max, strong-OA bonus, `hasGroundTruth`.

---

## 5. Core state

- `storeZone` — `Int16Array` of length `STORES.length`; `storeZone[i] = z` = store `i` is in zone `z`, `-1` = unassigned.
- `tbhLocs` / `oaLocs` — editable lat/lon of every TBH and OA anchor.
- `CURRENT_MODE` / `NUM_ZONES` — 24 vs 50 mode and resulting zone count.
- `STRONGER` — OA zone indices allowed a higher capacity (+ Strong OA Bonus).
- `oaDmas` — each OA's **home DMA** (the DMA of the store closest to the OA), used for DMA locking.
- `dmaLocksDisabled` — OAs whose DMA lock has been toggled off.
- Filters: `filterZone`, `filterArea`, `filterFop`, `filterRegion`.

---

## 6. Auto-assign algorithm (`runAutoAssign`)

Pipeline with a visible progress bar:

1. **`findOaDmas`** — for each OA, find the closest store; that store's DMA becomes the OA's home DMA.
2. **`lockOaDmas`** — every store in an OA's home DMA is force-assigned to that OA (unless its lock is disabled).
3. **`assignAreas`**
   - Groups unassigned stores by **Area**.
   - Each store in an area "votes" for its nearest zone; the highest-vote zone wins, subject to a *crossover rule* (at most `max(1, min(5, 25%))` stores may prefer a different zone) and the 200-mile drive cap.
   - Remaining strays go to the nearest zone within the drive cap (fallback: absolute nearest).
4. **`balanceZones`** — iterative rebalancing (up to `cfg-balance-iters` passes, default 10; stops early when a pass makes no moves):
   - **Pass A — over-capacity shed**: zones above their max donate stores to the nearest under-capacity zone. Receiver capacity is distance-penalized (`headroom − dist × 0.05`) so beyond-drive-cap receivers are allowed as a fallback — this is what lets geographically isolated over-capacity zones actually shed their excess. Stores leave farthest-first.
   - **Pass B — mean-equalization**: zones well above the mean (`mean + 4`) donate to zones below the mean, bounded to a 500-mi receiver search. This tightens the spread instead of leaving a floor of exact-min zones. Receivers never exceed the mean.
   - **Pass C — under-min fill**: zones still below Target Min draw from above-average donors, bounded to **400 mi** so stores are never dragged cross-country just to hit the floor.
   - **Final crossover correction**: stores return to their true nearest zone when that zone has headroom and the current zone is above min — rebalancing never exceeds capacity.
   - Every move skips locked-DMA stores and skips any move that would split an Area across more than the allowed zone count (`wouldSplitArea`).
   - **Known honest limits**: zones that are 100% locked-DMA (e.g., 0/3/4 in the 50-plan, at 177/177/161) stay at their locked size; genuinely sparse rural zones (e.g., West Wendover, Afton) may stay below Target Min and log a console warning rather than being artificially padded by cross-country steals.

**Guardrails:**
- 🔒 **OA home DMAs never split** (default, "Lock OA DMAs" = ABSOLUTE) — a store in an OA's home DMA cannot move to another zone.
- 🔓 **Soft lock mode** ("Lock OA DMAs" unchecked) — *shed-when-over*: an OA keeps its home-DMA stores while its zone is at or below its target max; when the zone exceeds its target, the dense excess may be rebalanced into neighboring zones. This lets heavily populated DMAs (e.g., LA, Dallas, NYC) split across 2+ OAs and relieves sparsity in rural zones. Per-OA 🔒/🔓 toggles and the global checkbox are both respected; `isLockedStore` / `isDmaLocked` / the top-bar 🔒 count and DMA-split badge all follow the effective rule.
- An **Area may span at most 1–2 zones** (configurable), with 1 as the preferred default.

---

## 7. Map rendering

- **Canvas (`#dot-canvas`)** — interactive layer:
  - Store dots colored by zone (unassigned = gray); hover highlights the store and shows a tooltip (id, DMA, city/state, area, franchisee, zone/region/FOP, 🔒 if locked).
  - **Zone territory overlay** (optional "Zones" toggle) — a per-pixel Voronoi map: every pixel is colored by the nearest assigned store's zone, clipped to state borders, at 20% alpha, rendered separately for mainland / Alaska / Hawaii.
  - **OA/TBH markers** — draggable circles (OA = solid ring, TBH = dashed ring) with labels; dragging an anchor moves it on the map and updates its lat/lon inputs.
  - Major-city labels; pan (drag) and zoom (wheel).
- **SVG (`#state-svg`)** — state fills and borders from the topoJSON atlas, kept in sync with pan/zoom.
- **Filtering** — FOP / Region dropdowns and zone/area selection dim non-matching dots; a filter-summary pill lists per-zone counts with ⚠ (over max) / ▲ (under min) flags.

---

## 8. Top bar & zone cards

**Top bar stats:** total stores, assigned count, σ (std dev of zone sizes — a balance metric), over/under counts, DMA-split violations, locked-store count.

**One card per zone:** color stripe, name, OA/region/FOP, current count, target range, average drive time (miles ÷ 50 mph), capacity bar, status chip (`OK` / `N over` / `N under` / `empty`), editable anchor lat/lon inputs, and a 🔒/🔓 toggle to disable that OA's DMA lock. Clicking a card selects the zone and filters the map.

---

## 9. Area detail & split-area navigator

- Clicking a store opens the **area detail** panel: zone breakdown of that area's stores, a "move all to zone" dropdown, and a per-store list with individual zone-change dropdowns.
- Areas split across 2+ zones appear in a **Split Areas navigator** (prev/next controls, clickable list, ⚠ DMA-conflict hints) so exceptions can be reviewed and resolved.

---

## 10. Config panel (`⚙ Config`) — full reference

Opened as a modal overlay. Sections:

### 10.1 Auto-Assign Algorithm
- **Guardrail banner**: shows the two absolute rules — 🔒 OA home DMAs never split; Areas max **2** zones.
- **Lock OA DMAs** (checkbox, default **checked**): when ON (**ABSOLUTE**), OA home DMAs can never be split. When OFF (**SOFT**), a dense DMA sheds its excess — an OA keeps its home-DMA stores only while its zone is at/below its target max, and the over-capacity excess is rebalanced into neighboring/under-capacity zones. Toggling updates the guardrail banner and constraint list; hit **↺ Reset to Initial** to re-run Auto-Assign under the new rule.
- **Keep Areas Together** (checkbox, default on): when checked, the area-split guardrail is enforced and enables the "Area Max Zones" control.
- **Area Max Zones** (select: `1 zone` / `2 zones`): how many zones an Area may span. Displayed value updates the guardrail banner.
- **Balance Iterations** (number, default 10, 0–30): how many rebalancing passes `balanceZones` runs.
- **Target Min** (number, default 150, 100–300): minimum stores per zone.
- **Target Max** (number, default 250, 100–400): maximum stores per zone.
- **Strong OA Bonus** (number, default 40, 0–100): extra capacity added to `Target Max` for zones marked Strong.
- **↺ Reset to Initial** — reloads the original `INITIAL_ZONES_24` assignment (in 50-zone mode, re-runs Auto-Assign).
- **✕ Clear All** — unassigns every store (`storeZone` all `-1`).

### 10.2 26 New Hire Placement Suggestions (50-Zone Plan)
- Table: `#`, `Suggested Base`, `Relieving Zone`, `Est. Stores` for each of the 26 suggested new territories. Live store counts are shown when in 50-zone mode.
- Purpose: decide **which large cities/DMAs to hire in** — each row is a proposed new-hire anchor and the existing zone it relieves.

### 10.3 TBH Zone Locations
- Table of every TBH zone: `Zone`, `OA`, `Lat`, `Lon`, `Assigned` (all editable).
- **🎯 Auto-Place TBH (density centers)** — runs k-means (15 iterations) over all stores to move each TBH anchor to the centroid of its natural store cluster.
- **Apply Locations & Re-run** — commits edited lat/lon, reloads initial assignments (or re-runs Auto-Assign in 50-zone mode), and closes the panel.

### 10.4 DMA & Area Constraints
- **Locked DMAs (OA home)**: green rows showing each OA's home DMA (🔒 locked).
- **DMA Split Status**: yellow ⚡ rows for any DMA whose stores span multiple zones (flagged ⚠️ if it's a locked OA home DMA — a hard violation).
- Toggle a lock on/off from a zone card (🔒/🔓) to allow a specific OA's DMA to be split.

### 10.5 Split Areas
- List of every area currently split across 2+ zones, with `N stores: X in Z1, Y in Z2, ...` counts. Clicking a row opens its area detail. ⚠ DMA conflict hint shown when an area's stores are locked to different DMAs.

### 10.6 Move Suggestions
- **Suggest moves for** dropdown (All Zones or a specific zone).
- **Generate Suggestions** — finds stores in over-capacity zones that are closest to under-capacity zones and lists up to 10 moves per zone, sorted by distance.
- Clicking a suggestion (or its **Move** button) applies it **with guardrail enforcement**: it is blocked if the move would split an Area across more than the allowed zones.

### 10.7 Zone Thresholds
- Per-zone table: `Zone`, `Color` (click the swatch to change the zone's map color), `Max` (effective target incl. Strong bonus), `Strong` (checkbox per OA zone).
- Marking an OA as **Strong** raises its max by the Strong OA Bonus.

---

## 11. Import / Export

- **Import CSV** (`⬆ Import`) — expects `STORE_ID` and `ZONE` columns (zone values are 1-based). Applies assignments in place, skipping unknown stores or invalid zone numbers.
- **Export CSV** (`⬇ Export`) — writes `STORE_ID, ZONE, ZONE_NAME, AREA, DMA, LAT, LON, FRANCHISEE` for every store.

---

## 12. Mode switching (`switchMode`)

- Saves the current mode's live state back into its `MODES[...]` slot so each mode keeps its own assignments.
- **24 → real** assignments load from `INITIAL_ZONES_24`.
- **50 → first entry** runs the full Auto-Assign across all 50 zones; later entries reuse the saved result.
- Mode-specific target min/max and Strong bonus are pushed into the config UI.
- The **26 New Hire table** updates to show live counts in 50-zone mode.

---

## 13. Utility & helpers

- `haversine` — great-circle distance in miles; `distToOA` — store → anchor distance.
- `DRIVE_CAP = 200` (4 hours at 50 mph); remote DMAs (Honolulu/Guam/Anchorage/Fairbanks) are exempt from the cap.
- `zoneCounts`, `getTargetMin`, `getTargetMax` (Strong zones get +bonus), `zoneName`, `zoneOa`.
- Toast notifications + a top progress bar for long operations.
