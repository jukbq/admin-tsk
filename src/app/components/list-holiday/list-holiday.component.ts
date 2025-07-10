import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HolidayResponse } from '../../shared/interfaces/holiday';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { HolidayService } from '../../shared/services/holiday/holiday.service';
import { Router } from '@angular/router';
import { AddHolidayModalComponent } from '../../madals/add-holiday-modal/add-holiday-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-list-holiday',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-holiday.component.html',
  styleUrl: './list-holiday.component.scss',
})
export class ListHolidayComponent {
  holiday: Array<HolidayResponse> = [];
  delete: any;

  constructor(
    private storsgeIcon: Storage,
    private holidayService: HolidayService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.geHoliday();
  }

  // Отримання даних з сервера
  geHoliday(): void {
    this.holidayService.getAll().subscribe((data: any) => {
      this.holiday = data as HolidayResponse[];
      this.holiday.sort((a, b) => a.holidayName.localeCompare(b.holidayName));
    });
  }

  // Видалення пункту меню
  delHoliday(index: HolidayResponse) {
    const task = ref(this.storsgeIcon, index.image);
    deleteObject(task);
    this.holidayService.delHoliday(index.id as string).then(() => {
      this.geHoliday();
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddHolidayModalComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.geHoliday();
    });
  }
}
