import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CurBenService } from '../../../../services/cur-ben.service';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { DatePipe } from '@angular/common';
import { element } from 'protractor';

@Component({
  selector: 'app-current-condition',
  templateUrl: './current-condition.component.html',
  styleUrls: ['./current-condition.component.css']
})
export class CurrentConditionComponent implements OnInit {
currentConditionForm : FormGroup;
displayedColumns: string[] = ['sNo' ,'condition', 'type','description',  'treatmentHistory', 'deleteOption'];
dataSource: MatTableDataSource<any[]>;
addedCurrentCondition =[];

currentCondition;
  description;
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
  }

  initialiseForm() {
    this.createFormControls();
    this.createForm();
    this.utilities.setStyles();

    
  }

  createFormControls() {
    this.currentCondition = new FormControl('');
    this.description = new FormControl('');
    this.type = new FormControl('');
    this.treatmentHistory = new FormControl('');
    
  }

  createForm() {
    this.currentConditionForm = new FormGroup({
      conditionType: this.currentCondition,
      description: this.description,
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
      currentCondition : this.currentCondition.value, 
      description : this.description.value,
       type : this.type.value,
      treatmentHistory : this.treatmentHistory.value
    })
    
    this.dataSource = new MatTableDataSource(this.addedCurrentCondition);
  }

  deleteCurrentCondition(i){
  
    this.addedCurrentCondition.splice(i , 1);
    this.dataSource = new MatTableDataSource(this.addedCurrentCondition);
    
  }

}