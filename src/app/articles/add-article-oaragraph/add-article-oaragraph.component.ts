import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { Storage, deleteObject, getDownloadURL, percentage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RecipesService } from '../../shared/services/recipes/recipes.service';

@Component({
  selector: 'app-add-article-oaragraph',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditorComponent],
  templateUrl: './add-article-oaragraph.component.html',
  styleUrl: './add-article-oaragraph.component.scss',
})
export class AddArticleOaragraphComponent {
  @ViewChild('selectParagraph') paragraphSelect!: MatSelect;
  paragraphForm!: FormGroup;
  paragraph_edit_status = false;
  pIndex!: number;
  paragraphImage = '';
  articleContent: any[] = [];
  uploadPercent!: number;
  slug: string | undefined;

  query: string = '';
  allRecipes: any[] = [];
  searchResults: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private storsge: Storage,
    private route: ActivatedRoute,
    private router: Router,
    public dialogRef: MatDialogRef<AddArticleOaragraphComponent>,
    private recipeService: RecipesService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      object: 'add' | 'edit';
      articleContent: any;
      slug: any;
    }
  ) {}

  ngOnInit(): void {
    this.initparagraphForm();
    if (this.data.object === 'edit') {
      this.articleContent = this.data.articleContent;
      this.slug = this.data.slug;
    } else {
      this.slug = this.data.slug;
    }
  }

  //ініцілізація форми параграфів
  initparagraphForm() {
    this.paragraphForm = this.formBuilder.group({
      paragraphName: [null],
      description: [null],
      imageSize: [null],
      recipeID: [null],
      recipeName: [null],
    });
  }

  //додати параграф
  addParagraph(): void {
    if (this.paragraph_edit_status == true) {
      const editedParagraphName = this.paragraphForm.value.paragraphName;
      const editedDescription = this.paragraphForm.value.description;
      const editedimageSize = this.paragraphForm.value.imageSize;
      const editedParagraphImage = this.paragraphImage;
      const editedRecipeID = this.paragraphForm.value.recipeID;
      const editedRecipeName = this.paragraphForm.value.recipeName;

      // Оновлення значень у відповідному об'єкті масиву instructions
      this.articleContent[this.pIndex].paragraphName = editedParagraphName;
      this.articleContent[this.pIndex].description = editedDescription;
      this.articleContent[this.pIndex].imageSize = editedimageSize;
      this.articleContent[this.pIndex].paragraphImage = editedParagraphImage;
      this.articleContent[this.pIndex].recipeID = editedRecipeID;
      this.articleContent[this.pIndex].recipeName = editedRecipeName;

      // Очищення даних у формах після редагування
      this.paragraphForm.reset();
      this.paragraphImage = '';
    } else {
      const newParagraph = {
        paragraphName: this.paragraphForm.value.paragraphName,
        description: this.paragraphForm.value.description,
        imageSize: this.paragraphForm.value.imageSize,
        recipeID: this.paragraphForm.value.recipeID,
        recipeName: this.paragraphForm.value.recipeName,
        paragraphImage: this.paragraphImage,
      };

      this.articleContent.push(newParagraph);

      if (this.paragraphSelect) {
        this.paragraphSelect.writeValue(null);
      }

      // Очищення даних у формах
      this.paragraphForm.reset();
      this.paragraphImage = '';
    }
  }

  //редагувати парагграф
  editParagraph(i: number) {
    this.paragraph_edit_status = true;
    this.pIndex = i;
    this.paragraphImage = this.articleContent[i].paragraphImage || '';
    this.paragraphForm.patchValue({
      paragraphName: this.articleContent[i].paragraphName || '',
      description: this.articleContent[i].description || '',
      imageSize: this.articleContent[i].imageSize || '',
      recipeID: this.articleContent[i].recipeID || '',
      recipeName: this.articleContent[i].recipeName || '',
    });
  }

  //видалити крок
  delParagraph(index: any): void {
    const task = ref(this.storsge, index.imageSize);
    deleteObject(task);
    this.articleContent.splice(index, 1);
  }

  async uploadParagraphImage(actionImage: any): Promise<void> {
    const file = actionImage.target.files[0];
    const previousImageURL = this.paragraphImage;
    this.paragraphImage = '';
    if (previousImageURL) {
      this.uploadPercent = 0;
      const task = ref(this.storsge, previousImageURL);
      await deleteObject(task);
    }

    this.loadFile(`article-page/${this.slug}`, file.name, file)
      .then((data) => {
        if (this.uploadPercent == 100) {
          this.paragraphImage = data;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Завантаження файлу в хмарне сховище
  async loadFile(
    folder: string,
    name: string,
    file: File | null
  ): Promise<string> {
    const pathIcon = `${folder}/${name}`;
    let urlIcon = '';
    if (file) {
      try {
        const storageRef = ref(this.storsge, pathIcon);
        const task = uploadBytesResumable(storageRef, file);
        percentage(task).subscribe((data: { progress: number }) => {
          this.uploadPercent = data.progress;
        });
        await task;
        urlIcon = await getDownloadURL(storageRef);
      } catch (e: any) {
        console.error(e);
      }
    } else {
      console.log('Wrong file');
    }
    return Promise.resolve(urlIcon);
  }

  save(): void {
    const articleContent = this.articleContent;
    this.dialogRef.close({
      articleContent: this.articleContent,
    });
  }

  test() {
    console.log(this.articleContent);
  }

  onSearch(): void {
    if (this.query.length >= 3) {
      this.recipeService.searchRecipes(this.query).subscribe((results) => {
        this.allRecipes = results;
        this.searchResults = this.allRecipes;
      });
    } else {
      this.searchResults = [];
    }
  }

  selectRecipe(recipeData: any) {
    this.paragraphForm.patchValue({
      recipeID: recipeData.id,
      recipeName: recipeData.recipeTitle,
    });

    this.query = '';

  }
}
