import { ChartLoadCallbackFunction } from "highcharts";

export const renderLogo: ChartLoadCallbackFunction = function () {
  // const logoWidth = 150; // Set your logo width
  // const logoHeight = 50; // Set your logo height
  const logoWidth = 190; // Set your logo width
  const logoHeight = 40; // Set your logo height
  const x = this.chartWidth - logoWidth - 5; // -5px from the right
  // const y = this.chartHeight - logoHeight + 5;
  const y = this.chartHeight - logoHeight;

  this.renderer.image('./assets/logo/svg/logoVertical2.png', x, y, logoWidth, logoHeight) // (./assets/logo/svg/EOSC OPEN SCIENCE OBSERVATORY LOGO.svg)
    .attr({
      zIndex: 10 // Ensure the logo is on top
    }).add();
}

export function createInfoBox(customLabelText: string, plotWidth: number) {
  if (customLabelText) {
    // Define your custom label text
    const infoBox = this.renderer.label(customLabelText, 10, 10, null, null, null, true)
      .attr({
        fill: '#AAD3D7',
        padding: 10,
        zIndex: 5,
        borderWidth: 1,
        borderColor: '#AAD3D7',
        borderRadius: 30
      })
      .css({
        color: '#333',
        borderRadius: 30
      })
      .add();

    // Position the info box in the top right corner
    infoBox.translate(plotWidth - 180, 130);
  }
}
