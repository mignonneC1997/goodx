import { TestBed } from '@angular/core/testing';

import { ToasterService } from './toaster.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

describe('ToasterService', () => {
  let service: ToasterService;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let loadingControllerSpy: jasmine.SpyObj<LoadingController>;

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastSpy.create.and.returnValue(Promise.resolve({ present: () => {} }));

    const alertSpy = jasmine.createSpyObj('AlertController', ['create', 'present', 'onDidDismiss']);
    const loadingSpy = jasmine.createSpyObj('LoadingController', ['create', 'present']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastController, useValue: toastSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: LoadingController, useValue: loadingSpy }
      ]
    });
    service = TestBed.inject(ToasterService);
    toastControllerSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    loadingControllerSpy = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('ToasterService should display a warning toast', async () => {
    const message = 'Warning message';
    await service.displayWarningToast(message);
    expect(toastControllerSpy.create).toHaveBeenCalledOnceWith({
      message: message,
      duration: 5000,
      color: 'warning',
      position: 'top'
    });
  });
});
