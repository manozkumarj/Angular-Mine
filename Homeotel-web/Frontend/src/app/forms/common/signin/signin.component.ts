import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit, AfterViewInit {

  username: string;
  password: string;

  @ViewChild("usernameElement") usernameElement: ElementRef;

  constructor(public authService: AuthService, public apiService: ApiService, public curStaff: CurStaffService,
    public router: Router, public route: ActivatedRoute, public utilities: UtilitiesService) { }

  ngOnInit() {
    this.redirectToConfigIfNotSet();
    this.utilities.setStyles();
  }

  ngAfterViewInit() {
    this.usernameElement.nativeElement.focus();
  }

  redirectToConfigIfNotSet() {
    var apiUrlIp = localStorage.getItem('api_url_ip');
    var apiUrlPort = localStorage.getItem('api_url_port');

    // apiUrlIp = '175.101.1.227';
    // apiUrlPort = '8123';

    if (!apiUrlIp || !apiUrlPort)
      this.router.navigate(['/config']);
    else {
      this.apiService.apiUrl = "http://" + apiUrlIp + ":" + apiUrlPort + "/";
      this.apiService.getNodeDetails()
        .subscribe(data => {
          if (data.hasOwnProperty('error'))
            alert(data['error']);
          else if (data.hasOwnProperty('node_id')) {
            this.utilities.thisSystemNodeId = data['node_id'];
            if (data['responseStatus'] === "false")
              localStorage.setItem("license", "false");
            else if (data['responseStatus'] === "true")
              localStorage.setItem("license", "true");
          }
          else
            this.utilities.thisSystemNodeId = 0;
        })
    }
  }

  hasValidLicense() {
    var license = localStorage.getItem("license");
    if (license === "false")
      return false;
    else return true;
  }

  login() {
    if (this.username == 'config' && this.password == 'config')
      this.router.navigate(['/config']);
    else if (!this.utilities.thisSystemNodeId)
      alert('Invalid API URL. Please check and try again.');
    else if (!this.hasValidLicense())
      alert("Something went very wrong while signin. Please contact admin.")
    else
      this.authService.login(this.username, this.password);
  }
}
