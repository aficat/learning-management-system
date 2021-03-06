import { action, computed, observable, toJS } from "mobx"
import axios from "axios";

class DataStore {
  @observable signInStatus = false
  @observable path = "/dashboard"
  @observable mobilePath = "/student/markAttendance"


  // student details
  @observable email = ""
  @observable password = ""
  @observable accessRight = ""
  @observable gender = ""
  @observable firstName = ""
  @observable lastName = ""
  @observable username = ""
  @observable userId = ""

  // year and sem details
  @observable semester = 0
  @observable year = ""

  // module details
  @observable modules = []
  @observable currentModuleId = 0
  @observable currentQuizId = 0
  @observable currentQuizAttemptId = 0
  @observable currentGradeItemId = 0
  @observable currentCoursepackId = 0
  @observable currentGradeItemName = "Choose..."

  //attendance
  @observable attendanceClassId = ""
  @observable attendanceId = ""
  @observable attendanceClassType = ""

  //questionsList
  @observable elements = []
  @observable currAnswers = [{ text: "" }]

  // coursepack quiz score
  @observable currScore = 0
  @observable maxMarks = 0
  @observable attempted = false

  //coursepack assessment
  @observable complete = []

   //coursepack analytics
   @observable coursepacks = []
   @observable totalRevenue = []
   @observable title = []
   @observable totalEnrollment = []

  @action setSignInStatus(status, email, password, accessRight) {
    this.signInStatus = status;
    this.email = email;
    this.password = password;
    this.accessRight = accessRight;
    sessionStorage.setItem("email", this.email)
    sessionStorage.setItem("password", this.password)
    sessionStorage.setItem("accessRight", this.accessRight)
    if (this.accessRight === "Public")
      this.path = "/coursepack/dashboard"
    else
      this.path = "/dashboard"
  }

  @action setMobileSignInStatus(status, email, password, accessRight) {
    this.signInStatus = status;
    this.email = email;
    this.password = password;
    this.accessRight = accessRight;
    sessionStorage.setItem("email", this.email)
    sessionStorage.setItem("password", this.password)
    sessionStorage.setItem("accessRight", this.accessRight)
    this.mobilePath = "/student/markAttendance"
  }

  @action setSignOutStatus() {
    this.signInStatus = false;
    if (this.accessRight === "Public")
      this.path = "/coursepack/login"
    else if (this.accessRight === "Admin")
      this.path = "/admin"
    else
      this.path = "/login"
    this.email = "";
    this.password = "";
    this.accessRight = "";
    this.modules = [];
    this.userId = "";
    this.username = "";
    this.gender = "";
    this.firstName = "";
    this.lastName = "";
    sessionStorage.clear();
  }

  @action setPath(path) {
    this.path = path;
  }

  @action setAttendanceClassId(classId) {
    this.attendanceClassId = classId
  }

  @action setAttendanceId(attendanceId) {
    this.attendanceId = attendanceId
  }

  @action setAttendanceClassType(classType) {
    this.attendanceClassType = classType
  }

  @computed get getPath() {
    return this.path;
  }

  @computed get getMobilePath() {
    return this.mobilePath;
  }

  @computed get getPassword() {
    return this.password;
  }

  @action setCurrModId(id) {
    this.currentModuleId = id;
  }

  @computed get getCurrModId() {
    return this.currentModuleId;
  }

  @action setCurrQuizId(id) {
    this.currentQuizId = id;
  }

  @computed get getCurrQuizId() {
    return this.currentQuizId;
  }

  @action setCurrQuizAttemptId(id) {
    this.currentQuizAttemptId = id;
  }

  @computed get getCurrQuizAttemptId() {
    return this.currentQuizAttemptId;
  }

  @action setCurrGradeItemId(id) {
    this.currentGradeItemId = id;
  }

  @computed get getCurrGradeItemName() {
    return this.currentGradeItemName;
  }

  @action setCurrGradeItemName(name) {
    this.currentGradeItemName = name;
  }

  @computed get getCurrGradeItemId() {
    return this.currentGradeItemId;
  }

  @action setCurrCoursepackId(id) {
    this.currentCoursepackId = id;
  }

  @computed get getCurrCoursepackId() {
    return this.currentCoursepackId;
  }

  @computed get getAttendanceClassId() {
    return this.attendanceClassId;
  }

  @computed get getAttendanceId() {
    return this.attendanceId;
  }

  @computed get getAttendanceClassType() {
    return this.attendanceClassType;
  }

  @action setUserDetails(id, gender, firstName, lastName, username) {
    this.userId = id;
    this.gender = gender;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    sessionStorage.setItem("userId", this.userId)
    sessionStorage.setItem("gender", this.gender)
    sessionStorage.setItem("firstName", this.firstName)
    sessionStorage.setItem("lastName", this.lastName)
    sessionStorage.setItem("username", this.username)
  }

  @computed get getSignInStatus() {
    return this.signInStatus;
  }

  @computed get getAccessRight() {
    return this.accessRight;
  }

  @computed get getUserId() {
    return this.userId;
  }

  @computed get getUsername() {
    return this.username;
  }

  @computed get getFirstName() {
    return this.firstName;
  }

  @computed get getLastName() {
    return this.lastName;
  }

  @computed get getEmail() {
    return this.email;
  }

  @computed get getGender() {
    return this.gender;
  }

  @action updateModules(modules) {
    this.modules = modules;
  }

  @computed get getModules() {
    return this.modules;
  }

  @action updateYearSem(year, sem) {
    this.year = year;
    this.semester = sem;
  }

  @computed get getYear() {
    return this.year;
  }

  @computed get getSem() {
    return this.semester;
  }

  @computed get getQuestions() {
    return this.elements;
  }

  @action addAnswerToQuestion(number, answer) {
    this.elements[number - 1].choices.push(answer)
    // console.log(this.elements[number-1].level)
  }

  @computed get getCurrAnswers() {
    return this.currAnswers;
  }

  @action addAnswerToList(answer, index) {
    if (index === undefined)
      this.currAnswers.push(answer)
    else
      this.currAnswers[0] = answer
  }

  @action resetQuestions() {
    this.elements = []
    this.currAnswers = [{ text: "" }]
  }

  @computed get getCurrScore() {
    return this.currScore;
  }

  @computed get getMaxMarks() {
    return this.maxMarks;
  }

  @action setCurrScore(score) {
    this.currScore = score
  }

  @action setMaxMarks(score) {
    this.maxMarks = score
  }

  @computed get getCoursepackQuizAttempt() {
    return this.attempted;
  }

  @action setComplete(result) {
    this.complete = result

  }

  @computed get getComplete() {
    return toJS(this.complete);
  }

  @action setCoursepacks(coursepacks) {
    this.coursepacks = coursepacks
    var title = []
    coursepacks && coursepacks.map((eachCoursepack) => {
      title.push(eachCoursepack.title)
      axios.get(`http://localhost:8080/LMS-war/webresources/CoursepackEnrollment/getNumberOfUsersEnrolled?coursepackId=${eachCoursepack.id}`)
        .then(result => {
          this.totalRevenue.push(result.data.totalRevenue)
          this.totalEnrollment.push(result.data.items.length)
        })
        .catch(error => {
          console.error("error in axios " + error);
        });
    })

    this.title = toJS(title)
  }

  @computed get getTotalRevenue() {
    return toJS(this.totalRevenue);
  }

  @computed get getTitle() {
    return this.title;
  }

  @computed get getTotalEnrollment() {
    return toJS(this.totalEnrollment);
  }

}

export default DataStore;