import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [LoginPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('LoginPage should create', () => {
    expect(component).toBeTruthy();
  });

  it('LoginPage should initialize with isLoading false', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('LoginPage should initialize loginForm with username and password controls', () => {
    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('LoginPage should disable login button when form is invalid', () => {
    component.loginForm.setValue({ username: '', password: '' });
    expect(component.loginForm.invalid).toBeTrue();
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('ion-button[type="submit"]');
    expect(submitButton.disabled).toBeTrue();
  });

  it('LoginPage should enable login button when form is valid', () => {
    // Set valid values for the form controls
    component.loginForm.setValue({ username: 'test', password: 'password' });
    fixture.detectChanges();
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('ion-button[type="submit"]');
    // Check if the submit button is enabled
    expect(submitButton.disabled).toBeFalse();
  });
});
