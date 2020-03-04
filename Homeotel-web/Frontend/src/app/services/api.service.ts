import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurStaffService } from './cur-staff.service';
import { CurBenService } from './cur-ben.service';
import { UtilitiesService } from './utilities.service';

@Injectable()
export class ApiService {
  apiUrl;
  constructor(private http: HttpClient, private curStaff: CurStaffService, private curBen: CurBenService,
    private utilities: UtilitiesService) {
  }

  //get node id from APi
  getNodeDetails() {
    var path = "node_details";
    return this.http.get(this.apiUrl + path);
  }

  //staff related
  getStaffDetails(username, password) {
    var path = "staff/login";
    var body = {
      thisNodeId: this.utilities.thisSystemNodeId,
      username: username,
      password: password
    }
    return this.http.post(this.apiUrl + path, body);
  }

  //home page
  getHomeData() {
    var thisNodeId = this.utilities.thisSystemNodeId;
    var path = "home/" + thisNodeId;
    return this.http.get(this.apiUrl + path);
  }

  //beneficiary related
  registerBeneficiary(photoBase64, firstName, lastName, dob, age, ageUnitId, genderId, fatherName, husbandName, maritalStatusId,
    socialStatusId, economicStatusId, idProofTypeId, idProofValue, literacyTypeId, isPiramalStaff, phone, villageId,
    mandalId, districtId, otherLocation, benCategoryTypeId, occupationId, religionId, nationalityId, email,
    addrFirstLine, addrSecondLine, city, state, country, pincode) {
    var path = "ben/register";
    var body = {
      thisNodeId: this.utilities.getThisSystemNodeId(),
      photoBase64: photoBase64,
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      age: age,
      ageUnitId: ageUnitId,
      genderId: genderId,
      fatherName: fatherName,
      husbandName: husbandName,
      maritalStatusId: maritalStatusId,
      socialStatusId: socialStatusId,
      economicStatusId: economicStatusId,
      idProofTypeId: idProofTypeId,
      idProofValue: idProofValue,
      literacyTypeId: literacyTypeId,
      isPiramalStaff: isPiramalStaff,
      phone: phone,
      villageId: villageId,
      mandalId: mandalId,
      districtId: districtId,
      otherLocation: otherLocation,
      benCategoryTypeId: benCategoryTypeId,
      encTypeId: this.utilities.getThisSystemEncounterTypeId(),
      createdBy: this.curStaff.staffId,
      occupationId: occupationId,
      religionId: religionId,
      nationalityId: nationalityId,
      email: email,
      addrFirstLine: addrFirstLine,
      addrSecondLine: addrSecondLine,
      city: city,
      state: state,
      country: country,
      pincode: pincode
    }

    return this.http.post(this.apiUrl + path, body);
  }

  revisitBeneficiary(isFreshPhotoCaptured, photoBase64, benCategoryTypeId) {
    var path = "ben/revisit";
    var body = {
      photoBase64: isFreshPhotoCaptured ? photoBase64 : null,
      benCategoryTypeId: benCategoryTypeId,
      benId: this.curBen.benId,
      benNodeId: this.curBen.benNodeId,
      thisNodeId: this.utilities.getThisSystemNodeId(),
      encTypeId: this.utilities.getThisSystemEncounterTypeId(),
      createdBy: this.curStaff.staffId
    }
    return this.http.post(this.apiUrl + path, body);
  }

  updateBeneficiaryDetails(photoBase64, firstName, lastName, dob, age, ageUnitId, fatherName, husbandName, maritalStatusId,
    socialStatusId, economicStatusId, idProofTypeId, idProofValue, literacyTypeId, isPiramalStaff, phone, villageId,
    mandalId, districtId, otherLocation, occupationId, religionId, nationalityId, email) {
    var path = "ben/update";
    var body = {
      benId: this.curBen.benId,
      benNodeId: this.curBen.benNodeId,
      photoBase64: photoBase64,
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      age: age,
      ageUnitId: ageUnitId,
      fatherName: fatherName,
      husbandName: husbandName,
      maritalStatusId: maritalStatusId,
      socialStatusId: socialStatusId,
      economicStatusId: economicStatusId,
      idProofTypeId: idProofTypeId,
      idProofValue: idProofValue,
      literacyTypeId: literacyTypeId,
      isPiramalStaff: isPiramalStaff,
      phone: phone,
      villageId: villageId,
      mandalId: mandalId,
      districtId: districtId,
      otherLocation: otherLocation,
      updatedBy: this.curStaff.staffId,
      occupationId: occupationId,
      religionId: religionId,
      nationalityId: nationalityId,
      email: email
    }

    return this.http.post(this.apiUrl + path, body);
  }

