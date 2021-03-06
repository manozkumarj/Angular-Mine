import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-treatment-history',
  templateUrl: './treatment-history.component.html',
  styleUrls: ['./treatment-history.component.css']
})
export class TreatmentHistoryComponent implements OnInit {

  clinicalHistoryForm;

  medical; otherMedical; surgical; otherSurgical;

  //masters
  medicals = []; surgicals = [];



  isOtherMedical = false;

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
    this.setDefaults();
    this.utilities.setStyles();

    this.loadClinicalHistory();
  }

  resetMasters() {
    this.medicals = []; this.surgicals = [];
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
            else if (masterRow.master_type == 'surgical')
              this.surgicals.push({ name: masterRow.name, id: masterRow.id });
            /* TODO - remove gynaec and obstetrics if ben is male (surgical id = 1 and 2 @ m_his_ch_surgical) */
          });

          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.medical = new FormControl();
    this.otherMedical = new FormControl();
    this.surgical = new FormControl();
    this.otherSurgical = new FormControl();
  }

  createForm() {
    this.clinicalHistoryForm = new FormGroup({
      medical: this.medical,
      otherMedical: this.otherMedical,
      surgical: this.surgical,
      otherSurgical: this.otherSurgical
    });
  }

  setDefaults() {
    this.medicalChanged();
    this.surgicalChanged();
  }

  medicalChanged() {
    this.isOtherMedical = false;
    if (this.medical.value && this.medical.value.length > 0) {
      this.medical.value.forEach(selectedOption => {
        if (selectedOption.name.toLowerCase().indexOf('other') > -1)
          this.isOtherMedical = true;
      });
    }

    this.utilities.multiSelectEnableDisableOtherCtrl(this.medical, this.otherMedical);
  }

  surgicalChanged() {
    this.utilities.multiSelectEnableDisableOtherCtrl(this.surgical, this.otherSurgical);
  }

  //save and load data
  saveClinicalHistory() {

    var curEncId = this.curBen.curEncId;
    var encNodeId = this.utilities.getCurEncNodeId();
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    var strMedicalsToAdd = '';
    this.medical.value.forEach((thisMedical, index) => {
      strMedicalsToAdd += "(";
      strMedicalsToAdd += curEncId + ",";
      strMedicalsToAdd += encNodeId + ",";
      strMedicalsToAdd += thisMedical.id + ",";
      if (thisMedical.name.toLowerCase().indexOf('other') > -1)
        strMedicalsToAdd += "'" + this.otherMedical.value + "',";
      else
        strMedicalsToAdd += "null" + ",";
      strMedicalsToAdd += this.curStaff.staffId + ",";
      strMedicalsToAdd += "'" + createdAt + "'"
      strMedicalsToAdd += ")";
      if (index != this.medical.value.length - 1)
        strMedicalsToAdd += ',';
    });

    var strSurgicalsToAdd = '';
    this.surgical.value.forEach((thisSurgical, index) => {
      strSurgicalsToAdd += "(";
      strSurgicalsToAdd += curEncId + ",";
      strSurgicalsToAdd += encNodeId + ",";
      strSurgicalsToAdd += thisSurgical.id + ",";
      if (thisSurgical.name.toLowerCase().indexOf('other') > -1)
        strSurgicalsToAdd += "'" + this.otherSurgical.value + "',";
      else
        strSurgicalsToAdd += "null" + ",";
      strSurgicalsToAdd += this.curStaff.staffId + ",";
      strSurgicalsToAdd += "'" + createdAt + "'"
      strSurgicalsToAdd += ")";
      if (index != this.surgical.value.length - 1)
        strSurgicalsToAdd += ',';
    });

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveClinicalHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      strMedicalsToAdd, strSurgicalsToAdd, this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Data Saved Successfully", "Success");
          // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.initialiseForm();
        }
      });
  }

  loadClinicalHistory() {
    this.apiService.getClinicalHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setClinicalHistory(data[0], data[1]);
        }
      });
  }

  setClinicalHistory(medicalsData, surgicalsData) {

    var medicalsList = [];
    medicalsData.forEach(thisMedical => {
      var thisMedicalWithName = this.medicals.find(val => val.id == thisMedical['medical_id'])
      medicalsList.push(thisMedicalWithName);
      if (thisMedicalWithName.name.toLowerCase().indexOf('other') > -1)
        this.otherMedical.setValue(thisMedical['other_medical']);
    });
    this.medical.setValue(medicalsList);

    var surgicalsList = [];
    surgicalsData.forEach(thisSurgical => {
      var thisSurgicalWithName = this.surgicals.find(val => val.id == thisSurgical['surgical_id'])
      surgicalsList.push(thisSurgicalWithName);
      if (thisSurgicalWithName.name.toLowerCase().indexOf('other') > -1)
        this.otherSurgical.setValue(thisSurgical['other_surgical']);
    });
    this.surgical.setValue(surgicalsList);

    this.medicalChanged();
    this.surgicalChanged();

    if (medicalsList.length > 0 || surgicalsList.length > 0)
      this.hasData.emit();
  }
}
