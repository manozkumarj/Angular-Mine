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
  selector: 'app-treatment-medical',
  templateUrl: './treatment-medical.component.html',
  styleUrls: ['./treatment-medical.component.css']
})
export class TreatmentMedicalComponent implements OnInit {

  personalHistoryForm: FormGroup;

  medical; otherMedical;

  //masters
  medicals = [];
  medicinesUsed;
  outcome;
  addedPersonalHistory = [];

  isOtherMedical = false;

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['medicalHistory', 'otherMedicalHistory', 'medicinesUsed', 'outcome', 'deleteOption'];

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
    this.loadTreatmentHistory();
  }

  resetMasters() {
    this.medicals = [];
  }

  loadMasters() {
    this.apiService.getHistoryChComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'medical')
              this.medicals.push({ name: masterRow.name, id: masterRow.id });
            /* TODO - remove gynaec and obstetrics if ben is male (surgical id = 1 and 2 @ m_his_ch_surgical) */
          });

          this.afterMasterDataLoads();
        }
      })
  }
  createFormControls() {
    this.medical = new FormControl();
    this.otherMedical = new FormControl();
    this.medicinesUsed = new FormControl();
    this.outcome = new FormControl();
  }

  createForm() {
    this.personalHistoryForm = new FormGroup({
      medical: this.medical,
      otherMedical: this.otherMedical,
      medicinesUsed: this.medicinesUsed,
      outcome: this.outcome
    });
  }


  medicalChanged() {

    if (this.medical.value.name.toLowerCase().indexOf('other') > -1) {
      this.isOtherMedical = true;
    } else {
      this.isOtherMedical = false;
    }

  }

  // added

  addPersonalHistory() {
    console.log(this.medical.value)

    if (this.medical.value === null) {
      swal({ title: "Error", text: "Please select atleast one medical history.", type: 'error' });
      return;
    }

    var isDuplicateMedicalId = false;

    this.addedPersonalHistory.forEach(thisMedication => {
      if (thisMedication.medicalsIds == this.medical.value.id)
        isDuplicateMedicalId = true;
    });

    if (isDuplicateMedicalId) {
      swal({ title: "Error", text: "Duplicate Medical History Selected. Please check and try again.", type: 'error' });
      this.personalHistoryForm.reset();
      return;
    }

    var addedPersonalHistory = {
      medicalsIds: this.medical.value.id,
      medicalNames: this.medical.value.name,
      otherMedical: this.otherMedical.value,
      medicinesUsed: this.medicinesUsed.value,
      outcome: this.outcome.value
    };

    this.addedPersonalHistory.push(addedPersonalHistory);
    console.log(this.addedPersonalHistory);
    this.dataSource = new MatTableDataSource(this.addedPersonalHistory);
    this.isOtherMedical = false;
    this.personalHistoryForm.reset();
    this.savePersonalHistory();

  }

  deleteCurrentPersonalHistory(i) {


    this.addedPersonalHistory.splice(i, 1);
    this.dataSource = new MatTableDataSource(this.addedPersonalHistory);
    if (this.addedPersonalHistory.length != 0) {
      this.savePersonalHistory();
    }

  }

  savePersonalHistory() {

    console.log(this.medical.value)



    var curEncId = this.curBen.curEncId;
    var encNodeId = this.utilities.getCurEncNodeId();
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    var strMedicalsHistoryToAdd = '';
    this.addedPersonalHistory.forEach((thisMedical, index) => {
      strMedicalsHistoryToAdd += "(";
      strMedicalsHistoryToAdd += curEncId + ",";
      strMedicalsHistoryToAdd += encNodeId + ",";
      strMedicalsHistoryToAdd += thisMedical.medicalsIds + ",";
      if (thisMedical.medicalNames.toLowerCase().indexOf('other') > -1)
        strMedicalsHistoryToAdd += "'" + thisMedical.otherMedical + "',";
      else
        strMedicalsHistoryToAdd += "null" + ",";
      strMedicalsHistoryToAdd += "'" + thisMedical.medicinesUsed + "',";
      strMedicalsHistoryToAdd += "'" + thisMedical.outcome + "',";
      strMedicalsHistoryToAdd += this.curStaff.staffId + ",";
      strMedicalsHistoryToAdd += "'" + createdAt + "'"
      strMedicalsHistoryToAdd += ")";
      if (index != this.addedPersonalHistory.length - 1)
        strMedicalsHistoryToAdd += ',';
    });

    console.log(strMedicalsHistoryToAdd);

    this.apiService.saveTreatmentHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId(), strMedicalsHistoryToAdd)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Data Saved Successfully", "Success");
          // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.loadTreatmentHistory();
        }
      });
  }


  loadTreatmentHistory() {

    console.log("get")
    this.apiService.getTreatmentHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          console.log(data[0]);
          this.addedPersonalHistory = [];
          data[0].forEach(data => {

            var getMedicalIdIndex = this.medicals.findIndex(medical => medical.id == data.medical_id);
            let medicalName = this.medicals[getMedicalIdIndex]['name'];
            this.addedPersonalHistory.push({
              medicalsIds: data.medical_id,
              medicalNames: medicalName,
              otherMedical: data.other_medical,
              medicinesUsed: data.medicines_used,
              outcome: data.outcome
            });
          });

          this.dataSource = new MatTableDataSource(this.addedPersonalHistory);
          if (this.addedPersonalHistory.length > 0) {
            this.hasData.emit();
          }

        }

      });



  }

}
