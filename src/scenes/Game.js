

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.score = 0;
        this.ballSpeed = 300;
    }

    preload() {
        this.load.image('paddle', '../public/assets/brick.png');
        this.load.image('ball', '../public/assets/bola.png');
        this.load.image('block', '../public/assets/brick.png');
    }

    create() {
        // Crear la pala
        this.paddle = this.physics.add.sprite(400, 550, 'paddle').setImmovable().setSize(700).setScale(0.1);

        // Crear la bola
        this.ball = this.physics.add.sprite(400, 500, 'ball').setSize(800).setScale(0.03);
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1);
        this.ball.setData('onPaddle', true);

        // Crear la matriz de ladrillos (NxM)
        let rows = 4; // N
        let cols = 12; // M
        this.blocks = this.physics.add.staticGroup();

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let blockX = 100 + x * 75; // Ajuste de espaciado horizontal
                let blockY = 60 + y * 60; // Ajuste de espaciado vertical
                let block = this.blocks.create(blockX, blockY, 'block');
                block.setScale(0.1).refreshBody(); // Reducir tamaño de los ladrillos
            }
        }

        // Colisiones
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        // Control de la pala
        this.input.on('pointermove', function (pointer) {
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 1300);
        }, this);

        // Lanzar la bola
        this.input.on('pointerup', function () {
            if (this.ball.getData('onPaddle')) {
                this.ball.setVelocity(-75, -this.ballSpeed);
                this.ball.setData('onPaddle', false);
            }
        }, this);

        // Mostrar puntuación
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    }

    update() {
        if (this.ball.y > 600) {
            this.ball.setPosition(this.paddle.x, 400);
            this.ball.setVelocity(-75, 300);
            this.ball.setData('onPaddle', true);
        }
    }

    hitBlock(ball, block) {
        block.disableBody(true, true);

        // Incrementar la puntuación
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        // Revisar si todos los bloques fueron destruidos
        if (this.blocks.countActive() === 0) {
            this.ballSpeed *= 1.1; // Aumentar la velocidad de la pelota en un 10%
            this.scene.restart(); // Reiniciar la escena y mantener la velocidad
        }
    }

    hitPaddle(ball, paddle) {
        let diff = 0;

        if (ball.x < paddle.x) {
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        } else if (ball.x > paddle.x) {
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        } else {
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }
}
