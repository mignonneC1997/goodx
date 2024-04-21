import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [DashboardPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('DashboardPage should create', () => {
    expect(component).toBeTruthy();
  });

  it('DashboardPage should initialize with isLoading false', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('DashboardPage should render the ion-header with correct content', () => {
    const ionHeaderElement: HTMLIonHeaderElement | null = fixture.nativeElement.querySelector('ion-header');
    expect(ionHeaderElement!).toBeTruthy();

    const ionToolbarElement: HTMLIonToolbarElement | null = ionHeaderElement!.querySelector('ion-toolbar');
    expect(ionToolbarElement!).toBeTruthy();

    // Test the ion-title
    const ionTitleElement: HTMLIonTitleElement | null = ionToolbarElement!.querySelector('ion-title');
    expect(ionTitleElement!.textContent).toContain('Welcome');

    // Test the ion-buttons with slot="start"
    const ionMenuButtonElement: HTMLIonButtonsElement | null = ionToolbarElement!.querySelector('ion-buttons[slot="start"]');
    expect(ionMenuButtonElement!).toBeTruthy();

    // Test the ion-icon with slot="end"
    const ionIconElement: HTMLIonIconElement | null = ionToolbarElement!.querySelector('ion-icon[slot="end"]');
    expect(ionIconElement!).toBeTruthy();
    expect(ionIconElement!.getAttribute('name')).toBe('location');
  });

  it('DashboardPage should render the ion-content with correct content', () => {
    const ionContentElement: HTMLElement | null = fixture.nativeElement.querySelector('ion-content');
    expect(ionContentElement).toBeTruthy();

    // Test the top part with profile image and user name
    const topPartElement: HTMLElement | null = ionContentElement!.querySelector('.top-part');
    expect(topPartElement).toBeTruthy();

    const profilePicElement: HTMLImageElement | null = topPartElement!.querySelector('.profile-pic img');
    expect(profilePicElement).toBeTruthy();
    expect(profilePicElement?.src).toContain('male.png');

    const profileNameElement: HTMLElement | null = topPartElement!.querySelector('.profile-name');
    expect(profileNameElement).toBeTruthy(); // Replace with the actual user name property binding
  });
});
