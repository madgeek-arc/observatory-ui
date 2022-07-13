import {Stakeholder, User} from "./userInfo";

export class SurveyAnswer {
  id: string;
  surveyId: string;
  stakeholderId: string;
  chapterAnswers: Map<string, ChapterAnswer>;
  metadata: Metadata;
  validated: boolean;
  published: boolean;
  chapterId: string;
}

export class ChapterAnswer {
  chapterId: string;
  answer: Object;
  metadata: Metadata;
  id: string;
}

export class ResourcePermission {
  resourceId: string;
  permissions: string[];
}

export class Metadata {
  creationDate: string;
  createdDy: User;
  modificationDate: string;
  modifiedBy: User;
}

export class SurveyInfo {
  surveyId: string;
  surveyAnswerId: string;
  surveyName: string;
  validated: boolean;
  published: boolean;
  lastUpdate: Date;
  editedBy: string[];
  progressRequired: Progress;
  progressTotal: Progress;
  stakeholder: Stakeholder;
}

export class Progress {
  current: number;
  total: number;
}
