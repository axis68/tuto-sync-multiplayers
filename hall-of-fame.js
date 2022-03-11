class HallOfFame {
    constructor(wallSize) {
        this.playerArray = [];
        this.wallSize = wallSize;
    }

    // singleScore: of type "SingleScore"
    addSingleScore(singleScore) {
        if (singleScore.score == 0) {
            return;
        }

        let playerIndex = this.searchPlayerIndexInArray(singleScore.player);
        if (playerIndex != -1) {    // Player already exists
            this.playerArray[playerIndex].score = singleScore.score;
            this.sortPlayerArrayDescending();
            return;
        }
        
        if (this.playerArray.length >= this.wallSize) {
            this.sortPlayerArrayDescending(); // List is full
            let lowestScore = this.playerArray[this.wallSize - 1].score;
            if (singleScore.score > lowestScore ) {
                this.playerArray.pop();
            } else {
                return;
            }
        }
        // console.log('Push: ' + singleScore.player + " - " + singleScore.score);
        this.playerArray.push(singleScore);
        this.sortPlayerArrayDescending();
    }

    sortPlayerArrayDescending() {
        this.playerArray.sort(function (a, b) {
            return b.score - a.score;
        });
    }

    searchPlayerIndexInArray(playerName) {
        let foundIndex = -1;
        for (let i = 0; i < this.playerArray.length; i++) {
            if (this.playerArray[i].player == playerName) {
                foundIndex = i;
                break;
            }
        }
        return foundIndex;
    }

    logHallOfFame() {
        console.log('Hall of fame:');
        this.playerArray.forEach(item => console.log(item.player + " = " + item.score));
    }
}

class SingleScore {
    constructor(player, score) {
        this.player = player;
        this.score = score;
    }
}

export { HallOfFame, SingleScore };
