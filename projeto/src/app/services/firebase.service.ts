﻿import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import * as firebase from 'firebase';
import {Professor} from '../professors/professor.model';
import {Course} from '../courses/course.model';
import {Allocation} from '../allocations/allocation.model';
import {User} from '../users/user.model';
import {Request} from '../requests/request.model';
import { Semester } from '../semesters/semester.model';

@Injectable()
export class FirebaseService {
  //"local"
  allocations: FirebaseListObservable<any[]>;
  allocation: FirebaseObjectObservable<any>;
  professors: FirebaseListObservable<any[]>;
  professor: FirebaseObjectObservable<any>;
  courses: FirebaseListObservable<any[]>;
  course: FirebaseObjectObservable<any>;
  users: FirebaseListObservable<any[]>;
  user: FirebaseObjectObservable<any>;
  requests: FirebaseListObservable<any[]>;
  request: FirebaseObjectObservable<any>;
  semesters: FirebaseListObservable<any[]>;
  semester: FirebaseObjectObservable<any>;
  dbRef: any;

  constructor(private db: AngularFireDatabase) {
    this.allocations = db.list('/allocations') as FirebaseListObservable<Allocation[]>;
    this.professors = db.list('/professors') as FirebaseListObservable<Professor[]>;
    this.courses = db.list('/courses') as FirebaseListObservable<Course[]>;
    this.users = db.list('/users') as FirebaseListObservable<User[]>;
    this.requests = db.list('/requests') as FirebaseListObservable<Request[]>;
    this.semesters = db.list('/semesters') as FirebaseListObservable<Semester[]>;
    this.dbRef = db.database.ref();
  }

  ///Allocation
  getAllocations(){
    return this.allocations;
  }
  addAllocation(allocation){
    if (allocation.professorTwoSIAP) {
      if(this.professorExists(allocation.professorOneSIAP) &&
          this.professorExists(allocation.professorTwoSIAP) &&
            this.courseExists(allocation.course)){
        this.allocations.push(allocation);
        return true;
      }
    } else {
      if(this.professorExists(allocation.professorOneSIAP) &&
          this.courseExists(allocation.course)){
        console.log("element.SIAP = professorSIAP");
        this.allocations.push(allocation);
        return true;
      }
    }
    return false;
  }
  getAllocationDetails(id){
    this.allocation = this.db.object('/allocations/'+id) as FirebaseObjectObservable<Allocation>;
    return this.allocation;
  }
  updateAllocation(id,allocation){
    return this.allocations.update(id,allocation);
  }
  deleteAllocation(id){
    return this.allocations.remove(id);
  }
  professorExists(professorSIAP) {
    var professorExists: Boolean = false;
    this.getProfessors().subscribe(professors =>{
      professors.forEach(element => {
        console.log(element.SIAP, professorSIAP);
        if (element.SIAP === professorSIAP) {
          professorExists = true;
        }
      });
    });
    return professorExists;
  }
  courseExists(courseName) {
    var courseExists: Boolean = false;
    this.getCourses().subscribe(courses =>{
      courses.forEach(element => {
        if (element.name === courseName) {
          courseExists = true;
        }
      });
    });
    return courseExists;
  }
  getProfessorNameWithSIAP(professorSIAP) {
    var professorName = "-";
    this.getProfessors().subscribe(professors =>{
      professors.forEach(element => {
        if (element.SIAP === professorSIAP) {
          console.log("HEEEEREEE",element);
          professorName = element.nome;
        }
      });
    });
    console.log("HEEEEREEE",professorName);
    return professorName;
  }

