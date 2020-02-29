import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';

@Component({
  selector: 'app-blood-group',
  templateUrl: './blood-group.component.html',
  styleUrls: ['./blood-group.component.css']
})
export class BloodGroupComponent implements OnInit {

  bloodGroup;

  //masters
  bloodGroups = [];

  @Output() dataReady = new EventEmitter<any>();

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.loadMasters();
    this.createFormControls();
  }

  afterMasterDataLoads() {
    this.utilities.setStyles();

    this.loadBloodGroupData();
  }

  resetMasters() {
    this.bloodGroups = [];
  }

  loadMasters() {
    this.apiService.getLabBloodGroupComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'blood_group')
              this.bloodGroups.push({ name: masterRow.name, id: masterRow.id });
          });
          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.bloodGroup = new FormControl();
  }

  //handle user events 
  bloodGroupChanged() {
    this.saveBloodGroup();
  }

  //save and load data
  saveBloodGroup() {

    var curEncId = this.curBen.curEncId;
    var encNodeId = this.utilities.getCurEncNodeId();

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveLabBloodGroup(this.curBen.benId, this.curBen.benNodeId, this.bloodGroup.value.id, this.curStaff.staffId)
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

  loadBloodGroupData() {
    this.apiService.getLabBloodGroup(this.curBen.benId, this.curBen.benNodeId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setBloodGroupData(data[0][0]);
        }
      });
  }

  setBloodGroupData(bloodGroupData) {
    if (!bloodGroupData)
      return;

    var bloodGroupWithName = this.bloodGroups.find(val => val.id == bloodGroupData['blood_group_id']);
    this.bloodGroup.setValue(bloodGroupWithName);
    if (bloodGroupWithName)
      this.dataReady.emit({ from: 'blood-group', strShortDescription: bloodGroupWithName.name });
  }
}
