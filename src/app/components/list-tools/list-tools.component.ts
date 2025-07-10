import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ToolsResponse } from '../../shared/interfaces/tools';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { ToolsService } from '../../shared/services/tools/tools.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddToolModalComponent } from '../../madals/add-tool-modal/add-tool-modal.component';

@Component({
  selector: 'app-list-tools',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-tools.component.html',
  styleUrl: './list-tools.component.scss',
})
export class ListToolsComponent {
  tools: Array<ToolsResponse> = [];

  constructor(
    private storsgeIcon: Storage,
    private toolsService: ToolsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getTools();
  }

  // Отримання даних з сервера
  getTools(): void {
    this.toolsService.getAll().subscribe((data: any) => {
      this.tools = data as ToolsResponse[];
    });
  }

  // Видалення пункту меню
  delTools(index: ToolsResponse) {
    const task = ref(this.storsgeIcon, index.image);
    deleteObject(task);
    this.toolsService.deltools(index.id as string).then(() => {
      this.getTools();
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddToolModalComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getTools();
    });
  }
}
