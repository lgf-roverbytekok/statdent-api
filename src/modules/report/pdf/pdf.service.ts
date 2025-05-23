import { Injectable } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  constructor() {
    // this.registerPartials();
    this.registerHelpers();
  }

  private registerPartials() {
    const partialsDir = path.join(__dirname, 'templates', 'partials');
    fs.readdirSync(partialsDir).forEach((file) => {
      const name = path.basename(file, '.hbs');
      const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');
      handlebars.registerPartial(name, content);
    });
  }

  private registerHelpers() {
    // Multiplica dos valores (útil para calcular colspan dinámicos)
    handlebars.registerHelper('multiply', (a: any, b: any) => {
      const na = Number(a);
      const nb = Number(b);
      return isNaN(na) || isNaN(nb) ? 0 : na * nb;
    });

    // (Opcional) Devuelve edad × 2, igual que multiply(ageGroups.length,2)
    // Calcula cuántas columnas ocupa el bloque de ageGroups
    handlebars.registerHelper('calcAgeCols', (ageGroups: any[]) => {
      return ageGroups.length * 2;
    });

    handlebars.registerHelper('inc', function (value) {
      return parseInt(value) + 1;
    });

    // Cualquier otro helper...
  }

  private compileTemplate(templateName: string, data: any): string {
    const layoutPath = path.join(__dirname, 'templates', 'layouts', 'main.hbs');
    const pagePath = path.join(
      __dirname,
      'templates',
      'pages',
      `${templateName}.hbs`,
    );

    const layout = fs.readFileSync(layoutPath, 'utf8');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    const compiledPage = handlebars.compile(pageContent)(data);

    const fullTemplate = handlebars.compile(layout);
    return fullTemplate({ ...data, body: compiledPage });
  }

  /*  async generatePdf2(templateName: string, data: any): Promise<Buffer> {
    // Compilar HTML con Handlebars
    const html = this.compileTemplate(templateName, data);

    // Lanzar Puppeteer y generar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return Buffer.from(pdf);
  }*/

  async generatePdf(data: any): Promise<Buffer> {
    const templatePath = path.join(
      __dirname,
      'templates',
      'report-template.hbs',
    );
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    const template = handlebars.compile(templateHtml);

    const html = template(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
