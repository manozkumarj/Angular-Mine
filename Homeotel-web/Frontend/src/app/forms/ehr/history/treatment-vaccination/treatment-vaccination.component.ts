import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { ApiService } from '../../../../services/api.service';
import { CurBenService } from '../../../../services/cur-ben.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-treatment-vaccination',
  templateUrl: './treatment-vaccination.component.html',
  styleUrls: ['./treatment-vaccination.component.css']
})
export class TreatmentVaccinationComponent implements OnInit {
  vaccinationMishap;

  @Output() hasData = new EventEmitter<any>();
  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService) { }

  ngOnInit() {
    this.loadCurrentVaccination();

  }

  saveVaccination() {
    this.apiService.saveVaccination(this.curBen.curEncId, this.utilities.getCurEncNodeId(), this.vaccinationMishap, this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Data Saved Successfully", "Success");
          // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.loadCurrentVaccination();
        }
      });
  }




  loadCurrentVaccination() {
    this.apiService.getVaccination(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          console.log(data[0][0]["vaccination"]);
          console.log(data[0][0].vaccination);
          this.vaccinationMishap = data[0][0].vaccination;
          if (this.vaccinationMishap) {
            this.hasData.emit();
          }
        }
      });


  }
}
