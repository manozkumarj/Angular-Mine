import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
import { CurStaffService } from '../../../services/cur-staff.service';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

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
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class InventoryComponent implements OnInit {
  inventoryForm: FormGroup;

  inventoryType; inventory; batchNo; expiryDate; qty;

  //temp variables
  strCurItemUnits = '';

  //masters
  inventoryTypes = []; drugs = []; labConsumables = [];
  inventories = []; //either drugs or lab consumables depending on the inventory type selection

  displayedColumns: string[] = ['invName', 'batchNo', 'expiryDate', 'currentQty'];
  dataSource: MatTableDataSource<Inventory>;
  currentInventory: Inventory[] = [];

  constructor(public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public router: Router, public datePipe: DatePipe) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.currentInventory = [];
    this.loadMasters();
    this.createFormControls();
    this.createForm();
  }

  afterMasterDataLoads() {
    this.inventories = [];
    this.utilities.setStyles();

    if (this.inventoryType.value)
      this.loadInventory();
  }

  resetMasters() {
    this.inventoryTypes = []; this.drugs = []; this.labConsumables = [];
    this.inventories = [];
  }

  loadMasters() {
    this.apiService.getInventoryPageMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'inventory_type')
              this.inventoryTypes.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'drug')
              this.drugs.push({ name: masterRow.name, id: masterRow.id, unitName: "Units" });
            else if (masterRow.master_type == 'lab_consumable')
              this.labConsumables.push({ name: masterRow.name, id: masterRow.id, unitName: masterRow.lab_unit_name });
          });

          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.inventoryType = new FormControl('', Validators.required);
    this.inventory = new FormControl('', Validators.required);
    this.batchNo = new FormControl('', Validators.required);
    this.expiryDate = new FormControl();
    this.qty = new FormControl('', [Validators.required, Validators.min(0)]);
  }

  createForm() {
    this.inventoryForm = new FormGroup({
      inventoryType: this.inventoryType,
      inventory: this.inventory,
      batchNo: this.batchNo,
      expiryDate: this.expiryDate,
      qty: this.qty
    })
  }

  resetForm(inventoryTypeId) {
    this.inventoryForm.reset();
    this.inventoryType.setValue(inventoryTypeId);
    this.strCurItemUnits = '';
  }

  //User events handling
  inventoryTypeChanged() {
    if (this.inventoryType.value == 1) //drugs 
      this.inventories = this.drugs;
    else if (this.inventoryType.value == 2)//lab consumables
      this.inventories = this.labConsumables;

    this.loadInventory();
  }

  inventoryChanged() {
    this.strCurItemUnits = this.inventory.value ? " in " + this.inventory.value.unitName : "";
  }

  //save and load data
  addInventory() {
    if (this.batchNo.value.indexOf("'") > -1 || this.batchNo.value.indexOf('"') > -1) {
      swal({ title: "Error", text: "Batch number cannot contain quotes. Please check and try again.", type: 'error' });
      return;
    }

    var formattedExpiryDate = this.datePipe.transform(this.expiryDate.value, 'yyyy-MM-dd');

    //using thisSystemNodeId as the inventory node coz this is happening at this node..
    this.apiService.addInventory(this.utilities.getThisSystemNodeId(), this.inventory.value.id, this.inventoryType.value,
      this.batchNo.value, formattedExpiryDate, this.qty.value, this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.loadInventory();
        }
      });
  }

  loadInventory() {
    this.apiService.getInventory(this.utilities.getThisSystemNodeId(), this.inventoryType.value)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setInventoryData(data[0]);
        }
      });
  }

  setInventoryData(thisInvData) {
    if (!thisInvData) return;

    this.resetForm(this.inventoryType.value);
    this.currentInventory = [];
    thisInvData.forEach(thisInvDataItem => {
      var thisInv = this.inventories.find(val => val.id == thisInvDataItem['inv_id']);
      var thisInvName = '';
      if (thisInv)
        thisInvName = thisInv.name;

      var thisInventoryItem: Inventory = {
        invId: thisInvDataItem['inv_id'],
        invTypeId: thisInvDataItem['inv_type_id'],
        invName: thisInvName,
        batchNo: thisInvDataItem['batch_no'],
        isOpened: thisInvDataItem['is_opened'],
        expiryDate: thisInvDataItem['expiry_date'],
        currentQty: thisInvDataItem['qty']
      }
      this.currentInventory.push(thisInventoryItem);
    });

    this.dataSource = new MatTableDataSource(this.currentInventory);
  }
}

export interface Inventory {
  invId: number;
  invTypeId: number;
  invName: string;
  batchNo: string;
  isOpened: string;
  expiryDate: string;
  currentQty: number;
}
