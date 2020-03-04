import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-current-medication',
  templateUrl: './current-medication.component.html',
  styleUrls: ['./current-medication.component.css']
})
export class CurrentMedicationComponent implements OnInit {

  currentMedicationForm;

  medicine; dosage; frequency; since;

  //for mat table
  displayedColumns: string[] = ['medicine', 'dosage', 'frequency', 'since', 'deleteOption'];
  dataSource: MatTableDataSource<CurrentMedication>;
  medicationsAdded: CurrentMedication[] = [];

  @Output() hasData = new EventEmitter<any>();

  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.createFormControls();
    this.createForm();
    this.setDefaults();
    this.utilities.setStyles();

    this.loadCurrentMedication();
  }

  createFormControls() {
    this.medicine = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 .,-]+')]);
    this.frequency = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 .,-]+')]);
    this.dosage = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 .,-]+')]);
    this.since = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 .,-]+')]);
  }

  createForm() {
    this.currentMedicationForm = new FormGroup({
      medicine: this.medicine,
      frequency: this.frequency,
      dosage: this.dosage,
      since: this.since
    });
  }

  setDefaults() {
    this.medicationsAdded = [];
  }

  //handling user inputs
  addMedication() {
    var isDuplicateMedicine = false;
    this.medicationsAdded.forEach(thisMedication => {
      if (thisMedication.medicine == this.medicine.value)
        isDuplicateMedicine = true;
    });

    if (isDuplicateMedicine) {
      swal({ title: "Error", text: "Duplicate medicine. Please check and try again.", type: 'error' });
      return;
    }

    var thisMedication: CurrentMedication = {
      medicine: this.medicine.value,
      frequency: this.frequency.value,
      dosage: this.dosage.value,
      since: this.since.value,
      deleteOption: true
    }

    this.currentMedicationForm.reset();
    this.medicationsAdded.push(thisMedication);
    this.dataSource = new MatTableDataSource(this.medicationsAdded);
    this.saveCurrentMedication()
  }

  deleteCurrentMedication(strMedicineName) {
    this.medicationsAdded.forEach((medication, index) => {
      if (medication.medicine == strMedicineName)
        this.medicationsAdded.splice(index, 1);
    });
    this.dataSource = new MatTableDataSource(this.medicationsAdded);
    if (this.medicationsAdded.length == 0) {
      this.deleteLastRow();
    } else {
      this.saveCurrentMedication();
    }
  }

  deleteLastRow() {
    var tableName = "dbe_his_cur_medication";

    this.apiService.deleteLastRow(this.curBen.curEncId, this.utilities.getCurEncNodeId(), tableName)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Data Saved Successfully", "Success");
          // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.loadCurrentMedication();
        }
      });
  }

  saveCurrentMedication() {
    var strCurrentMedicationToAdd = '';
    var thisEncId = this.curBen.curEncId;
    var thisEncNodeId = this.utilities.getCurEncNodeId();
    var createdBy = this.curStaff.staffId;
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');
    var medicineNameHasQuotes = false;

    this.medicationsAdded.forEach((medication, index) => {
      if (medication.medicine.indexOf("'") > -1 || medication.medicine.indexOf('"') > -1)
        medicineNameHasQuotes = true;

      strCurrentMedicationToAdd += "(";
      strCurrentMedicationToAdd += thisEncId + ",";
      strCurrentMedicationToAdd += thisEncNodeId + ",";
      strCurrentMedicationToAdd += "'" + medication.medicine + "',";
      strCurrentMedicationToAdd += "'" + medication.dosage + "',";
      strCurrentMedicationToAdd += "'" + medication.frequency + "',";
      strCurrentMedicationToAdd += "'" + medication.since + "',";
      strCurrentMedicationToAdd += createdBy + ",";
      strCurrentMedicationToAdd += "'" + createdAt + "'";
      strCurrentMedicationToAdd += ")";
      if (index != this.medicationsAdded.length - 1)
        strCurrentMedicationToAdd += ", ";
    });

    if (medicineNameHasQuotes) {
      swal({ title: "Error", text: "Medicine name cannot contain quotes. Please check and try again.", type: 'error' });
      return;
    }

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveCurrentMedication(this.curBen.curEncId, this.utilities.getCurEncNodeId(), strCurrentMedicationToAdd)
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

  loadCurrentMedication() {
    this.apiService.getCurrentMedication(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setCurrentMedicationData(data[0]);
        }
      });
  }

  setCurrentMedicationData(medicationData) {
    if (!medicationData) return;

    medicationData.forEach(thisMedicine => {
      var thisMedication: CurrentMedication = {
        medicine: thisMedicine['medicine_name'],
        dosage: thisMedicine['dosage'],
        frequency: thisMedicine['freq'],
        since: thisMedicine['since'],
        deleteOption: true
      }
      this.medicationsAdded.push(thisMedication);
    });

    if (this.medicationsAdded.length > 0)
      this.hasData.emit();

    this.dataSource = new MatTableDataSource(this.medicationsAdded);
  }
}

export interface CurrentMedication {
  medicine: string;
  dosage: string;
  frequency: string;
  since: string;
  deleteOption: boolean;
}