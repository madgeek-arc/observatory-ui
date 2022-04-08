import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {Survey, SurveyAnswer} from "../../../app/domain/survey";
import {zip} from "rxjs/internal/observable/zip";
import {FormControlService} from "../../services/form-control.service";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {SurveyService} from "../../../app/services/survey.service";
import {ActivatedRoute, Router} from "@angular/router";
import {
  Chapter,
  Field,
  Model,
  Tabs,
  UiVocabulary
} from "../../domain/dynamic-form-model";
import BitSet from "bitset";

import UIkit from "uikit";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-survey',
  templateUrl: 'survey.component.html',
  providers: [FormControlService]
})

export class SurveyComponent implements OnInit, OnChanges {

  @Input() surveyAnswers: SurveyAnswer = null;
  @Input() survey: Survey = null;
  @Input() tabsHeader : string = null;
  stakeholderId = null;

  subscriptions = [];
  surveyModel: Model;
  chapters: Chapter[] = [];
  chapterChangeMap: Map<string,boolean> = new Map<string, boolean>();
  currentChapter: Chapter = null;
  chapterForSubmission: Chapter = null;
  sortedSurveyAnswers: Object = {};
  vocabularies: Map<string, string[]>;
  subVocabularies: UiVocabulary[] = [];
  flatFields: Map<string, Field> = new Map<string, Field>();
  editMode = false;
  bitset: Tabs = new Tabs;

  ready = false;
  readonly : boolean = false;
  validate : boolean = false;
  errorMessage = '';
  successMessage = '';

  form: FormGroup;

