import React, { Component } from "react";
import styled from 'styled-components';
import ModuleQuizPageStudent from "./Student/ModuleQuizPageStudent";
import ModuleQuizPageTeacher from "./Teacher/ModuleQuizPageTeacher";
import AccessDeniedPage from "./AccessDeniedPage";
class ModuleQuizPage extends Component {

    state = {
        moduleId: 0,
    }

    componentDidMount() {
        this.initPage();
    }

    initPage() {
        let moduleId = this.props.match.params.moduleId;
        if (moduleId) {
            // console.log(moduleId);
            // retrieve module & set state
            this.setState({ moduleId: moduleId })
        }
    }

    render() {
        let accessRight = sessionStorage.getItem("accessRight")
        if (accessRight === "Student")
            return <ModuleQuizPageStudent moduleId={this.props.moduleId} history={this.props.history} />
        else if (accessRight === "Teacher")
            return <ModuleQuizPageTeacher moduleId={this.props.moduleId} history={this.props.history} />
        else
            return <AccessDeniedPage />
    }
}

export default styled(ModuleQuizPage)`
.module-content{
    margin-left: 270px;
    margin-top: 40px;
}
`;
