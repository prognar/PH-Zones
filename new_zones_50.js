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
    "estCount": 39
  },
  {
    "name": "Ruidoso, NM (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 1,
    "parentName": "Desert Southwest",
    "estCount": 53
  },
  {
    "name": "Walton, KY (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 2,
    "parentName": "OH Valley West",
    "estCount": 62
  },
  {
    "name": "Slaton, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 3,
    "parentName": "North Texas",
    "estCount": 27
  },
  {
    "name": "Greenwood, LA (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 3,
    "parentName": "North Texas",
    "estCount": 37
  },
  {
    "name": "Fort Johnson, LA (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 4,
    "parentName": "Houston/SE Texas",
    "estCount": 56
  },
  {
    "name": "College Station, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 4,
    "parentName": "Houston/SE Texas",
    "estCount": 29
  },
  {
    "name": "Pembroke Pines, FL (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 5,
    "parentName": "Florida Gulf",
    "estCount": 75
  },
  {
    "name": "Murphy, NC (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 6,
    "parentName": "Deep South",
    "estCount": 46
  },
  {
    "name": "Perrysburg, OH (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 7,
    "parentName": "OH Valley East",
    "estCount": 120
  },
  {
    "name": "Chester, VA (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 8,
    "parentName": "Carolinas East",
    "estCount": 92
  },
  {
    "name": "Marysville, KS (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 9,
    "parentName": "Central Plains",
    "estCount": 55
  },
  {
    "name": "Fremont, MI (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 10,
    "parentName": "Upper Midwest",
    "estCount": 82
  },
  {
    "name": "Hamilton, MT (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 11,
    "parentName": "Pacific Northwest",
    "estCount": 46
  },
  {
    "name": "Claremont, NH (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 12,
    "parentName": "Northeast Metro",
    "estCount": 57
  },
  {
    "name": "Byhalia, MS (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 13,
    "parentName": "Mid-South",
    "estCount": 69
  },
  {
    "name": "Columbia, MS (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 14,
    "parentName": "Gulf Coast",
    "estCount": 108
  },
  {
    "name": "Afton, WY (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 15,
    "parentName": "Mountain West/Denver",
    "estCount": 61
  },
  {
    "name": "West Wendover, NV (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 16,
    "parentName": "Northern California",
    "estCount": 15
  },
  {
    "name": "Odessa, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 17,
    "parentName": "San Antonio/W Texas",
    "estCount": 22
  },
  {
    "name": "Pampa, TX (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Noel Pelayo",
    "parentZone": 18,
    "parentName": "Oklahoma North",
    "estCount": 42
  },
  {
    "name": "Greenbrier, AR (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 19,
    "parentName": "Missouri/Illinois",
    "estCount": 72
  },
  {
    "name": "Sioux Falls, SD (New)",
    "oa": "TBD - New Hire",
    "region": "West",
    "fop": "Jake Stubblefield",
    "parentZone": 20,
    "parentName": "Northern Plains",
    "estCount": 59
  },
  {
    "name": "Sylvania, GA (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 21,
    "parentName": "Jacksonville/N Florida",
    "estCount": 55
  },
  {
    "name": "Abingdon, VA (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Fern Reyes",
    "parentZone": 22,
    "parentName": "Carolinas West",
    "estCount": 81
  },
  {
    "name": "Silver Spring, MD (New)",
    "oa": "TBD - New Hire",
    "region": "East",
    "fop": "Kelly Sharpe",
    "parentZone": 23,
    "parentName": "Appalachia/PA",
    "estCount": 102
  }
];
const NEW_TBH_LOCS_50 = [
  {
    "name": "Escondido, CA (New)",
    "lat": 33.1915,
    "lon": -116.897
  },
  {
    "name": "Ruidoso, NM (New)",
    "lat": 33.7484,
    "lon": -106.355
  },
  {
    "name": "Walton, KY (New)",
    "lat": 38.6622,
    "lon": -84.335
  },
  {
    "name": "Slaton, TX (New)",
    "lat": 33.3987,
    "lon": -101.7866
  },
  {
    "name": "Greenwood, LA (New)",
    "lat": 32.57,
    "lon": -94.2382
  },
  {
    "name": "Fort Johnson, LA (New)",
    "lat": 31.1885,
    "lon": -92.9557
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
    "name": "Murphy, NC (New)",
    "lat": 35.1191,
    "lon": -84.0998
  },
  {
    "name": "Perrysburg, OH (New)",
    "lat": 41.4849,
    "lon": -83.3854
  },
  {
    "name": "Chester, VA (New)",
    "lat": 37.3424,
    "lon": -77.3648
  },
  {
    "name": "Marysville, KS (New)",
    "lat": 39.8939,
    "lon": -96.7972
  },
  {
    "name": "Fremont, MI (New)",
    "lat": 43.346,
    "lon": -85.8395
  },
  {
    "name": "Hamilton, MT (New)",
    "lat": 46.1256,
    "lon": -115.5989
  },
  {
    "name": "Claremont, NH (New)",
    "lat": 43.5817,
    "lon": -72.094
  },
  {
    "name": "Byhalia, MS (New)",
    "lat": 34.6706,
    "lon": -89.6246
  },
  {
    "name": "Columbia, MS (New)",
    "lat": 31.1563,
    "lon": -89.8544
  },
  {
    "name": "Afton, WY (New)",
    "lat": 43.0093,
    "lon": -109.8957
  },
  {
    "name": "West Wendover, NV (New)",
    "lat": 40.2131,
    "lon": -114.1512
  },
  {
    "name": "Odessa, TX (New)",
    "lat": 31.5427,
    "lon": -101.988
  },
  {
    "name": "Pampa, TX (New)",
    "lat": 35.7759,
    "lon": -100.9079
  },
  {
    "name": "Greenbrier, AR (New)",
    "lat": 35.6559,
    "lon": -92.6364
  },
  {
    "name": "Sioux Falls, SD (New)",
    "lat": 43.6747,
    "lon": -97.2315
  },
  {
    "name": "Sylvania, GA (New)",
    "lat": 32.738,
    "lon": -81.6073
  },
  {
    "name": "Abingdon, VA (New)",
    "lat": 36.5935,
    "lon": -81.9783
  },
  {
    "name": "Silver Spring, MD (New)",
    "lat": 39.1359,
    "lon": -77.1094
  }
];
