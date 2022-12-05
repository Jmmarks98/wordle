import React from 'react'
 
class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = { Username: '' , Password: ''};
  }
 
  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }
 
  handleSubmit = (event) => {
    fetch('http://localhost:3001/register', {
        method: 'POST',
        // We convert the React state to JSON and send it as the POST body
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.state)
      }).then(function(response) {
        this.props.setCurUser(this.state.Username)
        return response;
      });
 
    event.preventDefault();
}
 
  render() {
    return (
      <form id="regForm" onSubmit={this.handleSubmit}>
        <label>
          Register Username:
          <input id="regField" type="text" value={this.state.Username} name="Username" onChange={this.handleChange} />
        </label>
        <label>
          Password:
          <input id="regPassField" type="text" value={this.state.Password} name="Password" onChange={this.handleChange} />
        </label>
        <input id="regSubmit" type="submit" value="Submit" />
      </form>
    );
  }
}
 
export default Register;