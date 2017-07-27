﻿import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Professor } from '../professors/professor.model';
import { Course } from '../courses/course.model';
import { Allocation } from '../allocations/allocation.model';
import { User } from '../users/user.model';
import { Request } from '../requests/request.model';
import { Semester } from '../semesters/semester.model';
import { ProfessorRestriction } from '../professors/professor-restriction.model';
import { Class } from '../allocations/class.model';

@Injectable()
export class FirebaseService {
  CLASSES_PATH = '/classes/';
  SEMESTERS_PATH = '/semesters/';
  PROFESSORS_RESTRICTIONS_PATH = '/professorRestrictions/';
  //"local"
  classes: FirebaseListObservable<any[]>;
  allocations: FirebaseListObservable<any[]>;
  allocation: FirebaseObjectObservable<any>;
  professors: FirebaseListObservable<any[]>;
  professor: FirebaseObjectObservable<any>;
  courses: FirebaseListObservable<any[]>;
  course: FirebaseObjectObservable<any>;
  users: FirebaseListObservable<any[]>;
  usersEmails: FirebaseListObservable<any[]>;
  user: FirebaseObjectObservable<any>;
  requests: FirebaseListObservable<any[]>;
  request: FirebaseObjectObservable<any>;
  requestsEmails: FirebaseListObservable<any[]>;
  semesters: FirebaseListObservable<Semester[]>;
  professorRestrictions: FirebaseListObservable<any[]>;

  constructor(private db: AngularFireDatabase)  {
    this.allocations = db.list('/allocations') as FirebaseListObservable<Allocation[]>;
    this.classes = db.list(this.CLASSES_PATH) as FirebaseListObservable<Class[]>;
    this.professors = db.list('/professors') as FirebaseListObservable<Professor[]>;
    this.courses = db.list('/courses') as FirebaseListObservable<Course[]>;
    this.users = db.list('/users') as FirebaseListObservable<User[]>;
    this.usersEmails = db.list('/usersEmails') as FirebaseListObservable<any[]>;
    this.requests = db.list('/requests') as FirebaseListObservable<Request[]>;
    this.requestsEmails = db.list('/requestsEmails') as FirebaseListObservable<any[]>;
    this.semesters = db.list(this.SEMESTERS_PATH) as FirebaseListObservable<any[]>;
    this.professorRestrictions = db.list(this.PROFESSORS_RESTRICTIONS_PATH) as FirebaseListObservable<ProfessorRestriction[]>;
    this.classes = db.list('/classes') as FirebaseListObservable<Class[]>;
  }

