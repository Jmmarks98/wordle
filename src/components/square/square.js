import React from 'react';

class Square extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      letter: this.props.letter, // Letter assigned to the square
      color: this.props.color, // Color assigned to the square
      row: this.props.row, // Grid row square is in
      col: this.props.col // Grid column square is in
    };
  }
  render(){
    return <div id={this.props.row+this.props.col} className="squares" style={{backgroundColor: this.props.color}}>{this.props.letter}</div>;
  }
}

Square.propTypes = {};

Square.defaultProps = {};

export default Square;
