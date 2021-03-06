import React, { Component } from "react";
import styled from 'styled-components';
import { MDBRow, MDBCol, MDBDataTable, MDBBtn, MDBCard, MDBCardBody, MDBIcon } from "mdbreact";
import axios from 'axios';
import { observer, inject } from 'mobx-react'
import { Snackbar } from '@material-ui/core';
import moment from 'moment';

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
        bookedRows: [],
        openSnackbar: false,
        message: "",
        status: "retrieving",
        statusBooked: "retrieving",
        recallConsultations: false,
        label: "No available consultations found.",
        bookedLabel: "No booked consultations found."
    }

    getAllAvailableConsultations = () => {
        const moduleId = this.props.dataStore.getCurrModId;
        // console.log(moduleId);
        axios
            .get(`http://localhost:8080/LMS-war/webresources/Consultation/viewAllAvailableConsultation/${moduleId}`)
            .then(result => {
                // console.log(result.data.consultationTimeslot)
                this.setState({ status: "done", rows: result.data.consultationTimeslot, recallConsultations: false })
            })
            .catch(error => {
                this.setState({ status: "error", rows: [] })
                console.error("error in axios " + error);
            });
    }

    getBookedConsultations = () => {
        const userId = this.props.dataStore.getUserId;
        axios
            .get(`http://localhost:8080/LMS-war/webresources/Consultation/viewConsultationByStudent?userId=${userId}`)
            .then(result => {
                // console.log(result.data.consultationTimeslot)
                this.setState({ statusBooked: "done", bookedRows: result.data.consultationTimeslot, recallConsultations: false })
            })
            .catch(error => {
                this.setState({ statusBooked: "error", bookedRows: [] })
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
        this.initPage();
        this.getAllAvailableConsultations();
        this.getBookedConsultations();
    }

    componentDidUpdate() {
        if (this.state.recallConsultations) {
            this.getAllAvailableConsultations();
            this.getBookedConsultations();
        }
    }

    initPage() {
        var pathname = location.pathname;
        pathname = pathname.split("/");
        this.props.dataStore.setCurrModId(pathname[2]);
    }

    bookConsultationSlot = (consultationId) => {
        const userId = this.props.dataStore.getUserId;
        axios
            .post(`http://localhost:8080/LMS-war/webresources/Consultation/bookConsultation?consultationTimeslotId=${consultationId}&userId=${userId}`)
            .then(result => {
                // console.log(result.data)
                this.setState({ recallConsultations: true, message: "Consultation slot booked!", openSnackbar: true })
                // console.log("update successful")
            })
            .catch(error => {
                this.setState({ message: error.response.data.errorMessage, openSnackbar: true })
                console.error("error in axios " + error);
            });
    }

    dropConsultationSlot = (consultationId) => {
        axios
            // .put(`http://localhost:3001/allConsultations/${row.id}`)
            .post(`http://localhost:8080/LMS-war/webresources/Consultation/dropConsultation?consultationTimeslotId=${consultationId}`)
            .then(result => {
                // console.log(result.data)
                this.setState({ recallConsultations: true, message: "Consultation slot dropped!", openSnackbar: true })
                // console.log("remove successful")
            })
            .catch(error => {
                this.setState({ message: error.response.data.errorMessage, openSnackbar: true })
                console.error("error in axios " + error);
            });
    }

    handleChange = event => {
        event.preventDefault();
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        var availableConsultations = []
        const row = this.state.rows
        var avaiData = {}
        if (row.length === 0) {
            avaiData = { columns: this.state.columns, rows: [{ label: this.state.label }] }
        } else {
            for (let i = 0; i < row.length; i++) {
                availableConsultations.push({
                    consultationId: row[i].consultationTsId,
                    startDate: moment(row[i].startD).format('DD-MM-YYYY'),
                    startTime: row[i].startTs,
                    endTime: row[i].endTs,
                    // date: "",
                    // startTime: "",
                    // endTime: "",
                    button: <MDBBtn size="small" onClick={() => this.bookConsultationSlot(row[i].consultationTsId)} color="primary">Book Slot</MDBBtn>
                })
            }
            avaiData = { columns: this.state.columns, rows: availableConsultations }
        }
        const availableConsultationData = {
            columns: [...avaiData.columns.map(col => {
                col.width = 200;
                return col;
            })], rows: [...avaiData.rows]
        }
        var bookedConsultations = []
        const bookedRow = this.state.bookedRows
        var bookedData = {}
        if (bookedRow.length === 0) {
            bookedData = { columns: this.state.columns, rows: [{ bookedLabel: this.state.bookedLabel }] }
        } else {
            for (let i = 0; i < bookedRow.length; i++) {
                bookedConsultations.push({
                    consultationId: bookedRow[i].consultationTsId,
                    startDate: moment(bookedRow[i].startD).format('DD-MM-YYYY'),
                    startTime: bookedRow[i].startTs,
                    endTime: bookedRow[i].endTs,
                    button: <MDBBtn size="small" onClick={() => this.dropConsultationSlot(bookedRow[i].consultationTsId)} color="primary">Drop Slot</MDBBtn>
                })
            }
            bookedData = { columns: this.state.columns, rows: bookedConsultations }
        }
        const bookedConsultationData = {
            columns: [...bookedData.columns.map(col => {
                col.width = 200;
                return col;
            })], rows: [...bookedData.rows]
        }
        return (
            <>
                <MDBRow>
                    <MDBCol md="12">
                        <h2 className="font-weight-bold">
                            Available Consultation Slots
  </h2>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="py-3">
                    <MDBCol md="12">
                        <MDBCard>
                            <MDBCardBody>
                                <MDBDataTable striped bordered hover scrollX scrollY maxHeight="400px" data={availableConsultationData} pagesAmount={4} />
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
                <MDBRow style={{ paddingTop: 60 }}>
                    <MDBCol md="12">
                        <h2 className="font-weight-bold">
                            Booked Consultation Slots
  </h2>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="py-3">
                    <MDBCol md="12">
                        <MDBCard>
                            <MDBCardBody>
                                <MDBDataTable striped bordered hover scrollX scrollY maxHeight="400px" data={bookedConsultationData} pagesAmount={4} />
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
