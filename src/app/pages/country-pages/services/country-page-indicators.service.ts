import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { COUNTRY_PAGE_INDICATORS, IndicatorConfig } from "../../../domain/country-page-indicators";

export type IndicatorsMode = 'public' | 'config';

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

  /** Working visibility, keyed by indicator id. */
  private readonly _visibility = signal<Map<string, boolean>>(this.defaultVisibility());
  readonly visibility = this._visibility.asReadonly();

  /** Snapshot taken at load time, used for dirty-check and Discard. */
  private pristine = new Map<string, boolean>(this.defaultVisibility());

  /** True when the working visibility differs from the last loaded/saved snapshot. */
  readonly dirty = signal(false);

  private defaultVisibility(): Map<string, boolean> {
    return new Map(COUNTRY_PAGE_INDICATORS.map(i => [i.id, i.visible]));
  }

  /**
   * Rebuilds the working state from the catalog defaults, overlaying whatever the given
   * scope returned. Resets the dirty flag and the pristine snapshot.
   */
  setState(overrides: IndicatorConfig[] | null | undefined): void {
    const map = this.defaultVisibility();
    for (const o of overrides ?? []) {
      if (map.has(o.id)) {
        map.set(o.id, o.visible);
      }
    }
    this._visibility.set(map);
    this.pristine = new Map(map);
    this.dirty.set(false);
  }

  isVisible(id: string): boolean {
    return this._visibility().get(id) ?? true;
  }

  toggle(id: string): void {
    const map = new Map(this._visibility());
    map.set(id, !(map.get(id) ?? true));
    this._visibility.set(map);
    this.recomputeDirty(map);
  }

  /** Reverts the working state back to the last loaded/saved snapshot. */
  discard(): void {
    this._visibility.set(new Map(this.pristine));
    this.dirty.set(false);
  }

  /** Full catalog with the current working visibility applied — the Publish payload. */
  buildPayload(): IndicatorConfig[] {
    const map = this._visibility();
    return COUNTRY_PAGE_INDICATORS.map(i => ({ ...i, visible: map.get(i.id) ?? i.visible }));
  }

  private recomputeDirty(map: Map<string, boolean>): void {
    for (const [id, value] of map) {
      if ((this.pristine.get(id) ?? true) !== value) {
        this.dirty.set(true);
        return;
      }
    }
    this.dirty.set(false);
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
      { id: '', stakeholderId, indicators }
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

  /** Save (update) the global default document for a stakeholder type. */
  putDefaults(type: string, doc: DefaultsDoc): Observable<DefaultsDoc> {
    return this.http.put<DefaultsDoc>(`${this.base}/indicators/defaults/${type}`, doc);
  }

  /** Delete the global default document for a stakeholder type. */
  deleteDefaults(type: string): Observable<DefaultsDoc> {
    return this.http.delete<DefaultsDoc>(`${this.base}/indicators/defaults/${type}`);
  }
}
