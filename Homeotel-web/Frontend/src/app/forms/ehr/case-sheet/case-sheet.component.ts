import { Component, OnInit } from '@angular/core';
import { CurBenService } from '../../../services/cur-ben.service';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-case-sheet',
  templateUrl: './case-sheet.component.html',
  styleUrls: ['./case-sheet.component.css']
})
export class CaseSheetComponent implements OnInit {

  step = -1;
  encounters = [];

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService) { }

  ngOnInit() {
    this.loadEncountersData();
  }

  //handling user inputs
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  loadEncountersData() {
    this.apiService.getBenEncounters(this.curBen.benNodeId, this.curBen.benId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.encounters = data[0];

          this.loadCasesheetDetails();
        }
      });
  }

  loadCasesheetDetails() {
    this.encounters.forEach(encounter => {
      this.apiService.getEncounterDetails(encounter['enc_node_id'], encounter['enc_id'])
        .subscribe((data) => {
          if (this.utilities.isInvalidApiResponseData(data)) {
            swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
            console.log(data);
          }
          else {
            this.encounters.forEach(enc => {
              if (enc['enc_id'] == encounter['enc_id'] && enc['enc_node_id'] == encounter['enc_node_id']) {

                if (data[0].length > 0) { //data[0] == dbe_ce_bmi 
                  enc['height'] = data[0][0]['height'];
                  enc['weight'] = data[0][0]['weight'];
                  enc['bmi'] = data[0][0]['bmi'];
                  enc['waist'] = data[0][0]['waist'];
                }

                if (data[1].length > 0) { //data[1] = dbe_ce_vitals
                  enc['temperature'] = data[1][0]['temperature'];
                  enc['pulse_rate'] = data[1][0]['pulse_rate'];
                  enc['resp_rate'] = data[1][0]['resp_rate'];
                  enc['bp_systolic'] = data[1][0]['bp_systolic'];
                  enc['bp_diastolic'] = data[1][0]['bp_diastolic'];
                }

                if (data[2].length > 0) { //data[2] = complaints 
                  enc['complaints'] = [];
                  data[2].forEach(complaint => {
                    var thisComplaint = complaint['other_complaint'] ? complaint['other_complaint'] : complaint['complaint_name'];
                    thisComplaint += ", ";
                    thisComplaint += complaint['severity'] + ", "
                    thisComplaint += complaint['duration'] + " " + complaint['duration_unit_name'];
                    enc['complaints'].push(thisComplaint);
                  });
                }

                if (data[3].length > 0) { //data[3] = diagnosis 
                  enc['diagnosis'] = '';
                  var index = 1;
                  data[3].forEach(diagnosis => {
                    enc['diagnosis'] += diagnosis['other_diagnosis'] ? diagnosis['other_diagnosis'] : diagnosis['diagnosis_name'];
                    if (index != data[3].length)
                      enc['diagnosis'] += ", ";
                    index++;
                  });
                }

                enc['drugs'] = data[4]  //data[4] = drugs         

                enc['lab_results'] = data[5] //data[5] = lab results
                if (data[5].length > 0) { ////data[5] = lab results
                  enc['lab_results'] = [];
                  data[5].forEach(labResult => {
                    if (labResult['result']) {
                      var thisLabTestName = labResult['lab_test_param_name'] == labResult['lab_test_name']
                        ? labResult['lab_test_name']
                        : labResult['lab_test_param_name'] + " (" + labResult['lab_test_name'] + ")";
                      var thisLabResult = labResult['result'] + " ";
                      thisLabResult += labResult['result_unit'] ? labResult['result_unit'] : labResult['default_unit'];

                      enc['lab_results'].push({
                        lab_test_name: thisLabTestName,
                        lab_result: thisLabResult
                      });
                    }
                  });
                }


                enc['se'] = data[6][0]  //data[6] = systemic examinations 
                enc['ge'] = data[7][0]  //data[7] = general examinations 
                encounter['fh'] = data[8]; //data[8] = family history
                encounter['habits'] = data[9][0]; //data[8] = family history
                encounter['medical_history'] = data[10]; //data[10] = medical history
                encounter['surgical_history'] = data[11]; //data[11] = surgical history
                encounter['current_medication'] = data[12]; //data[12] = current medication
                encounter['ph'] = data[13][0]; //data[13] = personal history
                encounter['allergies'] = data[14]; //data[14] = allergies
                encounter['obs'] = data[15][0]; //data[15] = obstetrics


              }
            });
          }
        });
    });
  }
}