import redImg from "./assets/red.png";
import redcircle from "./assets/Enemies/redcircle.jpg";

//checkOverlap
function checkOverlap(x, y, layer) {
  var tile = layer.tilemap.getTileAtWorldXY(x + 8, y + 8);
  return tile !== null;
}

function checkOverlap2(spriteA, spriteB) {
  var boundsA = spriteA.getBounds();
  var boundsB = spriteB.getBounds();
  var r = Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB);
  if (r.width == 0 && r.height == 0) {
    return false;
  }
  else {
    return true;
  }
}

function checkOverlap3(x, y, x2, y2) {
  var boundsA = new Phaser.Geom.Rectangle(x, y, 32, 32);
  var boundsB = new Phaser.Geom.Rectangle(x2, y2, 32, 32);
  var result = Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB);
  return !(result.width == 0 && result.height == 0);
}

function checkOverlap4(x, y, x2, y2) {
  var boundsA = new Phaser.Geom.Rectangle(x, y, 224, 32);
  var boundsB = new Phaser.Geom.Rectangle(x2, y2, 224, 32);
  var result = Phaser.Geom.Intersects.GetRectangleIntersection(boundsA, boundsB);
  return !(result.width == 0 && result.height == 0);
}


//redcircleobject

let redcircleobject = {};
redcircleobject.sprite = null;
/*let redcircleobject = {
  get sprite(){
    return this._sprite;
  },
  set sprite(value){
    this._sprite = value;
  }
};*/
//export {redcircleobject};

//redcircletimer

let redcircletimer = {
  get timer() {
    return this._timer;
  },
  set timer(value) {
    this._timer = value;
  }
};

//array
let mapdata_array = Array.from({ length: 40 }, () =>
  Array.from({ length: 40 }, () => null)
);

const SQUARE_SIZE = 32;

const globals = {
  mapdata_array,
  checkOverlap,
  checkOverlap2,
  checkOverlap3,
  checkOverlap4,
  redcircletimer,
  redcircleobject,
  SQUARE_SIZE
}

export default globals;