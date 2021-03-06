import React, { Component } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBCard, MDBIcon, MDBInputGroup, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader } from "mdbreact";
import { observer, inject } from 'mobx-react';
import styled from 'styled-components';
import CoursepackSideNavigation from "../CoursepackSideNavigation";
import CoursepackSideNavigationDropdown from "../CoursepackSideNavigationDropdown";
import { Stepper, Step, StepLabel, Typography, Snackbar } from '@material-ui/core';
import axios from 'axios';
import { Redirect } from "react-router-dom";
import { API_URL } from '../utils/GetApiUrl';

@inject('dataStore')
@observer
class CoursepackQuizPageEditQuiz extends Component {

    state = {
        recallQuiz: false,
        studentName: "",
        username: "",
        userId: "",
        email: "",
        coursepackId: 0,
        message: "",
        openSnackbar: false,
        description: "", // description
        title: "", // title
        questionType: "mcq",
        publish: false,
        publishAnswer: false,
        modal1: false, //edit question
        modal2: false, //delete question
        modal3: false, //add normal question
        activeStep: 0,
        steps: ['Quiz Configuration', 'Build Quiz'],

        //create quiz inputs
        quizType: "normal",
        questionsOrder: false, // "random" => true or "initial" => false
        noOfAttempts: 1,
        maxTimeToFinish: 60, // timeLimit
        openingDate: "",
        closingDate: "",
        points: 1,
        level: 0,
        number: 0,
        questionTitle: "",
        isRequired: true,
        explanation: "",
        correctAnswer: "",
        publish: false,
        choices: [],
        answer: "",
        elements: [],
        quizId: 0,
        questionId: 0,
        redirect: false,
        currQuizQuestions: [],
    }

    initPage() {
        var pathname = location.pathname;
        pathname = pathname.split("/");
        this.setState({ quizId: pathname[4] })
        this.props.dataStore.setCurrCoursepackId(pathname[2]);
        this.props.dataStore.setCurrQuizId(pathname[4]);
    }

    handleSwitchChange = () => {
        const currState = this.state.questionsOrder
        this.setState({
            questionsOrder: !currState
        });
    }

    componentDidMount() {
        this.initPage();
        this.getCoursepackQuiz();
    }

    componentDidUpdate() {
        if (this.state.recallQuiz) {
            this.getCoursepackQuiz();
        }
    }

    toggle = (nr, id) => {
        let modalNumber = "modal" + nr;
        this.setState({ [modalNumber]: !this.state[modalNumber] });

        if (id !== undefined) {
            this.setState({ questionId: id });
        }
    };

