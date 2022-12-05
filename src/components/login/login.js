import React from 'react'
 
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Username: '', 
      Password: ''
    };
  }
 
  handleChange = (event) => { // Setter for state props
    this.setState({[event.target.name]: event.target.value});
  }
 
  handleSubmit = (event) => { // Sends form data to backend for authentication
 
    fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.state)
      }).then(response => response.json())
      .then(data => {
        if(data.result === "success"){
          this.props.setCurUser(this.state.Username) // Log User In by calling parent function
        }
        else{
          this.setState({Username: '', Password: ''});
        }
      });
 
    event.preventDefault();
}
 
  render() {
    return (
      <form id="logForm" onSubmit={this.handleSubmit}> {/* Login Form */}
        <label>
          Login Username:
          <input id="logField" type="text" value={this.state.Username} name="Username" onChange={this.handleChange} />
        </label>
        <label>
          Password:
          <input id="logPassField" type="text" value={this.state.Password} name="Password" onChange={this.handleChange} />
        </label>
        <input id="logSubmit" type="submit" value="Submit" />
      </form>
      
    );
  }
}
 
export default Login;