  getBeneficiaryDetails(benNodeId, benId) {
    var thisNodeId = this.utilities.getThisSystemNodeId()
    if (thisNodeId == 3) //send node id as 0 if this is specialist end at HO
      thisNodeId = 0;
    var path = "ben/details/" + benNodeId + "/" + benId + "/" + thisNodeId;
    return this.http.get(this.apiUrl + path);
  }

  getBenEncounters(benNodeId, benId) {
    var path = "ben/encounters/" + benNodeId + "/" + benId;
    return this.http.get(this.apiUrl + path);
  }

  getEncounterDetails(encNodeId, encId) {
    var path = "ben/encounter/details/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  getBeneficiaryPhoto(benNodeId, benId) {
    var path = "ben/photo/" + benNodeId + "/" + benId;
    return this.http.get(this.apiUrl + path);
  }

  searchBeneficiaries(searchText, searchType) {
    var path = "ben/search/" + searchText + "/" + searchType;
    return this.http.get(this.apiUrl + path);
  }

  getBeneficiaryQueue(nodeId, roleId, splId = 0) {
    var path = "ben/queue/" + nodeId + "/" + roleId + "/" + splId;
    return this.http.get(this.apiUrl + path);
  }

  mergeBeneficiaries(firstBenId, firstBenNodeId, secondBenId, secondBenNodeId, updatedBy) {
    var path = "ben/merge";
    var body = {
      firstBenId: firstBenId,
      firstBenNodeId: firstBenNodeId,
      secondBenId: secondBenId,
      secondBenNodeId,
      updatedBy: updatedBy
    }

    return this.http.post(this.apiUrl + path, body);
  }

