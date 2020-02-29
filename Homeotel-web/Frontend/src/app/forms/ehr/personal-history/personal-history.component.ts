import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-personal-history',
  templateUrl: './personal-history.component.html',
  styleUrls: ['./personal-history.component.css']
})
export class PersonalHistoryComponent implements OnInit {


  clinicalHistoryForm;
  step = -1;

  // Select fields
  activity; memory; appetite; thirst; intolarence; sleep; sleepPosture; sweatQuantity; sweatSmell; urineQuantity; urineSmell; urineFlow; periodicity; consistency;
  tongueDryMoist; bathing; season; covering; fanAc; openAir; symptomsBeforeMensis;
  symptomsDuringMensis; symptomsAfterMensis; menopause; pregnant;

  // Input fields
  habbitsAddictions; aversions; desires; desiresInChildhood; dreams; sweat; lifeSituation;
  urineColor; urinationTimesDay; urinationTimesNight; bowelsTimesDay; bowelsTimesNight;
  bowelsColorStool; tongueColor; tongueBackCoating; tongueFrontCoating; tongueEntireCoating;
  menarche; mensis; lmpDate; deliveriesCount; childrenCount;
  ultraUterineDeaths; abortions;

  getEncId = this.curBen.curEncId;
  getEncNodeId = this.utilities.getCurEncNodeId();

  medical; otherMedical; surgical; otherSurgical;
  intolerance; meno;
  //masters
  medicals = []; surgicals = [];

  activities = [
    { id: 1, name: "Restless" },
    { id: 2, name: "Dull" },
    { id: 3, name: "No Change" },
  ];

  understandings = [
    { id: 1, name: "Normal" },
    { id: 2, name: "Altered" },
  ];

  memories = [
    { id: 1, name: "Weak" },
    { id: 2, name: "Normal" },
  ];


  //physical generals

  appetiteList = [
    { id: 1, name: "Increased" },
    { id: 2, name: "Decreased" },
    { id: 3, name: "No Change" },
  ];
  thirstList = [
    { id: 1, name: "Increased" },
    { id: 2, name: "Decreased" },
    { id: 3, name: "No Change" },
  ];
  intolarenceList = [
    { id: 1, name: "Food" },
    { id: 2, name: "Environment" },
    { id: 3, name: "Drugs" },
  ];

  envI = false;
  foodI = false;
  drugI = false;
  intoleranceChanged() {
    this.envI = false; this.drugI = false; this.foodI = false;
    if (this.intolerance.value && this.intolerance.value.length > 0) {
      this.intolerance.value.forEach(selectedOption => {
        if (selectedOption.name.toLowerCase().indexOf('food') > -1)
          this.foodI = true;

        if (selectedOption.name.toLowerCase().indexOf('drug') > -1)
          this.drugI = true;

        if (selectedOption.name.toLowerCase().indexOf('env') > -1)
          this.envI = true;
      });
    }
  }

  sleepList = [
    { id: 1, name: "Increased" },
    { id: 2, name: "Decreased" },
    { id: 3, name: "No Change" },
  ];
  sleepPostureList = [
    { id: 1, name: "Back" },
    { id: 2, name: "On the belly" },
    { id: 3, name: "to the right" },
    { id: 4, name: "to the left" },
    { id: 5, name: "others" },
  ];
  isOtherSleepPosture = false;
  sleepPostureChanged() {
    this.isOtherSleepPosture = false;

    if (this.sleepPosture.value) {
      console.log(this.sleepPosture.value)
      if (this.sleepPosture.value.name.toLowerCase().indexOf('other') > -1)
        this.isOtherSleepPosture = true;
    }
  }
  sweatCharListSmell = [
    { id: 1, name: "Offensive" },
    { id: 2, name: "Normal" },
  ];
  sweatCharListQty = [
    { id: 1, name: "Profuse" },
    { id: 2, name: "Scanty" },
  ];

  urineList1 = [
    { id: 1, name: "Profuse" },
    { id: 2, name: "Scanty" },
  ];

