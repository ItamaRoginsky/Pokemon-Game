// Load the battle background image
const battleBackgroundImage = new Image();
battleBackgroundImage.src = './img/battleBackground.png';

// Create a battle background sprite
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
});

// Declare variables for monsters, animation, and queues
let draggle;
let emby;
let queue;
let renderedSprites;
let battleAnimationId;

// Initialize the battle
function initBattle() {
    // Show the user interface elements and reset health bars
    document.querySelector('#userInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';
    document.querySelector('#playerHealthBar').style.width = '100%';
    document.querySelector('#enemyHealthBar').style.width = '100%';
    document.querySelector('#attacksBox').replaceChildren();

    // Create monster instances
    draggle = new Monster(monsters.Draggle);
    emby = new Monster(monsters.Emby);
    renderedSprites = [draggle, emby];
    queue = [];

    // Populate attack buttons for Emby
    emby.attacks.forEach(attack => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        document.querySelector('#attacksBox').append(button);
    });

    // Add event listeners for attack buttons and tooltips
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            });

            if (draggle.health <= 0) {
                queue.push(() => {
                    draggle.faint();
                });

                queue.push(() => {
                    gsap.to('#overLappingDiv', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector('#userInterface').style.display = 'none';

                            gsap.to('#overLappingDiv', {
                                opacity: 0
                            });
                            battle.initiated = false;
                            audio.Map.play();
                        }
                    });
                });
            }

            const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                });
            });
        });

        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector('#attackType').innerHTML = selectedAttack.type;
            document.querySelector('#attackType').style.color = selectedAttack.color;
        });
    });
}

// Function to animate the battle
function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();

    renderedSprites.forEach(sprite => {
        sprite.draw();
    });
}

// Start the animation
animate();

// Event listener for the dialogue box
document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
        if (emby.health <= 0) {
            queue.push(() => {
                emby.faint();
            });
            queue.push(() => {
                gsap.to('#overLappingDiv', {
                    opacity: 1,
                    onComplete: () => {
                        cancelAnimationFrame(battleAnimationId);
                        animate();
                        document.querySelector('#userInterface').style.display = 'none';

                        gsap.to('#overLappingDiv', {
                            opacity: 0
                        });
                        battle.initiated = false;
                        audio.Map.play();
                    }
                });
            });
        }
    } else {
        e.currentTarget.style.display = 'none';
    }
});