  ///Allocation
  getAllocations(){
    return this.allocations;
  }
  addAllocation(allocation){
    if(this.allocationExists(allocation.professorOneSIAP+allocation.courseKey)){
      return false;
    }
    else if (allocation.professorTwoSIAP) {
      if(this.db.database.ref("allocations/"+allocation.professorOneSIAP+allocation.courseKey).set({
        caControl: false,
        course: this.getCourseName(allocation.courseKey),
        courseType: this.getCourseType(allocation.courseKey),
        courseCredits: this.getCourseCredits(allocation.courseKey),
        classNumber: this.getClassesNumber(allocation.courseKey),
        professorOneName: this.getProfessorNameWithSIAP(allocation.professorOneSIAP),
        professorOneSIAP: allocation.professorOneSIAP,
        professorTwoName: this.getProfessorNameWithSIAP(allocation.professorTwoSIAP),
        professorTwoSIAP: allocation.professorTwoSIAP,
        courseOffererDepartment: this.getOffererDepartment(allocation.courseKey),
        courseRequesterDepartment: this.getRequesterDepartment(allocation.courseKey),
        note: allocation.note
      })){
        return true;
      }else{
        return false;
      }
    } else {
      if(this.db.database.ref("allocations/"+allocation.professorOneSIAP+allocation.courseKey).set({
        caControl: false,
        course: this.getCourseName(allocation.courseKey),
        courseType: this.getCourseType(allocation.courseKey),
        courseCredits: this.getCourseCredits(allocation.courseKey),
        classNumber: this.getClassesNumber(allocation.courseKey),
        professorOneName: this.getProfessorNameWithSIAP(allocation.professorOneSIAP),
        professorOneSIAP: allocation.professorOneSIAP,
        courseOffererDepartment: this.getOffererDepartment(allocation.courseKey),
        courseRequesterDepartment: this.getRequesterDepartment(allocation.courseKey),
        note: allocation.note
        })){
        return true;
      }else{
        return false;
      }
    }
  }
  getAllocationDetails(id){
    this.allocation = this.db.object('/allocations/'+id) as FirebaseObjectObservable<Allocation>;
    return this.allocation;
  }
  updateAllocation(id,allocation){
    if(id!=allocation.professorOneSIAP+allocation.courseKey){
      console.log('what??');
      if(this.allocationExists(allocation.professorOneSIAP+allocation.courseKey)){
        console.log('what??2222');
        return false;
      }
    }
    if(this.deleteAllocation(id,allocation.oldCourseKey,allocation.classNumber)){
      console.log('what??33333');
      if(this.addAllocation(allocation)){
        console.log('what??4444');
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  deleteAllocation(id,courseKey,allocationClassNumber){
    if(courseKey){
      if(this.updateAllocationsClassNumber(courseKey,allocationClassNumber)){
        if(this.deleteClass(courseKey)){
          console.log('inhereee4444');
          if (this.allocations.remove(id)){
            console.log('inhereee555');
            return true;
          }else{
            return false;
          }
        }else{
          return false;
        }
      }else{
        return false;
      }
    }else{
      if(this.allocations.remove(id)){
        return true;
      }else{
        return false;
      }
    }
  }
  updateAllocationsClassNumber(courseKey,allocationClassNumber){
    var mayDelete: boolean;
    var thisObject: any = this;
    return this.db.database.ref("allocations/").on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if(childSnapshot.child('course').val()+childSnapshot.child('courseCredits').val() === courseKey && childSnapshot.child('classNumber').val()>allocationClassNumber) {
            console.log((childSnapshot.child('classNumber').val()) - 1);
            console.log(childSnapshot.key);
            if(thisObject.db.database.ref("allocations/"+childSnapshot.key).update({
              "classNumber": (childSnapshot.child('classNumber').val() - 1)
            })){
              return true;
            }
        }
      });
    });
  }

  saveClass(classToSave: Class) {
    let key = this.classes.push(classToSave).key;
    this.addClassToSemester(key);
  }

  getClasses() {
    return this.classes;
  }

  private addClassToSemester(classId: string) {
    var semester = this.db.database.ref(this.SEMESTERS_PATH + '2017-2');
    semester.transaction(
      function(snapshot) {
        if (snapshot.noDataYet) {
          return {classes: [classId]};
        } else {
          var classes = snapshot.classes as string[];
          classes.push(classId);
          snapshot.classes = classes;
          return snapshot;
        }
      }
    );
  }

  getProfessorNameWithSIAP(professorSIAP) {
    var professorName: String = "-";
    this.db.database.ref("professors/"+professorSIAP).once("value", function(snapshot){
      professorName = snapshot.child('name').val();
    });
    return professorName;
  }
  getClassesNumber(courseKey){
    var actualClassesNumber: number;
    this.db.database.ref("courses/"+courseKey).once("value",function(snapshot){
        actualClassesNumber = (snapshot.child('classesNumber').val() + 1);
    });
    if (this.db.database.ref("courses/"+courseKey).update({
        "classesNumber": actualClassesNumber
    }))
    {
      return actualClassesNumber;
    }
  }
  getCourseName(courseKey){
    var name: string = '';
    this.db.database.ref("courses/"+courseKey).once("value",function(snapshot){
      name = snapshot.child('name').val();
    })
    return name;
  }
  getCourseType(courseKey){
    var type: string = '';
    this.db.database.ref("courses/"+courseKey).once("value",function(snapshot){
      type = snapshot.child('type').val();
    })
    return type;
  }
  getCourseCredits(courseKey){
    var credits: string = '';
    this.db.database.ref("courses/"+courseKey).once("value",function(snapshot){
      credits = snapshot.child('credits').val();
    })
    return credits;
  }
  deleteClass(courseKey){
    var newClassesNumber:number;
    this.db.database.ref("courses/"+courseKey).once("value",function(snapshot){
      newClassesNumber = (snapshot.child('classesNumber').val() - 1);
    });
    if (this.db.database.ref("courses/"+courseKey).update({
        "classesNumber": newClassesNumber
    }))
    {
      return true;
    }
  }
  //CHECK WITH CLIENT
  allocationExists(newAllocationKey){
    var isSaved: boolean;
    this.db.database.ref("allocations/"+newAllocationKey).once("value",function(snapshot){
      isSaved = snapshot.exists();
    });
    return isSaved;
  }
  changeCAStatus(id,status){
    this.db.database.ref("allocations/"+id).update({
        "caControl": status
    })
  }
  getOffererDepartment(courseKey){
    var department: string = '';
    this.db.database.ref("courses/"+courseKey).once("value",function(snapshot){
      department = snapshot.child('offererDepartment').val();
    })
    return department;
  }
  getRequesterDepartment(courseKey){
    var department: string = '';
    this.db.database.ref("courses/"+courseKey).once("value",function(snapshot){
      department = snapshot.child('requesterDepartment').val();
    })
    return department;
  }

  ///Professors
  addNewProfessor(newprofessor){
    if(this.professorExists(newprofessor.SIAP)){
        return false;
    }else{
      this.db.database.ref("professors/"+newprofessor.SIAP).set(newprofessor);
      return true;
    }  
  }
  getProfessors(){
    return this.professors;
  }
  getProfessorDetails( id){
    this.professor = this.db.object('/professors/'+id) as FirebaseObjectObservable<Professor>
    return this.professor;
  }
  updateProfessor(id, professor){
    if (id!==professor.SIAP){
      if(this.professorExists(professor.SIAP)){
        return false;
      }
      this.deleteProfessor(id);
      this.addNewProfessor(professor);
      return true;
    }else if(this.professors.update(id,professor)){
      return true;
    }
  }
  deleteProfessor(id){
    if(this.professors.remove(id)){
      return true;
    }else{
      return false;
    }
    
  }
  professorExists(newProfessorKey){
    var isSaved:boolean;
    this.db.database.ref("professors/"+newProfessorKey).once("value",function(snapshot){
      isSaved = snapshot.exists();
    });
    return isSaved;
  }

  ///Courses
  addNewCourse(newCourse){
    if(this.courseExists(newCourse.name+newCourse.credits)){
      return false;
    }else{
      this.db.database.ref("courses/"+newCourse.name+newCourse.credits).set(newCourse);
      return true;
    }
  }
  getCourses(){
    return this.courses;
  }
  getCourseDetails( id){
    this.course = this.db.object('/courses/'+id) as FirebaseObjectObservable<Course>
    return this.course;
  }
  updateCourse(id, course){
    if(id!==(course.name+course.credits)){
      if(this.courseExists(course.name+course.credits)){
        return false;
      }
      this.deleteCourse(id);
      this.addNewCourse(course);
      return true;
    }else if(this.courses.update(id,course)){
      return true;
    }else{
      return false;
    }
  }
  deleteCourse(id){
    if (this.courses.remove(id)){
      return true;
    }else{
      return false;
    }
  }
  courseExists(newCourseKey){
    var isSaved: boolean;
    this.db.database.ref("courses/"+newCourseKey).on("value",function(snapshot){
      isSaved = snapshot.exists();
    });
    return isSaved;
  }

  ///Users
  getUsers(){
    return this.users;
  }
  getUsersEmails(){
    return this.usersEmails;
  }
  deleteUser(user){
    var thisObject = this;
    if(this.users.remove(user.$key)){
      if(this.db.database.ref("usersEmails/").on("value",function(snapshot){
        snapshot.forEach(function(childSnapshot){
          if(childSnapshot.child('email').val()===user.email){
            thisObject.usersEmails.remove(childSnapshot.key);
            return true;
          }
        });
      })){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  addNewUser(newUser){
      if (this.emailAlreadySaved(newUser.SIAP)){
        return false;
      }else{
        this.db.database.ref("users/"+newUser.SIAP).set(newUser);
        this.usersEmails.push({
          email: newUser.email
        });
        return true;
      }

  }
  emailAlreadySaved(newUserKey){
    var userEmail: boolean;
    this.db.database.ref("users/"+newUserKey).once("value",function(snapshot){
      userEmail = snapshot.exists();
    });
    return userEmail;
  }
  isUserRegistered(userEmail){
    var isRegistered: boolean = false;
    this.db.database.ref("usersEmails/").on("value",function(snapshot){
      snapshot.forEach(function(childSnapshot){
        if(childSnapshot.child('email').val()===userEmail){
          isRegistered = true;
          return true;
        }
      });
    });
    return isRegistered;
  }

  ///Requests
  getRequests(){
    return this.requests;
  }
  getRequestsEmails(){
    return this.requestsEmails;
  }
  addNewRequest(newRequest){
    if(this.requestExists(newRequest.email)){
      return false;
    }else{
      this.db.database.ref("requests/"+newRequest.SIAP).set(newRequest);
      this.requestsEmails.push({
        email: newRequest.email
      });
      return true;
    }
  }
  acceptRequest(request){
    if(this.addNewUser(request)){
      if(this.deleteRequest(request)){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  deleteRequest(request){
    var thisObject = this;
    if(this.requests.remove(request.$key)){
      if(this.db.database.ref("requestsEmails/").on("value",function(snapshot){
        snapshot.forEach(function(childSnapshot){
          if(childSnapshot.child('email').val()===request.email){
            thisObject.requestsEmails.remove(childSnapshot.key);
            return true;
          }
        });
      })){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
  requestExists(requestEmail){
    var isRegistered: boolean = false;
    this.db.database.ref("requestsEmails/").on("value",function(snapshot){
      snapshot.forEach(function(childSnapshot){
        if(childSnapshot.child('email').val()===requestEmail){
          isRegistered = true;
          return true;
        }
      });
    });
    return isRegistered;
  }

  // Semesters
  saveSemester(semester: Semester) {
      this.db.database.ref(this.SEMESTERS_PATH + semester.getId())
          .set(semester.toFirebaseObject());
  }
  
  getSemesters() {
      return this.semesters;
  }

  // Restrictions
  getProfessorRestrictionsList() {
      return this.professorRestrictions;
  }
  saveProfessorRestriction(restriction: ProfessorRestriction) {
      this.db.database.ref(this.PROFESSORS_RESTRICTIONS_PATH + restriction.getSIAPSemester())
          .set(restriction.toFirebaseObject());
  }

  getProfessorRestrictions(restriction_id: string) {
      return this.db.object(this.PROFESSORS_RESTRICTIONS_PATH + restriction_id) as FirebaseObjectObservable<ProfessorRestriction>;
  }

  // Classes
  addClass(Class) {
    this.db.database.ref("classes/" + Class.classKey).set(Class);
    return true;
  }

  //EXTRA METHODS FOR TESTING/STUB
  getClassesOnSchedule(){
    let classesList = this.db.list('/classes/2017-1') as FirebaseListObservable<any[]>;
    return classesList;
  }
}