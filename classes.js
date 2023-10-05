// The Sprite class represents characters or objects in the game.

class Sprite {
    constructor({
      position,        // The position of the character or object on the screen.
      velocity,        // The speed and direction of the character or object.
      image,           // The image that makes up the character or object.
      frames = {       // Configuration for animations.
        max: 1,        // Maximum frames in the animation.
        hold: 10,      // Duration between animation frames.
      },
      sprites,         // Other sprites in the game.
      animate = false, // Determines if the sprite should be animated.
      rotation = 0,    // The rotation angle of the sprite.
    }) {
      this.position = position;          // Stores the position.
      this.image = new Image();          // Creates an image for the sprite.
      this.frames = { ...frames, val: 0, elapsed: 0 }; // Animation frame data.
  
      // Update width and height when the image is loaded.
      this.image.onload = () => {
        this.width = this.image.width / this.frames.max;
        this.height = this.image.height;
      };
  
      this.image.src = image.src;        // Sets the image source.
      this.animate = animate;            // Indicates if it's animated.
      this.sprites = sprites;            // Other sprites in the game.
      this.opacity = 1;                  // Opacity (transparency) of the sprite.
      this.rotation = rotation;          // Rotation angle.
    }
  
    // Draws the sprite on the screen.
    draw() {
      c.save();
  
      // Position, rotate, and translate the sprite.
      c.translate(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2
      );
      c.rotate(this.rotation);
      c.translate(
        -this.position.x - this.width / 2,
        -this.position.y - this.height / 2
      );
  
      c.globalAlpha = this.opacity; // Set the opacity.
  
      // Draw the image of the sprite.
      c.drawImage(
        this.image,
        this.frames.val * this.width,
        0,
        this.image.width / this.frames.max,
        this.image.height,
        this.position.x,
        this.position.y,
        this.image.width / this.frames.max,
        this.image.height
      );
  
      c.restore();
  
      // If not animated, exit early.
      if (!this.animate) return;
  
      // If there are multiple frames, update animation frame.
      if (this.frames.max > 1) {
        this.frames.elapsed++;
      }
  
      // Change animation frame when the hold duration is reached.
      if (this.frames.elapsed % this.frames.hold === 0) {
        if (this.frames.val < this.frames.max - 1) this.frames.val++;
        else this.frames.val = 0;
      }
    }
  }
  
  // The Monster class represents creatures in the game, extending Sprite.
  
  class Monster extends Sprite {
    constructor({
      isEnemy = false,  // Indicates if the monster is an enemy.
      name,            // The name of the monster.
      position,        // The position of the monster on the screen.
      velocity,        // The speed and direction of the monster.
      image,           // The image that represents the monster.
      frames = {       // Configuration for animations.
        max: 1,        // Maximum frames in the animation.
        hold: 10,      // Duration between animation frames.
      },
      sprites,         // Other sprites in the game.
      animate = false, // Determines if the monster should be animated.
      rotation = 0,    // The rotation angle of the monster.
      attacks,         // The list of attacks the monster can use.
    }) {
      super({
        isEnemy,
        name,
        position,
        velocity,
        image,
        frames,
        sprites,
        animate,
        rotation,
      });
  
      this.name = name;           // Stores the name of the monster.
      this.isEnemy = isEnemy;     // Indicates if it's an enemy.
      this.health = 100;          // The health of the monster.
      this.attacks = attacks;     // The attacks the monster can use.
    }
  
    // Handles when the monster faints (loses all health).
    faint() {
      document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!';
      gsap.to(this.position, {
        y: this.position.y + 20,
      });
      gsap.to(this, {
        opacity: 0,
      });
      audio.battle.stop();
      audio.victory.play();
    }
  
    // Performs an attack.
    attack({ attack, recipient, renderedSprites }) {
      document.querySelector('#dialogueBox').style.display = 'block';
      document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name;
  
      // Determine the health bar to update.
      let healthBar = '#enemyHealthBar';
      if (this.isEnemy) healthBar = '#playerHealthBar';
  
      recipient.health -= attack.damage; // Reduce recipient's health.
  
      // Determine the rotation direction.
      let rotate = 1;
      if (this.isEnemy) rotate = -2.4;
  
      const tl = gsap.timeline();
  
      switch (attack.name) {
        case 'Fireball':
          audio.fireballInit.play();
          const FireballImage = new Image();
          FireballImage.src = './img/fireball.png';
  
          // Create a fireball sprite.
          const fireball = new Sprite({
            position: {
              x: this.position.x,
              y: this.position.y,
            },
            image: FireballImage,
            frames: {
              max: 4,
              hold: 10,
            },
            animate: true,
            rotation: rotate,
          });
  
          renderedSprites.splice(1, 0, fireball);
  
          // Animate fireball movement.
          gsap.to(fireball.position, {
            x: recipient.position.x + 25,
            y: recipient.position.y + 25,
            onComplete: () => {
              // Shaking effect on recipient.
              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
  
              // Flashing effect on recipient.
              gsap.to(recipient, {
                opacity: 0.02,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
              });
  
              audio.fireballHit.play();
              gsap.to(healthBar, {
                width: recipient.health + '%',
              });
  
              renderedSprites.splice(1, 1); // Remove the fireball sprite.
            },
          });
          break;
  
        case 'Tackle':
          let movementDistance = 20;
          if (this.isEnemy) movementDistance = -20;
  
          // Animate tackle attack.
          tl.to(this.position, {
            x: this.position.x - movementDistance,
          })
            .to(this.position, {
              x: this.position.x + movementDistance * 2,
              duration: 0.1,
              onComplete: () => {
                // Shaking effect on recipient.
                gsap.to(recipient.position, {
                  x: recipient.position.x + 10,
                  yoyo: true,
                  repeat: 5,
                  duration: 0.08,
                });
  
                // Flashing effect on recipient.
                gsap.to(recipient, {
                  opacity: 0.02,
                  repeat: 5,
                  yoyo: true,
                  duration: 0.08,
                });
  
                audio.tackleHit.play();
                gsap.to(healthBar, {
                  width: recipient.health + '%',
                });
              },
            })
            .to(this.position, {
              x: this.position.x,
            });
          break;
      }
    }
  }
  
  // The Boundary class represents boundaries in the game.
  
  class Boundary {
    static width = 48;
    static height = 48;
  
    constructor({ position }) {
      this.position = position;
      this.width = 48;
      this.height = 48;
    }
  
    // Draws the boundary on the screen.
    draw() {
      c.fillStyle = 'rgba(255, 0, 0, 0.0)';
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }
  