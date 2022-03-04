# Tutorial Multiplayer breakout game using JavaScript and Socket-IO

MDN provides a tutorial for a [single player breakout game](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript). 
In this tutorial we will learn how to extend it for 2-players using Socket-IO.

![The game will look like this after the first tutorial](/img/breakout-screenshot.png)

## How to create multiplayer interaction?

Socket.IO provides the messaging mechanism we will use for the communication between a server and 1-2 clients (the players).
As you will see, the realization is straight forward, the result consists in only two files:
- `server.js`: This is the server-script which is executed on a Node.js web-server. It manages the position of game elements (ball, paddles) and synchronizes the information
  with the clients. Less than 100 lines of code.
- `index.html`: The client resolves the player-interactions and renders the graphical user interface. Less than 250 lines of code.

## Setting up the development environment

For the beginning we will just develop and run the game on the local machine, later we will explain how to deploy the game on internet.
As a prerequisite you will need to install [Node.js](https://nodejs.org/en/download/).

After this, please install the following packages from the command line:

    npm install -save express
    npm install -save socket.io

[Express](https://expressjs.com/) is a leight-weight web-development framework. [Socket-IO](https://socket.io/) is a bi-directional communication mechanism.
The file `package.json` will be created automatically, referencing your dependencies. To install/update the dependencies, you just have to
execute `npm install`.

## Start the game

Before we go more in details, you may want starting the game.

The server is started either with the command `node server.js` or `npm start`. The clients can then opened in your browser at the address `http://localhost/`.