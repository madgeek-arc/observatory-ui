import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { COUNTRY_PAGE_INDICATORS, IndicatorConfig } from "../../../domain/country-page-indicators";

export type IndicatorsMode = 'public' | 'config';

/**
 * Which document the admin is editing:
 *  - 'country': a specific country's own override (/stakeholders/{id}/indicators/overrides)
 *  - 'global':  the type-wide default that applies to every country without its own override
 *               (/indicators/defaults/{type})
 */
export type EditingScope = 'global' | 'country';

/**
 * How the admin config page presents the cards:
 *  - 'on-page': the live preview with a per-card toggle pinned on each card;
 *  - 'split':   the live preview (no per-card toggle) next to the left indicator list, which
 *               becomes the sole visibility control;
 *  - 'manage':  reserved / not implemented yet.
 */
export type ConfigViewMode = 'manage' | 'split' | 'on-page';

/**
 * Reserved path segment for the type-wide Global default editing scope. It is NOT a real country:
 * `/country/EU/configuration` edits the `eosc-sb` defaults document, while its page preview is
 * rendered from {@link GLOBAL_DATA_COUNTRY}'s survey data (there is no `sh-eosc-sb-EU` stakeholder).
 * Kept out of the shared `countries` list on purpose, so "Europe" never leaks into country pickers.
 */
export const GLOBAL_SCOPE_CODE = 'EU';

/** Real country whose survey data backs the Global default preview. */
export const GLOBAL_DATA_COUNTRY = 'FR';

/** Display label for the Global default scope ({@link GLOBAL_SCOPE_CODE} has no `countries` entry). */
export const GLOBAL_SCOPE_LABEL = 'Europe';

export interface IndicatorsPayload {
  indicators: IndicatorConfig[];
}

/** Per-country override document (/stakeholders/{id}/indicators/overrides). */
export interface OverrideDoc {
  id: string;
  stakeholderId: string;
  indicators: IndicatorConfig[];
}

/** Global default document (/indicators/defaults/{type}). */
export interface DefaultsDoc {
  id: string;
  type: string;
  indicators: IndicatorConfig[];
}

/** Lightweight summary row: which countries of a type have an override. */
export interface OverrideSummary {
  stakeholderId: string;
  country: string;
  hasOverrides: boolean;
}

/**
 * Holds the working visibility state for the Country Pages cards and talks to the
 * per-country override endpoints.
 *
 * State is exposed as signals so the `app-card-config` wrapper (and the config toolbar)
 * react automatically. HTTP methods return Observables and never subscribe internally
 * (that is the caller's job) — the state mutation methods below are pure/synchronous.
 */
@Injectable({ providedIn: 'root' })
export class CountryPageIndicatorsService {
  private http = inject(HttpClient);
  private readonly base = environment.API_ENDPOINT;

  /** Whether the shared section components are rendered on the admin config page or publicly. */
  readonly mode = signal<IndicatorsMode>('public');

  /** Which document the admin is currently editing — drives Publish (overrides vs defaults). */
  readonly editingScope = signal<EditingScope>('country');

  /**
   * Current config-page view. Single source of truth so the deeply-nested `app-card-config`
   * wrappers can react without @Input plumbing: the on-card toggle is hidden in 'split' (the
   * left indicator list controls visibility there instead).
   */
  readonly viewMode = signal<ConfigViewMode>('on-page');

  /** Working visibility, keyed by indicator id. */
  private readonly _visibility = signal<Map<string, boolean>>(this.defaultVisibility());
  readonly visibility = this._visibility.asReadonly();

  /**
   * Global-default visibility floor for the current country scope, keyed by indicator id.
   * Non-null only while editing a specific country: any indicator whose value here is `false`
   * is hidden by the Global default and therefore locked (its per-country toggle is disabled).
   * `null` in Global-default scope and on the public pages (nothing is locked).
   */
  private readonly _globalFloor = signal<Map<string, boolean> | null>(null);

  /**
   * Sections (catalog `group` labels) hidden as a whole from the live page — a layer above the
   * per-card visibility. A hidden section drops its cards AND its left-nav entry publicly; in the
   * admin preview it stays reachable but shows an informational notice.
   */
  private readonly _hiddenSections = signal<Set<string>>(new Set());
  readonly hiddenSections = this._hiddenSections.asReadonly();

  /** Snapshot taken at load time, used for dirty-check and Discard. */
  private pristine = new Map<string, boolean>(this.defaultVisibility());

  /** Section snapshot taken at load time, paired with {@link pristine} for dirty-check/Discard. */
  private pristineSections = new Set<string>();

