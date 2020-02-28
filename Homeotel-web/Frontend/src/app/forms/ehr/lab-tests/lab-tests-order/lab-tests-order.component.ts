import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-lab-tests-order',
  templateUrl: './lab-tests-order.component.html',
  styleUrls: ['./lab-tests-order.component.css']
})
export class LabTestsOrderComponent implements OnInit {

  labTest;

  //masters
  labTests = []; unassignedLabTests = [];

  //for mat table
  displayedColumns: string[] = ['labTestName'];
  dataSource: MatTableDataSource<LabTestsOrdered>;
  labTestsOrdered: LabTestsOrdered[] = [];

  @Output() dataReady = new EventEmitter<any>();
  @Output() newTestsAdded = new EventEmitter<any>();

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.labTestsOrdered = [];
    this.loadMasters();
    this.createFormControls();
  }

  afterMasterDataLoads() {
    this.utilities.setStyles();

    this.loadLabTestsOrderedData();
  }

  resetMasters() {
    this.labTests = [];
    this.unassignedLabTests = [];
  }

  loadMasters() {
    this.apiService.getLabTestsOrderComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'lab_test')
              this.labTests.push({ name: masterRow.name, id: masterRow.id });
              this.unassignedLabTests.push({ name: masterRow.name, id: masterRow.id });
          });
          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.labTest = new FormControl();
  }

  //handling user inputs
  addToLabTestsOrdered() {
    var isDuplicateLabTest = false;

    this.labTest.value.forEach(newlyAddedLabTest => {
      if (newlyAddedLabTest) {
        this.labTestsOrdered.forEach(alreadyOrderedLabTest => {
          if (alreadyOrderedLabTest.labTestId == newlyAddedLabTest.id)
            isDuplicateLabTest = true;
        });

        if (!isDuplicateLabTest) { //add this to the mat data table
          var thisLabTestOrdered: LabTestsOrdered = {
            labTestId: newlyAddedLabTest.id,
            labTestName: newlyAddedLabTest.name
          }
          this.labTestsOrdered.push(thisLabTestOrdered);
        }
      }
    });

    this.labTest.setValue('');
    this.dataSource = new MatTableDataSource(this.labTestsOrdered);    
  }

  //save and load data
  saveLabTestsOrdered() {
    var strLabTestsOrdered = '';

    this.labTestsOrdered.forEach((labTest, index) => {
      strLabTestsOrdered += labTest.labTestId
      if (index != this.labTestsOrdered.length - 1)
        strLabTestsOrdered += ",";
    });

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveLabTestsOrdered(this.curBen.curEncId, this.utilities.getCurEncNodeId(), strLabTestsOrdered,
      this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.initialiseForm();
        }
      });
  }

  loadLabTestsOrderedData() {
    this.apiService.getLabTestsOrdered(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setLabTestsOrdered(data);
        }

        this.newTestsAdded.emit();
      });
  }

  setLabTestsOrdered(data) {
    data[0].forEach(labTestOrderedData => {
      var thisLabTestOrdered: LabTestsOrdered = {
        labTestId: labTestOrderedData['lab_test_id'],
        labTestName: labTestOrderedData['name']
      }
      this.labTestsOrdered.push(thisLabTestOrdered);

      this.unassignedLabTests = this.unassignedLabTests.filter(obj => obj.id !== labTestOrderedData['lab_test_id']);      
    });

    var strShortDescription = this.labTestsOrdered.length == 1 ? "1 Lab Test Ordered" : this.labTestsOrdered.length + " Lab Tests Ordered"
    this.dataReady.emit({ from: 'lab-tests-ordered', strShortDescription: strShortDescription });
    this.dataSource = new MatTableDataSource(this.labTestsOrdered);
  }

  allowLabTestsOrder() {
    //either if it's a local doctor and case is still open (as opposed to a tc case)
    //or it's a specialist doctor and case is tc (as opposed to closed)
    return (this.curStaff.isLocalDoctor() && this.curBen.isOpenCase())
      || (this.curStaff.isSpecialistDoctor() && this.curBen.isTeleConsultationCase())
  }
}

export interface LabTestsOrdered {
  labTestId: number;
  labTestName: string;
}