import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-add-insyruction',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditorComponent],
  templateUrl: './add-insyruction.component.html',
  styleUrl: './add-insyruction.component.scss',
})

export class AddInsyructionComponent {
  @ViewChild('stepSelect') stepSelect!: MatSelect;
  instructions: any[] = [];
  selectStep = {
    stepImage: '',
    stepName: '',
    description: '',
    fullDescription: '',
  };
  uploadPercent!: number;
  filteredStep: any[] = [];
  stepImage = '';
  group: any = [];
  stepForm!: FormGroup;
  edit_status = false;
  gIndex!: number;
  sIndex!: number;

  constructor(
    private formBuilder: FormBuilder,
    private storsge: Storage,
    public dialogRef: MatDialogRef<AddInsyructionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      object: 'add' | 'edit';
      instructions: any;
    }
  ) { }

  ngOnInit(): void {
    this.addGroup();
    this.initStepForm();
    //отримання даних з батьківського компонента
    if (this.data.object === 'edit') {

      this.instructions = this.data.instructions;
      //фільтрація кроків
      const selectedStepFromData =
        this.data.instructions[0]?.group[0]?.selectedStep;

      if (selectedStepFromData) {
        const selectedStep = this.filteredStep.find(
          (step) => step.name === selectedStepFromData.name
        );

        if (selectedStep) {
          this.instructions[0].group[0].selectedProduct = selectedStep;
        }
      }
    }
  }

  //ініцілізація форми
  initStepForm() {
    this.stepForm = this.formBuilder.group({
      stepName: [null],
      description: [null],
      fullDescription: [null],
    });
  }

  //додати групу
  addGroup(): void {
    this.instructions.push({ groupName: '', group: [] });
  }

  //видалити групу
  delGroup(index: number): void {
    this.instructions.splice(index, 1);
  }

  //**************************** *//
  //переміщення кроків
  moveSteptUp(groupIndex: number, stepIndex: number): void {
    if (stepIndex > 0) {
      const currentIngredient = this.instructions[groupIndex].group[stepIndex];
      const previousIngredient =
        this.instructions[groupIndex].group[stepIndex - 1];

      this.instructions[groupIndex].group[stepIndex] = previousIngredient;
      this.instructions[groupIndex].group[stepIndex - 1] = currentIngredient;
    }
  }

  moveStepDown(groupIndex: number, stepIndex: number): void {
    const ingredientsLength = this.instructions[groupIndex].group.length;

    if (stepIndex < ingredientsLength - 1) {
      const currentIngredient = this.instructions[groupIndex].group[stepIndex];
      const nextIngredient = this.instructions[groupIndex].group[stepIndex + 1];

      this.instructions[groupIndex].group[stepIndex] = nextIngredient;
      this.instructions[groupIndex].group[stepIndex + 1] = currentIngredient;
    }
  }
  //***************************** *//
  //ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ
  // Завантаження зображення
  async uploadStepImage(actionImage: any): Promise<void> {
    const file = actionImage.target.files[0];
    const previousImageURL = this.stepImage;
    const task = ref(this.storsge, previousImageURL);
    if (previousImageURL) {
      deleteObject(task).then(() => {
        this.uploadPercent = 0;
      });
    }

    this.loadFIle('recipe-step-images', file.name, file)
      .then((data) => {
        if (this.uploadPercent == 100) {
          this.stepImage = data;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Завантаження файлу в хмарне сховище
  async loadFIle(
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

  //*************************/

  //додати крок
  addStep(index: number): void {
    if (this.edit_status == true) {
      const editedStepImage = this.stepImage;
      const editedStepName = this.stepForm.value.stepName;
      const editedDescription = this.stepForm.value.description;
      const editFullDescription = this.stepForm.value.fullDescription;

      // Оновлення значень у відповідному об'єкті масиву instructions
      this.instructions[this.gIndex].group[this.sIndex].stepImage =
        editedStepImage;
      this.instructions[this.gIndex].group[this.sIndex].stepName =
        editedStepName;
      this.instructions[this.gIndex].group[this.sIndex].description =
        editedDescription;
      this.instructions[this.gIndex].group[this.sIndex].fullDescription =
        editFullDescription;

      // Очищення даних у формах після редагування
      this.stepForm.reset();
      this.stepImage = '';
      this.stepForm.patchValue({ fullDescription: '' });
    } else {
      const newStep = {
        stepImage: this.stepImage,
        stepName: this.stepForm.value.stepName,
        description: this.stepForm.value.description,
        fullDescription: this.stepForm.value.fullDescription,
      };

      this.instructions[index].group.push(newStep);

      if (this.stepSelect) {
        this.stepSelect.writeValue(null);
      }

      // Очищення даних у формах
      this.stepForm.reset();
      this.stepImage = '';
      this.group = {}; // або можна по-черзі очистити поля group */
    }
  }

  //редагувати крок
  editStep(i: number, j: number) {
    this.edit_status = true;
    this.gIndex = i;
    this.sIndex = j;
    this.stepImage = this.instructions[i].group[j].stepImage;
    this.stepForm.patchValue({
      stepName: this.instructions[i].group[j].stepName || '',
      description: this.instructions[i].group[j].description || '',
      fullDescription: this.instructions[i].group[j].fullDescription || '',
    });
  }

  //видалити крок
  delStep(i: number, j: number): void {
    this.instructions[i].group.splice(j, 1);
  }

  test() {
    console.log(this.instructions);
  }

  //зберегти
  save(): void {
    this.dialogRef.close({
      instructions: this.instructions,
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