  /** id of the currently loaded override/defaults document, so Publish updates it instead of leaving it blank. */
  private docId = '';

  /** True when the working visibility differs from the last loaded/saved snapshot. */
  readonly dirty = signal(false);

  private defaultVisibility(): Map<string, boolean> {
    return new Map(COUNTRY_PAGE_INDICATORS.map(i => [i.id, i.visible]));
  }

  /**
   * Rebuilds the working state from the catalog defaults, overlaying whatever the given
   * scope returned. Resets the dirty flag and the pristine snapshot.
   *
   * @param docId id of the document these overrides/defaults came from (empty string if the
   * scope has no document yet, e.g. a country with no override — Publish will then create one).
   * @param hiddenSections group labels hidden as a whole for this scope (empty if none).
   */
  setState(
    overrides: IndicatorConfig[] | null | undefined,
    docId: string = '',
    hiddenSections: string[] = []
  ): void {
    const map = this.defaultVisibility();
    for (const o of overrides ?? []) {
      if (map.has(o.id)) {
        map.set(o.id, o.visible);
      }
    }
    this._visibility.set(map);
    this.pristine = new Map(map);

    const sections = new Set(hiddenSections);
    this._hiddenSections.set(sections);
    this.pristineSections = new Set(sections);

    this.dirty.set(false);
    this.docId = docId;
  }

  isVisible(id: string): boolean {
    return this._visibility().get(id) ?? true;
  }

  /** Admin-facing label for an indicator id (from the catalog). */
  labelFor(id: string): string {
    return COUNTRY_PAGE_INDICATORS.find(i => i.id === id)?.label ?? '';
  }

  /**
   * Whether a card block (e.g. a section's left "container" card) should render at all, given
   * its cards' data availability:
   *  - public: at least one card has data AND is toggled visible;
   *  - config: always shown (country: any card with data; global: also placeholders), so every
   *    indicator stays reachable for toggling.
   * Lets a section drop its wrapper card entirely when all inner cards are hidden.
   */
  anyCardVisible(cards: Array<{ id: string; hasData: boolean }>): boolean {
    if (this.mode() === 'config') {
      return this.editingScope() === 'global' || cards.some(c => c.hasData);
    }
    return cards.some(c => c.hasData && this.isVisible(c.id));
  }

  /**
   * Records (country scope) or clears (global/public) the Global-default lock floor.
   * Pass the Global default's indicators while editing a specific country; pass null otherwise.
   */
  setGlobalFloor(indicators: IndicatorConfig[] | null | undefined): void {
    this._globalFloor.set(indicators ? new Map(indicators.map(i => [i.id, i.visible])) : null);
  }

  /**
   * True when the Global default hides this indicator while a specific country is being edited,
   * i.e. no per-country override may turn it back on from this admin UI.
   */
  isLocked(id: string): boolean {
    const floor = this._globalFloor();
    return this.editingScope() === 'country' && floor !== null && floor.get(id) === false;
  }

  /**
   * Effective visibility with the Global default floor applied: any indicator the Global default
   * hides (false) stays hidden regardless of the country's own value. Mirrors {@link isLocked},
   * but actually hides the card instead of just disabling a toggle.
   *
   * Used by the public pages, which must honour the Global floor that the backend's effective
   * endpoint does not apply. Pure/read-only — it does not touch the working state, so each
   * country's own stored choice is preserved (the floor only wins at display time).
   */
  applyGlobalFloor(
    indicators: IndicatorConfig[],
    defaults: IndicatorConfig[] | null | undefined
  ): IndicatorConfig[] {
    const floor = new Map((defaults ?? []).map(i => [i.id, i.visible]));
    return indicators.map(i => ({
      ...i,
      visible: floor.get(i.id) === false ? false : i.visible,
    }));
  }

  toggle(id: string): void {
    if (this.isLocked(id)) {
      return; // locked by the Global default — ignore attempts to flip it in country scope
    }
    const map = new Map(this._visibility());
    map.set(id, !(map.get(id) ?? true));
    this._visibility.set(map);
    this.recomputeDirty();
  }

  /** Whether a whole section (catalog `group`) is hidden from the live page. */
  isSectionHidden(group: string): boolean {
    return this._hiddenSections().has(group);
  }

  /** Show/hide an entire section. Independent of the per-card toggles within it. */
  toggleSection(group: string): void {
    const set = new Set(this._hiddenSections());
    if (set.has(group)) {
      set.delete(group);
    } else {
      set.add(group);
    }
    this._hiddenSections.set(set);
    this.recomputeDirty();
  }

