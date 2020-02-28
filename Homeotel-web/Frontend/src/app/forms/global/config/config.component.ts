import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from '../../../services/utilities.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import swal from 'sweetalert2';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {

  configForm; 
  
  apiUrlIp; apiUrlPort;  

  constructor(public utilities: UtilitiesService, public router: Router) { }

  ngOnInit() {
    this.utilities.setStyles();
    this.initialiseForm();
  }

  initialiseForm() {
    this.createFormControls();
    this.createForm();

    this.loadConfigData();
  }

  createFormControls() {        
    this.apiUrlIp = new FormControl('', Validators.required);
    this.apiUrlPort = new FormControl('', Validators.required);    
  }

  createForm() {
    this.configForm = new FormGroup({                
      apiUrlIp: this.apiUrlIp,
      apiUrlPort: this.apiUrlPort      
    })
  }

  loadConfigData() {                           
    this.apiUrlIp.setValue(localStorage.getItem('api_url_ip'));          
    this.apiUrlPort.setValue(localStorage.getItem('api_url_port'));              
  }

  saveConfig() {        

    localStorage.setItem('api_url_ip', this.apiUrlIp.value);
    localStorage.setItem('api_url_port', this.apiUrlPort.value);        
  }

}