    getCoursepackQuiz = () => {
        let userId = sessionStorage.getItem('userId');
        let quizId = this.props.dataStore.getCurrQuizId;
        axios
            .get(`http://localhost:8080/LMS-war/webresources/Assessment/retrieveCoursepackQuiz/${quizId}?userId=${userId}`)
            .then(result => {
                // console.log(result.data)
                var elements = result.data.pages[0].elements
                var choices = []
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].type === "radiogroup") {
                        for (var j = 0; j < elements[i].choices.length; j++) {
                            choices.push({ text: elements[i].choices[j] })
                        }
                        if (choices.length !== 0) {
                            // console.log(elements[i].type)
                            elements[i].choices = choices
                            choices = []
                        }
                    }
                }
                this.setState({
                    status: "done",
                    title: result.data.title,
                    description: result.data.description,
                    maxTimeToFinish: result.data.maxTimeToFinish,
                    openingDate: result.data.openingDate,
                    closingDate: result.data.closingDate,
                    noOfAttempts: result.data.noOfAttempts,
                    questionsOrder: result.data.questionsOrder === "initial" ? false : true,
                    publish: result.data.publish,
                    publishAnswer: result.data.publishAnswer,
                    quizType: result.data.quizType,
                    currQuizQuestions: result.data.pages[0].elements,
                    recallQuiz: false
                })
            })
            .catch(error => {
                this.setState({ status: "error" })
                console.error("error in axios " + error);
            });
    }

    handleFormSubmit = () => {
        // call api to submit quiz
        let userId = sessionStorage.getItem('userId');
        let coursepackId = this.props.dataStore.getCurrCoursepackId;
        let quizId = this.props.dataStore.getCurrQuizId;
        // console.log({
        //     quizId: quizId,
        //     title: this.state.title,
        //     coursepackId: coursepackId,
        //     description: this.state.description,
        // })
        axios
            .post(`http://localhost:8080/LMS-war/webresources/Assessment/updateCoursepackQuiz?userId=${userId}`, {
                title: this.state.title,
                coursepackId: coursepackId,
                quizId: quizId,
                quizType: "normal",
                description: this.state.description,
                publish: true,
                questionsOrder: "initial"
            })
            .then(result => {
                // console.log("success")
                this.setState({
                    message: "Quiz updated successfully!",
                    openSnackbar: true,
                    redirect: true
                });
            })
            .catch(error => {
                this.setState({
                    message: error.response.data.errorMessage,
                    redirect: true
                });
                console.error("error in axios " + error);
            });
        this.props.dataStore.resetQuestions();
    }

    handleNext = () => {
        const currStep = this.state.activeStep;
        this.setState({ activeStep: currStep + 1 });
    };

    handleBack = () => {
        const currStep = this.state.activeStep;
        this.setState({ activeStep: currStep - 1 });
    };

    handleChange = event => {
        event.preventDefault();
        this.setState({ [event.target.name]: event.target.value });
    }

    handleCheckBoxChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };

    handleOpenSnackbar = () => {
        this.setState({ openSnackbar: true });
    };

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ openSnackbar: false });
    };

    deleteQuestion = (questionId) => {
        let userId = sessionStorage.getItem('userId');
        let quizId = this.props.dataStore.getCurrQuizId;
        // console.log({
        //     quizId: quizId,
        //     questionId: questionId,
        // })
        axios
            .delete(`http://localhost:8080/LMS-war/webresources/Assessment/deleteQuestionCoursepack?userId=${userId}&quizId=${quizId}&questionId=${questionId}`)
            .then(result => {
                this.setState({
                    message: "Deleted question successfully!",
                    openSnackbar: true,
                    recallQuiz: true
                });
            })
            .catch(error => {
                this.setState({
                    message: "Error has occured in deleting question. Please try again later.",
                    openSnackbar: true
                });
                console.error("error in axios " + error);
            });
    }

    updateQuestion = () => {
        let userId = sessionStorage.getItem('userId');
        let quizId = this.props.dataStore.getCurrQuizId;
        // console.log({
        //     quizId: quizId,
        //     questionId: this.state.questionId,
        //     type: this.state.questionType,
        //     title: this.state.questionTitle,
        //     isRequired: true,
        //     explanation: this.state.explanation,
        //     // correctAnswer: this.state.choices[this.state.correctAnswer].text,
        //     choices: this.state.choices
        // })
        axios
            .post(`http://localhost:8080/LMS-war/webresources/Assessment/updateQuestionCoursepack?userId=${userId}`, {
                quizId: quizId,
                questionId: this.state.questionId,
                type: "radiogroup",
                title: this.state.questionTitle,
                isRequired: true,
                points: this.state.points,
                explanation: this.state.explanation,
                correctAnswer: this.state.correctAnswer,
                choices: this.state.choices
            })
            .then(result => {
                this.setState({
                    message: "Updated question successfully!",
                    openSnackbar: true,
                    recallQuiz: true
                });
            })
            .catch(error => {
                this.setState({
                    message: error.response.data.errorMessage,
                    openSnackbar: true
                });
                console.error("error in axios " + error);
            });
        this.toggle(1);
        this.props.dataStore.resetQuestions();
    }

    addQuestion = () => {
        let userId = sessionStorage.getItem('userId');
        let quizId = this.props.dataStore.getCurrQuizId;
        // console.log({
        //     quizId: quizId,
        //     title: this.state.questionTitle,
        //     isRequired: true,
        //     points: this.state.points,
        //     level: this.state.level,
        //     explanation: this.state.explanation,
        //     // correctAnswer: this.state.choices[this.state.correctAnswer].text,
        //     choices: this.state.choices
        // })
        this.state.choices.push({ text: this.state.answer });
        axios
            .post(`http://localhost:8080/LMS-war/webresources/Assessment/createQuestionCoursepack?userId=${userId}`, {
                quizId: quizId,
                type: "radiogroup",
                title: this.state.questionTitle,
                isRequired: true,
                points: this.state.points,
                level: this.state.level,
                explanation: this.state.explanation,
                correctAnswer: this.state.choices[this.state.correctAnswer].text,
                choices: this.state.choices
            })
            .then(result => {
                this.setState({
                    message: "Added new question successfully!",
                    openSnackbar: true,
                    recallQuiz: true
                });
            })
            .catch(error => {
                this.setState({
                    message: error.response.data.errorMessage,
                    openSnackbar: true
                });
                console.error("error in axios " + error);
            });
        this.toggle(3);
        this.props.dataStore.resetQuestions();
    }

    openEditModalBox = (element) => {
        this.setState({
            questionType: element.type,
            questionTitle: element.title,
            explanation: element.explanation,
            correctAnswer: element.correctAnswer,
            quizType: element.quizType,
            choices: element.choices
        })
        this.toggle(1, element.questionId);
    }

    renderEditQuestionModalBox = () => {
        return (
            <MDBModal isOpen={this.state.modal1} toggle={() => this.toggle(1)}>
                <MDBModalHeader
                    className="text-center"
                    titleClass="font-weight-bold"
                    toggle={() => this.toggle(1)}
                >
                    Edit Question
                    </MDBModalHeader>
                <MDBModalBody>
                    <MDBCol md="12">
                        <label className="grey-text mt-4">
                            Question
                    </label>
                        <textarea rows="3" type="text" name="questionTitle" onChange={this.handleChange} defaultValue={this.state.questionTitle} className="form-control" />
                    </MDBCol>
                    <MDBCol md="12" className="mt-4">
                        <label className="grey-text">
                            Explanation
                    </label>
                        <textarea rows="3" type="text" name="explanation" onChange={this.handleChange} value={this.state.explanation} className="form-control" />
                    </MDBCol>
                    <MDBCol md="8" className="mt-4" style={{ paddingTop: 28 }}>
                        <MDBInputGroup
                            containerClassName="mb-3"
                            prepend="Correct Answer"
                            required
                            inputs={
                                <select name="correctAnswer" onChange={this.handleChange} disabled className="browser-default custom-select">
                                    <option value={this.state.correctAnswer}>{this.state.correctAnswer}</option>
                                    {/* {element.choices.map((answer, index) => { return <option value={answer.text}>Answer {index + 1}</option> })} */}
                                </select>
                            }
                        />
                    </MDBCol>
                    <MDBCol md="12" className="mt-4">
                        {this.state.choices.map((answer, index) => { return this.renderExistingAnswerInput(answer, index) })}
                    </MDBCol>
                </MDBModalBody>
                <MDBModalFooter className="justify-content-center">
                    <MDBRow>
                        <MDBCol md="6">
                            <MDBBtn onClick={() => this.toggle(1)} color="grey">Cancel</MDBBtn>
                        </MDBCol>
                        <MDBCol md="6">
                            <MDBBtn onClick={() => this.updateQuestion()} color="primary">Update</MDBBtn>
                        </MDBCol>
                    </MDBRow>
                </MDBModalFooter>
            </MDBModal>
        )
    }

    renderExistingQuestion = (element) => {
        return (
            <>
                <MDBCol md="8" className="mt-4" key={element.number}>
                    <h3>Question {element.number}</h3>
                </MDBCol>
                <MDBCol md="4" className="mt-4" align="right">
                    <MDBBtn onClick={() => this.openEditModalBox(element)} color="blue">Edit</MDBBtn>
                    <MDBBtn onClick={() => this.deleteQuestion(element.questionId)} color="blue">Delete</MDBBtn>
                </MDBCol>
                <MDBCol md="12">
                    <label className="grey-text">
                        Question
                    </label>
                    <textarea rows="3" type="text" name="questionTitle" disabled onChange={this.handleChange} defaultValue={element.title} className="form-control" />
                    <br />
                    <hr />
                </MDBCol>
            </>
        )
    }

    renderExistingAnswerInput = (answer, index) => {
        return (
            <>
                <label className="grey-text">
                    Answer {index + 1}
                </label>
                <input type="text" disabled name="answer" onChange={this.handleChange} defaultValue={answer.text} className="form-control" />
                <br />
            </>
        )
    }

    renderAnswerInput = (answer, index) => {
        return (
            <>
                <label className="grey-text" key={index}>
                    Answer {index + 1}
                </label>
                <input type="text" name="answer" onChange={this.handleChange} className="form-control" />
                <br />
            </>
        )
    }

    addQuestionModalBox = () => {
        return (
            <MDBModal isOpen={this.state.modal3} toggle={() => this.toggle(3)}>
                <MDBModalHeader
                    className="text-center"
                    titleClass="font-weight-bold"
                    toggle={() => this.toggle(3)}
                >
                    Add Question
                        </MDBModalHeader>
                <MDBModalBody>
                    <MDBCol md="12">
                        <label className="grey-text mt-4">
                            Question
                                </label>
                        <textarea rows="3" type="text" name="questionTitle" onChange={this.handleChange} className="form-control" />
                    </MDBCol>
                    <MDBCol md="12" className="mt-4">
                        <label className="grey-text">
                            Explanation
                                </label>
                        <textarea rows="3" type="text" name="explanation" onChange={this.handleChange} className="form-control" />
                    </MDBCol>
                    <MDBCol md="12" className="mt-4" style={{ paddingTop: 28 }}>
                        <MDBInputGroup
                            containerClassName="mb-3"
                            prepend="Correct Answer"
                            required
                            inputs={
                                <select name="correctAnswer" onChange={this.handleChange} className="browser-default custom-select">
                                    <option value={-1}>Choose...</option>
                                    {this.props.dataStore.getCurrAnswers.map((answer, index) => { return <option value={index}>Answer {index + 1}</option> })}
                                </select>
                            }
                        />
                    </MDBCol>
                    <MDBCol md="12" className="mt-4" align="center">
                        <MDBBtn onClick={() => this.addAnswerToQuestion()} size="small" color="grey">Add Answer</MDBBtn>
                    </MDBCol>
                    <MDBCol md="12" className="mt-4">
                        {this.props.dataStore.getCurrAnswers.map((answer, index) => { return this.renderAnswerInput(answer, index) })}
                    </MDBCol>
                </MDBModalBody>
                <MDBModalFooter className="justify-content-center">
                    <MDBRow>
                        <MDBCol md="6">
                            <MDBBtn onClick={() => this.toggle(3)} color="grey">Cancel</MDBBtn>
                        </MDBCol>
                        <MDBCol md="6">
                            <MDBBtn onClick={() => this.addQuestion()} color="primary">Add</MDBBtn>
                        </MDBCol>
                    </MDBRow>
                </MDBModalFooter>
            </MDBModal>
        )
    }

    addAnswerToQuestion = () => {
        this.props.dataStore.addAnswerToList({ text: "" })
        this.state.choices.push({ text: this.state.answer })
    }

    getStepContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return (
                    <div style={{ padding: 60 }}>
                        <h2 className="text-center"> Quiz Configuration </h2>
                        <br />
                        <label className="grey-text">  Quiz Title </label>
                        <input type="text" name="title" onChange={this.handleChange} defaultValue={this.state.title} className="form-control" />
                        <br />
                        <label className="grey-text"> Instructions </label>
                        <textarea type="text" rows="3" name="description" value={this.state.description} onChange={this.handleChange} className="form-control" />
                    </div>
                );
            case 1:
                return (
                    <div style={{ padding: 60 }}>
                        <h4 className="text-center">
                            Edit Quiz Build
                    </h4>
                        <hr />
                        <MDBRow>
                            {/* Add Questions List here */}
                            {this.state.currQuizQuestions.map((element) => { return this.renderExistingQuestion(element) })}
                        </MDBRow>
                        <center>
                            <MDBBtn onClick={() => this.toggle(3)} align="center" size="small" color="blue">Add Question</MDBBtn>
                        </center>
                        {this.renderEditQuestionModalBox()}
                        {this.addQuestionModalBox()}
                    </div>
                );
            default:
                return 'Unknown stepIndex';
        }
    }

    render() {
        const { steps, activeStep } = this.state;
        var coursepackId = this.props.dataStore.getCurrCoursepackId;
        if (this.state.redirect === true) {
            return <Redirect to={`/coursepack/${coursepackId}/quiz`} />
        }
        return (
            <div className={this.props.className}>
                {sessionStorage.getItem('accessRight') === 'Teacher' ?
                    <div>
                        <div className="module-sidebar-large"><CoursepackSideNavigation courseId={coursepackId} /></div>
                        <div className="module-navbar-small">
                            <CoursepackSideNavigationDropdown courseId={coursepackId} />
                        </div>
                    </div>
                : null}

                <div className="module-content">
                    <MDBContainer className="mt-3">
                        <MDBRow style={{ paddingTop: 60 }}>
                            <MDBCol md="12">
                                <h2 className="font-weight-bold">
                                    <a href={`/coursepack/${coursepackId}/quiz`}>Quiz</a>
                                    <MDBIcon icon="angle-right" className="ml-4 mr-4" /> Edit Quiz
                                </h2>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className="py-3">
                            <MDBCol md="12">
                                <MDBCard cascade className="grey lighten-4" style={{ padding: 50 }}>
                                    <ul className="list-unstyled example-components-list">
                                        <form name="quiz-form">

                                            <Stepper activeStep={activeStep} alternativeLabel>
                                                {steps.map(label => (
                                                    <Step key={label}>
                                                        <StepLabel>{label}</StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                            <div>
                                                {activeStep === steps.length ? (
                                                    <div style={{ padding: 60 }}>
                                                        <h5 className="text-center">
                                                            You have completed all steps to edit the quiz. <br />
                                                            Ensure that all fields are correct before submitting.
                                                        </h5>
                                                        <br />
                                                        <div className="text-center">
                                                            <MDBBtn color="blue" onClick={() => { this.handleFormSubmit() }}>Submit</MDBBtn>
                                                        </div>
                                                    </div>
                                                ) : (
                                                        <div>
                                                            <Typography>{this.getStepContent(activeStep)}</Typography>
                                                            <div align="center">
                                                                <hr />
                                                                {/* <MDBBtn
                                                                    disabled={activeStep === 0}
                                                                    onClick={() => this.handleBack()}
                                                                    color="grey"
                                                                >
                                                                    Back
                                                                </MDBBtn> */}
                                                                &nbsp;&nbsp;&nbsp;&nbsp;
                                                                <MDBBtn color="grey" onClick={() => this.handleNext()}>
                                                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                                                </MDBBtn>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </form>
                                    </ul>
                                </MDBCard>
                            </MDBCol>
                        </MDBRow>
                        <Snackbar
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            open={this.state.openSnackbar}
                            autoHideDuration={6000}
                            onClose={this.handleClose}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span id="message-id">{this.state.message}</span>}
                            action={[
                                <MDBIcon icon="times" color="white" onClick={this.handleClose} style={{ cursor: "pointer" }} />,
                            ]}
                        />
                    </MDBContainer>
                </div>
            </div>
        );
    }
}

export default styled(CoursepackQuizPageEditQuiz)`
.module-content{
    margin-top: 40px;
}
@media screen and (min-width: 800px) {
    .module-content{
        margin-left: 270px;
    }
    .module-navbar-small{
        display: none;
    }
    .module-sidebar-large{
        display: block;
    }
}
@media screen and (max-width: 800px) {
    .module-sidebar-large{
        display: none;
    }
    .module-navbar-small{
        display: block;
    }
}
`;