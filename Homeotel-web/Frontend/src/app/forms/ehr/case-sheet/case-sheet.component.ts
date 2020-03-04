import { Component, OnInit } from '@angular/core';
import { CurBenService } from '../../../services/cur-ben.service';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import swal from 'sweetalert2';
import { SidenavService } from '../../../services/sidenav.service';
import { CaseSheetService } from '../../../services/case-sheet.service';
import { type } from 'os';
import { Params, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-case-sheet',
  templateUrl: './case-sheet.component.html',
  styleUrls: ['./case-sheet.component.css']
})
export class CaseSheetComponent implements OnInit {

  step = -1;
  encounters = [];
  valueDate = "2020-03-03 10:18:21"

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public caseSheetService: CaseSheetService, private activateRoute: ActivatedRoute) { }

  ngOnInit() {
    this.loadEncountersData();
    this.activateRoute.params
      .subscribe(
        (params: Params) => {
          var test = params['endId'];

          console.log("test", test);
        });

  }



  loadEncountersData() {
    this.apiService.getBenEncounters(this.curBen.benNodeId, this.curBen.benId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          // this.encounters = data[0];
          this.loadEncounters(data[0])

          this.loadCasesheetDetails();
        }
      });
  }
  // `/casesheet/${}`
  loadEncounters(data) {
    data.forEach(data => {
      this.encounters.push({ encId: data.enc_id, encNodeId: data.enc_node_id, encAt: data.enc_at, routerLink: `/casesheet/${data.enc_id}` })
    })
    console.log(this.encounters);
    this.caseSheetService.benEncounters = this.encounters;


  }

  loadCasesheetDetails() {

    this.apiService.getEncounterDetails(this.curBen.curEncNodeId, this.curBen.curEncId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          console.log(data);
          this.caseSheetService.encounterComplaintsData = [];
          this.caseSheetService.encounterComplaintHistoryData = [];

          this.caseSheetService.encounterTreatmentHistoryData = [];
          this.caseSheetService.encounterFamilyData = [];
          this.caseSheetService.encounterSurgicalData = [];
          this.caseSheetService.encounterCurrentMedicationData = [];
          this.caseSheetService.encounterVitalsData = [];
          this.caseSheetService.encounterMeasurementsData = [];
          this.caseSheetService.encounterSystemicData = [];
          this.caseSheetService.encounterGeneralData = [];




          this.caseSheetService.encounterMeasurementsData = data[0];
          this.caseSheetService.encounterVitalsData = data[1];
          this.caseSheetService.encounterSystemicData = data[2];
          this.caseSheetService.encounterGeneralData = data[3];


          data[4].forEach(data => {
            this.caseSheetService.encounterComplaintsData.push(data);
          });


          data[5].forEach(data => {
            this.caseSheetService.encounterComplaintHistoryData.push(data);

          });



          data[6].forEach(data => {
            this.caseSheetService.encounterTreatmentHistoryData.push(data);
          })


          this.caseSheetService.encounterVaccinationData = data[7];

          data[8].forEach(data => {
            this.caseSheetService.encounterSurgicalData.push(data);
          })


          data[9].forEach(data => {
            this.caseSheetService.encounterFamilyData.push(data);
          });


          data[10].forEach(data => {
            this.caseSheetService.encounterCurrentMedicationData.push(data);
          });


        }
      });

  }
}