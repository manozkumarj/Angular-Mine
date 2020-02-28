import { Component, OnInit } from '@angular/core';
import { CurBenService } from '../../../services/cur-ben.service';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  todayTotalVisits = 0;
  todayOpenVisits = 0;
  todayClosedVisits = 0;
  todayNewVisits = 0;
  todayRepeatVisits = 0;
  pendingUploadCount = 0;

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService) { }

  ngOnInit() {
    this.loadHomeData();
  }


  loadHomeData() {
    this.apiService.getHomeData()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.todayTotalVisits = data[0][0]['today_total_visits'];
          this.todayNewVisits = data[1][0]['today_new_visits'];
          this.todayRepeatVisits = this.todayTotalVisits - this.todayNewVisits;

          this.todayOpenVisits = data[2][0]['today_open_visits'];
          this.todayClosedVisits = data[3][0]['today_closed_visits'];
          
          this.pendingUploadCount = data[4][0]['pending_upload_count'];          
        }
      });
  }
}