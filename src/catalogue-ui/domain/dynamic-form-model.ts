import BitSet from 'bitset/bitset';

export class Group {
  id: string;
  name: string;
  required: boolean;
  order: number;

  constructor() {
    this.id = '';
    this.name = 'Untitled Group';
    this.required = false;
    this.order = 0;
  }
}

export class Required {
  topLevel: number;
  total: number;
}

export class Dependent {
  id: number;
  name: string;
}

export class TypeInfo {
  type: string;
  values: string[];
  vocabulary: string;
  multiplicity: boolean


  constructor() {
    this.type = 'string';
    this.values = [];
    this.vocabulary = null;
    this.multiplicity = false;
  }
}

export class Form {
  dependsOn: Dependent;
  affects: Dependent[];
  vocabulary: string;
  group: string;
  description: StyledText;
  suggestion: StyledText;
  placeholder: string;
  mandatory: boolean;
  immutable: boolean;
  display: Display;

  constructor() {
    this.dependsOn = null;
    this.affects = null;
    this.vocabulary = null;
    this.group = '';
    this.description = new StyledText();
    this.suggestion = new StyledText();
    this.placeholder = '';
    this.mandatory = false;
    this.immutable = false;
    this.display = new Display();
  }
}

export class Display {
  hasBorder: boolean;
  order: number;
  placement: string;
  visible: boolean;

  constructor() {
    this.hasBorder = false;
    this.order = 0;
    this.placement = '';
    this.visible = true;
  }
}

export class StyledText {
  cssClasses: string;
  style: string;
  text: string;

  constructor() {
    this.cssClasses = '';
    this.style = '';
    this.text = '';
  }
}

export class Field {
  id: string;
  name: string;
  parentId: string;
  parent: string;
  label: StyledText;
  accessPath: string;
  typeInfo: TypeInfo;
  includedInSnippet: boolean;
  form: Form;
  display: Display;

  constructor() {
    this.id = '';
    this.name = '';
    this.parentId = '';
    this.parent = '';
    this.label = new StyledText();
    this.accessPath = '';
    this.typeInfo = new TypeInfo()
    this.includedInSnippet = false;
    this.form = new Form();
    this.display = new Display();
  }
}

export class Fields {
  field: Field;
  subFieldGroups: Fields[];

  constructor() {
    this.field = new Field();
    this.subFieldGroups = null;
  }
}

export class FormModel {
  group: Group;
  fields: Fields[];
  required: Required;
}

export class UiVocabulary {
  id: string;
  name: string;
}

export class Tab {
  valid: boolean;
  order: number;
  requiredOnTab: number;
  remainingOnTab: number;
  bitSet: BitSet;

  constructor() {
    this.valid = false;
    this.order = 0;
    this.requiredOnTab = 0;
    this.remainingOnTab = 0;
  }

}

export class Tabs {
  tabs: Map<string, Tab>;
  requiredTabs: number;
  completedTabs: number;
  completedTabsBitSet: BitSet;
  requiredTotal: number;
}

export class HandleBitSet {
  field: Fields;
  position: number;
}
