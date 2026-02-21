//route_listにアクセスできてない。mapdata[p.y][p.x]がunavailableに。
//add_aroundの値。x = 20, y = 40とかいうことになってる
//p.x,p.yが小さすぎる
//Search関数をはじめとする処理で適切な座標を得て処理を進めているかを継続してチェック
//depthに正しい値が入ってきていない
//候補リストの中から、消すべきでないタイミングで値を消している
//探索のスタートは相手、ゴールは自分　route.listにその結果が出るように
//route.list内など、方向性が未統一。ちゃんとデータを使えていない可能性。
//ゲームが始まった時にpositionが来てない
//searchのwhile文を書き換える。今は無限ループ。
//↑for文にする。ループの中で最小距離が出た場合、比較した古い最小距離に当たるexplore.listの項目を撤去する。
//ここで最後、explore.listが空にならないと外側のwhileが終了しない
//330行目あたりで、listed.fやp.fの比較がうまくいっていない。if文がいつもfalseを出力している。
//335,336をtrueにしたい
//moveが一回しか呼ばれていない
//add_aroundの結果が2回目以降変化していない
//trace_listが変化していないので、探索が2回目以降行われていない(search)
//explore_listへの追加がうまく行われていない、追跡が継続できない
//npm start の状態で起動してからlaunch.jsonの状態で起動
//一個前の自分の座標をtrace.list（すでに行った場所の記録）に入れて、反復運動をしないようにしたい。animalclassのコンストラクター、this.animalpastlocationより。

//障害物を認識できていない可能性がある。checkoverlapを緩めてみると変わるかも。
//failcountを行う機能が余計。
//route_list（最終的に行く道）の中に、障害物を通るルートが含まれている。


import Phaser from "phaser";
import globals from "./global.js";
import gameMap from "./assets/gamemap.json";

const {
  mapdata_array,
  checkOverlap,
  checkOverlap2,
  checkOverlap3,
  checkOverlap4,
  redcircletimer,
  redcircleobject,
  SQUARE_SIZE
} = globals;

function getdistance(x, y, animalx, animaly) {
  var xdistance = x - animalx;
  var ydistance = y - animaly;
  var distance = Math.sqrt(xdistance ** 2 + ydistance ** 2);
  return distance;
}

class position {
  constructor(my_x, my_y, animal_x, animal_y, depth = 0, parent_x = -1, parent_y = -1) {
    this.my_x = my_x
    this.my_y = my_y
    this.animal_x = animal_x
    this.animal_y = animal_y
    this.depth = depth;
    this.parent_x = parent_x;
    this.parent_y = parent_y;
    this.g = depth;
    this.h = 0;
    this.f = this.g + this.h;
    
  }
  cal_cost() {
    this.g = this.depth;
    this.h = getdistance(this.my_x, this.my_y, this.animal_x, this.animal_y);
    this.f = this.g + this.h
  }

  add_around() {
    var x = this.animal_x;
    var y = this.animal_y;
    var leftflag = true;
    var rightflag = true;
    var upflag = true;
    var downflag = true;
    if (x <= 1) {
      leftflag = false;
    }
    if (x >= 62) {
      rightflag = false;
    }
    if (y <= 1) {
      upflag = false;
    }
    if (y >= 38) {
      downflag = false;
    }
    var depth = this.depth;
    //var animal = this.animal;
    var around_list = [];

    if (leftflag == true) {
      var left_pos = new position(this.my_x, this.my_y, x - 1, y, depth + 1, x, y);
      left_pos.cal_cost();
      around_list.push(left_pos);
    }
    if (rightflag == true) {
      var right_pos = new position(this.my_x, this.my_y, x + 1, y, depth + 1, x, y);
      right_pos.cal_cost();
      around_list.push(right_pos);
    }
    if (upflag == true) {
      var up_pos = new position(this.my_x, this.my_y, x, y - 1, depth + 1, x, y);
      up_pos.cal_cost();
      around_list.push(up_pos);
    }
    if (downflag == true) {
      var down_pos = new position(this.my_x, this.my_y, x, y + 1, depth + 1, x, y);
      down_pos.cal_cost();
      around_list.push(down_pos);
    }
    return around_list;
  }
}

class Animal {
  constructor(o) {
    this.animal = o;
    this.failcountx = 0;
    this.failcounty = 0;
    this.position = undefined;
    this.animalspeed = 1;
    this.pastlocationx = 0;
    this.pastlocationy = 0;
    //this.animalpastlocation = (0,0);
  }
  checkOverlap(x, y, layer) {
    var tile = layer.tilemap.getTileAtWorldXY(x + 8, y + 8);
    return tile !== null;
  }

