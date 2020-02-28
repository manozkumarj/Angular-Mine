import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from '../../../services/utilities.service';
import { CurStaffService } from '../../../services/cur-staff.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private utilities: UtilitiesService, public curStaff: CurStaffService) { 
    this.utilities.docMode = true;
  }

  ngOnInit() {
  }

}


