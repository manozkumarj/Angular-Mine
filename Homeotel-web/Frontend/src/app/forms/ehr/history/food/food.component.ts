import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { CurBenService } from '../../../../services/cur-ben.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {

  foodForm : FormGroup;
displayedColumns: string[] = ['sNo' ,'foodType', 'otherFood','type',  'rating', 'deleteOption'];
dataSource: MatTableDataSource<any[]>;
addedFoodDetails =[];

  foodType;
  otherFood;
  type
  rating;
  otherFoodVisibility = false;

  foods =[
    {id : 1 , name :"Sweet"},
    {id : 2 , name :"Sour"},
    {id : 3 , name :"Salty"},
    {id : 4 , name :"Other"},
  ]

  ratings =[10 ,9,8,7,6,5,4,3,2,1]
  


  types =[
    {id :1 , name :"Aversion"},
    {id :2 , name :"Desire"},
  ]

  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.createFormControls();
    this.createForm();
    this.utilities.setStyles();

    
  }

  createFormControls() {
    this.foodType = new FormControl('');
    this.otherFood = new FormControl('');
    this.type = new FormControl('');
    this.rating = new FormControl('');
    
  }

  createForm() {
    this.foodForm = new FormGroup({
      foodType: this.foodType,
      otherFood: this.otherFood,
      type: this.type,
      rating: this.rating
    });
  }

  

  addFoodDetails()
  {
    this.addedFoodDetails.push({
      foodType : this.foodType.value, 
      otherFood : this.otherFood.value,
       type : this.type.value,
       rating : this.rating.value
    })
    this.dataSource = new MatTableDataSource(this.addedFoodDetails); 
  }

  deleteFoodDetails(i){
  
    this.addedFoodDetails.splice(i , 1);
    this.dataSource = new MatTableDataSource(this.addedFoodDetails);
    
  }

  foodTypeChanged()
  {
this.foodType.value ==="Other"? this.otherFoodVisibility=true: this.otherFoodVisibility=false;
  }
 

}