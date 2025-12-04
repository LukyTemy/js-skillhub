import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import fontkit from '@pdf-lib/fontkit';

export class GeneratorService {
    async generate(studentName: string, courseName: string, dateStr: string): Promise<Buffer> {
        const templatePath = path.join(__dirname, '../assets/template_form.pdf');

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found at ${templatePath}`);
        }

        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        pdfDoc.registerFontkit(fontkit);

        const form = pdfDoc.getForm();

        const dateObj = new Date(dateStr);
        const formattedDate = `${dateObj.getDate()}. ${dateObj.getMonth() + 1}. ${dateObj.getFullYear()}`;

        try {
            const nameField = form.getTextField('student_name');
            nameField.setText(studentName);

            const courseField = form.getTextField('course_name');
            courseField.setText(courseName);

            const dateField = form.getTextField('date');
            dateField.setText(formattedDate);

        } catch (e) {
            console.error("Chyba: Názvy polí v PDF nesedí s kódem (student_name, course_name, date).", e);
        }

        form.flatten();

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}