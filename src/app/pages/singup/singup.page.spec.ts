import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { SingupPage } from './singup.page';

describe('SingupPage', () => {
  let component: SingupPage;
  let fixture: ComponentFixture<SingupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SingupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