  getdistance(x, y, animalx, animaly) {
    var xdistance = x - animalx;
    var ydistance = y - animaly;
    var distance = Math.sqrt(xdistance ** 2 + ydistance ** 2);
    return distance;
  }

  nextposition(x, y, direction, array) {

    //direction 1=左　2=上　3=右　4=下
    var _x = Math.floor(x / SQUARE_SIZE);
    var _y = Math.floor(y / SQUARE_SIZE);
    var animal_x = Math.floor(this.animal.x / SQUARE_SIZE);
    var animal_y = Math.floor(this.animal.y / SQUARE_SIZE);
    var left = 10000;
    var up = 10000;
    var right = 10000;
    var down = 10000;
    var first = false;
    if (direction == undefined) {
      first = true;
    };
    if (first || (direction !== 3 && array[animal_x - 1][animal_y] < 100)) {
      left = getdistance(_x, _y, animal_x - 1, animal_y);
    };
    if (first || (direction !== 4 && array[animal_x][animal_y - 1] < 100)) {
      up = getdistance(_x, _y, animal_x, animal_y - 1);
    };
    if (first || (direction !== 1 && array[animal_x + 1][animal_y] < 100)) {
      right = getdistance(_x, _y, animal_x + 1, animal_y);
    };
    if (first || (direction !== 2 && array[animal_x][animal_y + 1] < 100)) {
      down = getdistance(_x, _y, animal_x, animal_y + 1);
    };
    var shortestdistance = 0
    let minValue = Math.min(left, up, right, down);

    //shortestdistanceでまとめられる
    if (minValue == left) {
      shortestdistance = 1;
    }
    if (minValue == up) {
      shortestdistance = 2;
    }
    if (minValue == right) {
      shortestdistance = 3;
    }
    if (minValue == down) {
      shortestdistance = 4;
    }
    return shortestdistance;
  }

  movingleft(layers) {
    if (this.checkOverlap(this.animal.x - 24, this.animal.y, layers)) {
      this.failcountx = this.failcountx + 1;
      if (this.failcountx >= 50) {
        this.movingdown(layers);
      }
    } else {
      this.animal.x = this.animal.x - this.animalspeed;
      sleep(100);
      this.failcountx = 0;
    }
  }
  movingright(layers) {
    if (this.checkOverlap(this.animal.x + 24, this.animal.y, layers)) {
      this.failcountx = this.failcountx + 1;
      if (this.failcountx >= 50) {
        this.movingup(layers);
      }
    } else {
      this.animal.x = this.animal.x + this.animalspeed;
      sleep(100);
      this.failcountx = 0;
    }
  }
  movingup(layers) {
    if (this.checkOverlap(this.animal.x, this.animal.y - 24, layers)) {
      this.failcounty = this.failcounty + 1;
      if (this.failcounty >= 50) {
        this.movingleft(layers);
      }
    } else {

      this.animal.y = this.animal.y - this.animalspeed;
      sleep(100);
      this.failcounty = 0;
    }
  }

  movingdown(layers) {
    if (this.checkOverlap(this.animal.x, this.animal.y + 24, layers)) {
      this.failcounty = this.failcounty + 1;
      if (this.failcounty >= 1) {
        this.movingright(layers);
      }
    } else {
      //sleep(1000);
      this.animal.y = this.animal.y + this.animalspeed;
      sleep(100);
      this.failcounty = 0;
    }
  }

  move(player, layers) {
    if (this.position[0].length <= 0) {
      return;
    }
    var route_list = this.position[0];
    var animal_x = route_list[route_list.length - 1].animal_x;
    var animal_y = route_list[route_list.length - 1].animal_y;
    var currentanimal_x = Math.floor(this.animal.x / SQUARE_SIZE);
    var currentanimal_y = Math.floor(this.animal.y / SQUARE_SIZE);
    if (currentanimal_x == animal_x && currentanimal_y == animal_y){ 
    }
    else if (currentanimal_x == animal_x && currentanimal_y < animal_y) {
      this.movingdown(layers);
    }
    else if (currentanimal_x == animal_x && currentanimal_y > animal_y) {
      this.movingup(layers);
    }
    else if (currentanimal_x < animal_x && currentanimal_y == animal_y) {
      this.movingright(layers);
    }
    else if (currentanimal_x > animal_x && currentanimal_y == animal_y) {
      this.movingleft(layers);
    }
    else if (currentanimal_x > animal_x && currentanimal_y > animal_y) {
      this.movingleft(layers);
    }
    else if (currentanimal_x > animal_x && currentanimal_y < animal_y) {
      this.movingleft(layers);
    }
    else if (currentanimal_x < animal_x && currentanimal_y > animal_y) {
      this.movingright(layers);
    }
    else if (currentanimal_x < animal_x && currentanimal_y < animal_y) {
      this.movingright(layers);
    }
    this.animal.setCollideWorldBounds(false);
  }
  
