import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  email: string;
  nome: string;
  SAVED_SUCCESSFULLY_MESSAGE: string = "Usuário cadastrado com sucesso!";
  NOT_SAVED_MESSAGE: string = "Opa! Parece que houve um erro ao cadastrar o usuário. Verifique se o usuário já foi cadastrado.";
  TIMEOUT_SAVED_MESSAGE = 2500;
  TIMEOUT_NOT_SAVED_MESSAGE = 5000;

  constructor(
    private FBservice: FirebaseService,
    private router: Router,
    private _flashMessagesService: FlashMessagesService
  ) {
  }

  onAddNewUser(){
    let user = {
      email: this.email,
      nome: this.nome
    }

    let savedSuccessfully: boolean = this.FBservice.addNewUser(user);
    console.log(this.email);
    
    this.email = null;
    this.nome = null;

    if(savedSuccessfully){
        this._flashMessagesService.show(this.SAVED_SUCCESSFULLY_MESSAGE, { cssClass: 'alert-success', timeout: this.TIMEOUT_SAVED_MESSAGE });
    }
    else{
        this._flashMessagesService.show(this.NOT_SAVED_MESSAGE, { cssClass: 'alert-danger', timeout: this.TIMEOUT_SAVED_MESSAGE });      
    }    
    this.router.navigate(['/add-user']);
  }



  ngOnInit() {
  }
}