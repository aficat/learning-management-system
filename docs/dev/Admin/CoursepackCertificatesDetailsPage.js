import React, { Component } from "react";
import { MDBIcon, MDBRow, MDBCol, MDBDataTable, MDBBtn, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBContainer } from "mdbreact";
import axios from "axios";
import { Snackbar } from "@material-ui/core";
import { observer, inject } from 'mobx-react'
const API = "http://localhost:8080/LMS-war/webresources/";
import styled from 'styled-components';
import MainSideNavDropdown from "../MainSideNavDropdown";

@inject('dataStore')
@observer
class CoursepackCertificatesDetailsPage extends Component {

    state = {
        listOfCoursepacks: [],
        message: "",
        openSnackbar: false,
        modal: false,
        modalEdit: false,
        modalDelete: false,
        coursepackList: "",
        certId: 0,
        selectedCoursepack: "",
        title: ""
    }

    componentDidMount() {
        this.initPage()
    }

    initPage() {
        let certId = this.props.match.params.certId
        this.setState({ certId: certId })
        axios.get(`${API}Gamification/getCertification?certificationId=${certId}`)
            .then(result => {
                this.setState({ coursepackList: result.data.coursepackList, title: result.data.title })
            })
            .catch(error => {
                console.error("error in axios " + error);
            });

        //get all coursepacks
        axios.get(`${API}Coursepack/getAllCoursepack`)
            .then(result => {
                this.setState({ listOfCoursepacks: result.data.coursepack })
            })
            .catch(error => {
                console.error("error in axios " + error);
            });
    }

    toggleModal = event => {
        this.setState({ modal: !this.state.modal })
    }

    toggleEdit = event => {
        this.setState({ modalEdit: !this.state.modalEdit })
    }

