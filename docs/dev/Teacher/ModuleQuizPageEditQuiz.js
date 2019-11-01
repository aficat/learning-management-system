import React, { Component } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBCard, MDBIcon, MDBInputGroup } from "mdbreact";
import { observer, inject } from 'mobx-react';
import styled from 'styled-components';
import ModuleSideNavigation from "../ModuleSideNavigation";
import { Stepper, Step, StepLabel, TextField, Typography, Snackbar, Checkbox } from '@material-ui/core';
import axios from 'axios';
import { Redirect } from "react-router-dom";

@inject('dataStore')
@observer
class ModuleQuizPageEditQuiz extends Component {

    state = {
        studentName: "",
        username: "",
        userId: "",
        email: "",
        moduleId: 0,
        message: "",
        openSnackbar: false,
        description: "", // title
        title: "", // title
        questionType: "",
        publish: false,
        publishAnswer: false,
        modal1: false,
        modal2: false,
        activeStep: 0,
        steps: ['Quiz Configuration', 'Build Quiz'],

        //create quiz inputs
        quizType: "normal", // adaptive
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
    }

    initPage() {
        var pathname = location.pathname;
        pathname = pathname.split("/");
        this.setState({ quizId: pathname[4] })
        this.props.dataStore.setCurrModId(pathname[2]);
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
        this.getModuleQuiz();
    }

    toggle = (nr, id) => {
        let modalNumber = "modal" + nr;
        this.setState({ [modalNumber]: !this.state[modalNumber] });

        if (id !== undefined) {
            this.setState({ questionId: id });
        }
    };

    getModuleQuiz = () => {
        let userId = sessionStorage.getItem('userId');
        let quizId = this.props.dataStore.getCurrQuizId;
        axios
            .get(`http://localhost:8080/LMS-war/webresources/Assessment/retrieveModuleQuiz/${quizId}?userId=${userId}`)
            .then(result => {
                console.log(result.data)
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
                    elements: result.data.pages[0].elements
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
        let moduleId = this.props.dataStore.getCurrModId;
        let quizId = this.props.dataStore.getCurrQuizId;
        var openingDate = this.state.openingDate
        var closingDate = this.state.closingDate
        console.log({
            quizId: quizId,
            title: this.state.title,
            moduleId: moduleId,
            description: this.state.description,
            quizType: this.state.quizType,
            questionsOrder: this.state.questionsOrder ? "random" : "initial",
            openingDate: openingDate + ":00",
            closingDate: closingDate + ":00",
            noOfAttempts: this.state.noOfAttempts,
            publish: this.state.publish,
            // publishAnswer: this.state.publishAnswer,
            maxTimeToFinish: this.state.maxTimeToFinish,
            // questions: this.state.elements
        })
        axios
            .post(`http://localhost:8080/LMS-war/webresources/Assessment/updateModuleQuiz?userId=${userId}`, {
                title: this.state.title,
                moduleId: moduleId,
                quizId: quizId,
                description: this.state.description,
                quizType: this.state.quizType,
                questionsOrder: this.state.questionsOrder ? "random" : "initial",
                openingDate: openingDate + ":00",
                closingDate: closingDate + ":00",
                publish: this.state.publish,
                noOfAttempts: this.state.noOfAttempts,
                maxTimeToFinish: this.state.maxTimeToFinish,
                questions: this.state.elements
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
                    openSnackbar: true
                });
                console.error("error in axios " + error);
            });
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
        // console.log(event.target.name)
    }

