# Tutorial Multiplayer breakout game using JavaScript and Socket-IO

MDN provides a tutorial for a [single player breakout game](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript). 
In this tutorial we will learn how to extend it for 2-players using Socket-IO.

![The game will look like this after the first tutorial](/img/breakout-screenshot.png)

## Multiplayer interaction

Socket.IO provides messaging mechanisms for the communication between a server and 1-2 clients (the players).
As you will see, the realization is straight forward and the result consists in only 2 files:
- `server.js`: less than 100 lines of code, the server-script is executed on Node.js. It handles the position of game elements (ball, paddles) and synchronizes the information
  with the clients.
- `index.html`: less than 250 lines of code, the client is handles the interactions with the player and the graphical rendering

## Setting up the development environment

For the beginning we will develop and run the game on the local machine, later we will explain how to deploy the game on internet.
As a prerequisite please just install Node.js, then install the following packages from the command line:

    npm install -save express
    npm install -save socket.io

Express is a leight-weight web framework. [Socket-IO](https://socket.io/) is a bi-directional communication mechanism.
Please note that by doing this the file `package.json` will be created, referencing your dependencies. To install/update the dependencies, you just have to
execute `npm install`.

## Start the game

Before we go more in details, you may want starting the game. 
The server is started either with the command `node server.js` or `npm start`. The clients can then opened in your browser by entering the address `http://localhost/`.