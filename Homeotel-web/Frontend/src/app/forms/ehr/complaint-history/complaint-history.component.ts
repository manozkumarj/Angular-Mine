import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CurStaffService } from '../../../services/cur-staff.service';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-complaint-history',
  templateUrl: './complaint-history.component.html',
  styleUrls: ['./complaint-history.component.css']
})
export class ComplaintHistoryComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  complaintsForm: FormGroup;

  complaint; otherComplaint;
  onset; duration; durationUnit;
  severity; visitReason;
  location; sensation;
  aggravation; modality; characteristics;
  symptoms;
  amelioration;
  recurringFreq;



  isRecurringList =
    [
      { id: 1, name: "Recurring" },
      { id: 2, name: "Not Recurring" }
    ]

  //temp variables
  isOtherComplaint;
  isRecurring;

  //masters
  complaints = []; onsets = []; durationUnits = []; severities = []; visitReasons = [];
  restrainedComplaints = [];


  displayedColumns: string[] = ['complaint', 'severity', 'duration', 'onset', 'isRecurring', 'recurringFreq',
    'characteristics', 'sensation', 'aggravation', 'amelioration', 'modality', 'symptoms', 'deleteOption'];

  dataSource: MatTableDataSource<Complaints>;
  complaintsAdded: Complaints[] = [];

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public router: Router, public datePipe: DatePipe) { }




  //canvas test

  @Input() public width = 280;
  @Input() public height = 500;

  private cx: CanvasRenderingContext2D;
  @ViewChild("canvas") canvas;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d')!;
    let image = new Image();


    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';
    image.onload = () => {
      this.cx.drawImage(image, 0, 0, this.width, this.height);
    }

    image.src = "assets/images/front.jpg";

  }

  getPoint(event) {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const rect = canvasEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
    var context = canvasEl.getContext("2d");
    //ctx.strokeStyle = "#880000";
    //ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
    //ctx.fillRect(20, 20, 150, 100);
    //ctx.fillRect(x, y, 10, 10);

    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI, false);
    context.fillStyle = 'orange';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = 'red';
    context.stroke();
  }
  //end of canvas test



  side = 0;
  toggleSide() {
    if (this.side == 0) {
      this.side = 1;
    }
    else if (this.side == 1) {
      this.side = 2;
    }
    else if (this.side == 2) {
      this.side = 0;
    }


    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d')!;
    let image = new Image();
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';
    image.onload = () => {
      this.cx.drawImage(image, 0, 0, this.width, this.height);
    }



    if (this.side == 0)
      image.src = "assets/images/front.jpg";
    else if (this.side == 1)
      image.src = "assets/images/back.jpg";
    else if (this.side == 2)
      image.src = "assets/images/side.jpg";
  }

  getSide() {
    if (this.side == 2) {
      return "Show Front View";
    }
    else if (this.side == 0) {
      return "Show Back View";
    }
    else if (this.side == 1) {
      return "Show Side View"
    }
  }


  ngOnInit() {
    this.curBen.returnIfBenNotLoaded();
    this.initialiseForm();
  }

  initialiseForm() {
    this.complaintsAdded = [];
    this.loadMasters();
    this.createFormControls();
    this.createForm();
  }

  afterMasterDataLoads() {
    this.setDefaults();
    this.utilities.setStyles();

    this.loadBeneficiaryComplaints();
  }

  resetMasters() {
    this.complaints = []; this.onsets = []; this.durationUnits = []; this.severities = []; this.visitReasons = [];
  }

  loadMasters() {
    this.apiService.getComplaintsPageMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'complaint')
              this.complaints.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'onset')
              this.onsets.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'duration_unit')
              this.durationUnits.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'severity')
              this.severities.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'visit_reason')
              this.visitReasons.push({ name: masterRow.name, id: masterRow.id });
          });

          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.complaint = new FormControl('');
    this.otherComplaint = new FormControl();
    this.severity = new FormControl('');
    this.duration = new FormControl('');
    this.durationUnit = new FormControl('');
    this.isRecurring = new FormControl('');
    this.recurringFreq = new FormControl('');
    this.onset = new FormControl();
    this.characteristics = new FormControl('');
    this.sensation = new FormControl('');
    this.aggravation = new FormControl('');
    this.amelioration = new FormControl('');
    this.modality = new FormControl('');
    this.symptoms = new FormControl('');
  }

  createForm() {
    this.complaintsForm = new FormGroup({
      complaint: this.complaint,
      otherComplaint: this.otherComplaint,
      severity: this.severity,
      duration: this.duration,
      durationUnit: this.durationUnit,
      isRecurring: this.isRecurring,
      recurringFreq: this.recurringFreq,
      onset: this.onset,
      characteristics: this.characteristics,
      sensation: this.sensation,
      aggravation: this.aggravation,
      amelioration: this.amelioration,
      modality: this.modality,
      symptoms: this.symptoms
    })
  }

  setDefaults() {
    this.isOtherComplaint = false;
    this.durationUnit.setValue(this.durationUnits.find(val => val.name.toLowerCase() == 'days'));
  }

  //User events handling
  complaintChanged() {
    if (this.complaint.value.name.toLowerCase().indexOf('other') > -1) {
      this.isOtherComplaint = true;
      this.otherComplaint.setValidators([Validators.required, Validators.pattern('^[a-zA-Z .,-]+')]);
      this.otherComplaint.updateValueAndValidity();
    }
    else {
      this.isOtherComplaint = false;
      this.otherComplaint.setValidators();
      this.otherComplaint.updateValueAndValidity();
    }
  }

  add() {
    var isDuplicateComplaint = false;
    this.complaintsAdded.forEach(complaint => {
      if (complaint.complaint == this.complaint.value.name)
        isDuplicateComplaint = true;
    });

    let strSymptoms = "";
    if (this.symptoms.value) {
      for (var i = 0; i < this.symptoms.value.length; i++) {
        strSymptoms += this.complaints.find(val => val.id == this.symptoms.value[i]).name,
          strSymptoms += " ,"
      }
      strSymptoms = strSymptoms.replace(/,\s*$/, "");
    }

    var thisComplaint: Complaints = {
      isOtherComplaint: this.isOtherComplaint,
      complaint: this.isOtherComplaint ? this.otherComplaint.value : this.complaint.value.name,
      complaintId: this.complaint.value.id,

      severity: this.severity.value.name,
      severityId: this.severity.value.id,

      duration: this.duration.value,
      durationUnit: this.durationUnit.value.name,
      durationUnitId: this.durationUnit.value.id,

      onset: this.onset.value ? this.onset.value.name : '',
      onsetId: this.onset.value ? this.onset.value.id : null,

      isRecurring: this.isRecurring.value.name,
      isRecurringId: this.isRecurring.value.id,

      recurringFreq: this.recurringFreq.value,

      characteristics: this.characteristics.value,
      sensation: this.sensation.value,
      aggravation: this.aggravation.value,
      amelioration: this.amelioration.value,
      modality: this.modality.value,

      symptoms: this.symptoms.value,
      strSymptoms: strSymptoms,

      deleteOption: true
    }

    this.complaintsForm.reset();
    this.setDefaults();
    this.complaintsAdded.push(thisComplaint);
    this.dataSource = new MatTableDataSource(this.complaintsAdded);

    this.saveComplaints();
  }

  deleteComplaint(strComplaint) {
    this.complaintsAdded.forEach((complaint, index) => {
      if (complaint.complaint == strComplaint)
        this.complaintsAdded.splice(index, 1);
    });
    this.dataSource = new MatTableDataSource(this.complaintsAdded);
    if (this.complaintsAdded.length != 0) {
      this.saveComplaints();
    }


  }

  //save and load data
  saveComplaints() {
    var strComplaintsToAdd = '';
    var thisEncId = this.curBen.curEncId;
    var thisEncNodeId = this.utilities.getCurEncNodeId();
    var createdBy = this.curStaff.staffId;
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    this.complaintsAdded.forEach((complaint, index) => {
      strComplaintsToAdd += "(";
      strComplaintsToAdd += thisEncId + ",";
      strComplaintsToAdd += thisEncNodeId + ",";
      strComplaintsToAdd += complaint.complaintId + ",";
      strComplaintsToAdd += complaint.isOtherComplaint ? "'" + complaint.complaint + "'," : 'NULL,';
      strComplaintsToAdd += complaint.onsetId + ",";
      strComplaintsToAdd += complaint.duration + ",";
      strComplaintsToAdd += complaint.durationUnitId + ",";
      strComplaintsToAdd += complaint.severityId + ",";
      strComplaintsToAdd += complaint.isRecurringId + ",";
      strComplaintsToAdd += complaint.recurringFreq ? "'" + complaint.recurringFreq + "'," : 'NULL,';
      strComplaintsToAdd += complaint.characteristics ? "'" + complaint.characteristics + "'," : 'NULL,';
      strComplaintsToAdd += complaint.sensation ? "'" + complaint.sensation + "'," : 'NULL,';
      strComplaintsToAdd += complaint.aggravation ? "'" + complaint.aggravation + "'," : 'NULL,';
      strComplaintsToAdd += complaint.amelioration ? "'" + complaint.amelioration + "'," : 'NULL,';
      strComplaintsToAdd += complaint.modality ? "'" + complaint.modality + "'," : 'NULL,';
      strComplaintsToAdd += JSON.stringify(complaint.symptoms) ? "'" + JSON.stringify(complaint.symptoms) + "'," : 'NULL,';
      strComplaintsToAdd += createdBy + ",";
      strComplaintsToAdd += "'" + createdAt + "'";
      strComplaintsToAdd += ")";
      if (index != this.complaintsAdded.length - 1)
        strComplaintsToAdd += ", ";
    });

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveComplaintsHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId(), strComplaintsToAdd)
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

  loadBeneficiaryComplaints() {
    this.apiService.getComplaintsHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setComplaintsData(data);
        }
      });


    this.apiService.getComplaints(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.restrictComplaints(data);
        }
      });
  }

  restrictComplaints(data) {
    let newList = [];
    this.restrainedComplaints = [];
    data[0].forEach(complaintData => {
      newList.push(complaintData['complaint_id']);
    })

    for (var i = 0; i < this.complaints.length; i++) {
      let complaintExists = 0;
      for (var j = 0; j < newList.length; j++) {
        if (newList[j] == this.complaints[i].id)
          complaintExists = 1;
      }
      if (complaintExists)
        this.restrainedComplaints.push(this.complaints[i]);
    }
  }

  setComplaintsData(data) {
    data[0].forEach(complaintData => {
      let symptoms = JSON.parse(complaintData['symptoms']);
      let strSymptoms = "";
      if (symptoms) {
        for (var i = 0; i < symptoms.length; i++) {
          strSymptoms += this.complaints.find(val => val.id == symptoms[i]).name,
            strSymptoms += " ,"
        }
        strSymptoms = strSymptoms.replace(/,\s*$/, "");
      }

      var isThisOtherComplaint = (complaintData['other_complaint'] && complaintData['other_complaint'] != '') ? true : false;
      var thisComplaint: Complaints = {
        isOtherComplaint: isThisOtherComplaint,
        complaint: isThisOtherComplaint ? complaintData['other_complaint'] : this.complaints.find(val => val.id == complaintData['complaint_id']).name,
        complaintId: complaintData['complaint_id'],

        severity: this.severities.find(val => val.id == complaintData['severity_id']).name,
        severityId: complaintData['severity_id'],

        duration: complaintData['duration'],
        durationUnit: this.durationUnits.find(val => val.id == complaintData['duration_unit_id']).name,
        durationUnitId: complaintData['duration_unit_id'],

        onset: complaintData['onset_id'] ? this.onsets.find(val => val.id == complaintData['onset_id']).name : '',
        onsetId: complaintData['onset_id'],

        isRecurring: complaintData['recurring_id'] ? this.isRecurringList.find(val => val.id == complaintData['recurring_id']).name : '',
        isRecurringId: complaintData['recurring_id'],
        recurringFreq: complaintData['recurring_freq'],


        characteristics: complaintData['characteristics'],
        sensation: complaintData['sensation'],
        aggravation: complaintData['aggravation'],
        amelioration: complaintData['amelioration'],
        modality: complaintData['modality'],

        symptoms: symptoms,
        strSymptoms: strSymptoms,


        deleteOption: true
      }
      this.complaintsAdded.push(thisComplaint);
    });

    this.dataSource = new MatTableDataSource(this.complaintsAdded);
  }
}

export interface Complaints {
  isOtherComplaint: boolean;
  complaint: string;
  complaintId: number;

  severity: string;
  severityId: number;

  duration: string;
  durationUnit: string;
  durationUnitId: number;

  isRecurring: string;
  isRecurringId: number;
  recurringFreq: string;

  onset: string;
  onsetId: number;

  characteristics: string;
  sensation: string;
  aggravation: string;
  amelioration: string;
  modality: string;

  symptoms: number[];
  strSymptoms: string;

  deleteOption: boolean;
}

