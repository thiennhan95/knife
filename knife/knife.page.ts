import { NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { F_OK } from "constants";
import Phaser, { Game, Time } from "phaser";
import { count } from "rxjs/operators";
import { ApiService } from "../api.service";

class GameScene extends Phaser.Scene {
  //data of knife:
  gift: any;
  thunder: any;
  image: any;
  timer = 0;
  user: any;
  api: any;
  score: any;
  apple: any;
  knife1: any;
  target: any;
  game: any;
  knifeGroup: any;
  canThrow: boolean;
  value = 100;
  gameOptions: any = {
    // target rotation speed, in degrees per frame
    rotationSpeed: 4,
    // knife throwing duration, in milliseconds
    throwSpeed: 150,
    // minimum angle between two knives
    minAngle: 10,
    // max rotation speed variation, in degrees per frame
    rotationVariation: 2,
    // interval before next rotation speed variation, in milliseconds
    changeTime: 2000,
    // maximum rotation speed, in degrees per frame
    maxRotationSpeed: 8,
    timeLimit: 30,
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
  giftGroup: Phaser.GameObjects.Group;
  constructor(config) {
    super(config);
  }
  preload() {
    //  for (var i = 1; i < 7; i++) {
    //    this.load.image(""+i, "images/" + i + ".png");
    //  }
    this.load.image("image", "assets/images/1.png");
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

    this.comp = this.registry.get("comp");
    this.api = this.registry.get("api");
  }
  start() {
    // can the player throw a knife? Yes, at the beginning of the game

    this.canThrow = true;
    this.knife1 = this.add.sprite(
      this.comp.api.screen_size.w / 2,
      this.comp.api.screen_size.h / 1.2,
      "knife1"
    );
    this.knife1.displayWidth = this.comp.api.screen_size.w / 10;
    this.knife1.displayHeight = this.knife1.displayWidth * 2;
    if (this.thingsGroup) {
      this.input.on("pointerdown", this.throwKnife, this);
    }
  }
  next() {
    this.timer = 0;
    this.value = 100;
    this.timeText.destroy();
  }
  createTimetext(){
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
    // at the beginning of the game, both current rotation speed and new rotation speed are set to default rotation speed
    this.currentRotationSpeed = this.gameOptions.rotationSpeed;
    this.newRotationSpeed = this.gameOptions.rotationSpeed;
    this.createTimetext();
    if(this.timeText == null ){
       this.createTimetext();
    }
   

    // group to store all rotating knives
    this.knifeGroup = this.add.group();
    // adding the knife

    // adding the target
    this.target = this.add.sprite(
      this.comp.api.screen_size.w / 2,
      this.comp.api.screen_size.h / 5.5,
      "target"
    );
    this.target.displayWidth = this.comp.api.screen_size.w / 3;
    this.target.scaleY = this.target.scaleX;
    this.target.depth = 1;

    this.thunder = this.add.sprite(
      this.comp.api.screen_size.w / 2,
      this.comp.api.screen_size.h / 4.5,
      "thunder"
    );
    this.thunder.displayWidth = this.comp.api.screen_size.w;
    this.thunder.scaleY = this.thunder.scaleX;
    this.thunder.depth = 3;
    this.thunder.visible = false;
    // this.image = this.add.sprite(
    //   this.comp.api.screen_size.w / 2,
    //   this.comp.api.screen_size.h / 2,
    //   "image"
    // );

    // moving the target on front
    //this.target.depth = 1;
    this.thingsGroup = this.add.group();
    // determing apple angle in radians
    var radians = Phaser.Math.DegToRad(90);
    for (let i = 0; i < 6; i++) {
      // var apple:any = this.add.sprite(this.target.x[i], this.target.y[i], "apple");
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
    }
      this.createG();
   

    // waiting for player input to throw a knife
    // this is how we create a looped timer event
    let timedEvent = this.time.addEvent({
      delay: Phaser.Math.Between(3000, 6000),
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
     this.giftGroup  =  this.add.group();
    this.giftGroup.add(this.gift);

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
    this.newRotationSpeed = (this.currentRotationSpeed + variation) * sign;

    // setting new rotation speed limits
    this.newRotationSpeed = Phaser.Math.Clamp(
      this.newRotationSpeed,
      -this.gameOptions.maxRotationSpeed,
      this.gameOptions.maxRotationSpeed
    );
  }
  tick() {
    this.timeText.visible = true;
    this.timer++;
    this.timeText.text = (this.gameOptions.timeLimit - this.timer).toString();
    if (this.timer >= this.gameOptions.timeLimit) {
      this.next();
      this.timerEvent.remove();
    }
  }
  addTimer() {
    if (this.timerEvent == null) {
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.tick,
        callbackScope: this,
        loop: true,
      });
    }
  }

  throwKnife() {
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
          if (g < this.gameOptions.minAngle) {
            ok = true;
            this.gift.destroy();
            this.addTimer();
            console.log(this.gift);
            console.log("trung hộp quà");
            var explosion = this.add
              .sprite(this.knife1.x, this.knife1.y / 0.8, "kaboom")
              .play("boom");
            explosion.depth = 2;
            explosion.once("animationcomplete", () => {
            explosion.destroy();
            });
            var sign1 = Phaser.Math.Between(2, 10);
            this.value = 100 * sign1;
            // var value = this.value;
            // this.comp.api.user.balance += value * 10;
            // this.comp.api.animate(1000);
          }
          // is this a legal hit?
          if (this.legalHit && ok) {
            this.canThrow = true;
            var value = this.value;
            this.comp.api.user.balance += value;
            this.comp.api.animate(value);
            var knife1 = this.add.sprite(
              this.comp.api.screen_size.w / 2,
              this.comp.api.screen_size.h * 1.2,
              "knife1"
            );

            knife1.displayWidth = this.comp.api.screen_size.w / 10;
            knife1.displayHeight = this.knife1.displayWidth * 2;

            knife1.impactAngle = this.target.angle;
            this.knifeGroup.add(knife1);
            setTimeout(() => {
              knife1.destroy();
            }, 2000);

            // var knifes = this.knifeGroup.getChildren();
            // for (let m = 0; m < knifes.length; m++) {
            //   setTimeout(() => {
            //     knifes[m].destroy();
            //   }, 2000);

            //   break;
            // }
            // bringing back the knife to its starting position
            this.knife1.y = this.comp.api.screen_size.h / 1.1;
          }
          // in case this is not a legal hit
          else {
            var value = this.value;
            this.comp.api.user.balance -= value;
            this.comp.api.animate(-value);
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
    //send api this.comp.api.post('action=knife', {value: value}).subcribe(r=>{this.count_throw = 0})
    if (this.count_throw == 5) {
      this.comp.api
        .post("user?action=knife", { value: value })
        .subscribe((r) => {
          this.count_throw = 0;
          console.log(this.comp.api.user.balance);
        });
    }
  }
  createGift() {
    this.gift.angle += this.currentRotationSpeed;
    var radians1 = Phaser.Math.DegToRad(this.gift.angle + 90);
    this.gift.x =
      this.target.x + (this.target.displayWidth / 1.6) * Math.cos(radians1);
    this.gift.y =
      this.target.y + (this.target.displayWidth / 1.6) * Math.sin(radians1);
  }
  update(time, delta) {
    // rotating the target

    this.target.angle += this.currentRotationSpeed;
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
  phaserGame: Phaser.Game;
  config: any;

  game: any;
  constructor(public api: ApiService) {
    this.config = {
      width: this.api.screen_size.w,
      height: this.api.screen_size.h,
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
    this.phaserGame = new Phaser.Game(this.config);
    this.phaserGame.registry.set("comp", this);
  }
}
