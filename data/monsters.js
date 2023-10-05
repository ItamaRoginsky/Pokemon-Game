// Define the monsters in the game
const monsters = {
    // Monster named "Emby"
    Emby: {
        // Initial position on the canvas
        position: {
            x: 300,
            y: 335
        },
        // Image source for the sprite
        image: {
            src: './img/embySprite.png'
        },
        // Animation frames configuration
        frames: {
            max: 4,      // Maximum number of frames
            val: 0,       // Current frame index
            elapsed: 0,   // Elapsed time for frame animation
            hold: 30      // Number of frames to hold each frame
        },
        // Enable animation for this monster
        animate: true,
        // Name of the monster
        name: 'Emby',
        // List of attacks this monster can perform
        attacks: [attacks.Tackle, attacks.Fireball]
    },
    // Monster named "Draggle"
    Draggle: {
        // Initial position on the canvas
        position: {
            x: 800,
            y: 100
        },
        // Image source for the sprite
        image: {
            src: './img/draggleSprite.png'
        },
        // Animation frames configuration
        frames: {
            max: 4,      // Maximum number of frames
            val: 0,       // Current frame index
            elapsed: 0,   // Elapsed time for frame animation
            hold: 30      // Number of frames to hold each frame
        },
        // Enable animation for this monster
        animate: true,
        // Flag indicating that this monster is an enemy
        isEnemy: true,
        // Name of the monster
        name: 'Draggle',
        // List of attacks this monster can perform
        attacks: [attacks.Tackle]
    }
};
