import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from '../forms/common/signin/signin.component';
import { PageNotFoundComponent } from '../forms/common/page-not-found/page-not-found.component';

import { AuthGuard } from '../services/auth-guard.service';
import { ComplaintsComponent } from '../forms/ehr/complaints/complaints.component';
import { HistoryComponent } from '../forms/ehr/history/history/history.component';
import { ImmunizationComponent } from '../forms/ehr/immunization/immunization.component';
import { SearchComponent } from '../forms/ehr/search/search.component';
import { ClinicalExaminationsComponent } from '../forms/ehr/clinical-examinations/clinical-examinations/clinical-examinations.component';
import { SettingsComponent } from '../forms/staff/settings/settings.component';
import { LabTestsComponent } from '../forms/ehr/lab-tests/lab-tests/lab-tests.component';
import { PrescriptionComponent } from '../forms/ehr/prescription/prescription.component';
import { DrugIssueComponent } from '../forms/ehr/drug-issue/drug-issue.component';
import { QueueComponent } from '../forms/ehr/queue/queue.component';
import { InventoryComponent } from '../forms/ehr/inventory/inventory.component';
import { ConfigComponent } from '../forms/global/config/config.component';
import { CaseSheetComponent } from '../forms/ehr/case-sheet/case-sheet.component';
import { HomeComponent } from '../forms/ehr/home/home.component';
import { DoctorNotesComponent } from '../forms/ehr/doctor-notes/doctor-notes/doctor-notes.component';
import { AnalysisComponent } from '../forms/ehr/analysis/analysis.component';
import { DoctorAnalysisComponent } from '../forms/ehr/analysis/doctor-analysis/doctor-analysis.component';
import { DoctorRegistrationComponent } from '../forms/ehr/doctor-registration/doctor-registration.component';
import { RegistrationComponent } from '../forms/ehr/registration/registration.component';
import { ComplaintHistoryComponent } from '../forms/ehr/complaint-history/complaint-history.component';
import { TreatmentHistoryComponent } from '../forms/ehr/treatment-history/treatment-history.component';
import { PersonalHistoryComponent } from '../forms/ehr/personal-history/personal-history.component';
import { ProfileComponent } from '../forms/doctor/profile/profile.component';





const appRoutes: Routes = [
    { path: 'config', component: ConfigComponent },
    { path: 'home', component: HomeComponent }, // , canActivate: [AuthGuard] },
    { path: 'queue', component: QueueComponent, canActivate: [AuthGuard] },
    { path: 'registration', component: RegistrationComponent, canActivate: [AuthGuard] },
    { path: 'casesheet', component: CaseSheetComponent, canActivate: [AuthGuard] },
    { path: 'casesheet/:endId', component: CaseSheetComponent, canActivate: [AuthGuard] },
    { path: 'search-results', component: SearchComponent, canActivate: [AuthGuard] },
    { path: 'complaints', component: ComplaintsComponent, canActivate: [AuthGuard] },
    { path: 'complaints-history', component: ComplaintHistoryComponent, canActivate: [AuthGuard] },
    { path: 'treatment-history', component: TreatmentHistoryComponent, canActivate: [AuthGuard] },
    { path: 'personal-history', component: PersonalHistoryComponent, canActivate: [AuthGuard] },
    { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
    { path: 'clinical-examinations', component: ClinicalExaminationsComponent, canActivate: [AuthGuard] },
    { path: 'immunization', component: ImmunizationComponent, canActivate: [AuthGuard] },
    { path: 'lab-tests', component: LabTestsComponent, canActivate: [AuthGuard] },
    { path: 'prescription', component: PrescriptionComponent, canActivate: [AuthGuard] },
    { path: 'doctoranalysis', component: DoctorAnalysisComponent, canActivate: [AuthGuard] },
    { path: 'doctornotes', component: DoctorNotesComponent, canActivate: [AuthGuard] },
    { path: 'drug-issue', component: DrugIssueComponent, canActivate: [AuthGuard] },
    { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard] },

    { path: 'doctor-profile', component: ProfileComponent, canActivate: [AuthGuard] },

    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
    { path: 'homeo', component: SigninComponent },
    { path: 'page-not-found', component: PageNotFoundComponent },
    { path: '**', redirectTo: '/page-not-found' }
    /* { path: '**', redirectTo: '/page-not-found' }    */
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { useHash: true })
    ],
    exports: [RouterModule]
})
export class RoutingModule { }