  RouteRecord(trace_list) {
    var num_trace = trace_list.length;
    var n = num_trace - 1;
    var route_list = [];
    var cnt = 0;
    while (true) {
      var child = trace_list[n];
      route_list.push(child);
      if (cnt > trace_list.length) {
        return route_list;
      }
      else {
        cnt = cnt + 1
        if (child.parent_x > 0) {
          for (var i = 0; i < num_trace; i++) {
            var p = trace_list[i];
            if (p.animal_x == child.parent_x && p.animal_y == child.parent_y) {
              n = i;
              break;
            }
            else {
              continue;
            }
          }
        }
        else {
          break;
        }
      }
    }
    return route_list;
  }

  numberreset(){
    let mapWidth = gameMap.layers[2].width;
    let mapHeight = gameMap.layers[2].height;
    for (let i = 0; i < mapWidth; i++) {
      for (let j = 0; j < mapHeight; j++) {
        if (mapdata_array[j][i] == 2 || mapdata_array[j][i] == 1 || mapdata_array[j][i] == -1) {
          mapdata_array[j][i] = 0;
        }
      }
    }
  }

  search(x, y, pastlocationx, pastlocationy) {
    var ax = Math.floor(this.animal.x / SQUARE_SIZE);
    var ay = Math.floor(this.animal.y / SQUARE_SIZE);
    var explore_list = [new position(x, y, ax, ay, 0, 0, 0)];
    var trace_list = [new position(x, y, this.animal.x, this.animal.y, 0, 0, 0)];
    var route_list = new Array();

    if (explore_list == null) {
      return;
    }

    //ループの仕方を変える
    //explorelistの更新がなされていないため、ゴールに辿り着けていない

    while (explore_list.length > 0) {
      var th = this;
      var f_min = 10000;
      var last_point = null;
      var index = 0;
      while (explore_list.length > index) {
        var item = explore_list[index];
        if (f_min > item.f) {
          f_min = item.f;
          const removed = explore_list.splice(index, 1)[0];
          last_point = removed;
        }
        index = index + 1;
      };
      var around_list = last_point.add_around();
      for (var i = 0; i < around_list.length; i++) {
        var p = around_list[i]
        //console.log(mapdata_array.mapdata_array[p.y][p.x]);

        if (p.animal_x < 0 || p.animal_y < 0) {
          //console.log("error");
        }

        //スタート位置との比較
        if (mapdata_array[p.animal_y][p.animal_x] == -1) {
          //console.log("start");
          continue;
        }

        //障害物との比較
        else if (mapdata_array[p.animal_y][p.animal_x] == 100) {
          //console.log("object");
          continue;
        }

        //直前にいた場所との比較
        else if (p.animal_x == pastlocationx && p.animal_y == pastlocationy){
          continue;
        }

        ///すでに通った位置との比較
        else if (mapdata_array[p.animal_y][p.animal_x] == 2) {
          index = 0;
          while (trace_list.length > index) {
            var listed = trace_list[index];
            if (listed.my_x == p.animal_x && listed.my_y == p.animal_y) {
              if (p.f < listed.f) {
                trace_list.remove(listed)
                explore_list.push(p)
                trace_list.push(p)
              }
              else {
                continue;
              }
            }
            index = index + 1;
          };
        }

        //ゴールとの比較
        else if (mapdata_array[p.animal_y][p.animal_x] == 1) {
          console.log("Find goal & Record it")
          trace_list.push(p)
          route_list = th.RouteRecord(trace_list);
          this.numberreset();
          //this.animalpastlocation =  (this.a)
          return [route_list, trace_list];
          //return [route_list, trace_list];
        }

        //未探索の場所との比較
        else if (mapdata_array[p.animal_y][p.animal_x] == 0) {
          mapdata_array[p.animal_y][p.animal_x] = 2
          //console.log(explore_list);
          explore_list.push(p)
          trace_list.push(p)
          //console.log("explore");
        }

        //結果なし
        else {
          console.log("No route to go")
          continue
        }
      }
    }
    this.numberreset();
    return [route_list, trace_list];
  }
}

/*
function sleepByPromise(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
async function sleep(sec) {
  await sleepByPromise(sec);
}
*/

function sleep(sec) {
  (waitTime) => setTimeout(waitTime * 10);
}

export default Animal;