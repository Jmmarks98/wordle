import React from 'react';

class KeyButton extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      letter: this.props.letter, // Letter assigned to the key
      processLetter: this.props.processLetter, // Parent Function
      color: this.props.color // Color for the key assigned by game
    }
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick = () => { // Call parent function
    this.state.processLetter(this.state.letter); 
  };
  render() { // Render key button
    if (this.props.letter === "Backspace"){
      return <button id={this.props.letter} onClick={this.handleClick} style={{backgroundColor: this.props.color}}>Delete</button>
    }
    else{
      return <button id={this.props.letter} onClick={this.handleClick} style={{backgroundColor: this.props.color}}>{this.props.letter}</button>
    }
  }
}

KeyButton.propTypes = {};

KeyButton.defaultProps = {};

export default KeyButton;
 