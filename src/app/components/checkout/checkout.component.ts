import { Target } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { FormService } from 'src/app/services/form.service';
import { CustomValidators } from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  
  totalPrice = 0;
  totalQuantity = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  
  constructor(private formBuilder: FormBuilder, private formService: FormService, private cartService: CartService) { }

  ngOnInit(): void {

    this.reviewCardDetails();



    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('',[Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhiteSpace]),
        email: new FormControl('',[Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), CustomValidators.notOnlyWhiteSpace])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required, CustomValidators.notOnlyWhiteSpace]),
        city: new FormControl('',[Validators.required, CustomValidators.notOnlyWhiteSpace]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, CustomValidators.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required, CustomValidators.notOnlyWhiteSpace]),
        city: new FormControl('',[Validators.required, CustomValidators.notOnlyWhiteSpace]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, CustomValidators.notOnlyWhiteSpace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('',[Validators.required, CustomValidators.notOnlyWhiteSpace]),
        nameOnCard: new FormControl('',[Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('',[Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth()+1;
    
    this.formService.getCreditCardMonths(startMonth).subscribe(
      (data) => {this.creditCardMonths = data}
    );

    // populate credit card years
    this.formService.getCreditCardYears().subscribe(
      (data) => {this.creditCardYears = data}
    );
    
    // populate countries
    this.formService.getCountries().subscribe(
      (data) => {
        console.log("Retrieved Countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );

  }
  reviewCardDetails() {
    
    this.cartService.totalQuantity.subscribe(
      (data) => { this.totalQuantity = data }
    );

    this.cartService.totalPrice.subscribe(
      (data) => { this.totalPrice = data }
    );
    
  }

  get firstName(){ return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName'); }
  get email(){ return this.checkoutFormGroup.get('customer.email'); }
  
  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity(){ return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState(){ return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipCode(){ return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressCountry(){ return this.checkoutFormGroup.get('shippingAddress.country');}

  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity(){ return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState(){ return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressZipCode(){ return this.checkoutFormGroup.get('billingAddress.zipCode');}
  get billingAddressCountry(){ return this.checkoutFormGroup.get('billingAddress.country');}

  get creditCardType(){ return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode'); }

  copyShippingToBilling(event: any){
    if (event.target.checked){
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // copy shipping address states to billing address states
      this.billingAddressStates = this.shippingAddressStates;

    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      // clear state for billing address
      this.billingAddressStates = [];

    }
  }

  onSubmit() {
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("The shipping address country is " +this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("The shipping address state is " +this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);  
  
    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth = 1;
    }

    this.formService.getCreditCardMonths(startMonth).subscribe(
      (data) => {this.creditCardMonths = data}
    )
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.formService.getStates(countryCode).subscribe(
      (data) => {
        if (formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        // select first state as default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );

  }

}