  /** Total number of indicators (cards) in a section. */
  groupTotal(group: string): number {
    return COUNTRY_PAGE_INDICATORS.filter(i => i.group === group).length;
  }

  /** How many of a section's indicators are currently toggled visible (reactive via the signal). */
  groupVisibleCount(group: string): number {
    return COUNTRY_PAGE_INDICATORS.filter(i => i.group === group && this.isVisible(i.id)).length;
  }

  /** Reverts the working state back to the last loaded/saved snapshot. */
  discard(): void {
    this._visibility.set(new Map(this.pristine));
    this._hiddenSections.set(new Set(this.pristineSections));
    this.dirty.set(false);
  }

  /** Full catalog with the current working visibility applied — the Publish payload. */
  buildPayload(): IndicatorConfig[] {
    const map = this._visibility();
    return COUNTRY_PAGE_INDICATORS.map(i => ({ ...i, visible: map.get(i.id) ?? i.visible }));
  }

  /** Hidden section labels for the Publish payload (persistence-ready; see hiddenSections). */
  buildHiddenSections(): string[] {
    return [...this._hiddenSections()];
  }

  /** Marks dirty when either the per-card visibility or the hidden-sections set has drifted. */
  private recomputeDirty(): void {
    this.dirty.set(this.visibilityDirty() || this.sectionsDirty());
  }

  private visibilityDirty(): boolean {
    const map = this._visibility();
    for (const [id, value] of map) {
      if ((this.pristine.get(id) ?? true) !== value) {
        return true;
      }
    }
    return false;
  }

  private sectionsDirty(): boolean {
    const current = this._hiddenSections();
    if (current.size !== this.pristineSections.size) {
      return true;
    }
    for (const group of current) {
      if (!this.pristineSections.has(group)) {
        return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // HTTP — per-country override (admin editing scope)
  // ---------------------------------------------------------------------------

  getOverrides(stakeholderId: string): Observable<OverrideDoc> {
    return this.http.get<OverrideDoc>(`${this.base}/stakeholders/${stakeholderId}/indicators/overrides`);
  }

  putOverrides(stakeholderId: string, indicators: IndicatorConfig[]): Observable<OverrideDoc> {
    return this.http.put<OverrideDoc>(
      `${this.base}/stakeholders/${stakeholderId}/indicators/overrides`,
      { id: this.docId, stakeholderId, indicators }
    );
  }

  getEffective(stakeholderId: string): Observable<IndicatorsPayload> {
    return this.http.get<IndicatorConfig[]>(`${this.base}/stakeholders/${stakeholderId}/indicators`)
      .pipe(map(indicators => ({ indicators })));
  }

  /** Remove a country's override entirely, reverting it to the global default. */
  deleteOverrides(stakeholderId: string): Observable<OverrideDoc> {
    return this.http.delete<OverrideDoc>(`${this.base}/stakeholders/${stakeholderId}/indicators/overrides`);
  }

  /** Summary of all stakeholders of a type and whether each has an override. */
  getOverridesSummary(type: string): Observable<OverrideSummary[]> {
    return this.http.get<OverrideSummary[]>(`${this.base}/stakeholders/types/${type}/indicators/overrides`);
  }

  // ---------------------------------------------------------------------------
  // HTTP — global default (per stakeholder type, e.g. 'eosc-sb')
  // ---------------------------------------------------------------------------

  /** Load the global default document for a stakeholder type. */
  getDefaults(type: string): Observable<DefaultsDoc> {
    return this.http.get<DefaultsDoc>(`${this.base}/indicators/defaults/${type}`);
  }

  /** Create the global default document — first-time seed. */
  postDefaults(doc: DefaultsDoc): Observable<DefaultsDoc> {
    return this.http.post<DefaultsDoc>(`${this.base}/indicators/defaults`, doc);
  }

  /**
   * Save (update) the global default document for a stakeholder type.
   *
   * The backend rejects the PUT with 409 ("Resource body id different than path id") unless the
   * body id equals the stored document's id. We echo `docId` — the id captured from the last
   * getDefaults/setState — rather than guessing it, so the two always match.
   */
  putDefaults(type: string, indicators: IndicatorConfig[]): Observable<DefaultsDoc> {
    return this.http.put<DefaultsDoc>(
      `${this.base}/indicators/defaults/${type}`,
      { id: this.docId, type, indicators }
    );
  }

  /** Delete the global default document for a stakeholder type. */
  deleteDefaults(type: string): Observable<DefaultsDoc> {
    return this.http.delete<DefaultsDoc>(`${this.base}/indicators/defaults/${type}`);
  }
}