  urineList2 = [
    { id: 1, name: "Offensive" },
    { id: 2, name: "Normal" },
  ];

  urineList3 = [
    { id: 1, name: "Fluent" },
    { id: 2, name: "Hesitancy" },
  ];

  bowelsList1 = [
    { id: 1, name: "Regular" },
    { id: 2, name: "Irregular" },
  ];

  bowelsList2 = [
    { id: 1, name: "Hard" },
    { id: 2, name: "Soft" },
    { id: 3, name: "Watery" },
  ];


  tongueList = [
    { id: 1, name: "Dry" },
    { id: 2, name: "Moist" },
  ];


  thermalsList1 = [
    { id: 1, name: "Hot" },
    { id: 2, name: "Cold" },
  ];

  thermalsList2 = [
    { id: 1, name: "Summer" },
    { id: 2, name: "Winter" },
    { id: 3, name: "Rainy" },
  ];

  thermalsList3 = [
    { id: 1, name: "Covers during sleep" },
    { id: 2, name: "Does not cover" },
  ];

  thermalsList4 = [
    { id: 1, name: "Fan" },
    { id: 2, name: "AC" },
  ];

  thermalsList5 = [
    { id: 1, name: "Likes" },
    { id: 2, name: "Dislikes" },
  ];

  menoList = [
    { id: 1, name: "Yes" },
    { id: 2, name: "No" },
  ];

  menoList2 = [
    { id: 1, name: "Fever" },
    { id: 2, name: "Nausea" },
    { id: 3, name: "Vomitting" },
  ];

  isMeno = false;
  menoChanged() {
    this.isMeno = false;
    if (this.meno.value) {
      if (this.meno.value.name.toLowerCase().indexOf('yes') > -1)
        this.isMeno = true;
    }
  }

