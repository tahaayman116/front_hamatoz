import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsDetails } from './cars-details';

describe('CarsDetails', () => {
  let component: CarsDetails;
  let fixture: ComponentFixture<CarsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
