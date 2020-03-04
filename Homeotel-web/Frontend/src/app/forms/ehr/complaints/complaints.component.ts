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
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css']
})
export class ComplaintsComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  complaintsForm: FormGroup;

  complaint; otherComplaint;
  onset; duration; durationUnit;
  severity; visitReason;
  location; sensation;
  aggravation; amelioration; characteristics;
  symptoms;

  frontSavedPoints;
  backSavedPoints;
  sideSavedPoints;

  frontPointsList = [];
  backPointsList = [];
  sidePointsList = [];

  symptomsList =
    [
      { id: 1, name: "Nausea" },
      { id: 2, name: "Fever" },
      { id: 3, name: "Headaches" }
    ]

  //temp variables
  isOtherComplaint;

  //masters
  complaints = []; onsets = []; durationUnits = []; severities = []; visitReasons = [];


  displayedColumns: string[] = ['complaint', 'duration', 'location', 'deleteOption'];
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
      setTimeout(() => { this.setPoint(); }, 100);
    }

    image.src = "assets/images/front.jpg";

  }

  pushPoints(x, y) {
    if (this.side == 0)
      this.frontPointsList.push({ x: x, y: y })
    else if (this.side == 1)
      this.backPointsList.push({ x: x, y: y })
    if (this.side == 2)
      this.sidePointsList.push({ x: x, y: y })
  }

  getPoint(event) {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const rect = canvasEl.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    this.pushPoints(x, y);

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

  getSavedPoints() {
    let thisPoints;

    if (this.side == 0)
      thisPoints = JSON.parse(this.frontSavedPoints)
    else if (this.side == 1)
      thisPoints = JSON.parse(this.backSavedPoints)
    else if (this.side == 2)
      thisPoints = JSON.parse(this.sideSavedPoints)

    return thisPoints;
  }

  setPoint() {
    let thisPoints = this.getSavedPoints();
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    var context = canvasEl.getContext("2d");
    for (var i = 0; i < thisPoints.length; i++) {
      this.pushPoints(thisPoints[i]['x'], thisPoints[i]['y'])
      context.beginPath();
      context.arc(thisPoints[i]['x'], thisPoints[i]['y'], 5, 0, 2 * Math.PI, false);
      context.fillStyle = 'orange';
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = 'red';
      context.stroke();
    }
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
      setTimeout(() => { this.setPoint(); }, 100);
    }



    if (this.side == 0) //front
      image.src = "assets/images/front.jpg";
    else if (this.side == 1) //back
      image.src = "assets/images/back.jpg";
    else if (this.side == 2) //side
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
    this.complaint = new FormControl('', Validators.required);
    this.otherComplaint = new FormControl();
    this.onset = new FormControl();
    this.duration = new FormControl('');
    this.durationUnit = new FormControl('');
    this.severity = new FormControl('');
    this.visitReason = new FormControl('');
    this.location = new FormControl('');
    this.sensation = new FormControl('');
    this.aggravation = new FormControl('');
    this.amelioration = new FormControl('');
    this.characteristics = new FormControl('');
    this.symptoms = new FormControl('');
  }

  createForm() {
    this.complaintsForm = new FormGroup({
      complaint: this.complaint,
      otherComplaint: this.otherComplaint,
      onset: this.onset,
      duration: this.duration,
      durationUnit: this.durationUnit,
      severity: this.severity,
      visitReason: this.visitReason,
      location: this.location,
      sensation: this.sensation,
      aggravation: this.aggravation,
      amelioration: this.amelioration,
      characteristics: this.characteristics,
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

    if (isDuplicateComplaint) {
      swal({ title: "Error", text: "Duplicate complaint. Please check and try again.", type: 'error' });
      return;
    }

    var thisComplaint: Complaints = {
      isOtherComplaint: this.isOtherComplaint,
      complaint: this.isOtherComplaint ? this.otherComplaint.value : this.complaint.value.name,
      complaintId: this.complaint.value.id,
      duration: this.duration.value,
      durationUnit: this.durationUnit.value.name,
      durationUnitId: this.durationUnit.value.id,
      location: this.location.value,
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
    if (this.complaintsAdded.length == 0) {
      this.deleteLastRow()
    } else {
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
      strComplaintsToAdd += complaint.duration + ",";
      strComplaintsToAdd += complaint.durationUnitId + ",";
      strComplaintsToAdd += "'" + complaint.location + "',";
      strComplaintsToAdd += "'" + JSON.stringify(this.frontPointsList) + "',";
      strComplaintsToAdd += "'" + JSON.stringify(this.backPointsList) + "',";
      strComplaintsToAdd += "'" + JSON.stringify(this.sidePointsList) + "',";
      strComplaintsToAdd += createdBy + ",";
      strComplaintsToAdd += "'" + createdAt + "'";
      strComplaintsToAdd += ")";
      if (index != this.complaintsAdded.length - 1)
        strComplaintsToAdd += ", ";
    });

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveComplaints(this.curBen.curEncId, this.utilities.getCurEncNodeId(), strComplaintsToAdd)
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
    this.apiService.getComplaints(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setComplaintsData(data);
        }
      });
  }

  deleteLastRow() {


    var tableName = "dbe_complaint";

    this.apiService.deleteLastRow(this.curBen.curEncId, this.utilities.getCurEncNodeId(), tableName)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Data Saved Successfully", "Success");
          // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.loadBeneficiaryComplaints();
        }
      });

  }

  setComplaintsData(data) {
    data[0].forEach(complaintData => {
      var isThisOtherComplaint = (complaintData['other_complaint'] && complaintData['other_complaint'] != '') ? true : false;

      this.frontSavedPoints = complaintData['points_front'];
      this.backSavedPoints = complaintData['points_back'];
      this.sideSavedPoints = complaintData['points_side'];

      var thisComplaint: Complaints = {
        isOtherComplaint: isThisOtherComplaint,
        complaint: isThisOtherComplaint ? complaintData['other_complaint'] : this.complaints.find(val => val.id == complaintData['complaint_id']).name,
        complaintId: complaintData['complaint_id'],
        duration: complaintData['duration'],
        durationUnit: this.durationUnits.find(val => val.id == complaintData['duration_unit_id']).name,
        durationUnitId: complaintData['duration_unit_id'],
        location: complaintData['location'],
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
  duration: string;
  durationUnit: string;
  durationUnitId: number;
  location: string;
  deleteOption: true;
}