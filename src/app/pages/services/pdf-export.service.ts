import { Injectable } from "@angular/core";
import html2canvas from "html2canvas";
import JsPDF from "jspdf";

@Injectable({
  providedIn: 'root',
})

export class PdfExportService {

  export(content: HTMLElement, filename: string = 'exported-page.pdf') {

    html2canvas(content).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new JsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename);
    });

  }

}
