import { Locator, Page } from '@playwright/test';

/** Generic page object for an individual Energy Assessment task. */
export class AssessmentTaskPage {
  readonly saveChangesButton: Locator;
  readonly uploadImagesHeading: Locator;
  readonly fileInput: Locator;
  readonly uploadButton: Locator;
  readonly goBackToProjectDetailsLink: Locator;

  constructor(private readonly page: Page) {
    this.saveChangesButton = page.getByRole('button', {
      name: 'Save Changes',
      exact: true,
    });
    this.uploadImagesHeading = page.getByRole('heading', {
      name: 'Upload Images',
    });
    this.fileInput = page.getByLabel('Take photos or upload images');
    this.uploadButton = page.getByRole('button', { name: 'Upload', exact: true });
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });
  }

  async selectDropdownOption(label: string, optionName: string) {
    await this.page.getByRole('combobox', { name: label }).click();
    await this.page.getByRole('option', { name: optionName, exact: true }).click();
  }

  async fillField(label: string, value: string) {
    const field = this.page
      .getByRole('textbox', { name: label })
      .or(this.page.getByRole('spinbutton', { name: label }));
    await field.fill(value);
  }

  async checkCheckbox(label: string) {
    await this.page.getByRole('checkbox', { name: label }).check();
  }

  async expandSection(sectionTitle: string) {
    await this.page.getByText(sectionTitle, { exact: true }).click();
  }

  async uploadMeasureImage(filePath: string) {
    await this.uploadImagesHeading.click();
    await this.fileInput.setInputFiles(filePath);
    await this.uploadButton.click();
  }

  async saveChanges() {
    await this.saveChangesButton.click();
  }

  async goBackToProjectDetails() {
    await this.goBackToProjectDetailsLink.click();
  }
}
