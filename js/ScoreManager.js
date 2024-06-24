export default class ScoreManager {
    constructor() {
        this.score = 0;
    }

    updateScore(points) {
        this.score += points;
        console.log(`Score updated: ${this.score}`);
    }

    getScore() {
        return this.score;
    }

    resetScore() {
        this.score = 0
        return this.score
    }
}
