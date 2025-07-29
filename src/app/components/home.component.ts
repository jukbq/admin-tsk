import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

interface MenuItem {
  name: string;
  link: string;
  subItems?: MenuItem[];
}

const LIST: MenuItem[] = [
  { name: 'Рецепти', link: 'recipes' },
  {
    name: 'Данні рецепта',
    link: '#',
    subItems: [
      { name: 'Страви', link: 'dishes' },
      { name: 'Категорії', link: 'categories' },
      { name: 'Кухні', link: 'countries' },
      { name: 'Регіонги', link: 'regions' },
      { name: 'Категорії продуктів', link: 'productCategory' },
      { name: 'Продукти', link: 'products' },
      { name: 'Одиниці виміру', link: 'units' },
      { name: 'Інструменти', link: 'tools' },
      { name: 'Свята', link: 'holiday' },
      { name: 'Тип рецепта', link: 'rcipe-tyoe' },
    ],
  },
  {
    name: 'Статті',
    link: '#',
    subItems: [{ name: 'Про продукти', link: 'about-products' }],
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  list: MenuItem[] = LIST;
  activeItem: number | undefined;
  activeSubItem: number | undefined;
  close: boolean = true;
  logout: boolean = true;

  constructor(

  ) { }

  onSelectItem(i: number): void {
    if (this.activeItem !== i) {
      this.activeItem = i;
    } else {
      this.activeItem = undefined;
    }
  }

  onSelectSubItem(link: any, j: number): void {
    this.activeSubItem = j;
    this.close = false;
  }

  openMenu() {
    this.close = !this.close;
  }


}
