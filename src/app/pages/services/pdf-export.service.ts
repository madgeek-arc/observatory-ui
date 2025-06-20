import { Injectable } from "@angular/core";
import html2canvas from "html2canvas";
import JsPDF from "jspdf";

@Injectable({
  providedIn: 'root',
})

export class PdfExportService {

  export(contents: HTMLElement[], filename: string = 'exported-page.pdf'): Promise<void> {
    return new Promise((resolve, reject) => {
      const pdf = new JsPDF('p', 'mm', 'a4');

      const pageHeight = 297; // A4 page height in mm
      const pageWidth = 210; // A4 page width in mm
      const margin = 0; // Add a margin to leave space around content
      let currentYPosition = margin; // Start with some top margin

      const footerHeight = 17; // Reserve 17mm for the footer
      const footerYPosition = pageHeight - 15; // 15mm from bottom

      const logoUrl = 'assets/logo/svg/logoVertical2.png'; // Logo path
      const currentDate = new Date().toLocaleDateString('en-GB'); // formatted date
      const predefinedText: string[] = [
        'Exported from the EOSC Open Science Observatory on ' + currentDate,
        'EOSC Open Science Observatory has received funding from the European Union’s Horizon Europe framework programme under grant agreement No. 101148217 (EOSC Track) and builds upon EOSC Observatory funded by the European Union’s Horizon 2020 Research and Innovation programme under EOSC Future (No. 101017536).'
      ];

      const addFooter = () => {
        // Add the predefined text
        pdf.setFontSize(8);
        pdf.text(predefinedText, 10, footerYPosition, {maxWidth: 150});

        // // Add the current date
        // pdf.text(currentDate, 100, footerYPosition); // adjust X position as needed

        // Add logo
        const logoWidth = 42;
        const logoHeight = 7;
        pdf.addImage(logoUrl, 'PNG', 165, footerYPosition + 4, logoWidth, logoHeight); // Adjust Y for better alignment
      };


      // Show the loading spinner
      const spinner = document.getElementById('loadingSpinner');
      if (spinner) spinner.style.display = 'block'; // Show spinner

      // Helper function to process each element
      const processElement = (index: number) => {
        if (index >= contents.length) {
          addFooter(); // Add footer to the last page
          // All elements processed, save the PDF
          pdf.save(filename);
          resolve(); // Resolve the promise after completion
          return;
        }

        const element = contents[index];

        html2canvas(element).then(canvas => {
          const imgData = canvas.toDataURL('image/png');

          // Scale the image width to fit within the page width
          let imgWidth = pageWidth - 2 * margin; // A4 width in mm with margin
          let imgHeight = (canvas.height * imgWidth) / canvas.width; // Scale the height proportionally

          // Check if the element height exceeds the page height
          if (imgHeight > pageHeight - 2 * margin) {
            // Shrink the image to fit within a single A4 page
            const scale = (pageHeight - 2 * margin) / imgHeight;
            imgHeight *= scale; // Shrink the height
            imgWidth *= scale; // Also proportionally shrink the width
          }

          // Check if the image fits in the remaining space on the current page
          if (currentYPosition + imgHeight + footerHeight > pageHeight - margin) {
            addFooter(); // Add footer before starting a new page
            pdf.addPage(); // Add a new page if it doesn't fit
            currentYPosition = margin; // Reset Y position for the new page
          }

          // Add the image to the current page at the current Y position
          pdf.addImage(imgData, 'PNG', margin, currentYPosition, imgWidth, imgHeight);

          // Update the current Y position for the next element
          currentYPosition += imgHeight + margin; // Add margin between elements

          // Process the next element
          processElement(++index);
        }).catch(error => {
          reject(error); // Catch and reject the promise in case of an error
        });
      };

      // Start processing elements
      processElement(0);
    });
  }



  // export(content: HTMLElement, filename: string = 'exported-page.pdf') {
  //
  //   html2canvas(content).then(canvas => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const imgWidth = 210; // A4 width in mm
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //
  //     /** Single sheet export **/
  //     // Create a PDF with custom height based on content
  //     const pdf = new JsPDF('p', 'mm', [imgWidth, imgHeight]);
  //
  //     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  //     pdf.save(filename);
  //   });
  //
  // }

}
