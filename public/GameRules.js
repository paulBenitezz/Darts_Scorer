class Player {

    constructor(player_id, name, score) {
        this.player_id = player_id;
        this.name = name;
        this.score = score;
        console.log(`Player ${player_id} obj created: ${name}, ${score}`);
    }


    handleState(inputScore) {

      if (!this.isValidScore) 
            return;

      


    }

    checkWin(inputScore) {
        let total = this.score - inputScore;

        if (total != 0)
            return false;

        return true;

    }

    handleWin() {
        // 
    }

    isValidScore(inputScore) {

        return (inputScore >= 0 && inputScore <= 180) && !this.checkWin(inputScore);
    }



}