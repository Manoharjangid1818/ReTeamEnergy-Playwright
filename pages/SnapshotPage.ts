import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import {
  APPLIANCE_FIELDS,
  APPLIANCE_SECTIONS,
  ApplianceSection,
} from '../test-data/energyAssessmentData';
import type {
  ApplianceSnapshotEdit,
  SnapshotEdit,
  WrittenApplianceEdit,
  WrittenEdit,
} from '../test-data/snapshotData';

/** Valid section titles in the Snapshot accordion view */
export type SnapshotSection =
  | 'Customer Information'
  | 'Customer Profile'
  | 'Property Profile'
  | 'Appliances';

/** Escapes special regex characters in strings */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Matches a form label exactly, tolerating optional leading/trailing '*', whitespace, and trailing colons */
function labelPattern(label: string): RegExp {
  const normalized = escapeRegExp(label).replace(/\\\./g, '\\.?').replace(/\\\//g, '[\\/\\s]+');
  return new RegExp(`^\\s*\\*?\\s*${normalized}[\\s*:]*$`, 'i');
}

/**
 * Page object for the Snapshot tab under Project Details.
 * Provides an accordion-based short-form with a unified 'Save All' button,
 * and assertions to verify synced values on the read-only profile tabs.
 */
export class SnapshotPage extends BasePage {
  readonly saveAllButton: Locator;

  /**
   * Initializes locators for the Snapshot page.
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    super(page);
    this.saveAllButton = page.getByRole('button', { name: 'Save All', exact: true });
  }

  // ---------- Snapshot accordions ----------

  /**
   * Locates the accordion header button for a Snapshot section.
   * Targets .MuiAccordionSummary-root to avoid matching navigation tabs.
   *
   * @param section Name of the accordion section
   */
  sectionHeader(section: SnapshotSection): Locator {
    const searchPattern = section.toLowerCase().includes('customer')
      ? /Customer (Profile|Information)/i
      : new RegExp(escapeRegExp(section), 'i');

    return this.page
      .locator('.MuiAccordionSummary-root')
      .filter({ hasText: searchPattern })
      .or(
        this.page
          .getByRole('button', { name: searchPattern })
          .filter({ hasNot: this.page.locator('[role="tab"]') })
      )
      .first();
  }

  /**
   * Expands an accordion section if it is currently collapsed.
   *
   * @param section Name of the accordion section to expand
   */
  async expandSection(section: SnapshotSection) {
    const header = this.sectionHeader(section);
    await expect(header).toBeVisible({ timeout: 15_000 });
    const ariaExpanded = await header.getAttribute('aria-expanded');
    const className = (await header.getAttribute('class')) || '';
    const isExpanded = ariaExpanded === 'true' || className.includes('Mui-expanded');
    if (!isExpanded) {
      await header.click();
      await expect(header)
        .toHaveAttribute('aria-expanded', 'true', { timeout: 5_000 })
        .catch(() => this.page.waitForTimeout(500));
    }
  }

  // ---------- Snapshot fields ----------

  /**
   * Locates a text input or textarea by label or placeholder.
   * Matches visible elements only so collapsed sections don't shift indices.
   *
   * @param label Accessible label or placeholder
   * @param index 0-based index among visible matching fields
   */
  textbox(label: string, index = 0): Locator {
    const pattern = labelPattern(label);
    return this.page
      .getByLabel(pattern)
      .or(this.page.getByPlaceholder(pattern))
      .or(
        this.page
          .locator('.MuiFormControl-root, .MuiTextField-root')
          .filter({ has: this.page.locator('label').filter({ hasText: pattern }) })
          .locator('input, textarea')
      )
      .filter({ visible: true })
      .nth(index);
  }

  /**
   * Resolves the matching input for an appliance section field.
   * Computes the index across appliance tabs based on APPLIANCE_FIELDS definitions.
   *
   * @param section Appliance section name
   * @param label Field label (e.g. 'kWh', 'Serial Number')
   */
  applianceTextbox(section: ApplianceSection, label: string): Locator {
    let index = 0;
    for (const s of APPLIANCE_SECTIONS) {
      if (s === section) break;
      index += APPLIANCE_FIELDS[s].filter((f) => f.label === label).length;
    }
    return this.textbox(label, index);
  }

  /**
   * Modifies fields in the active section and returns an array of written values.
   *
   * @param edits List of fields and candidate values to write
   */
  async changeFields(edits: SnapshotEdit[]): Promise<WrittenEdit[]> {
    const written: WrittenEdit[] = [];
    for (const edit of edits) {
      written.push({
        label: edit.label,
        value: await this.writeFirstDifferent(this.textbox(edit.label), edit.candidates),
      });
    }
    return written;
  }

  /**
   * Modifies appliance fields across sections and returns what was written.
   *
   * @param edits List of appliance fields and candidate values to write
   */
  async changeApplianceFields(edits: ApplianceSnapshotEdit[]): Promise<WrittenApplianceEdit[]> {
    const written: WrittenApplianceEdit[] = [];
    for (const edit of edits) {
      written.push({
        section: edit.section,
        label: edit.label,
        value: await this.writeFirstDifferent(
          this.applianceTextbox(edit.section, edit.label),
          edit.candidates,
        ),
      });
    }
    return written;
  }

  /**
   * Reads current input value and enters the first candidate that differs.
   */
  private async writeFirstDifferent(input: Locator, candidates: string[]): Promise<string> {
    await this.verifyVisible(input);
    const current = await input.inputValue();
    const next = candidates.find((c) => c !== current) ?? `${candidates[0]}-x`;
    await this.fillInput(input, next);
    return next;
  }

  /**
   * Clicks 'Save All' and races two outcomes:
   * (a) A successful backend response (POST, PUT, or PATCH with 2xx status) where saving completes
   * (b) The "Please fix the following before saving" validation alert
   *
   * In case (b), extracts all listed errors and throws an Error containing the full list.
   */
  async saveAll() {
    await expect(this.saveAllButton).toBeEnabled();

    // Prepare validation alert listener
    const alertHeading = this.page.getByText(
      /Please fix the following before saving/i
    );
    const alertPromise = alertHeading
      .waitFor({ state: 'visible', timeout: 20_000 })
      .then(() => ({ type: 'alert' as const }))
      .catch(() => null);

    // Prepare response listener: ensures write response arrives and all saves settle
    const responsePromise = (async () => {
      await this.page.waitForResponse(
        (res) =>
          ['POST', 'PUT', 'PATCH'].includes(res.request().method()) &&
          res.ok() &&
          !res.url().includes('/api/auth'),
        { timeout: 20_000 },
      );

      // Wait for "Saving…" button state to detach and success toast to appear
      await this.page
        .getByRole('button', { name: 'Saving…' })
        .waitFor({ state: 'detached', timeout: 20_000 })
        .catch(() => null);
      await this.page
        .getByText(/Saved successfully/i)
        .first()
        .waitFor({ state: 'visible', timeout: 20_000 })
        .catch(() => null);
      await this.page.waitForLoadState('networkidle').catch(() => null);

      return { type: 'response' as const };
    })().catch(() => null);

    // Click Save All
    await this.clickButton(this.saveAllButton);

    // Race the two outcomes
    const winner = await Promise.race([responsePromise, alertPromise]);

    if (winner?.type === 'alert') {
      const alertContainer = this.page.locator('.MuiAlert-root, [role="alert"]').filter({
        has: alertHeading,
      });

      const errorItems = await alertContainer
        .locator('li')
        .allInnerTexts()
        .catch(() => []);

      const formattedErrors = errorItems
        .map((text) => text.trim())
        .filter((text) => text.length > 0);

      const errorMessage =
        formattedErrors.length > 0
          ? formattedErrors.join('\n  - ')
          : 'Validation failed with unknown errors';

      throw new Error(
        `Save All blocked by validation:\n  - ${errorMessage}`
      );
    }

    if (winner?.type === 'response') {
      return;
    }

    // Fallback if neither resolved within race
    if (await alertHeading.isVisible().catch(() => false)) {
      const errorItems = await this.page
        .locator('[role="alert"] li')
        .allInnerTexts()
        .catch(() => []);
      throw new Error(
        `Save All blocked by validation:\n  - ${errorItems.join('\n  - ')}`
      );
    }

    // Await response directly to trigger standard timeout error if nothing happened
    await this.page.waitForResponse(
      (res) => ['POST', 'PUT', 'PATCH'].includes(res.request().method()) && res.ok(),
      { timeout: 1000 },
    );
  }

  // ---------- Verification on the read-only profile tabs ----------

  /**
   * Verifies that a field value is displayed as "Label: value" on read-only profile tabs.
   * Reads visible text from the page body.
   *
   * @param label Field label
   * @param value Expected displayed value
   */
  async expectProfileValue(label: string, value: string) {
    const normalizedLabel = escapeRegExp(label).replace(/\\\./g, '\\.?').replace(/\\\//g, '[\\/\\s]+');
    const pattern = new RegExp(`\\*?\\s*${normalizedLabel}[:\\s]+${escapeRegExp(value)}`, 'i');
    await expect(
      this.page.locator('body'),
      `"${label}" should show "${value}"`,
    ).toContainText(pattern, { useInnerText: true, timeout: 15_000 });
  }

  /**
   * Verifies an array of written fields on the read-only profile tabs.
   *
   * @param values Array of WrittenEdit objects
   */
  async expectProfileValues(values: WrittenEdit[]) {
    for (const { label, value } of values) {
      await this.expectProfileValue(label, value);
    }
  }
}