    toggleDelete = event => {
        this.setState({ modalDelete: !this.state.modalDelete })
    }

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ openSnackbar: false });
    };

    cancel = event => {
        this.setState({ modalDelete: false, modalEdit: false })
    }

    showTable = () => {
        const data = {
            columns: [
                {
                    label: 'Coursepack Title',
                    field: 'coursepackTitle',
                    sort: 'asc',
                    width: 600
                },
                {
                    label: 'Code',
                    field: 'code',
                    width: 100
                },
                {
                    label: 'Remove',
                    field: 'remove',
                    width: 100
                },
            ],
            rows:
                this.tableRows()
        }

        if (data.rows.length === 0) {
            return <div>No coursepack assigned</div>
        }
        return (
            <div>
                <MDBDataTable
                    style={{ textAlign: "center", verticalAlign: "center" }}
                    striped
                    bordered
                    hover
                    data={data}
                    responsive
                    small
                />
            </div>
        )
    }

    tableRows = () => {
        let coursepacks = []

        this.state.coursepackList && this.state.coursepackList.map((coursepack) => {
            coursepacks.push({
                coursepackTitle: coursepack.title,
                code: coursepack.code,
                remove: this.showDeleteButton(coursepack.coursepackId),

            })
        })
        return coursepacks
    }

    showDeleteButton = (index) => {
        return (
            <MDBIcon onClick={() => this.deleteCoursepack(index)} icon="trash-alt" />
        )
    }

    deleteCoursepack = index => {
        axios.put(`${API}Gamification/removeCoursepackFromCert?certificationId=${this.state.certId}&coursepackId=${index}`)
            .then(result => {
                this.setState({
                    message: "Coursepack removed",
                    openSnackbar: true
                })
                this.initPage()
            })
            .catch(error => {
                this.setState({
                    message: error.response,
                    openSnackbar: true
                })
                console.error("error in axios " + error);
            });
    }

    handleSelectedCoursepack = event => {
        this.setState({ selectedCoursepack: event.target.value }, () => event)
    }

    handleChange = event => {
        event.preventDefault();
        this.setState({ title: event.target.value });
        // console.log(event.target.value)
    }

    addCoursepack = event => {
        this.setState({ modal: false })
        axios.put(`${API}Gamification/assignCoursepackToCert?certificationId=${this.state.certId}&coursepackId=${this.state.selectedCoursepack}`)
            .then(result => {
                this.setState({
                    message: "New coursepack added",
                    openSnackbar: true,
                    modal: false
                })
                this.initPage()
            })
            .catch(error => {
                this.setState({
                    message: error.response,
                    openSnackbar: true
                })
                console.error("error in axios " + error);
            });
    }

    saveCertName = event => {
        axios.put(`${API}Gamification/updateCertification?certificationId=${this.state.certId}`, { title: this.state.title })
            .then(result => {
                this.setState({
                    message: "Certificate name updated",
                    openSnackbar: true,
                    modalEdit: false
                })
                this.initPage()
            })
            .catch(error => {
                this.setState({
                    message: error.response,
                    openSnackbar: true
                })
                console.error("error in axios " + error);
            })
    }

    removeCert = event => {
        axios.delete(`${API}Gamification/deleteCertification?certificationId=${this.state.certId}`)
            .then(result => {
                this.setState({
                    message: "Successfully deleted certificate",
                    openSnackbar: true,
                    modalDelete: false
                })
                this.props.history.go(-1)
            })
            .catch(error => {
                this.setState({ message: error.response, openSnackbar: true })
                console.error("error in axios " + error);
            });
    }

    select = () => {

        return (
            <select onChange={this.handleSelectedCoursepack} className="browser-default custom-select">
                <option>Choose a coursepack</option>
                {this.state.listOfCoursepacks && this.state.listOfCoursepacks.map(
                    (coursepack, index) => <option key={index} value={coursepack.coursepackId}>{coursepack.title}</option>)
                }
            </select>
        )
    }

    render() {

        return (
            <div className={this.props.className}>
                <div className="module-navbar-small">
                    <MainSideNavDropdown moduleId={this.props.moduleId} activeTab={'Achievements'}></MainSideNavDropdown>
                </div>
                <div className="module-content">
                    <MDBContainer className="mt-3">
                        <MDBRow md="12" >
                            <MDBCol md="8">
                                <h2 className="font-weight-bold" style={{ paddingTop: 50 }}>
                                    {this.state.title}
                                    <MDBIcon style={{ paddingLeft: 20 }} onClick={this.toggleEdit} icon="edit" />
                                    <MDBModal isOpen={this.state.modalEdit} toggle={this.toggleEdit}>
                                        <MDBModalHeader toggle={this.toggleEdit}>Edit Certificate Name</MDBModalHeader>
                                        <MDBModalBody>
                                            <input type="text" name="title" onChange={this.handleChange} defaultValue={this.state.title} className="form-control" />
                                        </MDBModalBody>
                                        <MDBModalFooter>
                                            <MDBBtn color="deep-orange" onClick={this.saveCertName}>Save</MDBBtn>
                                        </MDBModalFooter>
                                    </MDBModal>
                                </h2>
                            </MDBCol>
                            <MDBCol md="4" align="right" style={{ paddingTop: 40, paddingRight: 30 }}>
                                <MDBBtn color="deep-orange" onClick={this.toggleModal}>Add Coursepack</MDBBtn>
                                <MDBModal isOpen={this.state.modal} toggle={this.toggleModal}>
                                    <MDBModalHeader toggle={this.toggleModal}>Add Coursepack</MDBModalHeader>
                                    <MDBModalBody>
                                        <MDBRow>
                                            <MDBCol sm="4">Select Coursepack: </MDBCol>
                                            <MDBCol sm="8">
                                                {this.select()}
                                            </MDBCol>
                                        </MDBRow>
                                    </MDBModalBody>
                                    <MDBModalFooter>
                                        <MDBBtn color="deep-orange" onClick={this.addCoursepack}>Add</MDBBtn>
                                    </MDBModalFooter>
                                </MDBModal>
                            </MDBCol>
                        </MDBRow>
                        <hr />
                        {this.showTable()}
                        <MDBCol align="right">
                            <MDBBtn color="danger" onClick={this.toggleDelete}>Delete Certificate</MDBBtn>
                            <MDBModal isOpen={this.state.modalDelete} toggle={this.toggleDelete}>
                                <MDBModalHeader toggle={this.toggleDelete}>Add Coursepack</MDBModalHeader>
                                <MDBModalBody>
                                    <MDBCol align="center">
                                        <b>Confirm deletion? This action cannot be reverted.</b>
                                    </MDBCol>
                                </MDBModalBody>
                                <MDBModalFooter>
                                    <MDBBtn color="grey" onClick={this.cancel}>Cancel</MDBBtn>
                                    <MDBBtn color="danger" onClick={this.removeCert}>Remove</MDBBtn>
                                </MDBModalFooter>
                            </MDBModal>
                        </MDBCol>
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
        )
    }
}

export default styled(CoursepackCertificatesDetailsPage)`
.module-content{
    margin-top: 10px;
}
@media screen and (min-width: 800px) {
    .module-content{
        margin-left: 0px;
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

.new-paragraph{
    margin-top: 0;
    margin-bottom: 1rem;
}
.align-right{
    float: right;
}
`