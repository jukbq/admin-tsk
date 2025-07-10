import { Component } from '@angular/core';
import { UnitResponse } from '../../shared/interfaces/units';
import { UnitsService } from '../../shared/services/units/units.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddUnitsComponent } from '../../madals/add-units/add-units.component';

@Component({
  selector: 'app-list-units',
  standalone: true,
   imports: [CommonModule, MatDialogModule],
  templateUrl: './list-units.component.html',
  styleUrl: './list-units.component.scss',
})
export class ListUnitsComponent {
  units: Array<UnitResponse> = [];
  units_edit_status = false;

  constructor(private unitsService: UnitsService,  public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getUnits();
  }

  // Отримання даних з сервера
  getUnits(): void {
    this.unitsService.getAll().subscribe((data: any) => {
      this.units = data as UnitResponse[];
      this.units.sort((a, b) => a.unitName.localeCompare(b.unitName));
    });
  }

  // Видалення пункту меню
  delUnits(index: UnitResponse) {
    this.unitsService.delUnits(index.id as string).then(() => {
      this.getUnits();
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddUnitsComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getUnits();
    });
  }
}
