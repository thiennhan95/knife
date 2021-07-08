import { NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import Phaser, { Game, Time } from "phaser";
import { count } from "rxjs/operators";
import { ApiService } from "../api.service";

class GameScene extends Phaser.Scene {
  //data of knife:
  valuer: any = {
    ship: 5,
  };
  gift: any;
  thunder: any;
  timer = 0;
  user: any;
  api: any;
  apple: any;
  knife1: any;
  target: any;
  game: any;
  knifeGroup: any;
  canThrow: boolean;
  value = 1;
  gameOptions: any = {
    // target rotation speed, in degrees per frame
    rotationSpeed: 0.7,
    // knife throwing duration, in milliseconds
    throwSpeed: 150,
    // minimum angle between two knives
    minAngle: 10,
    // max rotation speed variation, in degrees per frame
    rotationVariation: 2,
    // interval before next rotation speed variation, in milliseconds
    changeTime: 2000,
    // maximum rotation speed, in degrees per frame
    // maxRotationSpeed: 8,
    timeLimit: 31,
  };

  comp: any;
  currentRotationSpeed: number;
  newRotationSpeed: any;
  thingsGroup: any;
  alienManager: any;
  fit_width: any;
  assetManager: any;
  count_throw = 0;
  legalHit: boolean;
  timeText: Phaser.GameObjects.BitmapText;
  timerEvent: any;
  showTimer = false;
  text: Phaser.GameObjects.Text;
  sign1 = Phaser.Math.Between(2, 10);
  gems: Phaser.GameObjects.Sprite;
  starfield: Phaser.GameObjects.TileSprite;
  constructor(config) {
    super(config);
  }
  preload() {
    this.load.image("bg", "assets/images/bg_shoot.jpg");
    this.load.image("thunder", "assets/images/thunder.png");
    this.load.image("gift", "assets/images/gift.png");
    this.load.bitmapFont(
      "font",
      "assets/game/tower/assets/fonts/font.png",
      "assets/game/tower/assets/fonts/font.fnt"
    );
    this.load.image("knife1", "assets/images/knife1.png");
    this.load.image("target", "assets/images/target2.png");
    this.load.image("apple", "assets/images/apple.png");
    this.load.spritesheet("kaboom", "assets/images/exp1.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.atlas(
      "gems",
      "assets/images/frame/gems.png",
      "assets/images/frame/gems.json"
    );

    this.comp = this.registry.get("comp");
    this.api = this.registry.get("api");
  }
  start() {
    const { width, height } = this.cameras.main;
    // can the player throw a knife? Yes, at the beginning of the game

    this.canThrow = true;
    this.knife1 = this.add.sprite(width / 2, height * 0.7, "knife1");
    this.knife1.displayWidth = this.comp.api.screen_size.w / 6;
    this.knife1.displayHeight = this.knife1.displayWidth * 2;
    if (this.thingsGroup) {
      this.input.on("pointerdown", this.throwKnife, this);
    }
  }
  next() {
    this.timer = 0;
    this.value = 1;
    this.text.visible = false;
    this.gems.setVisible(false);
    this.timeText.visible = false;
  }
  createTimetext() {
    this.timeText = this.add.bitmapText(
      10,
      10,
      "font",
      this.gameOptions.timeLimit.toString(),
      50
    );
    this.timeText.visible = false;
  }
  create() {
    const { width, height } = this.cameras.main;
    // at the beginning of the game, both current rotation speed and new rotation speed are set to default rotation speed
    this.currentRotationSpeed = this.gameOptions.rotationSpeed *this.valuer.ship
    this.newRotationSpeed = this.gameOptions.rotationSpeed * this.valuer.ship;
    console.log(this.currentRotationSpeed+"tốc độ quay hiện tại");
    console.log(this.newRotationSpeed +"tốc độ quay mới");

    // scroll-y bg;
    this.starfield = this.add
      .tileSprite(0, 0, 0, 0, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setOrigin(0, 0);

    // create range
    this.registry.events.on(
      "changedata",
      (parent, key, value) => {
        if (key == "set_power") {
          this.valuer = value;
          console.log('213213')
        }
      },
      this
    );
    // tạo timeText
    this.createTimetext();
    if (this.timeText == null) {
      this.createTimetext();
    }
    // create text
    this.text = this.add.text(
      this.comp.api.screen_size.w / 10,
      this.comp.api.screen_size.h / 10,
      "x" + this.sign1,
      {
        font: "65px Arial",
        fill: "#ff0044",
        align: "center",
      }
    );
    this.text.setScale(0.3);
    this.text.visible = true;

    // group to store all rotating knives
    this.knifeGroup = this.add.group();

    // adding the target
    this.target = this.add.sprite(width / 2, height / 8, "target");
    this.target.displayWidth = this.comp.api.screen_size.w / 1.8;
    this.target.scaleY = this.target.scaleX;
    this.target.depth = 1;

    this.thunder = this.add.sprite(
      width / 2.2,
      height /3.5,
      "thunder"
    );
    this.thunder.displayWidth = this.comp.api.screen_size.w *2;
    this.thunder.scaleY = this.thunder.scaleX ;
    this.thunder.depth = 3;
    this.thunder.visible = false;

    // moving the target on front
    //this.target.depth = 1;
    this.thingsGroup = this.add.group();
    // determing apple angle in radians
    var radians = Phaser.Math.DegToRad(90);
    for (let i = 0; i < 6; i++) {
      var apple: any = this.add.sprite(
        this.target.x + (this.target.displayWidth / 1.4) * Math.cos(radians),
        this.target.y + (this.target.displayWidth / 1.4) * Math.sin(radians),
        "apple"
      );
      apple.displayWidth = this.target.displayWidth / 6;
      apple.scaleY = apple.scaleX;

      var angle = 60 * i;
      apple.angle = angle;
      apple.impactAngle = angle;
      this.thingsGroup.add(apple);

      this.anims.create({
        key: "diamond",
        frames: this.anims.generateFrameNames("gems", {
          prefix: "diamond_",
          end: 60,
          zeroPad: 4,
        }),
        frameRate: 16,
        repeat: -1,
      });

      this.gems = this.add
        .sprite(
          this.comp.api.screen_size.w / 15,
          this.comp.api.screen_size.h / 8.3,
          "gems"
        )
        .play("diamond")
        .setScale(0.3)
        .setVisible(false);
    }
    this.text.visible = false;
    this.createG();

    // waiting for player input to throw a knife
    // this is how we create a looped timer event
    let timedEvent = this.time.addEvent({
      delay: 8000,
      callback: this.changeSpeed,
      callbackScope: this,
      loop: true,
    });

    this.anims.create({
      key: "boom",
      frames: this.anims.generateFrameNumbers("kaboom", {
        start: 0,
        end: 150,
      }),
      frameRate: 30,
      repeat: 0,
    });

    this.start();
  }
  createG() {
    var radians = Phaser.Math.DegToRad(90);
    this.gift = this.add.sprite(
      this.target.x + (this.target.displayWidth / 1.4) * Math.cos(radians),
      this.target.y + (this.target.displayWidth / 1.4) * Math.sin(radians),
      "gift"
    );
    this.gift.displayWidth = this.target.displayWidth / 6;
    this.gift.scaleY = this.gift.scaleX;
    var angle = 90;
    this.gift.angle = angle;
    this.gift.impactAngle = angle;
  }
  changeSpeed() {
    // ternary operator to choose from +1 and -1
    var sign = Phaser.Math.Between(0, 1) == 0 ? -1 : 1;

    // random number between -gameOptions.rotationVariation and gameOptions.rotationVariation
    var variation = Phaser.Math.FloatBetween(
      -this.gameOptions.rotationVariation,
      this.gameOptions.rotationVariation
    );
    // new rotation speed
    this.newRotationSpeed = Math.floor((this.currentRotationSpeed *this.valuer.ship + variation) * sign);
    console.log(this.newRotationSpeed+"+++")

    // setting new rotation speed limits
    this.newRotationSpeed = Phaser.Math.Clamp(
      this.newRotationSpeed,
      -this.gameOptions.rotationSpeed * this.valuer.ship,
      this.gameOptions.rotationSpeed * this.valuer.ship
    );
  }
  tick() {
    this.timeText.visible = true;
    this.text.visible = true;
    this.gems.setVisible(true);
    this.timer++;
    this.timeText.text = (this.gameOptions.timeLimit - this.timer).toString();
    if (this.timer >= this.gameOptions.timeLimit) {
      this.next();
      this.timerEvent.remove();
    }
    if (!this.gift.visible) {
      setTimeout(() => {
        this.gift.visible = true;
      }, 60000);
    }
  }
  addTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.tick,
      callbackScope: this,
      loop: true,
    });
  }

  throwKnife() {
    const { width, height } = this.cameras.main;
    // can the player throw?
    if (this.canThrow) {
      this.count_throw++;
      // player can't throw anymore
      this.canThrow = false;
      // tween to throw the knife
      this.tweens.add({
        // phóng dao vào mục tiêu
        targets: [this.knife1],
        // khoảng cách tới mục tiêu theo trục y

        y: this.target.y + this.target.displayWidth / 3,

        // tween duration ,thời gian hiệu ứng tới mục tiêu
        duration: this.gameOptions.throwSpeed,

        // callback scope
        callbackScope: this,

        // function to be executed once the tween has been completed
        onComplete: function (tween) {
          // at the moment, this is a legal hit
          this.legalHit = true;
          var ok = false;
          var things = this.thingsGroup.getChildren();
          for (var k = 0; k < things.length; k++) {
            var n = Math.abs(
              Phaser.Math.Angle.ShortestBetween(
                this.target.angle,
                -things[k].impactAngle
              )
            );

            if (n < this.gameOptions.minAngle && things[k].visible) {
              ok = true;

              things[k].visible = false;
              setTimeout(() => {
                things[k].visible = true;
              }, 2000);
              console.log("trung trai tao");
              var explosion = this.add
                .sprite(this.knife1.x, this.knife1.y / 0.8, "kaboom")
                .play("boom");
              explosion.setScale(0.5);
              explosion.depth = 2;
              explosion.once("animationcomplete", () => {
                explosion.destroy();
              });
              break;
            }
          }
          var g = Math.abs(
            Phaser.Math.Angle.ShortestBetween(
              this.target.angle,
              -this.gift.impactAngle
            )
          );
          if (g < this.gameOptions.minAngle && this.gift.visible) {
            ok = true;
            // hộp quà huỷ
            this.gift.visible = false;
            // đếm lùi
            this.addTimer();
            console.log("trung hộp quà");
            // hiệu ứng nổ
            var explosion = this.add
              .sprite(this.knife1.x, this.knife1.y / 0.8, "kaboom")
              .play("boom");
            explosion.depth = 2;
            explosion.once("animationcomplete", () => {
              explosion.destroy();
            });
            this.value = this.valuer.ship * this.sign1;
          }
          // is this a legal hit?
          if (this.legalHit && ok) {
            this.canThrow = true;
            var point1 = this.value * this.valuer.ship;
            console.log(this.valuer)
            this.comp.api.user.balance += point1;
            this.comp.api.animate(point1);
            var knife1 = this.add.sprite(width / 2, height * 0.7, "knife1");

            knife1.displayWidth = this.comp.api.screen_size.w / 6;
            knife1.displayHeight = this.knife1.displayWidth * 2;

            knife1.impactAngle = this.target.angle;
            this.knifeGroup.add(knife1);
            setTimeout(() => {
              knife1.destroy();
            }, 2000);

            this.knife1.y = height * 0.7;
          }
          // in case this is not a legal hit
          else {
            var point = this.value*this.valuer.ship;
            this.comp.api.user.balance -= point;
            this.comp.api.animate(-point);
            this.thunder.visible = true;
            this.cameras.main.flash();
            setTimeout(() => {
              this.thunder.visible = false;
            }, 500);
            this.legalHit = false;
            this.tweens.add({
              // adding the knife to tween targets
              targets: [this.knife1],
              // y destination
              y: this.comp.api.screen_size.h * 1.2 + this.knife1.height,
              // rotation destination, in radians
              rotation: 5,
              // tween duration
              duration: this.gameOptions.throwSpeed * 4,
              // callback scope
              callbackScope: this,
              // function to be executed once the tween has been completed
              onComplete: function () {
                // restart the games
                this.start();
              },
            });
            // player can now throw again
            // adding the rotating knife in the same place of the knife just landed on target
          }

          this.sendData(this.value);
        },
      });
    }
  }
  sendData(value) {
    if (this.count_throw == 5) {
      this.comp.api
        .post("user?action=knife", { value: value })
        .subscribe((r) => {
          this.count_throw = 0;
        });
    }
  }
  createGift() {
    this.gift.angle += this.currentRotationSpeed;
    var radians1 = Phaser.Math.DegToRad(this.gift.angle + 90);
    this.gift.x =
      this.target.x + (this.target.displayWidth / 1.7) * Math.cos(radians1);
    this.gift.y =
      this.target.y + (this.target.displayWidth / 1.7) * Math.sin(radians1);
  }
  update(time, delta) {
    // console.log(this.valuer)
    // rotating the target
    this.target.angle += this.currentRotationSpeed;
    this.starfield.tilePositionY -= 2;

    var things = this.thingsGroup.getChildren();
    for (var i = 0; i < things.length; i++) {
      things[i].angle += this.currentRotationSpeed;
      var radians = Phaser.Math.DegToRad(things[i].angle + 90);
      // trigonometry to make the knife rotate around target center
      things[i].x =
        this.target.x + (this.target.displayWidth / 1.4) * Math.cos(radians);
      things[i].y =
        this.target.y + (this.target.displayWidth / 1.4) * Math.sin(radians);
    }

    // getting an array with all rotating knives
    var children = this.knifeGroup.getChildren();
    // looping through rotating knives
    for (var i = 0; i < children.length; i++) {
      // rotating the knife
      children[i].angle += this.currentRotationSpeed;

      // turning knife angle in radians
      var radians = Phaser.Math.DegToRad(children[i].angle + 90);

      // trigonometry to make the knife rotate around target center
      children[i].x =
        this.target.x + (this.target.displayWidth / 2.2) * Math.cos(radians);
      children[i].y =
        this.target.y + (this.target.displayWidth / 2.2) * Math.sin(radians);
    }
    this.createGift();

    // adjusting curr`e`nt rotation speed using linear interpolation
    this.currentRotationSpeed = Phaser.Math.Linear(
      this.currentRotationSpeed,
      this.newRotationSpeed,
      delta / 1000
    );
  }
}

