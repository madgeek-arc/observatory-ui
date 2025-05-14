
export function renderLogo(renderer: Highcharts.SVGRenderer, chartWidth: number, chartHeight: number) {
  // const logoWidth = 150; // Set your logo width
  // const logoHeight = 50; // Set your logo height
  const logoWidth = 270; // Set your logo width
  const logoHeight = 31; // Set your logo height
  const x = chartWidth - logoWidth - 20; // -5px from the right
  // const y = this.chartHeight - logoHeight + 5;
  const y = chartHeight - logoHeight;

  renderer.image('./assets/logo/svg/logoVertical3.png', x, y, logoWidth, logoHeight) // (./assets/logo/svg/EOSC OPEN SCIENCE OBSERVATORY LOGO.svg)
    .attr({
      zIndex: 10 // Ensure the logo is on top
    }).add();
}

export function createInfoBox(renderer: Highcharts.SVGRenderer, customLabelText: string, plotWidth: number) {
    // Define your custom label text
    const infoBox = renderer.label(customLabelText, 10, 10, null, null, null, true)
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
        borderRadius: 30,
      })
      .add();

    // Position the info box in the top right corner
    infoBox.translate(plotWidth - 260, 130);
}
