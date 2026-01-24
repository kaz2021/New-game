import Phaser from "phaser";
import Animal from "./animal.js";
import gameMap from "./assets/gamemap.json";
import gameMap2 from "./assets/gamemap2.json";
import terrainImg from "./assets/Terrain/basemap.png";
import backgroundTile from "./assets/Background/Brown.png";
import playerRunning from "./assets/Main Characters/Ninja Frog/Run (32x32).png";
import playerIdle from "./assets/Main Characters/Ninja Frog/Idle (32x32).png";
import cherryImg from "./assets/Items/Fruits/Cherries.png";
import tresureBoxImg from "./assets/treasurebox.png";
import enemyIdle from "./assets/Enemies/AngryPig/Idle (36x30).png";
import enemyRunning from "./assets/Enemies/AngryPig/Idle (36x30).png";
import redImg from "./assets/red.png";
import redcircle from "./assets/Traps/Spiked Ball/Spiked Ball.png";
import { MyGame2 } from "./index2.js";
import globals from "./global.js";
import Rectangle from "phaser";
//redcircleobject = {};
//redcircleobject.sprite = null;

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

var isstart = true;

export class MyGame extends Phaser.Scene {
  constructor() {
    super('MyGame');
  }
  preload() {
    //this.load.image("background", backgroundTile);
    this.load.image("terrain", terrainImg);
    this.load.tilemapTiledJSON("gamemap", gameMap);
    this.load.spritesheet("player-run", playerRunning, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("player-idle", playerIdle, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("cherry-idle", cherryImg, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("treasurebox-idle", tresureBoxImg, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("enemy-run", enemyRunning, {
      frameWidth: 36,
      frameHeight: 30
    });
    this.load.spritesheet("enemy-idle", enemyIdle, {
      frameWidth: 36,
      frameHeight: 30
    });
    this.load.spritesheet("redwall", redImg, {
      frameWidth: 1890,
      frameHeight: 1890
    });
    this.load.spritesheet("redcircle", redcircle, {
      frameWidth: 50,
      frameHeight: 50
    });
    this.caveentrance = [];
    this.caveentrance = [
      { x: 51 * SQUARE_SIZE, y: 24 * SQUARE_SIZE, mapname: "gamemapjson2.json" },
      //{x:300,y:400,mapname:"mapjson3.json"}
    ];
    let mapWidth = gameMap.layers[2].width;
    let mapHeight = gameMap.layers[2].height;
    let mapdata = gameMap.layers[2].data;
    for (let i = 0; i < mapHeight; i++) {
      mapdata_array[i] = new Array(mapWidth);
      for (let j = 0; j < mapWidth; j++) {
        if (mapdata[i + j * mapWidth] == 0) {
          mapdata_array[i][j] = 0;
        } else {
          mapdata_array[i][j] = 100;
        }
      }
    }
    //updateでゴールの位置を自分の位置に変更できるように
    //mapdata_array[20][32] = 1;
    //mapdata_array[30][32] = -1;
  }

  create(passingdata) {
    //this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //this.scene.physics.world.enable(this);
    // redcircleobject.sprite = null;
    this.point = 0;
    if (isstart == false) {
      this.point = passingdata.score;
    }
    //this.add.tileSprite(400, 300, 800, 600, "background");
    const map = this.make.tilemap({ key: "gamemap" });
    const tiles = map.addTilesetImage("terrain", "terrain");
    this.basegroundlayer = map.createStaticLayer("base ground", tiles);
    this.groundlayer = map.createStaticLayer("ground", tiles);
    this.objectlayer = map.createStaticLayer("object", tiles);
    this.objectlayer.setCollisionByExclusion(-1, true);
    this.pointText = this.add.text(30, 30, "0 point", {
      fontSize: "32px",
      fill: "#000000"
    }).setScrollFactor(0);
    this.winText = this.add.text(200, 100, "", {
      fontSize: "64px",
      fill: "#f00"
    });
    //this.winText.setOrigin(0.5);
    this.restartText = this.add.text(400, 350, "", {
      fontSize: "32px",
      fill: "#fff"
    });
    //this.restartText.setOrigin(0.5);

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player-run", {
        start: 0,
        end: 11
      }),
      repeat: -1
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player-idle", {
        start: 0,
        end: 11
      }),
      repeat: -1
    });

    this.anims.create({
      key: "cherry",
      frames: this.anims.generateFrameNumbers("cherry-idle", {
        start: 0,
        end: 16
      }),
      repeat: -1
    });

    this.cherries = new Array(12);
    for (var i = 0; i < 12; i++) {
      var x = i * 120;
      var y = 0;
      this.cherries[i] = this.physics.add.sprite(x, y, "cherry-idle");
      this.cherries[i].x = x;
      this.cherries[i].y = y;
      this.cherries[i].allowgravity = true;
      this.cherries[i].body.gravity.y = 300;
    }

    this.anims.create({
      key: "treasurebox",
      frames: this.anims.generateFrameNumbers("treasurebox-idle", {
        start: 0,
        end: 16
      }),
      repeat: -1
    });

    this.anims.create({
      key: "enemy-running",
      frames: this.anims.generateFrameNumbers("enemy-run", {
        start: 0,
        end: 11
      }),
      repeat: -1
    });

    this.anims.create({
      key: "enemy-idle",
      frames: this.anims.generateFrameNumbers("enemy-idle", {
        start: 0,
        end: 8
      }),
      repeat: -1
    });

    //var platformCollider = this.physics.add.collider(object,object);
    //this.physics.world.removeCollider(platformCollider);
    //this.physics.world.setBounds(0, 0, 2048, 1280);


    this.cherries.forEach((child) => {
      child.play("cherry");
    });
    this.redcircleobject = new Array();
    redcircletimer.timer = setInterval(
      function (th) {
        var redcirclex = Math.floor(Math.random() * 400) - 200;
        var redcircley = Math.floor(Math.random() * 400) - 200;
        th.redcircleobject.push(th.physics.add.sprite(th.player.x + redcirclex, th.player.y + redcircley, "redcircle"));
      },
      1000 * 5,
      this
    );

    this.player = this.physics.add.sprite(1160, 840, "player-run");
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0.2);
    this.player.setOffset(0, -1);
    this.physics.add.collider(this.player, this.objectlayer);
    this.cherries.forEach((child) => {
      this.physics.add.collider(child, this.objectlayer);
      this.physics.add.collider(this.player, this.children, null, this);
    });
    //this.redImg = this.physics.add.sprite(0, 0, "redwall");
    this.cursors = this.input.keyboard.createCursorKeys();

    this.enemy = new Animal(this.physics.add.sprite(224, 1200, "enemy-run"));
    this.physics.add.collider(this.enemy.animal, this.objectlayer);
    //this.physics.arcade.enable(this.player);
    this.physics.add.overlap(
      this.player,
      this.enemy.animal,
      (p, c) => {
        this.physics.pause();
        this.gameOver = true;
        clearInterval(this.pointtimer);
        if (this.gameOvertextadd == false) {
          this.gameOverText = this.add.text(this.player.x - 80, this.player.y - 80, "Game over", {
            fontSize: "64px",
            fill: "#f00"
          });
          //this.gameOverText.setOrigin(0.5);
          this.gameOvertextadd = true;
        }
        this.restartText.setText("Restart: Hit Space Key");
      },
      null,
      this
    );
    this.treasureboxes = new Array(12);
    for (var i = 0; i < 12; i++) {
      var x = 0;
      var y = 0;
      var k = 0;
      this.treasureboxes[i] = this.physics.add.sprite(x, y, "treasurebox-idle");

      while (true) {
        x = Math.floor(Math.random() * 1600);
        y = Math.floor(Math.random() * 1200);
        k = Math.floor(Math.random() * 7);
        this.treasureboxes[i].x = x;
        this.treasureboxes[i].y = y;
        this.treasureboxes[i].kind = k;
        if (
          checkOverlap(
            this.treasureboxes[i].x,
            this.treasureboxes[i].y,
            this.objectlayer
          ) === true
        ) {
          x = Math.floor(Math.random() * 800);
          y = Math.floor(Math.random() * 600);
        } else {
          break;
        }
      }
    }
    this.teleportationX = Math.floor(Math.random() * 800);
    this.teleportationY = Math.floor(Math.random() * 800);
    this.pointadd = 1;

    for (var i = 0; i < 12; i++) {
      this.physics.add.overlap(
        this.player,
        this.treasureboxes[i],
        (p, c) => {
          c.destroy();
          if (c.kind === 0) {
            this.point = this.point + 50;
            this.pointText.setText(this.point + "point");
          }
          if (c.kind === 1) {
            this.velocityX = 600;
            this.velocityY = 600;
            this.treasureboxtimer = setTimeout(
              function (th) {
                th.velocityX = 300;
                th.velocityY = 300;
              },
              10000,
              this
            );
          }
          if (c.kind === 2) {
            this.enemymoving = false;
            this.treasureboxtimer = setTimeout(
              function (th) {
                th.enemymoving = true;
              },
              3000,
              this
            );
          }
          if (c.kind === 3) {
            this.velocityX = 150;
            this.velocityY = 150;
            this.treasureboxtimer = setTimeout(
              function (th) {
                th.velocityX = 300;
                th.velocityY = 300;
              },
              10000,
              this
            );
          }
          if (c.kind === 4) {
            this.cursorsfake = true;
            this.tresureboxtimer = setTimeout(
              function (th) {
                th.cursorsfake = true;
              },
              5000,
              this
            );
          }
          if (c.kind === 5) {
            this.player.x = this.teleportationX;
            this.player.y = this.teleportationY;
          }

          //4/25変更
          if (c.kind === 6) {
            this.pointaddtimer = setTimeout(
              function (th) {
                this.pointadd = this.pointadd + 1;
              },
              5000,
              this
            );
          }
          /*
          if (c.kind == 7){
            this.
          }
          */


        },
        null,
        this
      );
    }

    for (var i = 0; i < 12; i++) {
      this.physics.add.overlap(
        this.player,
        this.cherries[i],
        (p, c) => {
          c.destroy();
          this.point = this.point + 10;
          this.pointText.setText(this.point + "point");
        },
        null,
        this
      );
    }

    this.pointtimer = setInterval(
      function (th) {
        th.point = th.point + th.pointadd;
        th.pointText.setText(th.point + "point");
      },
      1000,
      this
    );

    this.gametimer = setTimeout(
      function (th) {
        th.physics.pause();
        th.gameOver = true;
        clearInterval(th.pointtimer);
        th.winText.setText("You win !");
        th.restartText.setText("Restart: Hit Space Key");
      },
      1000 * 300,
      this
    );
    this.velocityX = 0;
    this.velocityY = 0;
    this.enemymoving = true;
    this.cursorsfake = false;
    //this.add.image(0,0,"terrian");
    this.gameOvertextadd = false;
  };

  update() {

    this.player.x = Phaser.Math.Clamp(this.player.x, 0, 2048);
    this.player.y = Phaser.Math.Clamp(this.player.y, 0, 1280);
    this.player.currentlocationx = Math.floor(this.player.x / SQUARE_SIZE);
    this.player.currentlocationy = Math.floor(this.player.y / SQUARE_SIZE);
    this.enemy.currentlocationx = Math.floor(this.enemy.animal.x / SQUARE_SIZE);
    this.enemy.currentlocationy = Math.floor(this.enemy.animal.y / SQUARE_SIZE);
    mapdata_array[this.player.currentlocationy][this.player.currentlocationx] = 1;
    mapdata_array[this.enemy.currentlocationy][this.enemy.currentlocationx] = -1;


    if (this.cursors.left.isDown && this.cursorsfake == false) {
      this.player.setVelocityX(-this.velocityX);
      this.player.setFlipX(true);
      this.player.anims.play("right", true);
      this.player.setVelocityY(0);
    } else if (this.cursors.right.isDown && this.cursorsfake == false) {
      this.player.setVelocityX(this.velocityX);
      this.player.setFlipX(false);
      this.player.anims.play("right", true);
      this.player.setVelocityY(0);
    } else if (this.cursors.up.isDown && this.cursorsfake == false) {
      this.player.setVelocityY(-this.velocityY);
      this.player.setFlipY(false);
      this.player.anims.play("right", true);
      this.player.setVelocityX(0);
    } else if (this.cursors.down.isDown && this.cursorsfake == false) {
      this.player.setVelocityY(this.velocityY);
      this.player.setFlipY(false);
      this.player.anims.play("right", true);
      this.player.setVelocityX(0);
    } else if (this.cursors.left.isDown && this.cursorsfake == true) {
      this.player.setVelocityX(this.velocityX);
      this.player.setFlipX(true);
      this.player.anims.play("right", true);
      this.player.setVelocityY(0);
    } else if (this.cursors.right.isDown && this.cursorsfake == true) {
      this.player.setVelocityX(-this.velocityX);
      this.player.setFlipX(false);
      this.player.anims.play("right", true);
      this.player.setVelocityY(0);
    } else if (this.cursors.up.isDown && this.cursorsfake == true) {
      this.player.setVelocityY(this.velocityY);
      this.player.setFlipY(false);
      this.player.anims.play("right", true);
      this.player.setVelocityX(0);
    } else if (this.cursors.down.isDown && this.cursorsfake == true) {
      this.player.setVelocityY(-this.velocityY);
      this.player.setFlipY(false);
      this.player.anims.play("right", true);
      this.player.setVelocityX(0);
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      this.player.anims.play("idle", true);
    }
    if (this.enemymoving == true) {
      //var searchstart = this.enemy.search(this.player.x,this.player.y);
      var mx = Math.floor(this.player.x / SQUARE_SIZE);
      var my = Math.floor(this.player.y / SQUARE_SIZE);
      var searchresult = this.enemy.search(mx, my);
      //mapdata_array[mx][my] = 1;
      this.position = this.enemy.position = searchresult;
      //mapdata_array[mx][my] = 0;
      this.enemy.move(this.player, this.objectlayer);
    }
    if (redcircleobject !== null) {
      var flagredcircle = false;
      this.redcircleobject.forEach(function (value) {
        if (checkOverlap2(this.player, value) == true) {
          flagredcircle = true;
        }
      }, this);
      if (flagredcircle == true) {
        this.physics.pause();
        this.gameOver = true;
        clearInterval(this.pointtimer);
        if (this.gameOvertextadd == false) {
          this.gameOverText = this.add.text(this.player.x - 80, this.player.y - 80, "Game over", {
            fontSize: "64px",
            fill: "#f00"
          });
          //this.gameOverText.setOrigin(0.5);
          this.gameOvertextadd = true;
        }
        this.restartText.setText("Restart: Hit Space Key");
      };
    };

    var camerasx = this.player.x;
    var camerasy = this.player.y;
    if (this.player.x <= 400) {
      camerasx = 400;
    }
    if (this.player.x >= 1647) {
      camerasx = 1647;
    }
    if (this.player.y <= 320) {
      camerasy = 320;
    }
    if (this.player.y >= SQUARE_SIZE * 40 - 300) {
      camerasy = SQUARE_SIZE * 40 - 300;
    }
    this.cameras.main.centerOn(camerasx, camerasy);

    if (checkOverlap3(this.player.x, this.player.y, 1681, 765) == true) {
      if (redcircleobject != null) {
        //redcircleobject.destroy(true);
      };
      clearTimeout(this.treasureboxtimer);
      clearInterval(redcircletimer.timer);
      clearTimeout(this.gametimer);
      clearInterval(this.pointtimer);
      var passingdata = { isPlay: true, score: this.point };
      isstart = false;
      this.scene.start("MyGame2", passingdata);
    }
  };

  eatCherries(player, cherry) {
    cherry.disableBody(true, true);
  }
}

let game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "phaser3-codealong",
  physics: {
    default: "arcade",
    arcade: {
      // debug: true
    }
  },
  width: 800,
  height: 600,
  scene: [MyGame, MyGame2]
});

//game.scene.add(MyGame, MyGame2);
//commenttest(candelete)