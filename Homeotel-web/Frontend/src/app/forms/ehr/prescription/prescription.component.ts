import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
import { CurStaffService } from '../../../services/cur-staff.service';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
  },
  display: {
    // dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};


export class MyDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat == "input") {
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      return this._to2digit(day) + '-' + this._to2digit(month) + '-' + year;
    } else {
      return date.toDateString();
    }
  }

  _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }
}

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class PrescriptionComponent implements OnInit {

  prescriptionForm;

  ncdDiagnosis; nonNcdDiagnosis; otherDiagnosis;
  notes; advice; reviewDate; lifeSitutation;

  tcSplId;



  //temp variables
  tcStatus = ''; tcCompleted = false;
  strDiagnosis = '';
  doctorName = ''; doctorSignature = '';

  Testdosages = [
    { id: 1, name: 'Once a Day' },
    { id: 2, name: 'Twice a Day' },
    { id: 3, name: 'Thrice a Day' },
    { id: 4, name: 'As Required' }
  ];
  Testmethod = [
    { id: 1, name: 'Method 1' },
    { id: 2, name: 'Method 2' },
    { id: 3, name: 'Method 3' }
  ];
  Testscale = [
    { id: 1, name: 'Decimal' },
    { id: 2, name: 'Centisimal' },
    { id: 3, name: 'LM' }
  ];

  Testfrequency = [
    { id: 1, name: 'Once Daily' },
    { id: 2, name: 'Twice Daily' },
    { id: 3, name: 'Thrice Daily' },
    { id: 4, name: 'If requried' }
  ]

  Testpotency = [
    { uid: 1, id: 1, name: '0/1' },
    { uid: 2, id: 1, name: '0/2' },
    { uid: 3, id: 1, name: '0/3' },
    { uid: 4, id: 1, name: '0/4' },
    { uid: 5, id: 1, name: '0/5' },
    { uid: 6, id: 1, name: '0/6' },
    { uid: 7, id: 2, name: '1' },
    { uid: 8, id: 2, name: '2' },
    { uid: 9, id: 2, name: '3' },
    { uid: 10, id: 2, name: '4' },
    { uid: 11, id: 2, name: '5' },
    { uid: 12, id: 2, name: '6' },
    { uid: 13, id: 3, name: '10' },
    { uid: 14, id: 3, name: '20' },
    { uid: 15, id: 3, name: '30' },
    { uid: 16, id: 3, name: '40' },
    { uid: 17, id: 3, name: '50' },
    { uid: 18, id: 3, name: '60' },

  ];

  prescFiles = [];

  //masters
  ncdDiagnosisList = []; nonNcdDiagnosisList = [];
  drugs = []; categories = []; dosages = []; frequencies = []; instructions = [];
  specializations = []; allInstructions = [];

  displayedColumns: string[] = ['name', 'scale', 'potency', 'freq', 'instruction', 'noOfDays', 'deleteOption'];
  displayedColumnsForPrint: string[] = ['name', 'freq', 'instruction', 'noOfDays', 'quantity'];
  dataSource: MatTableDataSource<Drugs>;
  drugsAdded: Drugs[] = [];

  @ViewChild('inputFile') inputFile;
  @Output() dataReady = new EventEmitter<any>();
  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public router: Router, public datePipe: DatePipe, public auth: AuthService) { }

  ngOnInit() {
    this.curBen.returnIfBenNotLoaded();
    this.initialiseForm();
  }

  initialiseForm() {

    this.drugsAdded = [];
    this.setDefaults();
    this.loadMasters();

    this.createFormControls();
    this.createForm();
    this.inputFile.nativeElement.value = '';
    this.prescFiles = [];

  }

  afterMasterDataLoads() {
    this.utilities.setStyles();
    this.loadPrescriptionData();
    this.ncdDiagnosisChanged();
  }

  resetMasters() {
    this.ncdDiagnosisList = []; this.nonNcdDiagnosisList = [];
    this.drugs = []; this.categories = []; this.dosages = []; this.frequencies = []; this.instructions = [];
    this.specializations = [];
  }

  loadMasters() {
    this.apiService.getPrescriptionPageMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'ncd_diagnosis')
              this.ncdDiagnosisList.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'non_ncd_diagnosis')
              this.nonNcdDiagnosisList.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'drug')
              this.drugs.push({ name: masterRow.name, id: masterRow.id, categoryId: masterRow.category_id });
            else if (masterRow.master_type == 'drug_category')
              this.categories.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'dosage')
              this.dosages.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'freq')
              this.frequencies.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'instruction') {
              this.instructions.push({ name: masterRow.name, id: masterRow.id });
              this.allInstructions.push({ name: masterRow.name, id: masterRow.id });
            }
            else if (masterRow.master_type == 'specialization')
              this.specializations.push({ name: masterRow.name, id: masterRow.id });
          });

          this.afterMasterDataLoads();
        }
      })
  }

  setDefaults() {
    this.addAnEmptyDrug();
  }

  addAnEmptyDrug() {
    var emptyDrug: Drugs = {
      id: 0,
      categoryId: 0,
      scale: 0,
      potency: 0,
      //dosage: 0,
      freq: 0,
      //method:0,
      instruction: 0,
      noOfDays: 0,
      quantity: 0,
      deleteOption: false
    }

    this.drugsAdded.push(Object.assign({}, emptyDrug));

    this.dataSource = new MatTableDataSource(this.drugsAdded);
  }

  createFormControls() {
    this.ncdDiagnosis = new FormControl();
    this.nonNcdDiagnosis = new FormControl();
    this.otherDiagnosis = new FormControl();
    this.notes = new FormControl();
    this.reviewDate = new FormControl('', Validators.required);
    this.advice = new FormControl();
    this.lifeSitutation = new FormControl();

  }

  createForm() {
    this.prescriptionForm = new FormGroup({
      ncdDiagnosis: this.ncdDiagnosis,
      nonNcdDiagnosis: this.nonNcdDiagnosis,
      otherDiagnosis: this.otherDiagnosis,
      notes: this.notes,
      advice: this.advice,
      reviewData: this.reviewDate,
      lifeSitutation: this.lifeSitutation
    })
  }

  //handle user event
  printPreview() {
    this.utilities.printMode = true;
  }

  print() {
    window.print();
  }

  endPrint() {
    this.utilities.printMode = false;
  }

  ncdDiagnosisChanged() {
    if (this.ncdDiagnosis.value && this.ncdDiagnosis.value.length > 0) {
      this.instructions = [];
      this.allInstructions.forEach(instruction => {
        // We will show only "With Food" option when ncd diagnosis selected at least one, the ID is 4.
        if (instruction.id == 4) {
          this.instructions.push({ name: instruction.name, id: instruction.id });
        }
      });
      // Clearing all added dosages instructions, so that user will be asked to select instruction field.
      this.drugsAdded.forEach((drug, index) => {
        drug.instruction = null;
      });
    }
    else
      this.instructions = this.allInstructions;
  }


  drugChanged(index, element) {
    if (this.drugsAdded.length - 1 == index)
      this.addAnEmptyDrug();

    var thisDrug = this.drugs.filter(val => val.id == element.id);
    element.categoryId = parseInt(thisDrug[0]['categoryId']);
  }

  deleteDrug(drugElement) {
    this.drugsAdded.forEach((drug, index) => {
      if (drug.id == drugElement.id)
        this.drugsAdded.splice(index, 1);
    });

    this.addAnEmptyDrug();

    this.dataSource = new MatTableDataSource(this.drugsAdded);
  }

  aaaa(id) {

    console.log("aaaa triggered");
    console.log(id);
    // if(id===1){
    //   window.location.href = "https://www.zoltglobal.com/";
    // }

    // if(id===2){
    //   window.location.href = "https://www.zoltglobal.com/";
    // }
    // if(id===3){
    //   window.location.href = "https://www.zoltglobal.com/";
    // }


  }


  calculateQty(element) {




    if (element.freq && element.dosage && element.noOfDays && element.freq <= 3 && element.dosage <= 4) {
      element.quantity = element.freq * element.dosage * element.noOfDays;
    }
    else
      element.quantity = null;


  }


  //save and load data
  savePrescription() {
    var strDrugsAdded = '';
    var thisEncId = this.curBen.curEncId;
    var thisEncNodeId = this.utilities.getCurEncNodeId();
    var createdBy = this.curStaff.staffId;
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    var drugIdsAdded = [];
    var drugsDataValid = true;
    var duplicateDrugsExist = false;
    this.drugsAdded.forEach((drug, index) => {
      if (drug.id) {
        // if (!drug.dosage || !drug.freq || !drug.instruction || !drug.noOfDays || !drug.quantity)
        //   drugsDataValid = false;

        if (drugIdsAdded.indexOf(drug.id) > -1)
          duplicateDrugsExist = true;
        else
          drugIdsAdded.push(drug.id)

        strDrugsAdded += "(";
        strDrugsAdded += thisEncId + ",";
        strDrugsAdded += thisEncNodeId + ",";
        strDrugsAdded += drug.id + ",";
        strDrugsAdded += drug.potency + ",";
        strDrugsAdded += drug.scale + ",";
        strDrugsAdded += drug.freq + ",";
        strDrugsAdded += drug.instruction + ",";
        strDrugsAdded += drug.noOfDays + ",";
        strDrugsAdded += drug.quantity + ",";
        strDrugsAdded += createdBy + ",";
        strDrugsAdded += "'" + createdAt + "'";
        strDrugsAdded += ")";
        if (index != this.drugsAdded.length - 1)
          strDrugsAdded += ", ";
      }
    });
    strDrugsAdded = strDrugsAdded.replace(/,\s*$/, "");
    /* TODO - remove the above line and make sure an error is prompted when such things happen instead of false success!! */

    if ((!this.ncdDiagnosis.value || this.ncdDiagnosis.value.length == 0) &&
      (!this.nonNcdDiagnosis.value || this.nonNcdDiagnosis.value.length == 0) &&
      (!this.otherDiagnosis.value)) {
      swal({ title: "Error", text: "Diagnosis is mandatory. Please check and try again.", type: 'error' });
      return;
    }

    if (!drugsDataValid) {
      swal({ title: "Error", text: "Drug dosage, frequency, instruction, no. of days, quantity are mandatory. Please check and try again.", type: 'error' });
      return;
    }
    else if (duplicateDrugsExist) {
      swal({ title: "Error", text: "Duplicate drugs added. Please check and try again.", type: 'error' });
      return;
    }

    var strDiagnosisAdded = '';
    if (this.ncdDiagnosis.value) {
      this.ncdDiagnosis.value.forEach(ncdDiagnosis => {
        strDiagnosisAdded += "(";
        strDiagnosisAdded += thisEncId + ",";
        strDiagnosisAdded += thisEncNodeId + ",";
        strDiagnosisAdded += ncdDiagnosis + ",";
        strDiagnosisAdded += "null" + ",";
        strDiagnosisAdded += createdBy + ",";
        strDiagnosisAdded += "'" + createdAt + "'";
        strDiagnosisAdded += "),";
      });
    }

    if (this.nonNcdDiagnosis.value) {
      this.nonNcdDiagnosis.value.forEach(nonNcdDiagnosis => {
        strDiagnosisAdded += "(";
        strDiagnosisAdded += thisEncId + ",";
        strDiagnosisAdded += thisEncNodeId + ",";
        strDiagnosisAdded += nonNcdDiagnosis + ",";
        strDiagnosisAdded += "null" + ",";
        strDiagnosisAdded += createdBy + ",";
        strDiagnosisAdded += "'" + createdAt + "'";
        strDiagnosisAdded += "),";
      });
    }

    //let 0 mean other diagnosis
    /* TODO - documentation boss..!! documentation, it's about time... */
    if (this.otherDiagnosis.value) {
      strDiagnosisAdded += "(";
      strDiagnosisAdded += thisEncId + ",";
      strDiagnosisAdded += thisEncNodeId + ",";
      strDiagnosisAdded += "0" + ",";
      strDiagnosisAdded += "'" + this.lifeSitutation.value + "',";
      strDiagnosisAdded += "'" + this.otherDiagnosis.value + "',";
      strDiagnosisAdded += createdBy + ",";
      strDiagnosisAdded += "'" + createdAt + "'";
      strDiagnosisAdded += ")";
    }

    strDiagnosisAdded = strDiagnosisAdded.replace(/,\s*$/, "");

    var strReviewDate = this.datePipe.transform(this.reviewDate.value, 'yyyy-MM-dd');

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.savePrescription(this.curBen.curEncId, this.utilities.getCurEncNodeId(), strDrugsAdded,
      strDiagnosisAdded, this.notes.value, this.advice.value, strReviewDate, this.utilities.getThisSystemNodeId(),
      this.curStaff.strName, this.curStaff.staffId)
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

  scheduleTc() {
    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.savePrescriptionTc(this.curBen.curEncId, this.utilities.getCurEncNodeId(), this.tcSplId,
      this.curStaff.staffId)
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

  loadPrescriptionData() {
    console.clear();

    this.loadPrescFiles();



    this.apiService.getPrescription(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setPrescriptionData(data[0][0], data[1], data[2], data[3][0]);
          console.log();
        }
      });
  }

  setPrescriptionData(prescriptionData, diagnosisData, drugsData, tcData) {
    if (tcData) {
      //firstly, let's set the case as a tc case
      this.curBen.todaysEncounterStatus = this.curBen.EncounterStatusEnum.Tele_Consultation_Case;
      this.tcSplId = tcData['spl_id'];
    }

    //and continue later with the normal workflow... that is, even for a tc it's closed if it's closed..
    if (!prescriptionData) return;

    //else, since prescription seems to be already set, let's update the todaysEncounterStatus to closed
    this.curBen.todaysEncounterStatus = this.curBen.EncounterStatusEnum.Closed_Case;

    this.notes.setValue(prescriptionData['notes']);
    this.advice.setValue(prescriptionData['advice']);
    this.reviewDate.setValue(prescriptionData['review_date']);
    this.doctorSignature = prescriptionData['signature'];
    this.doctorName = prescriptionData['doctor_name'];
    this.lifeSitutation.setValue(diagnosisData[0]['lifeSitutation']);
    var selectedNcdDiagnosisList = [];
    var selectedNonNcdDiagnosisList = [];
    this.strDiagnosis = '';
    diagnosisData.forEach(thisDiagnosis => {
      if (thisDiagnosis['other_diagnosis']) {
        this.otherDiagnosis.setValue(thisDiagnosis['other_diagnosis']);
        this.strDiagnosis += thisDiagnosis['other_diagnosis'] + ", "
      }
      else if (thisDiagnosis['is_ncd']) {
        selectedNcdDiagnosisList.push(thisDiagnosis['diagnosis_id'])
        var thisNcdDiagnosis = this.ncdDiagnosisList.find(val => val.id == thisDiagnosis['diagnosis_id']);
        if (thisNcdDiagnosis)
          this.strDiagnosis += thisNcdDiagnosis.name + ", ";
      }
      else {
        selectedNonNcdDiagnosisList.push(thisDiagnosis['diagnosis_id'])
        var thisNonNcdDiagnosis = this.nonNcdDiagnosisList.find(val => val.id == thisDiagnosis['diagnosis_id']);
        if (thisNonNcdDiagnosis)
          this.strDiagnosis += thisNonNcdDiagnosis.name + ", ";
      }
    });

    this.strDiagnosis = this.strDiagnosis.replace(/,\s*$/, "");

    this.ncdDiagnosis.setValue(selectedNcdDiagnosisList);
    this.nonNcdDiagnosis.setValue(selectedNonNcdDiagnosisList);

    this.drugsAdded = [];
    if (drugsData[0]) {
      drugsData.forEach(drugsAdded => {
        var thisDrugMaster = this.drugs.filter(val => val.id == drugsAdded['drug_id']);
        var thisDrug: Drugs = {
          id: drugsAdded['drug_id'],
          categoryId: parseInt(thisDrugMaster[0]['categoryId']),
          scale: drugsAdded['scale'],

          potency: drugsAdded['potency'],
          // dosage: drugsAdded['drug_dosage_id'],
          freq: drugsAdded['drug_freq_id'],
          //method: drugsAdded['drug_dosage_id'],
          instruction: drugsAdded['drug_instruction_id'],
          noOfDays: drugsAdded['no_of_days'],
          quantity: drugsAdded['prescribed_qty'],
          deleteOption: true
        }
        this.drugsAdded.push(thisDrug);
      });
      console.log(this.drugsAdded);

    }

    this.dataSource = new MatTableDataSource(this.drugsAdded);
  }


  openImage(imgData) {
    var w = window.open("", '_blank');
    w.document.write("<img src='" + imgData + "' />");
    w.document.close();
  }





  startUpload(event: FileList) {
    // The File object
    const eventFile = event.item(0)

    //Since mysql is throwing error max_packet_size, for now, let's limit the upload size to 1 mb and see how it goes
    //and allowing only images for now (restricted by accept attribute on file input)    
    var fileSizeInMB = eventFile.size / 1024 / 1024;
    if (fileSizeInMB > 1) {
      swal({ title: "Error", text: "File size should be less than 1 MB. Please check and try again.", type: 'error' });
      return;
    }



    var reader = new FileReader();
    reader.readAsDataURL(eventFile); // read file as data url
    reader.onload = (event: any) => { // called once readAsDataURL is completed
      var fileTokens = event.target.result.split(',');
      var base64result = fileTokens[1];
      var fileType = fileTokens[0];
      this.uploadFile(base64result, fileType);
    }
  }

  uploadFile(fileDataBase64, fileType) {
    this.apiService.savePrescFile(this.curBen.curEncId, this.utilities.getCurEncNodeId(), fileDataBase64,
      fileType, this.curStaff.staffId)
      .subscribe(data => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the file", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Data Saved Successfully", "Success");
          // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.initialiseForm();
        }
      })
  }

  removeFile() {
    this.apiService.deletePrescFile(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe(data => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while removing the file", type: 'error' });
          console.log(data);
        }
        else {
          this.initialiseForm();
        }
      });
  }


  loadPrescFiles() {
    console.log('***');
    this.apiService.getPrescFiles(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe(data => {

        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the file", type: 'error' });
          console.log(data);
        }
        else {
          this.setprescFilesData(data[0]);
        }
      })
  }

  setprescFilesData(prescFilesData) {
    if (!prescFilesData) {
      this.dataReady.emit({ from: 'presc-files-upload', strShortDescription: null });
      return;
    }

    prescFilesData.forEach(prescFile => {
      this.prescFiles.push({ data: prescFile['file_type'] + "," + prescFile['file_data'] });
    });

    var s = this.prescFiles.length == 1 ? '' : 's';
    var strShortDescription = this.prescFiles.length + " presc file" + s + " uploaded";
    this.dataReady.emit({ from: 'presc-files-upload', strShortDescription: strShortDescription });
    console.log('ggggg')
  }




  allowPrescriptionSave() {
    //either if it's a local doctor and case is still open (as opposed to a tc case)
    //or it's a specialist doctor and case is tc (as opposed to closed)
    return (this.curStaff.isLocalDoctor() && this.curBen.isOpenCase())
      || (this.curStaff.isSpecialistDoctor() && this.curBen.isTeleConsultationCase())
  }

  showTcSection() {
    if (this.curStaff.isSpecialistDoctor())
      return false;
    else
      return this.curBen.isOpenCase() || this.curBen.isTeleConsultationCase();
  }
}

export interface Drugs {
  id: number;
  categoryId: number;
  scale: number;
  potency: number;
  //dosage: number;
  freq: number;
  //method:number;
  instruction: number;
  noOfDays: number;
  quantity: number;
  deleteOption: boolean;
}
