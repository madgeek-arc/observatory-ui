import {User} from "./userInfo";

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

export class Chapter {
  id: string;
  name: string;
  description: string;
  sections: string[];
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
