// Get the canvas element and its 2D context
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

// Set the canvas dimensions
canvas.width = 1024;
canvas.height = 576;

// Prepare collision maps for the game
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

// Create an array to store boundary objects
const boundaries = []
const offset = {
  x: -350,
  y: -265    
}

// Generate boundaries based on collision map
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * 48 + offset.x,
            y: i * 48 + offset.y
          }
        })
      )
    }
  })
})

// Create an array to store battle zone objects
const battleZones = []

// Generate battle zones based on battle zone map
battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      battleZones.push(
        new Boundary({
          position: {
            x: j * 48 + offset.x,
            y: i * 48 + offset.y
          }
        })
      )
    }
  })
})

// Load images for the game
const image = new Image()
image.src = './img/Pallet Town.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foregroundImage.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

// Create the player sprite
const player = new Sprite({
    position: {
        x:  canvas.width / 2 - 192/4 /2 ,
        y:  canvas.height/2 - 68/2 
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage
    }
})

// Create background and foreground sprites
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

// Create an object to track key presses
const keys = {
    w: {
      pressed: false
    },
    a: {
      pressed: false
    },
    s: {
      pressed: false
    },
    d: {
      pressed: false
    }
}

// An array of movables including boundaries and battle zones
const movables = [background, ...boundaries, foreground, ...battleZones]

// Function to check for rectangular collision
function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.width + rectangle2.position.x &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}

// Object to manage the battle state
const battle = {
    initiated: false
}

// Animation loop for the game
function animate() {
    console.log('animating map')
    const animationId = window.requestAnimationFrame(animate)
    background.draw()

    boundaries.forEach(boundary => {
        boundary.draw()
    })

    battleZones.forEach(battleZone => {
        battleZone.draw()
    })

    player.draw()
    foreground.draw()

    let moving = true
    player.animate = false;
    
    console.log('is it initiated = ' + battle.initiated)
    if (battle.initiated) return

    // Check for collisions with battle zones
    if (keys.a.pressed || keys.s.pressed || keys.d.pressed || keys.w.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            const overlappingArea = (Math.min(
              player.position.x + player.width,
              battleZone.position.x + battleZone.width
            ) -
              Math.max(player.position.x, battleZone.position.x)) *
            (Math.min(
              player.position.y + player.height,
              battleZone.position.y + battleZone.height
            ) -
              Math.max(player.position.y, battleZone.position.y))
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: battleZone
            }) && overlappingArea > (player.width * player.height) / 2 &&
            Math.random() < 0.019) {
                window.cancelAnimationFrame(animationId)

                audio.Map.stop()
                audio.initBattle.play()
                audio.battle.play()

                gsap.to('#overLappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                      gsap.to('#overLappingDiv', {
                        opacity: 1,
                        duration: 0.4,
                        onComplete() {
                          // Activate a new animation loop for battle
                          initBattle()
                          animateBattle()
                          gsap.to('#overLappingDiv', {
                            opacity: 0,
                            duration: 0.4
                          })
                        }
                      })
                    }
                })
          
                battle.initiated = true
                break
            }
        }
    }

    // Handle player movement based on key presses
    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true;
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: { x: boundary.position.x, y: boundary.position.y + 3 }}
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.y += 3
            })
        }  
    } else if (keys.s.pressed && lastKey === 's') {
        player.animate = true;
        player.image = player.sprites.down

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: { x: boundary.position.x, y: boundary.position.y - 3 }}
            })) {
                console.log('colliding')
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.y -= 3
            })
        }      
    } else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true;
        player.image = player.sprites.left

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: { x: boundary.position.x + 3, y: boundary.position.y }}
            })) {
                console.log('colliding')
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x += 3
            })
        }      
    } else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true;
        player.image = player.sprites.right

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: { x: boundary.position.x - 3, y: boundary.position.y }}
            })) {
                console.log('colliding')
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x -= 3
            })
        } 
    }
}

// Initialize battle state when the user clicks
let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'a':
            keys.a.pressed = true 
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
    }   
})

// Handle key release events
window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
            keys.a.pressed = false 
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break
    }   
})

// Initialize the audio when the user clicks
let clicked = false
addEventListener('click', () => {
    if (!clicked) {
        audio.Map.play()
        clicked = true
    }
})
