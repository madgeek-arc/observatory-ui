
export function renderLogo(renderer: Highcharts.SVGRenderer, chartWidth: number, chartHeight: number) {

  // const logoWidth = 150; // Set your logo width
  // const logoHeight = 50; // Set your logo height
  let logoWidth = 270; // Set your logo width
  let logoHeight = 31; // Set your logo height

  const screenWidth: number = window.innerWidth;
  if(screenWidth<960) {
    logoWidth = 200; // Set your logo width
    logoHeight = 25; // Set your logo height
  }

  const x = chartWidth - logoWidth - 20; // -5px from the right
  // const y = this.chartHeight - logoHeight + 5;
  const y = chartHeight - logoHeight;

  renderer.image('./assets/logo/svg/logoVertical3.png', x, y, logoWidth, logoHeight) // (./assets/logo/svg/EOSC OPEN SCIENCE OBSERVATORY LOGO.svg)
    .attr({
      zIndex: 10 // Ensure the logo is on top
    }).add();
}

// export function createInfoBox(renderer: Highcharts.SVGRenderer, customLabelText: string, plotWidth: number) {
//     // Define your custom label text
//     const infoBox = renderer.label(customLabelText, 10, 10, null, null, null, true)
//       .attr({
//         fill: '#AAD3D7',
//         // padding: 10,
//         padding: 5,
//         zIndex: 5,
//         borderWidth: 1,
//         borderColor: '#AAD3D7',
//         borderRadius: 30
//       })
//       .css({
//         color: '#333',
//         borderRadius: 30,
//       })
//       .add();
//
//     // Position the info box in the top right corner
//     // infoBox.translate(plotWidth - 260, 130);
//   infoBox.translate(plotWidth - 460, 30);
// }

export function createInfoBox(renderer: Highcharts.SVGRenderer, customLabelText: string, chartWidth: number, chartHeight: number, plotWidth: number, plotHeight: number, plotTop: number) {
  const padding = 10;

  const infoBox = renderer.label(customLabelText, 0, 0, null, null, null, true)
    .attr({
      fill: '#AAD3D7',
      padding: 5,
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

  // After the label is rendered, calculate its dimensions and reposition
  const bBox = infoBox.getBBox();

  console.log('chartHeight', chartHeight);
  console.log('plotHeight', plotHeight);
  console.log('plotTop', plotTop);

  // const x = chartWidth - bBox.width - padding;
  // const y = chartHeight - bBox.height - padding;
  // const x = chartWidth - bBox.width - 15;
  const x = plotWidth - bBox.width;
  // let y = padding + 45;
  const y = plotTop - bBox.height + 10;

  console.log('x', x);
  console.log('y', y);

  // const screenWidth: number = window.innerWidth;
  // if(screenWidth<960) {
  //   y = padding + 90;
  // }

  infoBox.translate(x, y);
}

