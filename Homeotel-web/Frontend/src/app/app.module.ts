import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { SigninComponent } from './forms/common/signin/signin.component';
import { RoutingModule } from './modules/routing.module';
import { MaterialModule } from './modules/material.module';
import { HeaderComponent } from './forms/common/header/header.component';
import { SidebarComponent } from './forms/common/sidebar/sidebar.component';
import { SidenavService } from './services/sidenav.service';

import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { WebcamModule } from 'ngx-webcam';

import { ApiService } from './services/api.service';
import { UtilitiesService } from './services/utilities.service';
import { PageNotFoundComponent } from './forms/common/page-not-found/page-not-found.component';
import { CurStaffService } from './services/cur-staff.service';
import { FileSizePipe } from './pipes/file-size.pipe';
import { DropZoneDirective } from './directives/drop-zone.directive';
import { RegistrationComponent } from './forms/ehr/registration/registration.component';
import { ComplaintsComponent } from './forms/ehr/complaints/complaints.component';
import { HistoryComponent } from './forms/ehr/history/history/history.component';
import { ImmunizationComponent } from './forms/ehr/immunization/immunization.component';
import { SearchComponent } from './forms/ehr/search/search.component';

import { ClinicalExaminationsComponent } from './forms/ehr/clinical-examinations/clinical-examinations/clinical-examinations.component';
import { VitalsComponent } from './forms/ehr/clinical-examinations/vitals/vitals.component';
import { BmiComponent } from './forms/ehr/clinical-examinations/bmi/bmi.component';
import { SystemicExaminationComponent } from './forms/ehr/clinical-examinations/systemic-examination/systemic-examination.component';
import { GeneralExaminationComponent } from './forms/ehr/clinical-examinations/general-examination/general-examination.component';

import { HabitsComponent } from './forms/ehr/history/habits/habits.component';
import { PersonalHistoryComponent } from './forms/ehr/personal-history/personal-history.component';
import { ClinicalHistoryComponent } from './forms/ehr/history/clinical-history/clinical-history.component';
import { FamilyHistoryComponent } from './forms/ehr/history/family-history/family-history.component';
import { CurrentMedicationComponent } from './forms/ehr/history/current-medication/current-medication.component';
import { ObstetricsAndMenstruationComponent } from './forms/ehr/history/obstetrics-and-menstruation/obstetrics-and-menstruation.component';
import { BenDetailsComponent } from './forms/ehr/ben-details/ben-details.component';
import { SettingsComponent } from './forms/staff/settings/settings.component';
import { CurBenService } from './services/cur-ben.service';
import { LabTestsComponent } from './forms/ehr/lab-tests/lab-tests/lab-tests.component';
import { BloodGroupComponent } from './forms/ehr/lab-tests/blood-group/blood-group.component';
import { LabTestsOrderComponent } from './forms/ehr/lab-tests/lab-tests-order/lab-tests-order.component';
import { LabTestResultsComponent } from './forms/ehr/lab-tests/lab-test-results/lab-test-results.component';
import { LabFilesUploadComponent } from './forms/ehr/lab-tests/lab-files-upload/lab-files-upload.component';
import { PrescriptionComponent } from './forms/ehr/prescription/prescription.component';
import { DrugIssueComponent } from './forms/ehr/drug-issue/drug-issue.component';
import { QueueComponent } from './forms/ehr/queue/queue.component';
import { DrugFilterPipe } from './pipes/drug-filter.pipe';
import { InventoryComponent } from './forms/ehr/inventory/inventory.component';
import { ConfigComponent } from './forms/global/config/config.component';
import { CaseSheetComponent } from './forms/ehr/case-sheet/case-sheet.component';
import { HomeComponent } from './forms/ehr/home/home.component';
import { DoctorNotesComponent } from './forms/ehr/doctor-notes/doctor-notes/doctor-notes.component';
import { NotesComponent } from './forms/ehr/doctor-notes/notes/notes.component';
import { AnalysisComponent } from './forms/ehr/analysis/analysis.component';
import { DoctorAnalysisComponent } from './forms/ehr/analysis/doctor-analysis/doctor-analysis.component';
import { CurrentConditionComponent } from './forms/ehr/history/current-condition/current-condition.component';
import { FoodComponent } from './forms/ehr/history/food/food.component';
import { DoctorRegistrationComponent } from './forms/ehr/doctor-registration/doctor-registration.component';
import { ComplaintHistoryComponent } from './forms/ehr/complaint-history/complaint-history.component';
import { TreatmentHistoryComponent } from './forms/ehr/treatment-history/treatment-history.component';
import { ProfileComponent } from './forms/doctor/profile/profile.component';
import { TreatmentVaccinationComponent } from './forms/ehr/history/treatment-vaccination/treatment-vaccination.component';
import { TreatmentMedicalComponent } from './forms/ehr/history/treatment-medical/treatment-medical.component';


export function HttpLoaderFactory(http: HttpClient) {
  var apiUrlIp = localStorage.getItem('api_url_ip');
  var apiUrlPort = localStorage.getItem('api_url_port');

  apiUrlIp = '175.101.1.227';
  apiUrlPort = '8123';

  if (apiUrlIp && apiUrlPort) {
    var apiUrl = "http://" + apiUrlIp + ":" + apiUrlPort + "/";
    var translationUrl = apiUrl + "translation/";

    return new TranslateHttpLoader(http, translationUrl, "");
  }
  else
    return new TranslateHttpLoader(http, "http://localhost:8080/translation/", "");

}

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    HeaderComponent,
    SidebarComponent,
    DoctorRegistrationComponent,
    PageNotFoundComponent,
    FileSizePipe,
    DropZoneDirective,
    RegistrationComponent,
    ComplaintsComponent,
    ImmunizationComponent,
    SearchComponent,

    ClinicalExaminationsComponent,
    VitalsComponent,
    BmiComponent,
    SystemicExaminationComponent,
    GeneralExaminationComponent,

    HistoryComponent,
    HabitsComponent,
    PersonalHistoryComponent,
    ClinicalHistoryComponent,
    FamilyHistoryComponent,
    CurrentMedicationComponent,
    ObstetricsAndMenstruationComponent,
    BenDetailsComponent,
    SettingsComponent,
    LabTestsComponent,
    BloodGroupComponent,
    LabTestsOrderComponent,
    LabTestResultsComponent,
    LabFilesUploadComponent,
    PrescriptionComponent,
    DrugIssueComponent,
    QueueComponent,
    DrugFilterPipe,
    InventoryComponent,
    ConfigComponent,
    FoodComponent,
    CaseSheetComponent,
    HomeComponent, DoctorNotesComponent, NotesComponent, AnalysisComponent, DoctorAnalysisComponent,

    HomeComponent, CurrentConditionComponent, ComplaintHistoryComponent, TreatmentHistoryComponent, ProfileComponent, TreatmentVaccinationComponent, TreatmentMedicalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RoutingModule,
    MaterialModule,
    SweetAlert2Module.forRoot(),
    FlexLayoutModule,
    AngularFontAwesomeModule,
    HttpClientModule,
    WebcamModule,
    LoadingBarHttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    SidenavService,
    AuthService,
    AuthGuard,
    ApiService,
    CurStaffService,
    CurBenService,
    UtilitiesService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
