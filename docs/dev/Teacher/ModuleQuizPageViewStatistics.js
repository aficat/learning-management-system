import React, { Component } from "react";
import { MDBDataTable, MDBContainer, MDBBtn, MDBCardHeader, MDBRow, MDBCol, MDBCard, MDBProgress, MDBBreadcrumb, MDBBreadcrumbItem, MDBCardBody, MDBIcon } from "mdbreact";
import axios from 'axios';
import { observer, inject } from 'mobx-react';
import styled from 'styled-components';
import ModuleSideNavigation from "../ModuleSideNavigation";

@inject('dataStore')
@observer
class ModuleQuizPageViewStatistics extends Component {

  state = {
    moduleId: 0,
    status: "retrieving",
    title: "",
    description: "",
    attempts: 0,
    questions: [],
    columns: [
      {
        "label": "Student",
        "field": "student",
        "width": 50,
        "attributes": {
          "aria-controls": "DataTable",
          "aria-label": "Name"
        }
      },
      {
        "label": "Score",
        "field": "score",
        "width": 100
      },
      {
        "label": "",
        "field": "",
        "width": 100
      }
    ],
    rows: [{ label: "Retrieving data..." }],
    status: "retrieving",
  }

  initPage() {
    var pathname = location.pathname;
    pathname = pathname.split("/");
    this.props.dataStore.setCurrModId(pathname[2]);
    this.props.dataStore.setCurrQuizId(pathname[4]);
  }

  componentDidMount() {
    this.initPage();
    this.getModuleQuizStatistics()
  }

  getModuleQuizStatistics = () => {
    let quizId = this.props.dataStore.getCurrQuizId;
    axios
      .get(`http://localhost:8080/LMS-war/webresources/Assessment/retrieveQuizStatistics?quizId=${quizId}`)
      .then(result => {
        this.setState({
          status: "done",
          title: result.data.title,
          description: result.data.description,
          attempts: result.data.attempts,
          questions: result.data.questions
        })
      })
      .catch(error => {
        this.setState({ status: "error" })
      });
  }

  renderQuestionStatistics = (question, index) => {
    return (
      <>
        <b>Question {index}</b>
        {question.question}
        <br />
        <br />
        {question.answers && question.answers.map((answer) => {
          const count = answer.count;
          var answerPercentage = (count / this.state.attempts * 100).toFixed(2)
          return (
            <>
              <p>{answer.answer}</p>
              <MDBRow>
                <MDBCol md="5">
                  <MDBProgress value={answerPercentage} color="blue" />
                </MDBCol>
                <MDBCol md="2">
                  {answerPercentage}%
              </MDBCol>
                <MDBCol md="5"></MDBCol>
              </MDBRow>
            </>
          )
        })}
        <hr />
      </>
    )
  }

  renderResults = () => {
    if (this.state.status === "done") {
      return (
        <MDBCard cascade className="my-3" style={{ padding: 20 }}>
          <h4>Quiz Statistics</h4>
          <br />
          Quiz Title: {this.state.title} <br />
          Description: {this.state.description} <br />
          No. of Attempts: {this.state.attempts}
          <h6 style={{ fontStyle: "italic" }}>
            <br />
            Note: Short Answer questions are removed from quiz statistics.
          </h6>
          <hr />
          <br />
          {this.state.questions.map((question, index) => { return this.renderQuestionStatistics(question, index + 1) })}
        </MDBCard>
      )
    } else if (this.state.status === "error") {
      return (
        <MDBCard cascade className="my-3" style={{ padding: 20 }}>
          <h5>Quiz Statistics is not available at the moment.</h5>
        </MDBCard>
      )
    }
  }

  renderUserTable = (tableData) => {
    return (
      <MDBCard>
        <MDBCardHeader>
          Students Below 25th Percentile
              </MDBCardHeader>
        <MDBCardBody>
          <MDBDataTable striped bordered hover scrollX scrollY maxHeight="400px" data={tableData} pagesAmount={4} />
        </MDBCardBody>
      </MDBCard>
    )
  }

  renderTableWithMessage = (message) => {
    const data = () => ({ columns: this.state.columns, rows: [{ label: message }] })

    const tableData = {
      columns: [...data().columns.map(col => {
        col.width = 200;
        return col;
      })], rows: [...data().rows]
    }
    return (
      <MDBCard>
        <MDBCardHeader>
          Students Below 25th Percentile
              </MDBCardHeader>
        <MDBCardBody>
          <MDBDataTable striped bordered hover scrollX scrollY maxHeight="400px" data={tableData} pagesAmount={4} />
        </MDBCardBody>
      </MDBCard>
    )
  }

  renderAwaiting = () => {
    return (
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  renderTable = () => {
    var newRows = []
    const row = this.state.rows
    for (let i = 0; i < row.length; i++) {
      newRows.push({
        userId: row[i].name,
        firstName: row[i].score,
        button: <center><MDBBtn color="primary" outline size="sm">Plan</MDBBtn></center>
      })
    }
    const data = () => ({ columns: this.state.columns, rows: newRows })

    const widerData = {
      columns: [...data().columns.map(col => {
        col.width = 150;
        return col;
      })], rows: [...data().rows.map(row => {
        return row;
      })]
    }

    if (this.state.status === "retrieving")
      return this.renderAwaiting();
    else if (this.state.status === "error")
      return this.renderTableWithMessage("Error in Retrieving Data. Please try again later.");
    else if (this.state.status === "done")
      if (this.state.rows[0].label === "Retrieving data...")
        return this.renderTableWithMessage("No data found.");
      else
        return this.renderUserTable(widerData);
    else
      return this.renderTableWithMessage("No data found.");
  }

  render() {
    var moduleId = this.props.dataStore.getCurrModId;
    return (
      <div className={this.props.className}>
        <ModuleSideNavigation moduleId={moduleId}></ModuleSideNavigation>
        <div className="module-content">
          <MDBContainer className="mt-3">
            <MDBRow className="py-3">
              <MDBCol md="12">
                <MDBCard>
                  <MDBCardBody id="breadcrumb" className="d-flex align-items-center justify-content-between">
                    <MDBBreadcrumb>
                      <MDBBreadcrumbItem><a href={`/modules/${moduleId}/quiz`}>Quiz</a></MDBBreadcrumbItem>
                      <MDBBreadcrumbItem active>Statistics</MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
              <MDBCol md="12">
                {this.renderResults()}
              </MDBCol>
              <MDBCol md="12">
                {this.renderTable()}
              </MDBCol>
            </MDBRow>
          </MDBContainer>
        </div>
      </div>
    )
  }
}

export default styled(ModuleQuizPageViewStatistics)`
.module-content{
    margin-left: 270px;
    margin-top: 40px;
}
`;