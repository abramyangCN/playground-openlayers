import 'ol/ol.css';
import { Feature, Map, View } from 'ol';
import { Vector } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { fromExtent } from 'ol/geom/Polygon';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { add } from 'ol/coordinate';
import { Draw, Select } from 'ol/interaction';
import { Fill, Stroke, Style, Icon, Circle } from 'ol/style';
import { Geometry, Polygon } from 'ol/geom';
import GridReference from 'ol-ext/control/GridReference';
import { GeoJSON } from 'ol/format';
import ExtentInteraction from 'ol/interaction/Extent';
import { createBox } from 'ol/interaction/Draw';
import { shiftKeyOnly } from 'ol/events/condition';
import MousePosition from 'ol/control/MousePosition';

import { getArea } from 'ol/extent';

let fill = new Fill({
  color: 'rgba(255,255,255,0.4)',
});
let stroke = new Stroke({
  color: '#3399CC',
  width: 1.25,
});
let styles = [
  new Style({
    image: new Circle({
      fill: fill,
      stroke: stroke,
      radius: 5,
    }),
    fill: fill,
    stroke: stroke,
  }),
];

let source = new Vector({ wrapX: false });

let drawnVector = new VectorLayer({
  source: source,
});

let map = new Map({
  layers: [new TileLayer({ source: new OSM() }), drawnVector],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
  target: 'map',
});

let draw = new Draw({
  source: drawnVector.getSource(),
  type: 'Circle',
  geometryFunction: createBox(),
});

map.addInteraction(draw);

draw.on('drawend', (e) => {
  // console.log(draw.getOverlay().getExtent());
  // window.drawLayer = draw;

  console.log(e.feature.getGeometry().getExtent());

  renderFrames(e.feature.getGeometry().getExtent(), 1 / 5);
});

const renderFrames = (extent, ratio) => {
  let intRatio = Math.floor(1 / ratio) - 1;

  let [leftBottomCoor, rightTopCoor] = [
    [extent[0], extent[1]],
    [extent[2], extent[3]],
  ];

  let [initLBCoor, initRTCoor] = [leftBottomCoor, rightTopCoor];
  let [initlb0, initlb1] = [...leftBottomCoor];
  let [initrt0, initrt1] = [...rightTopCoor];

  let edges = {
    initLBCoor: leftBottomCoor,
    initRTCoor: rightTopCoor,
  };

  let { offsetx, offsety, intRatioDup, isLandscape } = getParams(
    leftBottomCoor,
    rightTopCoor,
    intRatio
  );

  for (let i = 0; i <= (isLandscape ? intRatioDup : intRatio - 1); ++i) {
    for (let j = 0; j <= (isLandscape ? intRatio - 1 : intRatioDup); j++) {
      let lbCoor = [initlb0 + j * offsetx, initlb1 + i * offsety];
      let rtCoor = [
        initlb0 + (j + 1) * offsetx,
        initlb1 + (i + 1) * offsety,
      ].map((c, i) => (c > initRTCoor[i] ? initRTCoor[i] : c));
      let coors = [lbCoor, rtCoor];
      createFrame(lbCoor, rtCoor);
    }
  }
};

const createFrame = (leftBottomCoor, rightTopCoor) => {
  let newExtent = [...leftBottomCoor, ...rightTopCoor];
  let newPolygon = fromExtent(newExtent);
  let newFeature = new Feature({
    geometry: newPolygon,
  });
  source.addFeature(newFeature);
};

const getParams = (leftBottomCoor, rightTopCoor, intRatio) => {
  let [lb0, lb1] = [...leftBottomCoor];
  let [rt0, rt1] = [...rightTopCoor];
  let sides = [rt0 - lb0, rt1 - lb1];
  let isLandscape = sides[0] > sides[1];
  let side = isLandscape ? sides[0] : sides[1];
  let offsetS = side / intRatio;
  let OffsetL = offsetS * 1.414;
  let [offsetx, offsety] = [
    isLandscape ? OffsetL : offsetS,
    isLandscape ? offsetS : OffsetL,
  ];
  let intRatioDup = Math.floor(
    (isLandscape ? sides[1] : sides[0]) / (isLandscape ? offsetS : OffsetL)
  );
  return {
    intRatioDup,
    isLandscape,
    offsetx,
    offsety,
  };
};

const addFrame = (leftBottomCoor, rightTopCoor) => {};
