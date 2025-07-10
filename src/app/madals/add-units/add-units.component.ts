import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { UnitsService } from '../../shared/services/units/units.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UnitResponse } from '../../shared/interfaces/units';

@Component({
  selector: 'app-add-units',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-units.component.html',
  styleUrl: './add-units.component.scss',
})
export class AddUnitsComponent {
  public units: any[] = [];
  public unitsForm!: FormGroup;
  public uploadPercent!: number;
  public unitses_edit_status = false;
  private unitsID!: number | string;

  constructor(
    private formBuild: FormBuilder,
    private unitService: UnitsService,
    public dialogRef: MatDialogRef<AddUnitsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any }
  ) { }

  ngOnInit(): void {
    this.initpUnitsForm();
    this.getUnits();
    if (this.data.action === 'edit') {
      this.editUnits(this.data.object);
    }
  }

  // Ініціалізація форми продуктів
  initpUnitsForm(): void {
    this.unitsForm = this.formBuild.group({
      unitName: [null],
    });
  }

  // Отримання одинці з сервера
  getUnits(): void {
    this.unitService.getAll().subscribe((data: any[]) => {
      this.units = data as UnitResponse[];
      this.units.sort((a, b) => a.unitName.localeCompare(b.unitName));
    });
  }

  // Редагування категорію
  editUnits(products: UnitResponse) {
    this.unitsForm.patchValue({
      unitName: products.unitName,
    });
    this.unitses_edit_status = true;
    this.unitsID = products.id;
  }

  // Додавання або редагування продукта
  creatUnits() {
    if (this.unitses_edit_status) {
      this.unitService
        .editUnits(this.unitsForm.value, this.unitsID as string)
        .then(() => {
          this.dialogRef.close();
        });
    } else {
      this.unitService.addUnits(this.unitsForm.value).then(() => {
        this.dialogRef.close();
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
