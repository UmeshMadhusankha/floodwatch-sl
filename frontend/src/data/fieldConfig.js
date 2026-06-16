// ============================================================
// FloodWatch SL — form field configuration (single source of truth)
//
// Every field keeps its API name (what POST /predict expects).
// The UI shows a friendly label + helper + unit + example placeholder.
// Dropdown options are verified against data/processed/train_dropmissing.csv.
// ============================================================

export const DROPDOWN_OPTIONS = {
  district: [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
    "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
    "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
    "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya",
  ],
  soil_type: ["Sandy", "Silty", "Clay", "Loamy", "Peaty"],
  landcover: ["Agriculture", "Plantation", "Forest", "Scrub", "Wetland", "Urban", "Bare Soil"],
  water_supply: ["Municipal", "Well", "Tube-well", "Surface water", "Rainwater harvesting"],
  road_quality: ["Good (paved)", "Fair", "Poor (unpaved)", "No road access"],
  urban_rural: ["Urban", "Rural"],
  water_presence_flag: ["Likely", "Unlikely"],
  flood_occurrence_current_event: ["No", "Yes"],
  is_good_to_live: ["Yes", "No"],
  reason_not_good_to_live: ["High flood risk", "Poor infrastructure", "No road access", "Other"],
};

// ------------------------------------------------------------
// Sections (9) — drives both the Expert stepper and field rendering.
// icon = lucide-react icon name (resolved in the component).
// ------------------------------------------------------------
export const SECTIONS = [
  {
    id: "location",
    title: "Location & Identity",
    icon: "MapPin",
    fields: [
      { name: "record_id", label: "Record ID", helper: "Optional — leave blank to auto-generate.", type: "text", placeholder: "e.g., F104559" },
      { name: "district", label: "District", helper: "Administrative district.", type: "select", options: DROPDOWN_OPTIONS.district, required: true },
      { name: "place_name", label: "Place / Village Name", helper: "Optional local name for the location.", type: "text", placeholder: "e.g., Kudakumbura South" },
      { name: "latitude", label: "Latitude", helper: "Decimal degrees. Sri Lanka spans about 5.9 to 9.9.", unit: "°", type: "number", step: "0.0001", placeholder: "e.g., 7.29", required: true },
      { name: "longitude", label: "Longitude", helper: "Decimal degrees. Sri Lanka spans about 79.6 to 81.9.", unit: "°", type: "number", step: "0.0001", placeholder: "e.g., 80.63", required: true },
    ],
  },
  {
    id: "geographic",
    title: "Geographic & Terrain",
    icon: "Mountain",
    fields: [
      { name: "elevation_m", label: "Elevation", helper: "Height above sea level.", unit: "m", type: "number", step: "0.1", placeholder: "e.g., 50" },
      { name: "distance_to_river_m", label: "Distance to Nearest River", helper: "Straight-line distance to the closest river.", unit: "m", type: "number", step: "0.1", placeholder: "e.g., 1200" },
      { name: "landcover", label: "Land Cover Type", helper: "Dominant land use around the location.", type: "select", options: DROPDOWN_OPTIONS.landcover },
      { name: "soil_type", label: "Soil Type", helper: "Predominant soil at the location.", type: "select", options: DROPDOWN_OPTIONS.soil_type },
      { name: "inundation_area_sqm", label: "Nearest Flood-Prone Area", helper: "Size of the nearest historically flood-prone zone in square metres.", unit: "m²", type: "number", step: "0.1", placeholder: "e.g., 5000" },
    ],
  },
  {
    id: "vegetation",
    title: "Vegetation & Water",
    icon: "Leaf",
    fields: [
      { name: "ndvi", label: "Vegetation Density (NDVI)", helper: "Satellite-measured vegetation index from -1 (no plants) to 1 (dense forest). Typical Sri Lanka values: 0.2 to 0.7.", type: "number", step: "0.01", min: "-1", max: "1", placeholder: "e.g., 0.45" },
      { name: "ndwi", label: "Surface Water Index (NDWI)", helper: "Satellite-measured water presence from -1 (dry) to 1 (open water). Negative values are normal for inland areas.", type: "number", step: "0.01", min: "-1", max: "1", placeholder: "e.g., -0.1" },
      { name: "water_presence_flag", label: "Standing Water Nearby?", helper: "Whether surface water is typically present nearby.", type: "select", options: DROPDOWN_OPTIONS.water_presence_flag },
    ],
  },
  {
    id: "rainfall",
    title: "Rainfall",
    icon: "CloudRain",
    fields: [
      { name: "rainfall_7d_mm", label: "Last 7 Days Rainfall", helper: "Total rainfall over the past week.", unit: "mm", type: "number", step: "0.1", placeholder: "e.g., 50", required: true },
      { name: "monthly_rainfall_mm", label: "This Month's Rainfall", helper: "Total rainfall so far this month.", unit: "mm", type: "number", step: "0.1", placeholder: "e.g., 180" },
    ],
  },
  {
    id: "population",
    title: "Population & Infrastructure",
    icon: "Building2",
    fields: [
      { name: "population_density_per_km2", label: "Population Density", helper: "Number of residents per square kilometre.", unit: "people/km²", type: "number", step: "0.1", placeholder: "e.g., 500" },
      { name: "water_supply", label: "Main Water Supply", helper: "Primary source of water for the area.", type: "select", options: DROPDOWN_OPTIONS.water_supply },
      { name: "road_quality", label: "Road Access Quality", helper: "Quality of road access to the location.", type: "select", options: DROPDOWN_OPTIONS.road_quality },
      { name: "infrastructure_score", label: "Infrastructure Quality", helper: "Overall infrastructure rating from 0 to 100; higher is better.", unit: "0–100", type: "number", step: "0.1", min: "0", max: "100", placeholder: "e.g., 60" },
      { name: "urban_rural", label: "Area Type", helper: "Whether the area is urban or rural.", type: "select", options: DROPDOWN_OPTIONS.urban_rural },
    ],
  },
  {
    id: "proximity",
    title: "Proximity Services",
    icon: "Hospital",
    fields: [
      { name: "nearest_hospital_km", label: "Nearest Hospital", helper: "Distance to the closest hospital.", unit: "km", type: "number", step: "0.1", placeholder: "e.g., 8" },
      { name: "nearest_evac_km", label: "Nearest Evacuation Centre", helper: "Distance to the closest evacuation point.", unit: "km", type: "number", step: "0.1", placeholder: "e.g., 12" },
    ],
  },
  {
    id: "indices",
    title: "Risk Indices",
    icon: "Activity",
    fields: [
      { name: "terrain_roughness_index", label: "Terrain Roughness", helper: "How uneven the terrain is; higher means rougher ground.", type: "number", step: "0.01", placeholder: "e.g., 0.5" },
      { name: "socioeconomic_status_index", label: "Socioeconomic Status", helper: "Relative economic wellbeing from 0 to 1; higher is better off.", unit: "0–1", type: "number", step: "0.01", min: "0", max: "1", placeholder: "e.g., 0.5" },
      { name: "extreme_weather_index", label: "Extreme Weather Exposure", helper: "Likelihood of extreme weather events from 0 to 1.", unit: "0–1", type: "number", step: "0.01", min: "0", max: "1", placeholder: "e.g., 0.6" },
      { name: "seasonal_index", label: "Seasonal Rainfall Factor", helper: "Adjusts for monsoon season intensity.", type: "number", step: "0.01", placeholder: "e.g., 0.4" },
    ],
  },
  {
    id: "history",
    title: "Flood History & Status",
    icon: "History",
    fields: [
      { name: "historical_flood_count", label: "Past Flood Events", helper: "Number of recorded floods at this location.", unit: "count", type: "number", step: "1", min: "0", placeholder: "e.g., 2" },
      { name: "flood_occurrence_current_event", label: "Flooding Right Now?", helper: "Is the location currently flooding?", type: "select", options: DROPDOWN_OPTIONS.flood_occurrence_current_event },
      { name: "is_good_to_live", label: "Generally Habitable?", helper: "Is the location generally considered habitable?", type: "select", options: DROPDOWN_OPTIONS.is_good_to_live },
      { name: "reason_not_good_to_live", label: "Main Concern (if any)", helper: "Primary reason the area may be unsuitable.", type: "select", options: DROPDOWN_OPTIONS.reason_not_good_to_live },
    ],
  },
  {
    id: "metadata",
    title: "Metadata",
    icon: "FileText",
    fields: [
      { name: "generation_date", label: "Assessment Date", helper: "Date this assessment was recorded.", type: "date" },
      { name: "is_synthetic", label: "Synthetic / Test Record", helper: "Tick only if this is test data, not a real assessment.", type: "checkbox" },
      { name: "built_up_percent", label: "Built-up Land", helper: "Share of land covered by buildings or pavement.", unit: "%", type: "number", step: "0.1", min: "0", max: "100", placeholder: "e.g., 30" },
    ],
  },
];

