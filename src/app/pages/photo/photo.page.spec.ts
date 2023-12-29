import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

// Elimina la importación del módulo ExploreContainerComponentModule
// import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { PhotoPage } from './photo.page';

describe('PhotoPage', () => {
  let component: PhotoPage;
  let fixture: ComponentFixture<PhotoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotoPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
