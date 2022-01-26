
export class PrivacyPolicy {
  id: string;
  type: string;
  activationDate: string;
}

export class AcceptedPrivacyPolicy {
  privacyPolicy: PrivacyPolicy;
  accepted: boolean;
}
