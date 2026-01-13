import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexdbComponent } from './indexdb.component';

describe('IndexdbComponent', () => {
  let component: IndexdbComponent;
  let fixture: ComponentFixture<IndexdbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexdbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexdbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
