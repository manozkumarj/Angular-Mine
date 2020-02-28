import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurBenService } from '../../../../services/cur-ben.service';
import { MatTableDataSource } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  currentConditionForm : FormGroup;
  displayedColumns: string[] = ['type', 'notes', 'sNo'];
  dataSource: MatTableDataSource<any[]>;
  addedCurrentCondition =[];
  
   
    notes;
    type;
    treatmentHistory;
    treatmentHistoryVisibility = false;

  
    
  
  
  
    constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
      public curBen: CurBenService, public datePipe: DatePipe) { }
  
    ngOnInit() {
      this.initialiseForm();
      this.curBen.returnIfBenNotLoaded();

    }

   
  
    initialiseForm() {
      this.createFormControls();
      this.createForm();
      this.utilities.setStyles();
  
      
    }

    getDoctorName(i) {
      return i == 0 || i == 1 ? 'Dr. Arun' : 'Dr. Uday' 
    }
  
    createFormControls() {
    
      this.notes = new FormControl('');
      this.type = new FormControl('');
      this.treatmentHistory = new FormControl('');
      
    }
  
    createForm() {
      this.currentConditionForm = new FormGroup({
       
        notes: this.notes,
        type: this.type
      });
    }
  

    addCurrentCondition()
    {

      console.log(this.curStaff);
      this.addedCurrentCondition.push({       
        notes : this.notes.value,
        type : this.type.value
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