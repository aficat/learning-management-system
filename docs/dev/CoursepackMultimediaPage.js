import React, { Component } from "react";
import styled from 'styled-components';
import {
    MDBContainer,
    MDBCol,
    MDBBtn,
    MDBRow,
    MDBMedia,
    MDBCard,
    MDBIcon,
    MDBTable,
    MDBTableBody,
    MDBTableHead
} from "mdbreact";
import axios from "axios";
import 'babel-polyfill';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, ExpansionPanel, ExpansionPanelSummary, Typography, ExpansionPanelDetails, List, ListItem, ListItemText } from "@material-ui/core";
import CoursepackSideNavigation from "./CoursepackSideNavigation";
import CoursepackSideNavigationDropdown from "./CoursepackSideNavigationDropdown";
import Dropzone from 'react-dropzone';
import Snackbar from '@material-ui/core/Snackbar';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import SectionContainer from "../components/sectionContainer";

const API = "http://localhost:8080/LMS-war/webresources"

const FILE_SERVER = "http://127.0.0.1:8887/";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class CoursepackMultimediaPage extends Component {

    state = {
        coursepackId: "",
        open: false,
        uploadedMultimedia: [],
        availableMultimedia: {
            columns: [
                {
                    label: 'File Name',
                    field: 'name',
                    sort: 'asc'
                },
                {
                    label: 'Type',
                    field: 'type',
                    sort: 'asc'
                },
                {
                    label: 'Date Uploaded',
                    field: 'createdDt',
                    sort: 'asc'
                },
                {
                    label: '',
                    field: 'action',
                    sort: 'asc'
                }
            ],
            rows: []
        },
        modalUploadMultimedia: false,
        showMultimediaDialog: false,
        multimediaToShow: {
            location: "",
            name: ""
        },
        showDeleteDialog: false,
        multimediaIdToDelete: "",
        message: "",
        openSnackbar: "",
        multimediaToViewLocation: "",
        modalViewMultimedia: false
    }

    handleOpenSnackbar = () => {
        this.setState({ openSnackbar: true });
    };

    handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ openSnackbar: false });
    };

    componentDidMount() {
        this.initPage()
    }

    async initPage() {
        let coursepackId = this.props.match.params.coursepackId;
        if (coursepackId) {
            this.setState({
                coursepackId: coursepackId
            })
            let coursepackId = this.props.match.params.coursepackId;
            axios.get(`${API}/coursepack/${coursepackId}`)
                .then(result => {
                    this.setState({ courseDetails: result.data })
                })
                .catch(error => {
                    console.error("error in axios " + error);
                });

            await axios
                .get(`${API}/file/retrieveAllMultimediaForCoursepack?coursepackId=${coursepackId}`)
                .then(result => {
                    console.log(result)
                    let data = result.data.files;
                    let arr = [];
                    const method = this.clickMultimedia;
                    const deleteMethod = this.deleteMultimedia;
                    Object.keys(data).forEach(function (key) {
                        let dateCreatedDt = data[key].createdDt ? data[key].createdDt.substring(0, 10) : "";
                        let timeCreatedDt = data[key].createdDt ? data[key].createdDt.substring(11, 16) : "";
                        let temp = {
                            name: data[key].name,
                            type: "video",
                            createdDt: dateCreatedDt + " " + timeCreatedDt,
                            action: (<div><span onClick={e => method(data[key])} className="teal-text" style={{ fontWeight: "bold", cursor: "pointer" }}>View</span>
                                <MDBIcon icon="trash-alt" className="teal-text ml-2" onClick={e => deleteMethod(data[key].fileId)}></MDBIcon></div>)
                        }
                        arr.push(temp);
                    });
                    this.setState({
                        ...this.state,
                        coursepackId: coursepackId,
                        availableMultimedia: {
                            ...this.state.availableMultimedia,
                            rows: arr
                        }
                    });
                })
                .catch(error => {
                    /*this.setState({
                        message: "error.response.data.errorMessage",
                        openSnackbar: true
                    })*/
                    console.error("error in axios " + error);
                });
        }
    }

    showDescriptions = () => {
        return (
            <MDBContainer style={{ paddingTop: 20 }}>
                <MDBRow>
                    <MDBCol size="8">
                        <h1>{this.state.courseDetails && this.state.courseDetails.courseTitle}</h1>
                        <h3>{this.state.courseDetails && this.state.courseDetails.courseDescription}</h3>
                    </MDBCol>
                    <MDBCol size="4">
                        <MDBCard style={{ width: "23rem", minHeight: "12rem" }}>
                            <MDBMedia object src="https://mdbootstrap.com/img/Photos/Others/placeholder1.jpg" alt="" />
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>)
    }

    toggleModal = nr => () => {
        let modalNumber = "modal" + nr;
        if (nr == "UploadMultimedia") {
            this.setState({
                ...this.state,
                uploadedMultimedia: [],
                [modalNumber]: !this.state[modalNumber]
            })
        }
        else {
            this.setState({
                ...this.state,
                [modalNumber]: !this.state[modalNumber]
            });
        }
    };

    uploadMultimedia = (e) => {
        this.setState({
            ...this.state,
            modalUploadMultimedia: true
        })
    }

    onDrop = (uploadedMultimedia) => {
        this.setState({
            ...this.state,
            uploadedMultimedia: this.state.uploadedMultimedia.concat(uploadedMultimedia)
        });
    }

    submitNewMultimediaHandler = event => {
        event.preventDefault();

        // call api to send
        var files = this.state.uploadedMultimedia;
        if (files.length > 0 && this.state.coursepackId && sessionStorage.getItem("userId")) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('file', files[i]);
            }

            fetch(`${API}/file/uploadMultipleMultimediaForCoursepack?coursepackId=${this.state.coursepackId}&userId=${sessionStorage.getItem("userId")}`, {
                method: 'post',
                body: formData
            })
                .then((result) => {
                    if (result.status == "200") {
                        this.setState({
                            ...this.state,
                            modalUploadMultimedia: false,
                            uploadedMultimedia: [],
                            message: "New files uploaded successfully!",
                            openSnackbar: true
                        })
                        return this.initPage();
                    }
                })
                .catch(error => {
                    this.setState({
                        ...this.state,
                        modalUploadMultimedia: false,
                        uploadedMultimedia: [],
                        message: error.response.data.errorMessage,
                        openSnackbar: true
                    });
                    console.error("error in axios " + error);
                    return this.initPage();
                });
        }

        this.setState({
            ...this.state,
            modalUploadMultimedia: false,
            uploadedMultimedia: []
        })
    }

    removeMultimediaUpload = (file) => {
        var array = this.state.uploadedMultimedia.filter(function (item) {
            return item !== file
        });
        this.setState({
            ...this.state,
            uploadedMultimedia: array
        })
    }

    showUploadModal = () => {
        let uploadedMultimedia = this.state.uploadedMultimedia;
        return <Dialog
            open={this.state.modalUploadMultimedia}
            onClose={this.toggleModal("UploadMultimedia")}
            TransitionComponent={Transition}
            keepMounted
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Upload Files
            </DialogTitle>
            <form className="needs-validation" noValidate onSubmit={this.submitNewMultimediaHandler}>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <div className="text-center mt-2">
                            <Dropzone onDrop={this.onDrop} multiple accept=".mp4">
                                {({ getRootProps, getInputProps, isDragActive, isDragReject, rejectedFiles }) => (
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <SectionContainer className="mb-0 p-5 mt-1">
                                            <MDBIcon icon="upload" size="3x" className="mb-3 indigo-text"></MDBIcon><br></br>
                                            Click to Upload or Drag & Drop
                                    </SectionContainer>
                                    </div>
                                )}
                            </Dropzone>
                        </div>

                        <List style={{ width: "26rem", height: "auto", maxHeight: "120px", overflowY: "auto" }}>
                            {uploadedMultimedia.length > 0 && uploadedMultimedia.map((uploadedFile, index) => (
                                <ListItem button>
                                    <ListItemText key={index}>
                                        <IconButton onClick={e => this.removeMultimediaUpload(uploadedFile)}>
                                            <MDBIcon icon="times"></MDBIcon>
                                        </IconButton>
                                        {uploadedFile.name}
                                    </ListItemText>
                                </ListItem>
                            ))}
                        </List>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={this.toggleModal("UploadMultimedia")}>
                        Cancel
                    </Button>
                    <Button color="primary" type="submit" disabled={this.state.uploadedMultimedia.length == 0}>Save</Button>
                </DialogActions>
            </form>
        </Dialog>
    }

    handleCloseMultimediaDialog = () => {
        this.setState({
            showMultimediaDialog: false
        })
    }

    fullScreenMultimediaDialog = () => {
        let multimediaToShow = this.state.multimediaToShow;
        let savedFileName = multimediaToShow && multimediaToShow.location.split('\\')[1];
        let fullPath = FILE_SERVER + savedFileName;
        return (
            <div>
                <Dialog fullScreen open={this.state.showMultimediaDialog} onClose={e => this.handleCloseMultimediaDialog()} TransitionComponent={Transition}>
                    <AppBar style={{ position: 'relative' }}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={e => this.handleCloseMultimediaDialog()} aria-label="close">
                                <MDBIcon icon="times" />
                            </IconButton>
                            <Typography variant="h6" style={{ color: "white", marginLeft: "10px", flex: "1" }}>
                                {multimediaToShow.name}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <video controls controlsList="nodownload" id="multimediaToShow" style={{ maxHeight: "90%" }}
                        src={fullPath}>
                    </video>
                    <div className="mb-4" />
                </Dialog>
            </div>
        )
    }

    clickMultimedia = (multimedia) => {
        this.setState({
            ...this.state,
            multimediaToShow: multimedia,
            showMultimediaDialog: true
        })
    }

    deleteMultimedia = (id) => {
        this.setState({
            showDeleteDialog: true,
            multimediaIdToDelete: id
        })
    }

    handleCloseDeleteDialog = () => {
        this.setState({
            showDeleteDialog: false,
            multimediaIdToDelete: ""
        })
    }

    confirmDeleteDialog = () => {
        return (
            <div>
                <Dialog
                    open={this.state.showDeleteDialog}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={e => this.handleCloseDeleteDialog()}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title">{"Confirm Delete?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            This action is reversible.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={e => this.handleCloseDeleteDialog()} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={e => this.confirmDelete()} color="warning">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    confirmDelete = () => {
        let multimediaIdToDelete = this.state.multimediaIdToDelete;
        axios
            .delete(`${API}/file/deleteFile?fileId=` + this.state.multimediaIdToDelete)
            .then((result) => {
                this.setState({
                    message: "File (" + multimediaIdToDelete + ") deleted successfully!",
                    openSnackbar: true,
                    showDeleteDialog: false,
                    multimediaIdToDelete: ""
                })
                return this.initPage();
            })
            .catch(error => {
                this.setState({
                    message: error.response.data.errorMessage,
                    openSnackbar: true
                })
                console.error("error in axios " + error);
            });
    }

    render() {
        let uploadedMultimedia = this.state.uploadedMultimedia;
        let availableMultimedia = this.state.availableMultimedia;
        let multimediaToShow = this.state.multimediaToShow;
        return (
            <div className={this.props.className}>
                {sessionStorage.getItem('accessRight') === 'Teacher' ?
                    <div>
                        <div className="module-sidebar-large"><CoursepackSideNavigation courseId={this.props.match.params.coursepackId} /></div>
                        <div className="module-navbar-small">
                            <CoursepackSideNavigationDropdown courseId={this.props.match.params.coursepackId} />
                        </div>
                    </div>
                    : null}
                <div className="module-content">

                    <MDBContainer style={{ paddingTop: 10 }}>
                        <MDBRow>
                            <MDBCol>
                                <h2 className="font-weight-bold" >Multimedia</h2>
                                <hr />
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <div style={{ float: 'right' }}>
                                    <MDBBtn color="deep-orange" className="mr-0" size="md" onClick={e => this.uploadMultimedia()}>
                                        Upload
                            </MDBBtn>
                                </div>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                {
                                    availableMultimedia.rows.length == 0 &&
                                    <div>No multimedia uploaded yet</div>
                                }
                                {
                                    availableMultimedia.rows.length > 0 &&
                                    <MDBTable btn>
                                        <MDBTableHead columns={availableMultimedia.columns} />
                                        <MDBTableBody rows={availableMultimedia.rows} />
                                    </MDBTable>
                                }
                            </MDBCol>
                        </MDBRow>
                    </MDBContainer>
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={this.state.openSnackbar}
                        autoHideDuration={6000}
                        onClose={this.handleCloseSnackbar}
                        ContentProps={{
                            'aria-describedby': 'message-id',
                        }}
                        message={<span id="message-id">{this.state.message}</span>}
                        action={[
                            <MDBIcon icon="times" color="white" onClick={this.handleCloseSnackbar} style={{ cursor: "pointer" }} />,
                        ]}
                    />
                    {this.showUploadModal()}
                    {this.fullScreenMultimediaDialog()}
                    {this.confirmDeleteDialog()}
                </div >
            </div>
        )
    }
}


export default styled(CoursepackMultimediaPage)`
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