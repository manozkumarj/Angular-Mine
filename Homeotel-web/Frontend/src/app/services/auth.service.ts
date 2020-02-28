import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { ApiService } from './api.service';
import { UtilitiesService } from './utilities.service';
import { CurStaffService } from './cur-staff.service';
import swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

@Injectable()
export class AuthService {

  isLoggedIn = false;

  constructor(private router: Router, private _ngZone: NgZone,
    private apiService: ApiService, private utils: UtilitiesService, private curStaff: CurStaffService,
    public utilities: UtilitiesService, private datePipe: DatePipe) {    
  }

  login(username, password) {
    this.apiService.getStaffDetails(username, password).subscribe((data) => {
console.log(data);

      if (typeof data != 'undefined' && typeof data[0] != 'undefined' && typeof data[0][0] != 'undefined') {
        if (data[0][0].hasOwnProperty('error')) {
          this.isLoggedIn = false;
          swal({ title: "Error", text: data[0][0]['error'], type: 'error' });
        }
        else {
          var userData = data[0][0];
          this.isLoggedIn = true;
          this.curStaff.setUserData(userData['staff_id'], userData['role_id'], userData['role_name'], userData['spl_id'], userData['name'], userData['surname'])

          if (userData['role_id'] == 1)
            this.router.navigate(['/inventory']);
          else
            this.router.navigate(['/queue']);
        }
      }
      else {
        this.isLoggedIn = false;
        swal({ title: "Error", text: 'Invalid username or password entered. Please check and try again.', type: 'error' });
      }

    })

  }

  isAuthenticated() {
    return this.isLoggedIn;
  }

  logout() {
    this.isLoggedIn = false;
    this.router.navigate(['/signin']);
  }
}