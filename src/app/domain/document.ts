export interface Document {
    docInfo: Content;
    text: string;
    sentences: string[];
    sentencesEn: string[];
    paragraphs: string[];
    paragraphsEn: string[];
    id: string;
    url: string;
    metadata: Metadata;
    references: reference[];
    status: string;
    source: string;
    curated: boolean;
}

export interface Content {
    title: string;
    originalTitles: string[];
    acronym: string;
    shortDescription: Description;
    abstract: Description;
    summary: Description;
    links: Link[];
    otherTags: string[];
    otherLinks: Link[];
    tags: string[];
    country: string;
    language: string;
    startDate: string;
    endDate: string;
    publicationDate: string;
    organisations: string[];
    authors: Author[];
    modificationDate: string;
}
export interface Description {
    text: string;
    generated: boolean;
}

export interface Link{
    name: string;
    pid:string;
    type: string;
    url: string;
    description: string;
}

export interface Metadata {
    createdby:string;
    creationDate: number;
    modifiedBy:string;
    modificationDate: number;
}

export interface reference {
    surveyAnswerId: string;
    fields: string[];
}

export interface Author {
    name: string;
    orcid: string;
}

