﻿import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-allocation-table',
  templateUrl: './allocation-table.component.html',
  styleUrls: ['./allocation-table.component.css']
})
export class AllocationTableComponent implements OnInit {
    allocationsList: any[];
  constructor(
    private FBservice: FirebaseService,
    private router: Router
  ) { }

  ngOnInit() {
    this.FBservice.getAllocations().subscribe( allocations =>{
      this.allocationsList = allocations;
      });
  }

  onDeleteAllocation(id,course,credits,classNumber){
    if(this.FBservice.deleteAllocation(id,course+credits,classNumber)){
      this.router.navigate(['/allocations']);
    }
  }
  onChangeCAStatus(id,stats){
    if(this.FBservice.changeCAStatus(id,stats)){
      this.router.navigate(['/allocations']);
    }
  }

}

