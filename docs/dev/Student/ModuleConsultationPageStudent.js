import React, { Component } from "react";
import styled from 'styled-components';
import { MDBRow, MDBCol, MDBDataTable, MDBBtn, MDBCard, MDBCardBody, MDBIcon } from "mdbreact";
import axios from 'axios';
import { observer, inject } from 'mobx-react'
import { Snackbar } from '@material-ui/core';

@inject('dataStore')
@observer
class ModuleConsultationPageStudent extends Component {

    state = {
        date: "",
        startTime: "",
        endTime: "",
        studentId: "",
        columns: [
            {
                label: "Consultation Id",
                field: "consultationId",
                width: 150,
            },
            {
                label: "Date",
                field: "date",
                width: 150,
                attributes: {
                    "aria-controls": "DataTable",
                    "aria-label": "Name"
                }
            },
            {
                label: "Start Time",
                field: "startTime",
                width: 270
            },
            {
                label: "End Time",
                field: "endTime",
                width: 270
            },
            {
                label: "",
                field: "button",
                width: 200
            }
        ],
        rows: [],
        openSnackbar: false,
        message: ""
    }

    getAllAvailableConsultations = () => {
        const moduleId = this.props.dataStore.getCurrModId;
        // console.log(moduleId);
        axios
            // .get("http://localhost:3001/allConsultations")
            .get(`http://localhost:8080/LMS-war/webresources/Consultation/viewAllAvailableConsultation/${moduleId}`)
            .then(result => {
                // console.log(result.data.consultationTimeslots)
                this.setState({ status: "done", rows: result.data.consultationTimeslot })
            })
            .catch(error => {
                this.setState({ status: "error" })
                console.error("error in axios " + error);
            });
    }

    handleOpenSnackbar = () => {
        this.setState({ openSnackbar: true });
    };

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ openSnackbar: false });
    };

    componentDidMount() {
        this.getAllAvailableConsultations();
    }

    componentDidUpdate() {
        if (this.state.status === "recallConsultations")
            this.getAllAvailableConsultations();
    }

    bookConsultationSlot = (consultationId) => {
        const userId = this.props.dataStore.getUserId;
        axios
            .post(`http://localhost:8080/LMS-war/webresources/Consultation/bookConsultation?consultationTimeslotId=${consultationId}&userId=${userId}`)
            // .put(`http://localhost:3001/allConsultations/${row.id}`, {
            .then(result => {
                // console.log(result.data)
                this.setState({ status: "recallConsultations", message: "Consultation slot booked!", openSnackbar: true })
                // console.log("update successful")
            })
            .catch(error => {
                this.setState({ message: error.response.data.errorMessage, openSnackbar: true })
                console.error("error in axios " + error);
            });
    }

    removeConsultationSlot = (row) => {
        axios
            .put(`http://localhost:3001/allConsultations/${row.id}`, {
                studentId: 0,
                date: row.date,
                startTime: row.startTime,
                endTime: row.endTime
            })
            .then(result => {
                // console.log(result.data)
                this.setState({ message: "done" })
                console.log("remove successful")
            })
            .catch(error => {
                this.setState({ message: "error" })
                console.error("error in axios " + error);
            });
    }

    handleChange = event => {
        event.preventDefault();
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        var newRows = []
        const row = this.state.rows
        for (let i = 0; i < row.length; i++) {
            newRows.push({
                consultationId: row[i].consultationTsId,
                // date: row[i].startD,
                // startTime: row[i].startTs,
                // endTime: row[i].endTs,
                date: "",
                startTime: "",
                endTime: "",
                button: <MDBBtn size="small" onClick={() => this.bookConsultationSlot(row[i].consultationTsId)} color="primary">Book Slot</MDBBtn>
                // : <MDBBtn size="small" onClick={() => this.removeConsultationSlot(row[i])} color="primary">Drop Slot</MDBBtn>
            })
        }
        const data = { columns: this.state.columns, rows: newRows }
        const widerData = {
            columns: [...data.columns.map(col => {
                col.width = 200;
                return col;
            })], rows: [...data.rows]
        }
        return (
            <>
                <MDBRow style={{ paddingTop: 60 }}>
                    <MDBCol md="12">
                        <h2 className="font-weight-bold">
                            Consultation Slots
  </h2>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="py-3">
                    <MDBCol md="12">
                        <MDBCard>
                            <MDBCardBody>
                                <MDBDataTable striped bordered hover scrollX scrollY maxHeight="400px" data={widerData} pagesAmount={4} />
                            </MDBCardBody>
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
            </>
        );
    }
}

export default styled(ModuleConsultationPageStudent)`
.module-content{
    margin-left: 270px;
    margin-top: 40px;
}
`;