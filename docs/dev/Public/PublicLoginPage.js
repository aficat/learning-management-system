import React, { Component } from "react";
import { MDBEdgeHeader, MDBContainer, MDBRow, MDBCol, MDBJumbotron, MDBAnimation } from "mdbreact";
import { observer, inject } from 'mobx-react'
import { Redirect } from "react-router-dom";
import axios from "axios";
import logo from '../img/coursepack-logo.jpg';

@inject('dataStore')
@observer
class PublicLoginPage extends Component {

  state = {
    loggedInStatus: false,
    email: "",
    password: "",
    message: ""
  }

  handleChangeEmail = event => this.setState({ email: event.target.value });
  handleChangePassword = event => this.setState({ password: event.target.value });

  checkLogIn = () => {
    const { email, password } = this.state;
    event.preventDefault();

    axios
      // .post("http://localhost:3001/login", {
      .get(`http://localhost:8080/LMS-war/webresources/User/userLogin?email=${email}&password=${password}`)
      .then(result => {
        if (result.data.user.accessRight === "Public") {
          this.props.dataStore.setSignInStatus(true, this.state.email, this.state.password, result.data.user.accessRight)
          this.props.dataStore.setUserDetails(result.data.user.userId, result.data.user.gender, result.data.user.firstName, result.data.user.lastName, result.data.user.username)
          this.setState({ loggedInStatus: true })
        }
        else {
          this.setState({ message: "invalid access" })
        }
      })
      .catch(error => {
        this.setState({ message: "error" })
        console.error("error in axios " + error);
      });
  }

  render() {
    // console.log(this.props.dataStore.getPath)
    if (this.state.loggedInStatus === true) {
      return <Redirect to={this.props.dataStore.getPath} />
    }
    return (
      <>
        <MDBEdgeHeader color="red lighten-2" className="loginPage" />
        <MDBAnimation type="zoomIn" duration="500ms">
          <MDBContainer>
            <MDBRow>
              <MDBCol md="8" className="mt-3 mx-auto">
                <MDBJumbotron>
                  <center><img src={logo} width="50%" /></center>
                  <ul className="list-unstyled example-components-list">
                    <form onSubmit={this.checkLogIn}>
                      <br />
                      <label htmlFor="defaultFormRegisterEmailEx" className="grey-text">
                        Email
                </label>
                      <input type="email" id="defaultFormRegisterEmailEx" onChange={this.handleChangeEmail} className="form-control" />
                      <br />
                      <label htmlFor="defaultFormRegisterPasswordEx" className="grey-text">
                        Password
                </label>
                      <input type="password" id="defaultFormRegisterPasswordEx" onChange={this.handleChangePassword} className="form-control" />
                      <div className="text-center mt-4">
                        <button className="btn" type="submit" style={{ backgroundColor: "#fb6d63" }}>
                          Login
                  </button>
                        <br />
                        <br />
                        <p className="text-center grey-text">
                          Do you have an account? If not, sign up
                        <a href="/coursepack/register" style={{ color: "#fb6d63" }}> here</a>.
                        </p>
                      </div>
                    </form>
                    {this.state.message === "error" && <h6 align="center" style={{ color: "red" }}>Invalid email/ password!</h6>}
                    {this.state.message === "invalid access" && <h6 align="center" style={{ color: "red" }}>Access Denied</h6>}
                  </ul>
                </MDBJumbotron>
              </MDBCol>
            </MDBRow>
          </MDBContainer>
        </MDBAnimation>
      </>
    );
  }
}

export default PublicLoginPage;
