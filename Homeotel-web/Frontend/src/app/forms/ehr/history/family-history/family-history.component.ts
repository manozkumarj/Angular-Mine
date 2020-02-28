import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-family-history',
  templateUrl: './family-history.component.html',
  styleUrls: ['./family-history.component.css']
})
export class FamilyHistoryComponent implements OnInit {

  familyHistoryForm;
  relation;

  medicalHistory; otherMedicalHistory; motherMedical; motherOtherMedical; sisterMedical; sisterOtherMedical; brotherMedical; brotherOtherMedical

  //masters
  medicals = [];
  addedFamilyHistory =[];
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['relationName', 'medicalHistoryNames','otherMedicalHistory', 'deleteOption'];

  isOtherMedical = false;
  relations =[];

  @Output() hasData = new EventEmitter<any>();
  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.loadMasters();
    this.createFormControls();
    this.createForm();
  }

  afterMasterDataLoads() {
    this.utilities.setStyles();
   this.loadFamilyHistory();

  }

  resetMasters() {
    this.medicals = [];
    this.relations =[];
  }

  loadMasters() {
    this.apiService.getHistoryFhComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'medical'){
              this.medicals.push({ name: masterRow.name, id: masterRow.id });
            }
              else if(masterRow.master_type == 'relation'){
                this.relations.push({ name: masterRow.name, id: masterRow.id });
              }
          });
          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.relation = new FormControl();
    this.medicalHistory = new FormControl();
    this.otherMedicalHistory = new FormControl();
  }

  createForm() {
    this.familyHistoryForm = new FormGroup({
      relation: this.relation,
      medicalHistory: this.medicalHistory,
      otherMedicalHistory: this.otherMedicalHistory,
    });
  }




  //save and load data
  // saveFamilyHistory() {

  //   var curEncId = this.curBen.curEncId;
  //   var encNodeId = this.utilities.getCurEncNodeId();
  //   var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');

  //   var familyMedicalCtrlsList = [
  //     { ctrl: this.motherMedical, otherCtrl: this.motherOtherMedical, relationId: 1 },
  //     { ctrl: this.medicalHistory, otherCtrl: this.otherMedicalHistory, relationId: 2 },
  //     { ctrl: this.sisterMedical, otherCtrl: this.sisterOtherMedical, relationId: 3 },
  //     { ctrl: this.brotherMedical, otherCtrl: this.brotherOtherMedical, relationId: 4 }
  //   ];

  //   var strFamilyMedicalsToAdd = '';
  //   familyMedicalCtrlsList.forEach(thisFamilyMember => {
  //     if (thisFamilyMember.ctrl.value) {
  //       thisFamilyMember.ctrl.value.forEach(thisMedical => {
  //         strFamilyMedicalsToAdd += "(";
  //         strFamilyMedicalsToAdd += curEncId + ",";
  //         strFamilyMedicalsToAdd += encNodeId + ",";
  //         strFamilyMedicalsToAdd += thisFamilyMember.relationId + ",";
  //         strFamilyMedicalsToAdd += thisMedical.id + ",";
  //         if (thisMedical.name.toLowerCase().indexOf('other') > -1)
  //           strFamilyMedicalsToAdd += "'" + thisFamilyMember.otherCtrl.value + "',";
  //         else
  //           strFamilyMedicalsToAdd += "null" + ",";
  //         strFamilyMedicalsToAdd += this.curStaff.staffId + ",";
  //         strFamilyMedicalsToAdd += "'" + createdAt + "'"
  //         strFamilyMedicalsToAdd += ")";
  //         strFamilyMedicalsToAdd += ',';
  //       });
  //     }
  //   });

    //remove the last comma
    // strFamilyMedicalsToAdd = strFamilyMedicalsToAdd.replace(/,\s*$/, "");

    //using thisSystemNodeId as the encounter is happening at this node..







  // added

  medicalHistoryChanged(){
    this.isOtherMedical = false;
     this.medicalHistory.value.forEach(value=>{
       if(value.name.indexOf('Other')>-1){
         this.isOtherMedical = true;
       }
       else{
         this.isOtherMedical = false;
       }
     })
  }



  addFamilyHistory(){


if (this.relation.value===null) {
  swal({ title: "Error", text: "Please select atleast one relation.", type: 'error' });
  return;
}

var isDuplicateRelation= false;

this.addedFamilyHistory.forEach(thisRealtion => {
  if (thisRealtion.relationId == this.relation.value.id)
  isDuplicateRelation = true;
});

if (isDuplicateRelation) {
  swal({ title: "Error", text: "Duplicate Relation Selected. Please check and try again.", type: 'error' });
  this.familyHistoryForm.reset();
  return;
}


var medicalHistoryIds = []
var medicalHistoryNames = []

 this.medicalHistory.value.forEach(thismedical=>{
   medicalHistoryIds.push(thismedical.id)
   medicalHistoryNames.push(thismedical.name)
 })


    var addedFamilyHistory ={
      relationId : this.relation.value.id,
      relationName : this.relation.value.name,
      medicalHistoryIds : medicalHistoryIds,
      medicalHistoryNames:medicalHistoryNames,
      otherMedicalHistory : this.otherMedicalHistory.value
    }

    this.addedFamilyHistory.push(addedFamilyHistory);
    console.log(this.addedFamilyHistory);
    this.dataSource = new MatTableDataSource(this.addedFamilyHistory);
    this.isOtherMedical =false;
    this.familyHistoryForm.reset();


  }



  deleteCurrentFamilyHistory(i){
    this.addedFamilyHistory.splice(i,1);
    this.dataSource = new MatTableDataSource(this.addedFamilyHistory);
  }


  saveFamilyHistory(){

    console.log(this.addedFamilyHistory);
    var curEncId = this.curBen.curEncId;
    var encNodeId = this.utilities.getCurEncNodeId();
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    var strFamilyMedicalHistoryToAdd = '';

    this.addedFamilyHistory.forEach(thisRelation=>{
      thisRelation.medicalHistoryIds.forEach((thisMedical)=>{
        strFamilyMedicalHistoryToAdd += "(";
        strFamilyMedicalHistoryToAdd += curEncId + ",";
        strFamilyMedicalHistoryToAdd += encNodeId + ",";
        strFamilyMedicalHistoryToAdd += thisRelation.relationId + ",";
        strFamilyMedicalHistoryToAdd += thisMedical + ",";
        if (thisRelation.medicalHistoryNames.indexOf('Other') > -1)
        strFamilyMedicalHistoryToAdd += "'" + thisRelation.otherMedicalHistory + "',";
        else
        strFamilyMedicalHistoryToAdd += "null" + ",";
        strFamilyMedicalHistoryToAdd += this.curStaff.staffId + ",";
        strFamilyMedicalHistoryToAdd += "'" + createdAt + "'"
        strFamilyMedicalHistoryToAdd += ")";
        strFamilyMedicalHistoryToAdd += ',';
      })
    });
    strFamilyMedicalHistoryToAdd = strFamilyMedicalHistoryToAdd.replace(/,\s*$/, "")
    console.log(strFamilyMedicalHistoryToAdd);
    this.apiService.saveFamilyHistory( this.curBen.curEncId , this.utilities.getCurEncNodeId() , strFamilyMedicalHistoryToAdd )
    .subscribe((data) => {
      if (this.utilities.isInvalidApiResponseData(data)) {
        swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
        console.log(data);
      }
      else {
        swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
       this.loadFamilyHistory();
      }
    });
}