    handleCheckBoxChange = name => event => {
        this.setState({ [name]: event.target.checked });
        // console.log(this.state.emailNotification, this.state.publish)
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

    renderQuestion = (element) => {
        // console.log(element.type)
        if (element.type === "radiogroup") {
            return (
                <><MDBCol md="12" className="mt-4" key={element.number}>
                    <h3>Question {element.number}</h3>
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
                    <MDBCol md="8" className="mt-4" style={{ paddingTop: 28 }}>
                        <MDBInputGroup
                            containerClassName="mb-3"
                            prepend="Correct Answer"
                            required
                            inputs={
                                <select name="correctAnswer" onChange={this.handleChange} className="browser-default custom-select">
                                    <option value={-1}>Choose...</option>
                                    {element.choices.map((answer, index) => { return <option value={index}>Answer {index + 1}</option> })}
                                </select>
                            }
                        />
                    </MDBCol>
                    <MDBCol md="2" className="mt-4">
                        {this.state.quizType === "adaptive" &&
                            <>
                                <label className="grey-text">
                                    Level
                    </label>
                                <input type="number" className="form-control" name="level"
                                    value={this.state.level}
                                    onChange={this.handleChange}
                                    min={1}
                                    required />
                            </>
                        }
                    </MDBCol>
                    <MDBCol md="2" className="mt-4">
                        <label className="grey-text">
                            Points
                    </label>
                        <input type="number" className="form-control" name="points"
                            value={this.state.points}
                            onChange={this.handleChange}
                            min={1}
                            required />
                    </MDBCol>
                    <MDBCol md="12" className="mt-4" align="center">
                        <MDBBtn onClick={() => this.addAnswerToQuestion(element.number)} size="small" color="grey">Add Answer</MDBBtn>
                    </MDBCol>
                    <MDBCol md="12" className="mt-4">
                        {element.choices.map((answer, index) => { return this.renderAnswerInput(answer, index) })}
                    </MDBCol>
                    <MDBCol md="12" className="mt-4" align="center">
                        {this.props.dataStore.getQuestions.length !== 0 && <MDBBtn onClick={() => this.saveQuestionsToList("mcq")} align="center" size="small" color="grey">Save</MDBBtn>}
                        <hr />
                    </MDBCol>
                </>
            )
        } else {
            return (
                <>
                    <MDBCol md="10" className="mt-4" key={element.number}>
                        <h3>Question {element.number}</h3>
                        <label className="grey-text mt-4">
                            Question
                                </label>
                        <textarea rows="3" type="text" name="question" onChange={this.handleChange} className="form-control" />
                    </MDBCol>
                    <MDBCol md="2" className="mt-4">
                        {this.state.quizType === "adaptive" &&
                            <>
                                <label className="grey-text">
                                    Level
                                    </label>
                                <input type="number" className="form-control" name="level"
                                    value={this.state.level}
                                    onChange={this.handleChange}
                                    min={1}
                                    required />
                            </>
                        }
                        <br />
                        <br />
                        <label className="grey-text" style={{ paddingTop: 8 }}>
                            Points
                                    </label>
                        <input type="number" className="form-control" name="points"
                            value={this.state.points}
                            onChange={this.handleChange}
                            min={1}
                            required />
                    </MDBCol>
                    <MDBCol md="12" className="mt-4">
                        <label className="grey-text">
                            Explanation
                                    </label>
                        <textarea rows="3" type="text" name="explanation" onChange={this.handleChange} className="form-control" />
                        <br />
                        <center>
                            {this.props.dataStore.getQuestions.length !== 0 && <MDBBtn onClick={() => this.saveQuestionsToList("short-answer")} align="center" size="small" color="grey">Save</MDBBtn>}
                        </center>
                        <hr />
                    </MDBCol>
                </>)
        }
    }

    renderAnswerInput = (answer, index) => {
        return (
            <>
                <label className="grey-text">
                    Answer {index + 1}
                </label>
                <input type="text" name="answer" onChange={this.handleChange} className="form-control" />
                <br />
            </>
        )
    }

    addQuestionToList = () => {
        var number = this.props.dataStore.getQuestions.length + 1
        if (this.state.questionType === "short-answer") {
            this.props.dataStore.getQuestions.push(
                {
                    type: "text", //text
                    name: "Short Answer",
                    number: number,
                    title: "",
                    isRequired: true,
                    level: 1, //only for adaptive
                    explanation: "",
                    correctAnswer: "",
                    points: 0,
                })
        } else if (this.state.questionType === "mcq") {
            this.props.dataStore.getQuestions.push(
                {
                    type: "radiogroup",
                    name: "MCQ",
                    number: number,
                    title: "",
                    isRequired: true,
                    level: 1, //only for adaptive,
                    explanation: "",
                    correctAnswer: "",
                    points: 0,
                    choices: [
                        {
                            text: ""
                        }
                    ],
                })
            // console.log(this.props.dataStore.getQuestions)
        } else {
            this.setState({ openSnackbar: true, message: "No question type was selected" })
        }
    }

    addQuestionToAdaptiveList = () => {
        var number = this.props.dataStore.getQuestions.length + 1
        this.props.dataStore.getQuestions.push(
            {
                type: "radiogroup",
                name: "MCQ",
                number: number,
                title: "",
                isRequired: true,
                level: 1, //only for adaptive,
                explanation: "",
                correctAnswer: "",
                points: 0,
                choices: [
                    {
                        text: ""
                    }
                ],
            })
    }

    addAnswerToQuestion = (number) => {
        this.props.dataStore.addAnswerToQuestion(number, { text: "" })
        var answers = this.state.choices;
        answers.push({ text: this.state.answer })
        this.setState({ choices: answers })
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
                        <MDBRow>
                            <MDBCol md="7" className="mt-4">
                                <MDBInputGroup
                                    style={{ paddingTop: 22 }}
                                    containerClassName="mb-3"
                                    prepend="Quiz Type"
                                    required
                                    inputs={
                                        <select name="quizType" onChange={this.handleChange} defaultValue={this.state.quizType} className="browser-default custom-select">
                                            <option value="Normal">Normal</option>
                                            <option value="Adaptive">Adaptive</option>
                                        </select>
                                    }
                                />
                            </MDBCol>
                            <MDBCol md="3" className="mt-4" style={{ paddingTop: 20 }}>
                                <label>  Shuffle Questions </label>
                                <Checkbox
                                    checked={this.state.questionsOrder}
                                    onChange={this.handleCheckBoxChange('questionsOrder')}
                                    value="questionsOrder"
                                    name="questionsOrder"
                                    color="primary"
                                    inputProps={{
                                        'aria-label': 'secondary checkbox',
                                    }}
                                />
                            </MDBCol>
                            <MDBCol md="2" className="mt-4" style={{ paddingTop: 20 }}>
                                <label> Publish</label>
                                <Checkbox
                                    checked={this.state.publish}
                                    onChange={this.handleCheckBoxChange('publish')}
                                    value="publish"
                                    name="publish"
                                    color="primary"
                                    inputProps={{
                                        'aria-label': 'secondary checkbox',
                                    }}
                                />
                            </MDBCol>
                            <MDBCol md="6">
                                <br />
                                <TextField
                                    id="datetime-local"
                                    label="Opening Date"
                                    type="datetime-local"
                                    name="openingDate"
                                    value={this.state.openingDate}
                                    onChange={this.handleChange}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </MDBCol>
                            <MDBCol md="6">
                                <br />
                                <TextField
                                    id="datetime-local"
                                    label="Closing Date"
                                    type="datetime-local"
                                    name="closingDate"
                                    value={this.state.closingDate}
                                    onChange={this.handleChange}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </MDBCol>
                            <MDBCol md="6" className="mt-4">
                                <label className="grey-text"> Time Limit (in minutes) </label>
                                <input type="number" className="form-control" name="maxTimeToFinish"
                                    value={this.state.maxTimeToFinish}
                                    onChange={this.handleChange}
                                    min={30}
                                    required />
                            </MDBCol>
                            <MDBCol md="6" className="mt-4">
                                <label className="grey-text">
                                    Number of Attempts
                        </label>
                                <input type="number" className="form-control" name="noOfAttempts" onChange={this.handleChange}
                                    value={this.state.noOfAttempts}
                                    onChange={this.handleChange}
                                    min={1}
                                    required />
                            </MDBCol>
                        </MDBRow>
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
                            {this.props.dataStore.getQuestions.map((element) => { return this.renderQuestion(element) })}
                        </MDBRow>
                        <center>
                            {this.state.quizType === "normal" &&
                                <>
                                    <MDBCol md="12" className="mt-4" align="center">
                                        <MDBInputGroup
                                            style={{ paddingTop: 22, width: 350 }}
                                            containerClassName="mb-3"
                                            prepend="Question Type"
                                            required
                                            inputs={
                                                <select name="questionType" onChange={this.handleChange} className="browser-default custom-select">
                                                    <option value="0">Choose...</option>
                                                    <option value="mcq">MCQ</option>
                                                    <option value="short-answer">Short Answer</option>
                                                </select>
                                            }
                                        />
                                    </MDBCol>
                                    <MDBBtn onClick={() => this.addQuestionToList()} align="center" size="small" color="blue">Add Question</MDBBtn>
                                </>
                            }
                            {this.state.quizType === "adaptive" && <MDBBtn onClick={() => this.addQuestionToAdaptiveList()} align="center" size="small" color="blue">Add Question</MDBBtn>}
                        </center>
                    </div>
                );
            default:
                return 'Unknown stepIndex';
        }
    }

    render() {
        const { steps, activeStep } = this.state;
        var moduleId = this.props.dataStore.getCurrModId;
        if (this.state.redirect === true) {
            return <Redirect to={`/modules/${moduleId}/quiz`} />
        }
        return (
            <div className={this.props.className}>
                <ModuleSideNavigation moduleId={moduleId}></ModuleSideNavigation>
                <div className="module-content">
                    <MDBContainer className="mt-3">
                        <MDBRow style={{ paddingTop: 60 }}>
                            <MDBCol md="12">
                                <h2 className="font-weight-bold">
                                    <a href={`/modules/${moduleId}/quiz`}>Quiz</a>
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
                                                                <MDBBtn
                                                                    disabled={activeStep === 0}
                                                                    onClick={() => this.handleBack()}
                                                                    color="grey"
                                                                >
                                                                    Back
                                                                </MDBBtn>
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

export default styled(ModuleQuizPageEditQuiz)`
.module-content{
    margin-left: 270px;
    margin-top: 40px;
}
`;