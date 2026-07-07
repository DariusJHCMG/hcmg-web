const topojson = require('topojson-client');
const us = require('us-atlas/states-albers-10m.json');

const fipsToAbbr = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT',
  '10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL',
  '18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD',
  '25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE',
  '32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND',
  '39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD',
  '47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV',
  '55':'WI','56':'WY'
};

function getBbox(geom) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  function processRings(rings) {
    for (const ring of rings) {
      for (const [x, y] of ring) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (geom.type === 'Polygon') processRings(geom.coordinates);
  else if (geom.type === 'MultiPolygon') {
    // Use the largest polygon (by bbox area) for centroid
    let bestArea = 0;
    let bestRings = geom.coordinates[0];
    for (const poly of geom.coordinates) {
      let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
      for (const ring of poly) {
        for (const [x, y] of ring) {
          if (x < pMinX) pMinX = x;
          if (x > pMaxX) pMaxX = x;
          if (y < pMinY) pMinY = y;
          if (y > pMaxY) pMaxY = y;
        }
      }
      const area = (pMaxX - pMinX) * (pMaxY - pMinY);
      if (area > bestArea) { bestArea = area; bestRings = poly; }
    }
    processRings(bestRings);
  }
  return { minX, maxX, minY, maxY, cx: (minX+maxX)/2, cy: (minY+maxY)/2 };
}

const geo = topojson.feature(us, us.objects.states);
const results = {};
for (const f of geo.features) {
  const abbr = fipsToAbbr[f.id];
  if (!abbr) continue;
  const bbox = getBbox(f.geometry);
  results[abbr] = [Math.round(bbox.cx), Math.round(bbox.cy)];
}

// Print as TS object
const sorted = Object.entries(results).sort(([a],[b]) => a.localeCompare(b));
let out = '  ';
sorted.forEach(([abbr, [cx, cy]], i) => {
  out += `${abbr}:[${cx},${cy}]`;
  if (i < sorted.length - 1) out += ', ';
  if ((i+1) % 5 === 0) out += '\n  ';
});
console.log(out);