  //complaints
  saveComplaints(encId, encNodeId, commaSeparatedComplaintsToInsert) {
    var path = "enc/complaint";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedComplaintsToInsert: commaSeparatedComplaintsToInsert
    }
    return this.http.post(this.apiUrl + path, body);
  }

  getComplaints(encId, encNodeId) {
    var path = "enc/complaint/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }


  //complaints history
  saveComplaintsHistory(encId, encNodeId, commaSeparatedComplaintsHistoryToInsert) {
    var path = "enc/complaint-history";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedComplaintsHistoryToInsert: commaSeparatedComplaintsHistoryToInsert
    }
    return this.http.post(this.apiUrl + path, body);
  }

  getComplaintsHistory(encId, encNodeId) {
    var path = "enc/complaint-history/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //history -> habits
  saveHistoryHabits(encId, encNodeId, smokingId, smokingDuration, smokingFreq, alcoholId, alcoholDuration,
    alcoholFreq, exerciseId, exerciseDuration, exerciseFreq, createdBy) {
    var path = "enc/history/habit";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      smokingId: smokingId,
      smokingDuration: smokingDuration,
      smokingFreq: smokingFreq,
      alcoholId: alcoholId,
      alcoholDuration: alcoholDuration,
      alcoholFreq: alcoholFreq,
      exerciseId: exerciseId,
      exerciseDuration: exerciseDuration,
      exerciseFreq: exerciseFreq,
      createdBy: createdBy
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getHistoryHabits(encId, encNodeId) {
    var path = "enc/history/habit/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //history -> personal history
  savePersonalHistory(encId, encNodeId, commaSeparatedAllergiesToInsert, appetiteId, bowelMovementId,
    defecationId, handWashingId, occupationId, drinkingWaterId, mosquitoExposureId, createdBy) {
    var path = "enc/history/ph";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedAllergiesToInsert: commaSeparatedAllergiesToInsert,
      appetiteId: appetiteId,
      bowelMovementId: bowelMovementId,
      defecationId: defecationId,
      handWashingId: handWashingId,
      occupationId: occupationId,
      drinkingWaterId: drinkingWaterId,
      mosquitoExposureId: mosquitoExposureId,
      createdBy: createdBy
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getPersonalHistory(encId, encNodeId) {
    var path = "enc/history/ph/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //history -> clinical history
  saveClinicalHistory(encId, encNodeId, commaSeparatedMedicalsToInsert, commaSeparatedSurgicalsToInsert, createdBy) {
    var path = "enc/history/ch";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedMedicalsToInsert: commaSeparatedMedicalsToInsert,
      commaSeparatedSurgicalsToInsert: commaSeparatedSurgicalsToInsert,
      createdBy: createdBy
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getClinicalHistory(encId, encNodeId) {
    var path = "enc/history/ch/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //history -> clinical history
  saveFamilyHistory(encId, encNodeId, commaSeparatedFamilyMedicalsToInsert) {
    var path = "enc/history/fh";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedFamilyMedicalsToInsert: commaSeparatedFamilyMedicalsToInsert
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getFamilyHistory(encId, encNodeId) {
    var path = "enc/history/fh/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //history -> current medication
  saveCurrentMedication(encId, encNodeId, commaSeparatedCurrentMedicationToInsert) {
    var path = "enc/history/current-medication";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedCurrentMedicationToInsert: commaSeparatedCurrentMedicationToInsert
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getCurrentMedication(encId, encNodeId) {
    var path = "enc/history/current-medication/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }


  //history -> obstetrics related
  saveObstetrics(encId, encNodeId, menstrualId, periodId, bleedingId, painId, dischargeId, createdBy) {
    var path = "enc/history/obstetrics";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      menstrualId: menstrualId,
      periodId: periodId,
      bleedingId: bleedingId,
      painId: painId,
      dischargeId: dischargeId,
      createdBy: createdBy
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getObstetrics(encId, encNodeId) {
    var path = "enc/history/obstetrics/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //Immunization related
  saveImmunization(encId, encNodeId, benId, benNodeId, deliveryTypeId, birthWeightId, createdBy,
    commaSeparatedPolioToInsert, commaSeparatedBcgToInsert, commaSeparatedDptToInsert,
    commaSeparatedMeaslesToInsert, commaSeparatedHepatitisBToInsert, commaSeparatedVitaminAToInsert) {

    var path = "enc/imm";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      benId: benId,
      benNodeId: benNodeId,
      deliveryTypeId: deliveryTypeId,
      birthWeightId: birthWeightId,
      createdBy: createdBy,
      commaSeparatedPolioToInsert: commaSeparatedPolioToInsert,
      commaSeparatedBcgToInsert: commaSeparatedBcgToInsert,
      commaSeparatedDptToInsert: commaSeparatedDptToInsert,
      commaSeparatedMeaslesToInsert: commaSeparatedMeaslesToInsert,
      commaSeparatedHepatitisBToInsert: commaSeparatedHepatitisBToInsert,
      commaSeparatedVitaminAToInsert: commaSeparatedVitaminAToInsert
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getImmunization(benId, benNodeId) {
    var path = "enc/imm/" + benNodeId + "/" + benId;
    return this.http.get(this.apiUrl + path);
  }

  //clinical examination -> bmi related
  saveBmi(encId, encNodeId, height, weight, bmi, waist, createdBy) {
    var path = "enc/ce/bmi";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      height: height,
      weight: weight,
      bmi: bmi,
      waist: waist,
      createdBy: createdBy
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getBmi(encId, encNodeId) {
    var path = "enc/ce/bmi/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //clinical examination -> vitals related
  saveVitals(encId, encNodeId, temperature, pulseRate, respRate, bpSystolic, bpDiastolic, createdBy) {
    var path = "enc/ce/vitals";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      temperature: temperature,
      pulseRate: pulseRate,
      respRate: respRate,
      bpSystolic: bpSystolic,
      bpDiastolic: bpDiastolic,
      createdBy: createdBy
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getVitals(encId, encNodeId) {
    var path = "enc/ce/vitals/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //clinical examination -> systemic examination related
  saveSystemicExaminations(encId, encNodeId, respSys, cardioSys, gastroSys, nervousSys, genitoSys, musculoSys, otherFindings, createdBy) {
    var path = "enc/ce/se";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      respSys: respSys,
      cardioSys: cardioSys,
      gastroSys: gastroSys,
      nervousSys: nervousSys,
      genitoSys: genitoSys,
      musculoSys: musculoSys,
      otherFindings: otherFindings,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getSystemicExaminations(encId, encNodeId) {
    var path = "enc/ce/se/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //clinical examination -> general examination related
  saveGeneralExaminations(encId, encNodeId, hasPallor, hasJaundice, hasCyanosis, hasClubbing, hasGingivitis, hasLympha,
    lymphaRemarks, hasEdema, edemaRemarks, createdBy) {
    var path = "enc/ce/ge";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      hasPallor: hasPallor,
      hasJaundice: hasJaundice,
      hasCyanosis: hasCyanosis,
      hasClubbing: hasClubbing,
      hasGingivitis: hasGingivitis,
      hasLympha: hasLympha,
      lymphaRemarks: lymphaRemarks,
      hasEdema: hasEdema,
      edemaRemarks: edemaRemarks,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getGeneralExaminations(encId, encNodeId) {
    var path = "enc/ce/ge/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //lab -> blood group related
  saveLabBloodGroup(benId, benNodeId, bloodGroupId, createdBy) {
    var path = "enc/lab/blood-group";
    var body = {
      benId: benId,
      benNodeId: benNodeId,
      bloodGroupId: bloodGroupId,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getLabBloodGroup(benId, benNodeId) {
    var path = "enc/lab/blood-group/" + benNodeId + "/" + benId;
    return this.http.get(this.apiUrl + path);
  }

  //lab -> tests ordered related
  saveLabTestsOrdered(encId, encNodeId, commaSeparatedLabTestsOrderedToInsert, createdBy) {
    var path = "enc/lab/lab-tests-ordered";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedLabTestsOrderedToInsert: commaSeparatedLabTestsOrderedToInsert,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getLabTestsOrdered(encId, encNodeId) {
    var path = "enc/lab/lab-tests-ordered/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //lab -> tests results related
  saveLabTestResult(encId, encNodeId, labInstituteId, labTestId, labTestParamId, result, unitId, updatedBy) {
    var path = "enc/lab/lab-test-results/result";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      labInstituteId: labInstituteId,
      labTestId: labTestId,
      labTestParamId: labTestParamId,
      result: result,
      unitId: unitId,
      updatedBy: updatedBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  saveLabInstitution(encId, encNodeId, institutionId, otherLabInstitution, updatedBy) {
    var path = "enc/lab/lab-test-results/institution";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      institutionId: institutionId,
      otherLabInstitution: otherLabInstitution,
      updatedBy: updatedBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getLabTestResults(encId, encNodeId) {
    var path = "enc/lab/lab-test-results/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //lab -> upload files 
  saveLabFile(encId, encNodeId, description, fileDataBase64, fileType, createdBy) {
    var path = "enc/lab/lab-file";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      description: description,
      fileDataBase64: fileDataBase64,
      fileType: fileType,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }


  getLabFiles(encId, encNodeId) {
    var path = "enc/lab/lab-file/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  deleteLabFile(encId, encNodeId, description) {
    var path = "enc/lab/lab-file";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      description: description
    };

    return this.http.request('delete', this.apiUrl + path, { body: body })
  }

  //prescription related
  savePrescFile(encId, encNodeId, fileDataBase64, fileType, createdBy) {
    var path = "enc/presc/presc-file";
    var body = {
      encId: encId,
      encNodeId: encNodeId,

      fileDataBase64: fileDataBase64,
      fileType: fileType,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getPrescFiles(encId, encNodeId) {
    var path = "enc/presc/presc-file/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  deletePrescFile(encId, encNodeId) {
    var path = "enc/presc/presc-file";
    var body = {
      encId: encId,
      encNodeId: encNodeId,

    };

    return this.http.request('delete', this.apiUrl + path, { body: body })
  }

  savePrescription(encId, encNodeId, commaSeparatedDrugsToInsert, commaSeparatedDiagnosisToInsert, notes, advice,
    reviewDate, prescNodeId, doctorName, createdBy) {
    var path = "enc/prescription";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedDrugsToInsert: commaSeparatedDrugsToInsert,
      commaSeparatedDiagnosisToInsert: commaSeparatedDiagnosisToInsert,
      notes: notes,
      advice: advice,
      reviewDate: reviewDate,
      prescNodeId: prescNodeId,
      doctorName: doctorName,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  savePrescriptionTc(encId, encNodeId, splId, createdBy) {
    var path = "enc/prescription/tc";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      splId: splId,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getPrescription(encId, encNodeId) {
    var path = "enc/prescription/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //drug issue related
  saveDrugIssuedData(encId, encNodeId, drugId, issuedQty, batchNo, issuedRemarks, updatedBy) {
    var path = "enc/drug-issue";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      drugId: drugId,
      batchNo: batchNo,
      issuedQty: issuedQty,
      issuedRemarks: issuedRemarks,
      updatedBy: updatedBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getDrugIssuedData(encId, encNodeId) {
    var path = "enc/drug-issue/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  //inventory related
  addInventory(invNodeId, invId, invTypeId, batchNo, expiryDate, transactionQty, createdBy) {
    var path = "inv/add";
    var body = {
      invNodeId: invNodeId,
      invId: invId,
      invTypeId: invTypeId,
      batchNo: batchNo,
      expiryDate: expiryDate,
      transactionQty: transactionQty,
      createdBy: createdBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  consumeInventory(invNodeId, invId, invTypeId, batchNo, transactionQty, updatedBy) {
    var path = "inv/consume";
    var body = {
      invNodeId: invNodeId,
      invId: invId,
      invTypeId: invTypeId,
      batchNo: batchNo,
      transactionQty: transactionQty,
      updatedBy: updatedBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  openInventory(invNodeId, invId, invTypeId, batchNo, openedBy) {
    var path = "inv/open";
    var body = {
      invNodeId: invNodeId,
      invId: invId,
      invTypeId: invTypeId,
      batchNo: batchNo,
      openedBy: openedBy
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getInventory(invNodeId, invTypeId) {
    var path = "inv/" + invNodeId + "/" + invTypeId;
    return this.http.get(this.apiUrl + path);
  }

  //master data related
  getRegistrationPageMaster() {
    var path = "master-data/registration-page";
    return this.http.get(this.apiUrl + path);
  }

  getMandals(districtId) {
    var path = "master-data/mandal/" + districtId;
    return this.http.get(this.apiUrl + path);
  }

  getVillages(mandalId) {
    var path = "master-data/village/" + mandalId;
    return this.http.get(this.apiUrl + path);
  }

  getComplaintsPageMaster() {
    var path = "master-data/complaints";
    return this.http.get(this.apiUrl + path);
  }

  //history related masters
  getHistoryPageMaster() {
    var path = "master-data/history";
    return this.http.get(this.apiUrl + path);
  }

  getHistoryHabitsComponentMaster() {
    var path = "master-data/history/habits";
    return this.http.get(this.apiUrl + path);
  }

  getHistoryPhComponentMaster() {
    var path = "master-data/history/ph";
    return this.http.get(this.apiUrl + path);
  }

  getHistoryChComponentMaster() {
    var path = "master-data/history/ch";
    return this.http.get(this.apiUrl + path);
  }

  getHistoryFhComponentMaster() {
    var path = "master-data/history/fh";
    return this.http.get(this.apiUrl + path);
  }

  getHistoryObstetricsMaster() {
    var path = "master-data/history/obstetrics";
    return this.http.get(this.apiUrl + path);
  }

  //end of history related masters


  getImmunizationPageMaster() {
    var path = "master-data/immunization";
    return this.http.get(this.apiUrl + path);
  }

  //lab test related masters
  getLabTestsOrderComponentMaster() {
    var path = "master-data/lab/lab-tests-ordered";
    return this.http.get(this.apiUrl + path);
  }

  getLabBloodGroupComponentMaster() {
    var path = "master-data/lab/blood-group";
    return this.http.get(this.apiUrl + path);
  }

  getLabTestResultsComponentMaster() {
    var path = "master-data/lab/lab-test-results";
    return this.http.get(this.apiUrl + path);
  }

  getPrescriptionPageMaster() {
    var path = "master-data/prescription";
    return this.http.get(this.apiUrl + path);
  }

  getInventoryPageMaster() {
    var path = "master-data/inventory";
    return this.http.get(this.apiUrl + path);
  }

  savePersonalHistoryField(encId, encNodeId, fieldName, intFieldValue, textFieldValue, date, userId) {
    var path = "enc/personal-history";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      fieldName: fieldName,
      intFieldValue: intFieldValue,
      textFieldValue: textFieldValue,
      date: date,
      userId: userId
    };
    return this.http.post(this.apiUrl + path, body);
  }

  getPersonalHistories(encId, encNodeId) {
    var path = "enc/personal-history-get/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }
  //vaccination added
  saveVaccination(encId, encNodeId, vaccinationMishap, createdBy) {

    var path = "enc/save-vaccination";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      vaccinationMishap: vaccinationMishap,
      createdBy: createdBy,

    };

    return this.http.post(this.apiUrl + path, body);

  }
  getVaccination(encId, encNodeId) {
    var path = "enc/get-vaccination/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  // surgical added

  saveSurgical(encId, encNodeId, commaSeparatedSurgicalsToInsert) {
    var path = "enc/save-surgical";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedSurgicalsToInsert: commaSeparatedSurgicalsToInsert,
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getSurgical(encId, encNodeId) {
    var path = "enc/get-surgical/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  // treatment added
  saveTreatmentHistory(encId, encNodeId, commaSeparatedTreatmentToInsert) {
    var path = "enc/save-treatment-history";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      commaSeparatedTreatmentToInsert: commaSeparatedTreatmentToInsert,
    };

    return this.http.post(this.apiUrl + path, body);
  }

  getTreatmentHistory(encId, encNodeId) {
    var path = "enc/get-treatment-history/" + encNodeId + "/" + encId;
    return this.http.get(this.apiUrl + path);
  }

  deleteLastRow(encId, encNodeId, tableName) {
    console.log(encId, encNodeId, tableName);
    var path = "enc/delete-last-row";
    var body = {
      encId: encId,
      encNodeId: encNodeId,
      tableName: tableName,

    };
    return this.http.post(this.apiUrl + path, body);
  }

}