  constructor(private formControlService: FormControlService, private fb: FormBuilder,
              private router: Router, private surveyService: SurveyService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.router.url.includes('/view')) {
      this.readonly = true;
    } else if (this.router.url.includes('/validate')) {
      this.validate = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    if (this.surveyAnswers) {
      this.editMode = true;

      this.subscriptions.push(
        zip(
          this.formControlService.getUiVocabularies(),
          this.formControlService.getFormModel(this.surveyAnswers.surveyId)
        ).subscribe(res => {
            this.vocabularies = res[0];
            res[1].chapters.sort((a, b) => a.order - b.order);
            this.surveyModel = res[1];
            this.chapters = [];
            for (const model of this.surveyModel.chapters) {
              for (const surveyAnswer in this.surveyAnswers.chapterAnswers) {
                if (model.id === this.surveyAnswers.chapterAnswers[surveyAnswer].chapterId) {
                  this.chapters.push(model);
                  this.chapterChangeMap.set(model.id, false);
                  this.sortedSurveyAnswers[model.id] = this.surveyAnswers.chapterAnswers[surveyAnswer].answer;
                  break;
                }
              }
            }
            this.currentChapter = this.surveyModel.chapters[0];
          },
          error => {
            this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
          },
          () => {
            this.form = this.fb.group({});
            this.createFieldMap(this.surveyModel);
            for (let i = 0; i < this.surveyModel.chapters.length; i++) {
              this.form.addControl(this.surveyModel.chapters[i].name, this.formControlService.toFormGroup(this.surveyModel.chapters[i].sections, true));
              if (this.sortedSurveyAnswers[Object.keys(this.sortedSurveyAnswers)[i]]) {
                this.prepareForm(this.sortedSurveyAnswers[Object.keys(this.sortedSurveyAnswers)[i]], this.surveyModel.chapters[i]);
              }
              // setTimeout( () => { // this removes ExpressionChangedAfterItHasBeenCheckedError, not the best solution, but it is what it is
                this.form.get(this.surveyModel.chapters[i].name).patchValue(this.sortedSurveyAnswers[Object.keys(this.sortedSurveyAnswers)[i]]);
              // }, 0);

            }
            // console.log(this.form.value);
            if (this.surveyAnswers.validated) {
              this.readonly = true;
              this.validate = false;
            } else if (this.validate) {
              UIkit.modal('#validation-modal').show();
            }

            setTimeout(() => {
              if (this.readonly) {
                this.form.disable();
              }
            }, 0);
            this.ready = true;
          })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  validateSurvey() {
    for (const chapterChangeMapElement of this.chapterChangeMap) {
      if (chapterChangeMapElement[1]) {
        UIkit.modal('#validation-modal').hide();
        this.errorMessage = 'There are unsaved changes, please submit all changes first and then validate.';
        return;
      }
    }
    if (this.form.valid) {
      this.subscriptions.push(
        this.route.params.subscribe( params => {
          this.stakeholderId = params['id'];
          console.log(this.stakeholderId);
          this.subscriptions.push(
            this.surveyService.changeAnswerValidStatus(this.surveyAnswers.id, !this.surveyAnswers.validated).subscribe(
              next => {
                UIkit.modal('#validation-modal').hide();
                this.router.navigate([`/contributions/${this.stakeholderId}/mySurveys`]);
              },
              error => {
                console.error(error);
              },
              () => {}
            )
          );
        })
      );
    } else {
      UIkit.modal('#validation-modal').hide();
      // console.log('Invalid form');
      this.form.markAllAsTouched();
      let str = '';
      for (let key in this.form.value) {
        // console.log(key + ': '+ this.form.get(key).valid);
        if (!this.form.get(key).valid) {
          str =  str + '\n\t-> ' + key;
        }
        for (const keyElement in this.form.get(key).value) {
          // console.log(keyElement + ': '+ this.form.get(key+'.'+keyElement).valid);
        }
      }
      this.errorMessage = 'There are missing fields at chapters ' + str;
    }
  }

  onSubmit() {
    window.scrollTo(0, 0);
    // this.showLoader = true;
    this.subscriptions.push(
      this.formControlService.postItem(this.surveyAnswers.id, this.form.get(this.chapterForSubmission.name).value, this.editMode).subscribe(
        res => {
          this.successMessage = 'Updated successfully!';
          this.chapterChangeMap.set(this.chapterForSubmission.id, false);
          UIkit.modal('#unsaved-changes-modal').hide();
        },
        error => {
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(error?.error?.error);
          // this.showLoader = false;
          UIkit.modal('#unsaved-changes-modal').hide();
          console.log(error);
        },
        () => {
          setTimeout(() => {
            UIkit.alert('#successMessage').close();
          }, 4000);
          // this.showLoader = false;
        }
      )
    );
  }

  showUnsavedChangesPrompt(chapter: Chapter) {
    if (this.chapterChangeMap.get(this.currentChapter.id)) {
      this.chapterForSubmission = this.currentChapter;
      UIkit.modal('#unsaved-changes-modal').show();
    }
    this.currentChapter = chapter;
  }

  getFormGroup(index: number): FormGroup {
    return this.form.get(this.surveyModel.chapters[index].name) as FormGroup;
  }

  setChapterChangesMap(chapterId: string[]) {
    if (chapterId[1] === null) {
      this.chapterChangeMap.set(chapterId[0], true);
    } else {
      this.chapterChangeMap.set(chapterId[0], false);
    }
  }

  /** create additional fields for arrays if needed --> **/
  prepareForm(form: Object, chapter: Chapter) {
    for (const [key, value] of Object.entries(form)) {
      // console.log(`${key}: ${value}`);
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // console.log(key + ' is object');
        this.prepareForm(value, chapter);
      } else if (Array.isArray(value)) {
        // console.log(key + ' is array');
        for (let i = 0; i < value.length-1; i++) {
          let path = this.createAccessPath(this.flatFields.get(key).name);
          this.push(path, this.flatFields.get(key).form.mandatory, chapter.name);
          if (typeof value[i] === 'object' && !Array.isArray(value[i])) {
            this.prepareForm(value[i], chapter);
          }
        }
      } else if (value === null) {
        // console.log(key+ ' is null');
      }
    }
  }

  createFieldMap(model: Model) {
    for (const chapter of model.chapters) {
      for (const section of chapter.sections) {
        this.createFieldMapRecursion(section.fields);
      }
    }
  }

  createFieldMapRecursion(fields: Field[]) {
    for (const field of fields) {
      if (field.typeInfo.multiplicity)
        this.flatFields.set(field.name, field);
      if (field.subFields.length > 0) {
        this.createFieldMapRecursion(field.subFields);
      }
    }
  }

  popComposite(group: string, field: string) {
    let tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.removeAt(0);
  }

  createAccessPath(fieldName: string) { // super junk method it only works if the name of the fields has a specific structure!
    let str = fieldName.split('-');
    let path = '';
    let subString = '';
    for (let i = 0; i < str.length; i++) {
      if (i === 0) {
        subString = str[i];
        path = subString;
      }
      else {
        subString = subString.concat('-', str[i]);
        path = path.concat('.', subString);
      }
    }
    return path;
  }

  push(path: string, mandatory: boolean, chapterName: string) {
    let tmpArr = this.form.get(chapterName).get(path) as FormArray;
    tmpArr.push(mandatory ? new FormControl('', Validators.required) : new FormControl(''));
  }

  pushComposite(group: string, field: string, subFields: Field[]) {
    const formGroup: any = {};
    subFields.forEach(subField => {
      if (subField.typeInfo.multiplicity) {
        formGroup[subField.name] = subField.form.mandatory ?
          new FormArray([new FormControl('', Validators.required)])
          : new FormArray([new FormControl('')]);
      } else {
        formGroup[subField.name] = subField.form.mandatory ? new FormControl('', Validators.required)
          : new FormControl('');
      }
    });
    let tmpArr = this.form.get(group).get(field) as FormArray;
    tmpArr.push(new FormGroup(formGroup));
  }
  /** <-- create additional fields for arrays if needed **/

  /** other stuff --> **/
  closeAlert() {
    this.errorMessage = '';
    UIkit.alert('#errorAlert').close();
  }
}
