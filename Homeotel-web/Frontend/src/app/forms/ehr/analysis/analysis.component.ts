import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { CurBenService } from '../../../services/cur-ben.service';
import { Identifiers } from '@angular/compiler';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {
 
  currentConditionForm : FormGroup;
  displayedColumns: string[] = ['type','notes', 'sNo' , 'deleteOption'];
  dataSource: MatTableDataSource<any[]>;
  addedCurrentCondition =[];
  

    notes;
    type;
    treatmentHistory;
    treatmentHistoryVisibility = false;
    
  
    currentConditions =[
      {id : 1 , condition : "Thirst"},
      {id : 2 , condition : "Bowels"},
      {id : 3 , condition : "Sweating"},
      {id : 4 , condition : "Sleep"},
      {id : 6 , condition : "Temp.Tolerance"},
    ];
  
    types =[
      {id :1 , name :"Acute"},
      {id :2 , name :"Chronic"},
    ]
  
    constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
      public curBen: CurBenService, public datePipe: DatePipe) { }
  
    ngOnInit() {
      this.initialiseForm();
      this.curBen.returnIfBenNotLoaded();

    }
  
    getDoctorName(i) {
      return i == 0 || i == 1 ? 'Dr. Arun' : 'Dr. Uday' 
    }
  
    initialiseForm() {
      this.createFormControls();
      this.createForm();
      this.utilities.setStyles();
  
      
    }
  
    createFormControls() {
    
      this.notes = new FormControl('');
      this.type = new FormControl('');
      this.treatmentHistory = new FormControl('');
      
    }
  
    createForm() {
      this.currentConditionForm = new FormGroup({
       
        notes: this.notes,
        type: this.type,
        treatmentHistory: this.treatmentHistory
      });
    }
  
    typeChanged()
    {
      this.type.value ==="Chronic"? this.treatmentHistoryVisibility=true: this.treatmentHistoryVisibility=false;
    }
  
    addCurrentCondition()
    {
      this.addedCurrentCondition.push({
       
        notes : this.notes.value,
         type : this.type.value,
        treatmentHistory : this.treatmentHistory.value
      })
      
      this.dataSource = new MatTableDataSource(this.addedCurrentCondition);

      this.type.setValue("");
      this.notes.setValue("");
    }
  
    deleteCurrentCondition(i){
    
      this.addedCurrentCondition.splice(i , 1);
      this.dataSource = new MatTableDataSource(this.addedCurrentCondition);
      
    }
  
  }