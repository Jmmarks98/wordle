import React from 'react';
import Square from '../square/square';
import KeyButton from '../keyButton/keyButton';
import Register from '../register/register';
import Login from '../login/login';

class Game extends React.Component{
  constructor(props){
    super(props);
    this.processLetter = this.processLetter.bind(this) 
    this.setCurUser = this.setCurUser.bind(this)
    this.saveGame = this.saveGame.bind(this)
    this.getStats = this.getStats.bind(this)
    this.state = {
      letters: this.props.letters, // List of letters currently stored in the game
      colors: this.props.colors, // List of colors represented by the squares in the game
      curRow: this.props.curRow, // Current row/guess being considered
      curLetter: this.props.curLetter, // Current letter/square being considered
      Solution: this.props.solution, // The five-letter answer to the game
      keyColors: this.props.keyColors, // Keyboard colors
      Guesses: [], // User submitted guesses
      result: "Good Luck!", // Displays above the game board, changes on game completion
      User: "Guest", // Current logged in user, for database
      NumGuesses: 6, // Number of guesses, mutated on game completion, for database
      Win: false, // Mutated on game win, for database
      userGames: 'Login to View', // Total number of games played by the user, mutated on login
      userWinPercent: 'Login to View', // User's winpercentage, mutated on login
    }
  }
  setCurUser = (user) => { // Sets the current user on register, login or logout
    this.setState({User: user}, () => this.getStats());
  }
  renderSquare(letter, color, i) { // Loads each grid square with its corresponding letter, color, and grid position
    return (
      <Square
        letter={letter}
        color={color}
        row={Math.floor(i / 5)}
        col={i%5}
      />
    );
  }
  addLetter(letter){ // Adds a letter to the board at the current square
    if(this.state.curLetter < 5 * (this.state.curRow+1)){ // Checks that current square is not filled at the end of the row
      if(this.state.curLetter === 5 * (this.state.curRow+1)){ 
        if(this.state.letters[this.state.curLetter] === ''){ // Checks if square at end of row is empty
          let newLetters = this.state.letters; 
          newLetters[this.state.curLetter] = letter;
          this.setState({letters: newLetters}); // Mutate the letters list with new letter
        }
      }
     else{
      let newLetters = this.state.letters;
      newLetters[this.state.curLetter] = letter;
      this.setState({letters: newLetters}); // Mutate the letters list with new letter
      let newLetter = this.state.curLetter + 1;
      this.setState({curLetter: newLetter}); // Update current letter
     }
    }
  }
  prevLetter(){
    if(5*(this.state.curRow) !== this.state.curLetter){ // Check if at beginning of row
      let newLetters = this.state.letters;
      newLetters[this.state.curLetter-1] = '';
      this.setState({letters: newLetters}); // Delete current letter
      if(this.state.curLetter > this.state.curRow * 5){
        let newLetter = this.state.curLetter - 1; // Update current letter
      this.setState({curLetter: newLetter});
      }
    }
  }
  gameWin(){ // Mutates result message and number of guesses
    if(this.state.curRow === 0){
      this.setState({result: "Lucky!", NumGuesses: 1})
    }
    else if (this.state.curRow === 1){
      this.setState({result: "Genius!", NumGuesses: 2})
    }
    else if (this.state.curRow === 2){
      this.setState({result: "Splendid!", NumGuesses: 3})
    }
    else if (this.state.curRow === 3){
      this.setState({result: "Great!", NumGuesses: 4})
    }
    else if (this.state.curRow === 4){
      this.setState({result: "Good!", NumGuesses: 5})
    }
    else{
      this.setState({result: "Phew!", NumGuesses: 6})
    }
    this.setState({Win: true}, () => {if(this.state.User !== 'Guest'){ // Send game to database if user is logged in
      this.saveGame()
    }})
  }
  gameLose(){
    this.setState({result: this.state.Solution}, () => {if(this.state.User !== ''){this.saveGame() // Send game to database if user is logged in
    }})
  }
  saveGame(){
    fetch('http://localhost:3001/saveGame', { // Posts game data to backend
        method: 'POST',
        // We convert the React state to JSON and send it as the POST body
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.state, ['User', 'Guesses', 'NumGuesses', 'Solution', 'Win'])
      }).then(function(response) {
        return response;
      });
    this.getStats() // Updates stats with new game
  }
 
  processLetter(key){ // Binds keyboard buttons to their respective functions
    if (key === "Enter"){
      this.wordCompare();
    }
    else if(key === "Backspace"){
      this.prevLetter();
    }
    else{
      this.addLetter(key);
    }
  }
  logout(){ // Overwrites user and user stat display 
    this.setState({User: 'Guest', userGames: 'Login to View', userWinPercent: 'Login to View', userGuessDistribution: 'Login to View'});
  }
  getStats = () => { // Retrieves user info
    this.getGamesPlayed()
    this.getWinPercent()
  }
  getGamesPlayed(){ // Retrieves number of games in database for user
    fetch('http://localhost:3001/numGames', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.state, ['User'])
      }).then(response => response.json())
      .then(data => {
        if(data.result !== 0){
          this.setState({userGames: data.result})
        }
        else{
          return "Data Retrieval Error"
        }
      });
  }
  getWinPercent(){ // Retrieves number of wins in database for user and divides by total number of games
    fetch('http://localhost:3001/winPercent', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.state, ['User'])
      }).then(response => response.json())
      .then(data => {
        if(this.state.userGames > 0){
          this.setState({userWinPercent: (data.result / this.state.userGames)})
        }
        else{
          return "Data Retrieval Error"
        }
      });
  }
 
  render(){
    return (
      <div>
        <div id="form">
          <Register setCurUser={this.setCurUser}></Register> {/* Registration Form */}
          <Login setCurUser={this.setCurUser}></Login> {/* Login Form */}
          <button id="logOut" onClick={() => this.logout()}>Log Out</button> {/* Logout Button */}
        </div>
        <div id="gameResult">Logged in as {this.state.User}: {this.state.result}</div> {/* Displays current user and game result */}
        <div id="stats"> {/* Displays user stats or default message if user is Guest */}
          <p>{this.state.User} Stats</p>
          <p>Games Played: {this.state.userGames}</p>
          <p>Win %: {this.state.userWinPercent}</p>
        </div>
        <div className="board-row"> {/* Renders the board with the appropriate letter, color, and index */}
          {this.renderSquare(this.state.letters[0], this.state.colors[0], 0)}
          {this.renderSquare(this.state.letters[1], this.state.colors[1], 1)}
          {this.renderSquare(this.state.letters[2], this.state.colors[2], 2)}
          {this.renderSquare(this.state.letters[3], this.state.colors[3], 3)}
          {this.renderSquare(this.state.letters[4], this.state.colors[4], 4)}
        </div>
        <div className="board-row">
          {this.renderSquare(this.state.letters[5], this.state.colors[5], 5)}
          {this.renderSquare(this.state.letters[6], this.state.colors[6], 6)}
          {this.renderSquare(this.state.letters[7], this.state.colors[7], 7)}
          {this.renderSquare(this.state.letters[8], this.state.colors[8], 8)}
          {this.renderSquare(this.state.letters[9], this.state.colors[9], 9)}
        </div>
        <div className="board-row">
          {this.renderSquare(this.state.letters[10], this.state.colors[10], 10)}
          {this.renderSquare(this.state.letters[11], this.state.colors[11], 11)}
          {this.renderSquare(this.state.letters[12], this.state.colors[12], 12)}
          {this.renderSquare(this.state.letters[13], this.state.colors[13], 13)}
          {this.renderSquare(this.state.letters[14], this.state.colors[14], 14)}
        </div>
        <div className="board-row">
          {this.renderSquare(this.state.letters[15], this.state.colors[15], 15)}
          {this.renderSquare(this.state.letters[16], this.state.colors[16], 16)}
          {this.renderSquare(this.state.letters[17], this.state.colors[17], 17)}
          {this.renderSquare(this.state.letters[18], this.state.colors[18], 18)}
          {this.renderSquare(this.state.letters[19], this.state.colors[19], 19)}
        </div>
        <div className="board-row">
          {this.renderSquare(this.state.letters[20], this.state.colors[20], 20)}
          {this.renderSquare(this.state.letters[21], this.state.colors[21], 21)}
          {this.renderSquare(this.state.letters[22], this.state.colors[22], 22)}
          {this.renderSquare(this.state.letters[23], this.state.colors[23], 23)}
          {this.renderSquare(this.state.letters[24], this.state.colors[24], 24)}
        </div>
        <div className="board-row">
          {this.renderSquare(this.state.letters[25], this.state.colors[25], 25)}
          {this.renderSquare(this.state.letters[26], this.state.colors[26], 26)}
          {this.renderSquare(this.state.letters[27], this.state.colors[27], 27)}
          {this.renderSquare(this.state.letters[28], this.state.colors[28], 28)}
          {this.renderSquare(this.state.letters[29], this.state.colors[29], 29)}
        </div>

        <div id="keyboard"> {/* Render keyboard UI*/}
            <KeyButton id="q" letter="Q" processLetter={this.processLetter} color={this.state.keyColors[0]}></KeyButton>
            <KeyButton id="w" letter="W" processLetter={this.processLetter} color={this.state.keyColors[1]}></KeyButton>
            <KeyButton id="e" letter="E" processLetter={this.processLetter} color={this.state.keyColors[2]}></KeyButton>
            <KeyButton id="r" letter="R" processLetter={this.processLetter} color={this.state.keyColors[3]}></KeyButton>
            <KeyButton id="t" letter="T" processLetter={this.processLetter} color={this.state.keyColors[4]}></KeyButton>
            <KeyButton id="y" letter="Y" processLetter={this.processLetter} color={this.state.keyColors[5]}></KeyButton>
            <KeyButton id="u" letter="U" processLetter={this.processLetter} color={this.state.keyColors[6]}></KeyButton>
            <KeyButton id="i" letter="I" processLetter={this.processLetter} color={this.state.keyColors[7]}></KeyButton>
            <KeyButton id="o" letter="O" processLetter={this.processLetter} color={this.state.keyColors[8]}></KeyButton>
            <KeyButton id="p" letter="P" processLetter={this.processLetter} color={this.state.keyColors[9]}></KeyButton>
            <br></br>
            <KeyButton id="a" letter="A" processLetter={this.processLetter} color={this.state.keyColors[10]}></KeyButton>
            <KeyButton id="s" letter="S" processLetter={this.processLetter} color={this.state.keyColors[11]}></KeyButton>
            <KeyButton id="d" letter="D" processLetter={this.processLetter} color={this.state.keyColors[12]}></KeyButton>
            <KeyButton id="f" letter="F" processLetter={this.processLetter} color={this.state.keyColors[13]}></KeyButton>
            <KeyButton id="g" letter="G" processLetter={this.processLetter} color={this.state.keyColors[14]}></KeyButton>
            <KeyButton id="h" letter="H" processLetter={this.processLetter} color={this.state.keyColors[15]}></KeyButton>
            <KeyButton id="j" letter="J" processLetter={this.processLetter} color={this.state.keyColors[16]}></KeyButton>
            <KeyButton id="k" letter="K" processLetter={this.processLetter} color={this.state.keyColors[17]}></KeyButton>
            <KeyButton id="l" letter="L" processLetter={this.processLetter} color={this.state.keyColors[18]}></KeyButton>
            <br></br>
            <KeyButton letter="Enter" processLetter={this.processLetter} color="#808384"></KeyButton>
            <KeyButton id="z" letter="Z" processLetter={this.processLetter} color={this.state.keyColors[19]}></KeyButton>
            <KeyButton id="x" letter="X" processLetter={this.processLetter} color={this.state.keyColors[20]}></KeyButton>
            <KeyButton id="c" letter="C" processLetter={this.processLetter} color={this.state.keyColors[21]}></KeyButton>
            <KeyButton id="v" letter="V" processLetter={this.processLetter} color={this.state.keyColors[22]}></KeyButton>
            <KeyButton id="b" letter="B" processLetter={this.processLetter} color={this.state.keyColors[23]}></KeyButton>
            <KeyButton id="n" letter="N" processLetter={this.processLetter} color={this.state.keyColors[24]}></KeyButton>
            <KeyButton id="m" letter="M" processLetter={this.processLetter} color={this.state.keyColors[25]}></KeyButton>
            <KeyButton letter="Backspace" processLetter={this.processLetter} color="#808384"></KeyButton>
        </div>
      </div>
    );
  }
  wordCompare(){ // Compares the committed word with the solution and updates the game accordingly
    const keyDict = {'Q': 0, 'W': 1, 'E': 2, 'R': 3, 'T': 4, 'Y': 5, 'U': 6, 'I': 7, 'O': 8, 'P': 9, 'A': 10, 'S': 11, 'D': 12, 'F': 13, 'G': 14, 'H': 15, 'J': 16, 'K': 17, 'L': 18, 'Z': 19, 'X': 20, 'C': 21, 'V': 22, 'B': 23, 'N': 24, 'M': 25} // Binds letters to their respective array index
    console.log(this.state.Solution) // Display solution to dev tools console for debugging purposes
    if (this.state.curLetter === 5 || this.state.curLetter === 10 || this.state.curLetter === 15 || this.state.curLetter === 20 || this.state.curLetter === 25 || this.state.curLetter === 30){ // Checks that the row is filled
      const rowLetters = [this.state.letters[5*this.state.curRow], this.state.letters[5*this.state.curRow+1], this.state.letters[5*this.state.curRow+2], this.state.letters[5*this.state.curRow+3], this.state.letters[5*this.state.curRow+4]]; // Parses the letters for the current row
      const rowWord = rowLetters.join(""); // Joins the characters into the string
      let newGuess = this.state.Guesses.concat(rowWord); // Adds new guess to guesses list
      this.setState({Guesses: newGuess});
      for(let l = 0; l < 5; ++l){ // Iterates over each letter
        if(rowLetters[l] === this.state.Solution[l]){ // If the letter is in the same position as the solution, the square and respective keyboard key are colored green
          let newColors = this.state.colors;
          newColors[(5*this.state.curRow)+l] = "#548c4e";
          this.setState({colors: newColors});
          let newKeyColors = this.state.keyColors;
          newKeyColors[keyDict[rowLetters[l]]] = "#548c4e";
          this.setState({keyColors: newKeyColors});
        }
        else if(this.state.Solution.includes(rowLetters[l])){ // If the letter is included in the solution but in a different place, the square and respective keyboard key are colored yellow if not already green
          let newColors = this.state.colors;
          newColors[(5*this.state.curRow)+l] = "#b4a03a";
          this.setState({colors: newColors});
          let newKeyColors = this.state.keyColors;
          newKeyColors[keyDict[rowLetters[l]]] = "#b4a03a";
          this.setState({keyColors: newKeyColors});
        }
        else{ // If the letter is not in the word, the square and respective keyboard key are colored dark grey
          let newColors = this.state.colors;
          newColors[(5*this.state.curRow)+l] =  "#3a3a3c";
          this.setState({colors: newColors});
          let newKeyColors = this.state.keyColors;
          newKeyColors[keyDict[rowLetters[l]]] = "#3a3a3c";
          this.setState({keyColors: newKeyColors});
        }
      }
      let solved = true;
      for(let l = 5*this.state.curRow; l < 5 + 5*this.state.curRow; ++l){ // Checks if the guess is the solution, this is a very roundabout way of doings so but it works
        if (this.state.colors[l] !== "#548c4e"){
          solved = false;
        }
      }
      if(solved){ // I don't know why this is here twice but the data is updated correctly so I'm not touching it
        const rowLetters = [this.state.letters[5*this.state.curRow], this.state.letters[5*this.state.curRow+1], this.state.letters[5*this.state.curRow+2], this.state.letters[5*this.state.curRow+3], this.state.letters[5*this.state.curRow+4]];
        const rowWord = rowLetters.join("");
        let newGuess = this.state.Guesses.concat(rowWord);
        this.setState({Guesses: newGuess});
        this.gameWin();
      }
      else if(this.state.curRow === 5){ // User did not guess word in enough guesses, trigger game lose
        const rowLetters = [this.state.letters[5*this.state.curRow], this.state.letters[5*this.state.curRow+1], this.state.letters[5*this.state.curRow+2], this.state.letters[5*this.state.curRow+3], this.state.letters[5*this.state.curRow+4]];
        const rowWord = rowLetters.join("");
        let newGuess = this.state.Guesses.concat(rowWord);
        this.setState({Guesses: newGuess});
        this.gameLose();
      }
      else{ // Update current row
        let newRow = this.state.curRow + 1;
        this.setState({curRow: newRow});
      }
    }
  // }
  }
}

Game.propTypes = {};

Game.defaultProps = {};

export default Game;