@Component({
  selector: "app-knife",
  templateUrl: "./knife.page.html",
  styleUrls: ["./knife.page.scss"],
})
export class KnifePage implements OnInit {
  config: any;
  value: any = {
    ship: 5,
  };
  show = 0;
  game: any;
  constructor(public api: ApiService) {
    this.config = {
      width: 500,
      height: "100%",
      type: Phaser.AUTO,
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      physics: {
        default: "arcade",
      },
      parent: "game",
      scene: GameScene,
    };
  }
  ngOnInit() {
    

    setTimeout(() => {
      this.show = 1;
    }, 1000);
  }
  setValue(type, v) {
    this.value[type] = v;
    this.game.registry.set("set_power", this.value);
    console.log(this.value)
  }
  ionViewDidEnter() {
    this.api.sound.volume(0.1);

    this.game = new Phaser.Game(this.config);
    if (this.game) {
      this.game.registry.set("comp", this);
      this.game.registry.set("api", this.api);
      this.game.registry.set("set_power", this.value);

      setTimeout(() => {
        this.show = 1;
      }, 1000);
    }
    // this.game.scene.resume('MainScene');
  }

  ionViewWillLeave() {
    this.show = 0;
    //gui du lieu truoc khi thoat
    this.api.sound.volume(1);
    // this.game.scene.pause('MainScene');
    this.game.destroy(true);
  }
}
