// Auto-generated suggestions for 26 new zones (splits of the 24 existing zones)
// Derived by proportionally splitting each existing zone's current store count
// (target ~94 stores/zone at 50 total) and running k-means on that zone's stores
// to find a sensible new territory center. Excludes remote outlier stores
// (Honolulu/Guam/Anchorage/Fairbanks) from anchor placement since those are
// drive-cap-exempt and shouldn't force their own single-purpose zone.
const NEW_ZONE_DEFS_50 = [
  {
    "name": "Escondido, CA (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 0,
    "parentName": "Southern California",
    "estCount": 101
  },
  {
    "name": "Albuquerque, NM (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 1,
    "parentName": "Desert Southwest",
    "estCount": 42
  },
  {
    "name": "Cincinnati, OH (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 2,
    "parentName": "OH Valley West",
    "estCount": 114
  },
  {
    "name": "Lubbock, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 3,
    "parentName": "North Texas",
    "estCount": 36
  },
  {
    "name": "Shreveport, LA (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 3,
    "parentName": "North Texas",
    "estCount": 85
  },
  {
    "name": "Alexandria, LA (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 4,
    "parentName": "Houston/SE Texas",
    "estCount": 74
  },
  {
    "name": "College Station, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 4,
    "parentName": "Houston/SE Texas",
    "estCount": 89
  },
  {
    "name": "Pembroke Pines, FL (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 5,
    "parentName": "Florida Gulf",
    "estCount": 80
  },
  {
    "name": "Knoxville, TN (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 6,
    "parentName": "Deep South",
    "estCount": 71
  },
  {
    "name": "Toledo, OH (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 7,
    "parentName": "OH Valley East",
    "estCount": 112
  },
  {
    "name": "Richmond, VA (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 8,
    "parentName": "Carolinas East",
    "estCount": 103
  },
  {
    "name": "Wichita, KS (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 9,
    "parentName": "Central Plains",
    "estCount": 96
  },
  {
    "name": "Grand Rapids, MI (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 10,
    "parentName": "Upper Midwest",
    "estCount": 113
  },
  {
    "name": "Spokane, WA (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 11,
    "parentName": "Pacific Northwest",
    "estCount": 74
  },
  {
    "name": "Albany, NY (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 12,
    "parentName": "Northeast Metro",
    "estCount": 97
  },
  {
    "name": "Memphis, TN (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 13,
    "parentName": "Mid-South",
    "estCount": 84
  },
  {
    "name": "New Orleans, LA (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 14,
    "parentName": "Gulf Coast",
    "estCount": 72
  },
  {
    "name": "Cheyenne, WY (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 15,
    "parentName": "Mountain West/Denver",
    "estCount": 70
  },
  {
    "name": "Las Vegas, NV (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 16,
    "parentName": "Northern California",
    "estCount": 67
  },
  {
    "name": "Odessa, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 17,
    "parentName": "San Antonio/W Texas",
    "estCount": 70
  },
  {
    "name": "Amarillo, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 18,
    "parentName": "Oklahoma North",
    "estCount": 43
  },
  {
    "name": "Little Rock, AR (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 19,
    "parentName": "Missouri/Illinois",
    "estCount": 95
  },
  {
    "name": "Sioux Falls, SD (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 20,
    "parentName": "Northern Plains",
    "estCount": 85
  },
  {
    "name": "Savannah, GA (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 21,
    "parentName": "Jacksonville/N Florida",
    "estCount": 71
  },
  {
    "name": "Bristol, TN (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 22,
    "parentName": "Carolinas West",
    "estCount": 76
  },
  {
    "name": "Silver Spring, MD (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 23,
    "parentName": "Appalachia/PA",
    "estCount": 115
  }
];
const NEW_TBH_LOCS_50 = [
  {
    "name": "Escondido, CA (New)",
    "lat": 33.1915,
    "lon": -116.897
  },
  {
    "name": "Albuquerque, NM (New)",
    "lat": 35.0844,
    "lon": -106.6504
  },
  {
    "name": "Cincinnati, OH (New)",
    "lat": 39.1031,
    "lon": -84.512
  },
  {
    "name": "Lubbock, TX (New)",
    "lat": 33.5779,
    "lon": -101.8552
  },
  {
    "name": "Shreveport, LA (New)",
    "lat": 32.5252,
    "lon": -93.7502
  },
  {
    "name": "Alexandria, LA (New)",
    "lat": 31.3113,
    "lon": -92.4451
  },
  {
    "name": "College Station, TX (New)",
    "lat": 30.5953,
    "lon": -96.08
  },
  {
    "name": "Pembroke Pines, FL (New)",
    "lat": 26.1406,
    "lon": -80.538
  },
  {
    "name": "Knoxville, TN (New)",
    "lat": 35.9606,
    "lon": -83.9207
  },
  {
    "name": "Toledo, OH (New)",
    "lat": 41.6528,
    "lon": -83.5379
  },
  {
    "name": "Richmond, VA (New)",
    "lat": 37.5407,
    "lon": -77.436
  },
  {
    "name": "Wichita, KS (New)",
    "lat": 37.6872,
    "lon": -97.3301
  },
  {
    "name": "Grand Rapids, MI (New)",
    "lat": 42.9634,
    "lon": -85.6681
  },
  {
    "name": "Spokane, WA (New)",
    "lat": 47.6588,
    "lon": -117.426
  },
  {
    "name": "Albany, NY (New)",
    "lat": 42.6526,
    "lon": -73.7562
  },
  {
    "name": "Memphis, TN (New)",
    "lat": 35.1495,
    "lon": -90.049
  },
  {
    "name": "New Orleans, LA (New)",
    "lat": 29.9511,
    "lon": -90.0715
  },
  {
    "name": "Cheyenne, WY (New)",
    "lat": 41.14,
    "lon": -104.8202
  },
  {
    "name": "Las Vegas, NV (New)",
    "lat": 36.1699,
    "lon": -115.1398
  },
  {
    "name": "Odessa, TX (New)",
    "lat": 31.5427,
    "lon": -101.988
  },
  {
    "name": "Amarillo, TX (New)",
    "lat": 35.222,
    "lon": -101.8313
  },
  {
    "name": "Little Rock, AR (New)",
    "lat": 34.7465,
    "lon": -92.2896
  },
  {
    "name": "Sioux Falls, SD (New)",
    "lat": 43.6747,
    "lon": -97.2315
  },
  {
    "name": "Savannah, GA (New)",
    "lat": 32.0809,
    "lon": -81.0912
  },
  {
    "name": "Bristol, TN (New)",
    "lat": 36.5951,
    "lon": -82.1887
  },
  {
    "name": "Silver Spring, MD (New)",
    "lat": 39.1359,
    "lon": -77.1094
  }
];
