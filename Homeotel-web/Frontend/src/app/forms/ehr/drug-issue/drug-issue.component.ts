import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
import { CurStaffService } from '../../../services/cur-staff.service';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-drug-issue',
  templateUrl: './drug-issue.component.html',
  styleUrls: ['./drug-issue.component.css']
})
export class DrugIssueComponent implements OnInit {

  displayedColumns: string[] = ['name', 'prescribedQty', 'batchNo', 'issuedQty', 'remarks', 'saved'];
  dataSource: MatTableDataSource<Drugs>;
  prescribedDrugs: Drugs[] = [];
  prescribedDrugsOriginal: Drugs[] = [];
  batches = [];

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public router: Router) { }

  ngOnInit() {
    this.curBen.returnIfBenNotLoaded();
    this.initialiseForm();
  }

  initialiseForm() {
    this.prescribedDrugs = [];
    this.prescribedDrugsOriginal = [];

    this.utilities.setStyles();
    this.loadDrugsIssuedData();
  }

  //save and load data
  saveThisDrugIssuedData(element) {
    //check if issued qty or remarks changed w.r.t original
    var originalIssuedData = this.prescribedDrugsOriginal.find(val => val.id == element.id);
    if (originalIssuedData.issuedQty == element.issuedQty && originalIssuedData.remarks == element.remarks) {
      element.saved = originalIssuedData.saved;
      return; //as nothing was changed...
    }

    element.saved = false; //until save is successful and data loads again    

    if (isNaN(parseInt(element.issuedQty)))
      return;

    if (element.issuedQty != element.prescribedQty && !element.remarks)
      return; //as remarks are mandatory in this case  

    if (element.issuedQty > element.prescribedQty) {
      swal({ title: "Error", text: "Cannot issue more than the prescribed Qty. Please check and try again.", type: 'error' });
      return;
    }

    //check if issued qty is greater than available qty
    var thisBatch = this.batches.find(val => val.drugId == element.id && val.batchNo == element.batchNo);
    if (element.issuedQty > thisBatch.availableQty) {
      swal({ title: "Error", text: "Cannot issue more than the available Qty (" + thisBatch.availableQty + "). Please check and try again.", type: 'error' });
      return;
    }

    this.apiService.saveDrugIssuedData(this.curBen.curEncId, this.utilities.getCurEncNodeId(), element.id,
      element.issuedQty, element.batchNo, element.remarks, this.curStaff.staffId)
      .subscribe((data) => {
        console.log(data)
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          element.saved = true;
          this.loadDrugsIssuedData();
        }
      });
  }

  loadDrugsIssuedData() {
    this.apiService.getDrugIssuedData(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          console.log(data);
          this.setDrugsIssuedData(data[0], data[1]);
        }
      });
  }

  setDrugsIssuedData(drugsIssuedData, batchesData) {
    if (!drugsIssuedData) return;


    this.batches = [];
    batchesData.forEach(batch => {
      this.batches.push({
        drugId: batch['drug_id'],
        batchNo: batch['batch_no'],
        availableQty: batch['qty']
      });
    });

    this.prescribedDrugs = [];
    this.prescribedDrugsOriginal = [];
    drugsIssuedData.forEach(drugIssued => {
      var thisDrug: Drugs = {
        id: drugIssued['drug_id'],
        name: drugIssued['drug_name'],
        prescribedQty: drugIssued['prescribed_qty'],
        batchNo: drugIssued['batch_no'],
        issuedQty: drugIssued['issued_qty'],
        remarks: drugIssued['issued_remarks'],
        saved: isNaN(parseInt(drugIssued['issued_qty'])) ? false : true
      }
      this.prescribedDrugs.push(thisDrug);
      this.prescribedDrugsOriginal.push(Object.assign({}, thisDrug));
    });

    this.dataSource = new MatTableDataSource(this.prescribedDrugs);
  }
}

export interface Drugs {
  id: number;
  name: string;
  prescribedQty: number;
  batchNo: string;
  issuedQty: number;
  remarks: string;
  saved: boolean;
}