// Flat lookup: name -> field config
export const FIELDS = SECTIONS.reduce((acc, section) => {
  section.fields.forEach((f) => {
    acc[f.name] = f;
  });
  return acc;
}, {});

// The fields visible in Quick Mode. These are the highest-signal inputs
// (verified via ensemble feature importance + score sensitivity) plus the
// identity/location fields. Everything else falls back to district defaults.
// Order = display order in the form.
export const QUICK_FIELDS = [
  "district",            // model's #1 feature
  "place_name",
  "latitude",
  "longitude",
  "rainfall_7d_mm",      // good leverage
  "monthly_rainfall_mm",
  "distance_to_river_m", // strong leverage (feeds 3 engineered features)
  "inundation_area_sqm", // strong leverage (feeds 3 engineered features)
  "road_quality",        // moderate categorical signal
  "water_presence_flag", // moderate categorical signal
];

// ------------------------------------------------------------
// BASE_DEFAULTS — a complete, safe value for every API field so a
// record is always fully populated regardless of which mode is used
// or how complete district_defaults.json is.
// Categorical defaults use the first valid training option.
// ------------------------------------------------------------
export const BASE_DEFAULTS = {
  record_id: "",
  district: "",
  place_name: "",
  latitude: "",
  longitude: "",
  elevation_m: "",
  distance_to_river_m: "",
  landcover: "Agriculture",
  soil_type: "Sandy",
  inundation_area_sqm: "",
  ndvi: "",
  ndwi: "",
  water_presence_flag: "Unlikely",
  rainfall_7d_mm: "",
  monthly_rainfall_mm: "",
  population_density_per_km2: "",
  water_supply: "Municipal",
  road_quality: "Fair",
  infrastructure_score: "",
  urban_rural: "Rural",
  nearest_hospital_km: "",
  nearest_evac_km: "",
  terrain_roughness_index: "",
  socioeconomic_status_index: "",
  extreme_weather_index: "",
  seasonal_index: "",
  historical_flood_count: "",
  flood_occurrence_current_event: "No",
  is_good_to_live: "Yes",
  reason_not_good_to_live: "Other",
  generation_date: new Date().toISOString().split("T")[0],
  is_synthetic: false,
  built_up_percent: "",
};

// Numeric API fields — used to coerce string inputs to numbers before POST.
export const NUMERIC_FIELDS = [
  "latitude", "longitude", "elevation_m", "distance_to_river_m", "inundation_area_sqm",
  "ndvi", "ndwi", "rainfall_7d_mm", "monthly_rainfall_mm", "population_density_per_km2",
  "infrastructure_score", "nearest_hospital_km", "nearest_evac_km", "terrain_roughness_index",
  "socioeconomic_status_index", "extreme_weather_index", "seasonal_index",
  "historical_flood_count", "built_up_percent",
];