  @Output() hasData = new EventEmitter<any>();

  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.loadMasters();
    this.createFormControls();
  }

  afterMasterDataLoads() {
    this.utilities.setStyles();
    this.loadPersonalHistory();
  }

  loadPersonalHistory() {
    this.apiService.getPersonalHistories(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          console.log(data[0]);
          this.setPersonalHistory(data[0]);
        }
      });
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  setPersonalHistory(data) {
    data.forEach(data => {
      this.activity.setValue(data['activity_id']);
      this.memory.setValue(data['memory_id']);
      this.appetite.setValue(data['appetite_id']);
      this.habbitsAddictions.setValue(data['habits_addictions']);
      this.thirst.setValue(data['thirst_id']);
      this.aversions.setValue(data['aversions']);
      this.desires.setValue(data['desires']);

      var intolarenceIds = [];
      data['intolarence'].split(',').forEach(id => {
        intolarenceIds.push(+id);
      })
      this.intolarence.setValue(intolarenceIds);

      this.desiresInChildhood.setValue(data['desires_in_childhood']);
      this.sleep.setValue(data['sleep_id']);
      this.sleepPosture.setValue(data['sleep_posture_id']);
      this.dreams.setValue(data['dreams']);
      this.sweat.setValue(data['sweat']);
      this.sweatQuantity.setValue(data['sweat_quantity_id']);
      this.sweatSmell.setValue(data['sweat_smell_id']);
      this.lifeSituation.setValue(data['life_situation']);
      this.urineSmell.setValue(data['urine_smell_id']);
      this.urineFlow.setValue(data['urine_flow_id']);
      this.urineColor.setValue(data['urine_color']);
      this.urinationTimesDay.setValue(data['urination_times_day']);
      this.urinationTimesNight.setValue(data['urination_times_night']);
      this.bowelsTimesDay.setValue(data['bowels_times_day']);
      this.bowelsTimesNight.setValue(data['bowels_times_night']);
      this.periodicity.setValue(data['bowels_periodicity_id']);
      this.consistency.setValue(data['bowels_consistency_id']);
      this.bowelsColorStool.setValue(data['bowels_color_stool']);
      this.tongueColor.setValue(data['tongue_color']);
      this.tongueBackCoating.setValue(data['tongue_back_coating']);
      this.tongueFrontCoating.setValue(data['tongue_front_coating']);
      this.tongueEntireCoating.setValue(data['tongue_entire_coating']);
      this.tongueDryMoist.setValue(data['tongue_dry_moist_id']);
      this.bathing.setValue(data['bathing_id']);
      this.season.setValue(data['season_id']);
      this.covering.setValue(data['covering_id']);
      this.fanAc.setValue(data['fan_ac_id']);
      this.openAir.setValue(data['open_air_id']);
      this.menarche.setValue(data['menarche']);
      this.mensis.setValue(data['mensis']);
      this.lmpDate.setValue(data['lmp_date']);
      this.symptomsBeforeMensis.setValue(data['symptoms_before_mensis_id']);
      this.symptomsDuringMensis.setValue(data['symptoms_during_mensis_id']);
      this.symptomsAfterMensis.setValue(data['symptoms_after_mensis_id']);
      this.menopause.setValue(data['menopause_id']);
      this.pregnant.setValue(data['pregnant_id']);
      this.deliveriesCount.setValue(data['deliveries_count']);
      this.childrenCount.setValue(data['childern_count']);
      this.ultraUterineDeaths.setValue(data['ultra_uterine_deaths']);
      this.abortions.setValue(data['abortions']);
    })
  }


  resetMasters() {
    this.medicals = []; this.surgicals = [];
  }

  loadMasters() {
    this.apiService.getHistoryChComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'medical')
              this.medicals.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'surgical')
              this.surgicals.push({ name: masterRow.name, id: masterRow.id });
            /* TODO - remove gynaec and obstetrics if ben is male (surgical id = 1 and 2 @ m_his_ch_surgical) */
          });

          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.activity = new FormControl('');
    this.memory = new FormControl('');
    this.appetite = new FormControl('');
    this.habbitsAddictions = new FormControl('');

    this.thirst = new FormControl('');
    this.aversions = new FormControl('');
    this.desires = new FormControl('');
    this.intolarence = new FormControl('');
    this.desiresInChildhood = new FormControl('');
    this.sleep = new FormControl('');
    this.sleepPosture = new FormControl('');
    this.dreams = new FormControl('');
    this.sweat = new FormControl('');
    this.sweatQuantity = new FormControl('');
    this.sweatSmell = new FormControl('');
    this.lifeSituation = new FormControl('');
    this.urineQuantity = new FormControl('');
    this.urineSmell = new FormControl('');
    this.urineFlow = new FormControl('');
    this.urineColor = new FormControl('');
    this.urinationTimesDay = new FormControl('');
    this.urinationTimesNight = new FormControl('');
    this.bowelsTimesDay = new FormControl('');
    this.bowelsTimesNight = new FormControl('');
    this.periodicity = new FormControl('');
    this.consistency = new FormControl('');
    this.bowelsColorStool = new FormControl('');
    this.tongueColor = new FormControl('');
    this.tongueBackCoating = new FormControl('');
    this.tongueFrontCoating = new FormControl('');
    this.tongueEntireCoating = new FormControl('');
    this.tongueDryMoist = new FormControl('');

    this.bathing = new FormControl('');
    this.season = new FormControl('');
    this.covering = new FormControl('');
    this.fanAc = new FormControl('');
    this.openAir = new FormControl('');
    this.menarche = new FormControl('');
    this.mensis = new FormControl('');
    this.lmpDate = new FormControl('');

    this.symptomsBeforeMensis = new FormControl('');
    this.symptomsDuringMensis = new FormControl('');
    this.symptomsAfterMensis = new FormControl('');
    this.menopause = new FormControl('');
    this.pregnant = new FormControl('');
    this.deliveriesCount = new FormControl('');
    this.childrenCount = new FormControl('');
    this.ultraUterineDeaths = new FormControl('');
    this.abortions = new FormControl('');

    this.medical = new FormControl();
    this.otherMedical = new FormControl();
    this.surgical = new FormControl();
    this.otherSurgical = new FormControl();
    this.intolerance = new FormControl();
    this.sleepPosture = new FormControl();
    this.meno = new FormControl();
  }

  // Change functions
  dataChanged(fieldName, fieldType) {
    console.log(`fieldName -> ${fieldName}`);
    console.log(`fieldType -> ${fieldType}`);
    let intFieldValue = null;
    let textFieldValue = null;
    let date = null;
    switch (fieldName) {
      case 'activity':
        fieldName = 'activity_id'
        intFieldValue = this.activity.value;
        break;
      case 'memory':
        fieldName = 'memory_id'
        intFieldValue = this.memory.value;
        break;
      case 'appetite':
        fieldName = 'appetite_id'
        intFieldValue = this.appetite.value;
        break;
      case 'habbitsAddictions':
        fieldName = 'habits_addictions'
        textFieldValue = this.habbitsAddictions.value.trim();
        break;
      case 'aversions':
        fieldName = 'aversions'
        textFieldValue = this.aversions.value.trim();
        break;
      case 'desires':
        fieldName = 'desires'
        textFieldValue = this.desires.value.trim();
        break;
      case 'desiresInChildhood':
        fieldName = 'desires_in_childhood'
        textFieldValue = this.desiresInChildhood.value.trim();
        break;
      case 'dreams':
        fieldName = 'dreams'
        textFieldValue = this.dreams.value.trim();
        break;
      case 'sweat':
        fieldName = 'sweat'
        textFieldValue = this.sweat.value.trim();
        break;
      case 'lifeSituation':
        fieldName = 'life_situation'
        textFieldValue = this.lifeSituation.value.trim();
        break;
      case 'urineColor':
        fieldName = 'urine_color'
        textFieldValue = this.urineColor.value.trim();
        break;
      case 'urinationTimesDay':
        fieldName = 'urination_times_day'
        textFieldValue = this.urinationTimesDay.value.trim();
        break;
      case 'urinationTimesNight':
        fieldName = 'urination_times_night'
        textFieldValue = this.urinationTimesNight.value.trim();
        break;
      case 'bowelsTimesDay':
        fieldName = 'bowels_times_day'
        textFieldValue = this.bowelsTimesDay.value.trim();
        break;
      case 'bowelsTimesNight':
        fieldName = 'bowels_times_night'
        textFieldValue = this.bowelsTimesNight.value.trim();
        break;
      case 'bowelsColorStool':
        fieldName = 'bowels_color_stool'
        textFieldValue = this.bowelsColorStool.value.trim();
        break;
      case 'tongueColor':
        fieldName = 'tongue_color'
        textFieldValue = this.tongueColor.value.trim();
        break;
      case 'tongueBackCoating':
        fieldName = 'tongue_back_coating'
        textFieldValue = this.tongueBackCoating.value.trim();
        break;
      case 'tongueFrontCoating':
        fieldName = 'tongue_front_coating'
        textFieldValue = this.tongueFrontCoating.value.trim();
        break;
      case 'tongueEntireCoating':
        fieldName = 'tongue_entire_coating'
        textFieldValue = this.tongueEntireCoating.value.trim();
        break;
      case 'menarche':
        fieldName = 'menarche'
        textFieldValue = this.menarche.value.trim();
        break;
      case 'mensis':
        fieldName = 'mensis'
        textFieldValue = this.mensis.value.trim();
        break;
      case 'lmpDate':
        fieldName = 'lmp_date'
        let getDate = this.lmpDate.value;
        date = this.datePipe.transform(getDate, 'yyyy-MM-dd HH:mm:ss');;
        break;
      case 'deliveriesCount':
        fieldName = 'deliveries_count'
        textFieldValue = this.deliveriesCount.value.trim();
        break;
      case 'childrenCount':
        fieldName = 'childern_count'
        textFieldValue = this.childrenCount.value.trim();
        break;
      case 'ultraUterineDeaths':
        fieldName = 'ultra_uterine_deaths'
        textFieldValue = this.ultraUterineDeaths.value.trim();
        break;
      case 'abortions':
        fieldName = 'abortions'
        textFieldValue = this.abortions.value.trim();
        break;
      case 'intolarence':
        fieldName = 'intolarence'
        textFieldValue = this.intolarence.value;
        textFieldValue = textFieldValue.join(',');
        break;
      case 'thirst':
        fieldName = 'thirst_id'
        intFieldValue = this.thirst.value;
        break;
      case 'sleep':
        fieldName = 'sleep_id'
        intFieldValue = this.sleep.value;
        break;
      case 'sleepPosture':
        fieldName = 'sleep_posture_id'
        intFieldValue = this.sleepPosture.value;
        break;
      case 'sweatQuantity':
        fieldName = 'sweat_quantity_id'
        intFieldValue = this.sweatQuantity.value;
        break;
      case 'sweatSmell':
        fieldName = 'sweat_smell_id'
        intFieldValue = this.sweatSmell.value;
        break;
      case 'urineQuantity':
        fieldName = 'urine_quantity_id'
        intFieldValue = this.urineQuantity.value;
        break;
      case 'urineSmell':
        fieldName = 'urine_smell_id'
        intFieldValue = this.urineSmell.value;
        break;
      case 'urineFlow':
        fieldName = 'urine_flow_id'
        intFieldValue = this.urineFlow.value;
        break;
      case 'periodicity':
        fieldName = 'bowels_periodicity_id'
        intFieldValue = this.periodicity.value;
        break;
      case 'consistency':
        fieldName = 'bowels_consistency_id'
        intFieldValue = this.consistency.value;
        break;
      case 'tongueDryMoist':
        fieldName = 'tongue_dry_moist_id'
        intFieldValue = this.tongueDryMoist.value;
        break;
      case 'bathing':
        fieldName = 'bathing_id'
        intFieldValue = this.bathing.value;
        break;
      case 'season':
        fieldName = 'season_id'
        intFieldValue = this.season.value;
        break;
      case 'covering':
        fieldName = 'covering_id'
        intFieldValue = this.covering.value;
        break;
      case 'fanAc':
        fieldName = 'fan_ac_id'
        intFieldValue = this.fanAc.value;
        break;
      case 'openAir':
        fieldName = 'open_air_id'
        intFieldValue = this.openAir.value;
        break;
      case 'symptomsBeforeMensis':
        fieldName = 'symptoms_before_mensis_id'
        intFieldValue = this.symptomsBeforeMensis.value;
        break;
      case 'symptomsDuringMensis':
        fieldName = 'symptoms_during_mensis_id'
        intFieldValue = this.symptomsDuringMensis.value;
        break;
      case 'symptomsAfterMensis':
        fieldName = 'symptoms_after_mensis_id'
        intFieldValue = this.symptomsAfterMensis.value;
        break;
      case 'menopause':
        fieldName = 'menopause_id'
        intFieldValue = this.menopause.value;
        break;
      case 'pregnant':
        fieldName = 'pregnant_id'
        intFieldValue = this.pregnant.value;
        break;
      default:
        null;
    }
    // console.log(`selectedActivityId -> ${intFieldValue}`);

    // console.log(this.getEncId, ' -- ', this.getEncNodeId, ' -- ', fieldName, ' -- ', intFieldValue, ' -- ', textFieldValue, ' -- ', date, ' -- ', this.curStaff.staffId);

    if ((intFieldValue || textFieldValue || date) && (intFieldValue != null || textFieldValue != null || date != null)) {
      this.apiService.savePersonalHistoryField(this.getEncId, this.getEncNodeId, fieldName, intFieldValue, textFieldValue, date, this.curStaff.staffId)
        .subscribe((data) => {
          if (this.utilities.isInvalidApiResponseData(data)) {
            swal({ title: "Error", text: "Something went wrong while saving data", type: 'error' });
            console.log(data);
          }
          else {
            this.utilities.openSnackBar("Data Saved Successfully", "Success");
            // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          }
        });
    }
  }

}
