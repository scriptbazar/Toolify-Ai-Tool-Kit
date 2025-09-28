
export const unitData = {
  length: {
    name: 'Length',
    units: [
      { value: 'm', label: 'Meter (m)' },
      { value: 'km', label: 'Kilometer (km)' },
      { value: 'cm', label: 'Centimeter (cm)' },
      { value: 'mm', label: 'Millimeter (mm)' },
      { value: 'mi', label: 'Mile (mi)' },
      { value: 'ft', label: 'Foot (ft)' },
      { value: 'in', label: 'Inch (in)' },
      { value: 'yd', label: 'Yard (yd)' },
      { value: 'nm', label: 'Nanometer (nm)' },
    ],
    factors: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, in: 0.0254, yd: 0.9144, nm: 1e-9 },
  },
  mass: {
    name: 'Mass',
    units: [
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 'g', label: 'Gram (g)' },
      { value: 'mg', label: 'Milligram (mg)' },
      { value: 'lb', label: 'Pound (lb)' },
      { value: 'oz', label: 'Ounce (oz)' },
      { value: 't', label: 'Tonne (t)' },
      { value: 'st', label: 'Stone (st)' },
    ],
    factors: { kg: 1, g: 0.001, mg: 1e-6, lb: 0.453592, oz: 0.0283495, t: 1000, st: 6.35029 },
  },
  temperature: {
    name: 'Temperature',
    units: [
      { value: 'Celsius', label: 'Celsius (°C)' },
      { value: 'Fahrenheit', label: 'Fahrenheit (°F)' },
      { value: 'Kelvin', label: 'Kelvin (K)' },
    ],
    factors: {}, // Special handling
  },
  area: {
    name: 'Area',
    units: [
      { value: 'sqm', label: 'Square Meter (m²)' },
      { value: 'sqkm', label: 'Square Kilometer (km²)' },
      { value: 'sqcm', label: 'Square Centimeter (cm²)' },
      { value: 'sqmi', label: 'Square Mile (mi²)' },
      { value: 'sqft', label: 'Square Foot (ft²)' },
      { value: 'acre', label: 'Acre' },
      { value: 'ha', label: 'Hectare (ha)' },
    ],
    factors: { sqm: 1, sqkm: 1e6, sqcm: 1e-4, sqmi: 2.59e6, sqft: 0.092903, acre: 4046.86, ha: 10000 },
  },
  volume: {
    name: 'Volume',
    units: [
      { value: 'l', label: 'Liter (l)' },
      { value: 'ml', label: 'Milliliter (ml)' },
      { value: 'cubic-m', label: 'Cubic Meter (m³)' },
      { value: 'cubic-cm', label: 'Cubic Centimeter (cm³)' },
      { value: 'gal', label: 'Gallon (US)' },
      { value: 'qt', label: 'Quart (US)' },
      { value: 'pt', label: 'Pint (US)' },
      { value: 'cup', label: 'Cup (US)' },
    ],
    factors: { l: 1, ml: 0.001, 'cubic-m': 1000, 'cubic-cm': 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588 },
  },
  speed: {
    name: 'Speed',
    units: [
      { value: 'm/s', label: 'Meter/second (m/s)' },
      { value: 'km/h', label: 'Kilometer/hour (km/h)' },
      { value: 'mph', label: 'Miles/hour (mph)' },
      { value: 'knot', label: 'Knot' },
    ],
    factors: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444 },
  },
  time: {
    name: 'Time',
    units: [
      { value: 's', label: 'Second (s)' },
      { value: 'ms', label: 'Millisecond (ms)' },
      { value: 'min', label: 'Minute (min)' },
      { value: 'hr', label: 'Hour (hr)' },
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
    ],
    factors: { s: 1, ms: 0.001, min: 60, hr: 3600, day: 86400, week: 604800 },
  },
  data: {
    name: 'Data Storage',
    units: [
      { value: 'B', label: 'Byte (B)' },
      { value: 'KB', label: 'Kilobyte (KB)' },
      { value: 'MB', label: 'Megabyte (MB)' },
      { value: 'GB', label: 'Gigabyte (GB)' },
      { value: 'TB', label: 'Terabyte (TB)' },
      { value: 'PB', label: 'Petabyte (PB)' },
    ],
    factors: { B: 1, KB: 1024, MB: 1024**2, GB: 1024**3, TB: 1024**4, PB: 1024**5 },
  },
};
