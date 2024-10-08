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
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      /** Multi page export **/
      // const pdf = new JsPDF('p', 'mm', 'a4');
      //
      // const pageHeight = 295; // A4 height in mm
      //
      // let heightLeft = imgHeight;
      // let position = 0;
      //
      // pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      //
      // heightLeft -= pageHeight; // Reduce heightLeft by the available space minus bottom margin
      //
      // while (heightLeft >= 0) {
      //   position = heightLeft - imgHeight;
      //   pdf.addPage();
      //   pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      //   heightLeft -= pageHeight;
      // }

      /** Single sheet export **/
      // Create a PDF with custom height based on content
      const pdf = new JsPDF('p', 'mm', [imgWidth, imgHeight]);

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename);
    });

  }

}