loadFamilyHistory(){


  console.log("get")
    this.apiService.getFamilyHistory(this.curBen.curEncId , this.utilities.getCurEncNodeId())
    .subscribe((data) => {
      if (this.utilities.isInvalidApiResponseData(data)) {
        swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
        console.log(data);
      }
      else
      {

       this.setFamilyHistory(data[0])


      }
    });
}



setFamilyHistory(data){

  this.addedFamilyHistory=[];
  var addedFamilyHistory;
  data.forEach(data=>{
    var relationId = data.relation_id;
    var getRelationIdIndex = this.relations.findIndex(medical => medical.id == data.relation_id);
    var relationName = this.relations[getRelationIdIndex]['name'];
     var medicalIds = data.medical_id.split(',');
     var medicalNames = data.medical_name
     var otherMedicalHistory = data.other_medical
     addedFamilyHistory={
      relationId: relationId,
               relationName :relationName,
               medicalHistoryIds : medicalIds,
               medicalHistoryNames : medicalNames,
              otherMedicalHistory : otherMedicalHistory
     }
     this.addedFamilyHistory.push(addedFamilyHistory);
  });


  console.log(this.addedFamilyHistory);
  this.dataSource = new MatTableDataSource(this.addedFamilyHistory);
  if(this.addedFamilyHistory.length >0){
    this.hasData.emit();
  }
}

  }
