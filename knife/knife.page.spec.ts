import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { KnifePage } from './knife.page';

describe('KnifePage', () => {
  let component: KnifePage;
  let fixture: ComponentFixture<KnifePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnifePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(KnifePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
