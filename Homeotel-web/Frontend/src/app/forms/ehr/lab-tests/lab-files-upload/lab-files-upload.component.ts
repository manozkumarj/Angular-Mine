import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { CurBenService } from '../../../../services/cur-ben.service';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-lab-files-upload',
  templateUrl: './lab-files-upload.component.html',
  styleUrls: ['./lab-files-upload.component.css']
})
export class LabFilesUploadComponent implements OnInit {

  labFiles = [];
  description;
  @ViewChild('inputFile') inputFile;

  @Output() dataReady = new EventEmitter<any>();
  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.inputFile.nativeElement.value = '';
    this.description = '';
    this.labFiles = [];
    this.loadLabFiles();
  }

  //handle user events
  openImage(imgData) {
    var w = window.open("", '_blank');
    w.document.write("<img src='" + imgData + "' />");
    w.document.close();
  }

  //uploads related
  removeFile(description) {
    this.apiService.deleteLabFile(this.curBen.curEncId, this.utilities.getCurEncNodeId(), description)
      .subscribe(data => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while removing the file", type: 'error' });
          console.log(data);
        }
        else {
          this.initialiseForm();
        }
      });
  }

  startUpload(event: FileList, description) {
    // The File object
    const eventFile = event.item(0)

    //Since mysql is throwing error max_packet_size, for now, let's limit the upload size to 1 mb and see how it goes
    //and allowing only images for now (restricted by accept attribute on file input)    
    var fileSizeInMB = eventFile.size / 1024 / 1024;
    if (fileSizeInMB > 1) {
      swal({ title: "Error", text: "File size should be less than 1 MB. Please check and try again.", type: 'error' });
      return;
    }

    if (description.indexOf("'") > -1 || description.indexOf('"') > -1) {
      swal({ title: "Error", text: "File description cannot contain quotes. Please check and try again.", type: 'error' });
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(eventFile); // read file as data url
    reader.onload = (event: any) => { // called once readAsDataURL is completed
      var fileTokens = event.target.result.split(',');
      var base64result = fileTokens[1];
      var fileType = fileTokens[0];
      this.uploadFile(description, base64result, fileType);
    }
  }

  uploadFile(description, fileDataBase64, fileType) {
    this.apiService.saveLabFile(this.curBen.curEncId, this.utilities.getCurEncNodeId(), description, fileDataBase64,
      fileType, this.curStaff.staffId)
      .subscribe(data => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the file", type: 'error' });
          console.log(data);
        }
        else {
          swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.initialiseForm();
        }
      })
  }

  loadLabFiles() {
    this.apiService.getLabFiles(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe(data => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the file", type: 'error' });
          console.log(data);
        }
        else {
          this.setLabFilesData(data[0]);
        }
      })
  }

  setLabFilesData(labFilesData) {
    if (!labFilesData) {
      this.dataReady.emit({ from: 'lab-files-upload', strShortDescription: null });
      return;
    }

    labFilesData.forEach(labFile => {
      this.labFiles.push({ data: labFile['file_type'] + "," + labFile['file_data'], description: labFile['description'] });
    });

    var s = this.labFiles.length == 1 ? '' : 's';
    var strShortDescription = this.labFiles.length + " lab file" + s + " uploaded";
    this.dataReady.emit({ from: 'lab-files-upload', strShortDescription: strShortDescription });
  }
}