  ///Professors
  addNewProfessor(newprofessor){
    if(this.sameSIAPProfessor(newprofessor)){
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
  //things to change in here!
  updateProfessor(id, professor){
    if (id!==professor.SIAP){
      if(this.sameSIAPProfessor(professor)){
        return false;
      }
        //change this after changing allocation
      this.deleteProfessor(id,professor.name);
    }
    if(this.professors.update(professor.SIAP,professor)){
      return true;
    }else{
      return false;
    }
  }
  //change allocations first
  deleteProfessor(id, professorName){
    this.getAllocations().subscribe(allocations => {
      allocations.forEach(element => {
        if (element.professorOne === professorName && !(element.professorTwo)) {
          this.deleteAllocation(element.$key);
        }else if(element.professorOne === professorName){
          let allocation = {
            course: element.course,
            professorOne: element.professorTwo,
            professorTwo: ""
          }
          this.updateAllocation(element.$key,allocation);
        }else if(element.professorTwo === professorName){
          let allocation = {
            course: element.course,
            professorOne: element.professorOne,
            professorTwo: ""
          }
          this.updateAllocation(element.$key,allocation);
        }
      });
    });
    return this.professors.remove(id);
    
  }
  sameSIAPProfessor(newProfessor){
    var isSaved: boolean = false;
    this.db.database.ref("professors/"+newProfessor.SIAP).once("value", function(snapshot) {
      isSaved = snapshot.exists();
    });
    return isSaved;
  }

  ///Courses
  addNewCourse(newCourse){
    if(this.sameCourse(newCourse)){
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
  //things to change in here!!
  updateCourse(id, course){
    if(id!==(course.name+course.credits)){
      if(this.sameCourse(course)){
        return false;
      }
      //change this after changing allocation
      this.deleteCourse(id,course.name);
    }
    if(this.courses.update((course.name+course.credits),course)){
      return true;
    }else{
      return false;
    }
  }
  //change allocation first
  deleteCourse(id, courseName){
    this.getAllocations().subscribe(allocations => {
      allocations.forEach(element => {
        if (element.course === courseName) {
          this.deleteAllocation(element.$key);
        }
      });
    });
    return this.courses.remove(id);
  }
  sameCourse(newCourse){
    var isSaved: boolean = false;
    this.db.database.ref("courses/"+newCourse.name+newCourse.credits).once("value", function(snapshot) {
      isSaved = snapshot.exists();
    });
    return isSaved;
  }

  ///Users
  getUsers(){
    return this.users;
  }
  deleteUser(id){
    return this.users.remove(id);
  }
  addNewUser(newUser){
    var isEmailAlreadySaved: Boolean = this.emailAlreadySaved(newUser);
    if (isEmailAlreadySaved===true){
      return false;
    }
    else if(isEmailAlreadySaved===false){
      this.users.push(newUser);
      return true;
    }
    
  }
  ///change to avoid duble values in the firebase system
  emailAlreadySaved(newUser){
    var sameEmail: Boolean = false;
    var executionOrder: Boolean = false;
    this.getUsers().subscribe(users =>{
      users.forEach(element => {
        executionOrder = true;
        if (element.email == newUser.email) {
          sameEmail= true;
        }
      });
    });
    if(executionOrder){
      return sameEmail;
    }
  } 

  ///Requests
  getRequests(){
    this.requests = this.db.list('/requests') as FirebaseListObservable<Request[]>;
    return this.requests;
  }
  ///change to avoid duble values in the firebase system
  addNewRequest(request){
    this.requests.push(request);
    return true;
  }
  deleteRequest(id){
    this.requests.remove(id);
  }

  ///Semesters
  addNewSemester(semester) {
        var isAlreadySaved: Boolean = this.semesterAlreadySaved(semester);
        if (!isAlreadySaved) {
            this.semesters.push(semester);
            return true;
        } else {
            return false;
        }
  }
  getSemesters() {
      return this.semesters;
  }
  ///change to avoid duble values in the firebase system
  semesterAlreadySaved(semester) {
        var isSaved: Boolean = false;
        this.getSemesters().subscribe(semesters => {
            semesters.forEach(element => {
                if (element.semester_id === semester.semester_id) {
                    isSaved = true;
                }
            });
        });
        return isSaved;
  }

}
