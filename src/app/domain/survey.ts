import {User} from "./userInfo";
import {Chapter} from "../../catalogue-ui/domain/dynamic-form-model";

export class Survey {
  id: string;
  name: string;
  description: string;
  notice: string;
  type: string;
  creationDate: string;
  createdBy: User;
  modificationDate: string;
  modifiedBy: User;
  chapters: Chapter[];
}


export class SurveyAnswer {
  surveyId: string;
  stakeholderId: string;
  answer: Object;
  metadata: Metadata;
  validated: boolean;
  published: boolean;
  id: string;
}

export class Metadata {
  creationDate: string;
  createdDy: User;
  modificationDate: string;
  modifiedBy: User;
}
