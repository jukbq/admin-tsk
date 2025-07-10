import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { MethodCookinResponse } from '../../shared/interfaces/method-cooking';
import { MethodService } from '../../shared/services/method/method.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-methods',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-methods.component.html',
  styleUrl: './list-methods.component.scss',
})
export class ListMethodsComponent {
  public metod: Array<MethodCookinResponse> = [];

  constructor(
    private metodCokingService: MethodService,
    private viewportScroller: ViewportScroller,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getMetod();
  }

  // Отримання страв  з сервера
  getMetod(): void {
    this.metodCokingService
      .getAll()
      .subscribe((data: any) => {
        this.metod = data as MethodCookinResponse[];
      });
  }

  // Видалення пункту меню
  delMetod(index: MethodCookinResponse) {
    this.metodCokingService.delmethodCookin(index.id as string).then(() => {
      this.getMetod();
    });
  }

  navigateToAddOrEditCategorie(action: string, object: any): void {
    this.router.navigate(['/add-method'], {
      queryParams: { action, object: JSON.stringify(object) },
    });
  }
}
