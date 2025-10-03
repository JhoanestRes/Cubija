(function() {
  'use strict';

  // Elementos del DOM
  const boxLengthInput = document.getElementById('boxLength');
  const boxWidthInput = document.getElementById('boxWidth');
  const boxHeightInput = document.getElementById('boxHeight');
  const palletLengthInput = document.getElementById('palletLength');
  const palletWidthInput = document.getElementById('palletWidth');
  const maxStackHeightInput = document.getElementById('maxStackHeight');

  const resultsGrid = document.getElementById('resultsGrid');
  const visualization = document.getElementById('visualization');
  const resultsSection = document.getElementById('resultsSection');
  const noResults = document.getElementById('noResults');

  let results = [];
  let selectedResultIndex = 0;

  // Obtener valores de inputs con validación
  function getInputValues() {
    return {
      boxLength: Math.max(0, parseFloat(boxLengthInput.value) || 0),
      boxWidth: Math.max(0, parseFloat(boxWidthInput.value) || 0),
      boxHeight: Math.max(0, parseFloat(boxHeightInput.value) || 0),
      palletLength: Math.max(0, parseFloat(palletLengthInput.value) || 0),
      palletWidth: Math.max(0, parseFloat(palletWidthInput.value) || 0),
      maxStackHeight: Math.max(0, parseFloat(maxStackHeightInput.value) || 0)
    };
  }

  // Cálculo principal de opciones de cubicaje
  function calculatePacking() {
    const values = getInputValues();

    if (
      values.boxLength <= 0 || values.boxWidth <= 0 || values.boxHeight <= 0 ||
      values.palletLength <= 0 || values.palletWidth <= 0 || values.maxStackHeight <= 0
    ) {
      showNoResults();
      return;
    }

    const orientations = [
      { x: values.boxLength, y: values.boxWidth, z: values.boxHeight, name: 'Largo x Ancho x Alto' },
      { x: values.boxWidth, y: values.boxLength, z: values.boxHeight, name: 'Ancho x Largo x Alto' },
      { x: values.boxLength, y: values.boxHeight, z: values.boxWidth, name: 'Largo x Alto x Ancho' },
      { x: values.boxHeight, y: values.boxLength, z: values.boxWidth, name: 'Alto x Largo x Ancho' },
      { x: values.boxWidth, y: values.boxHeight, z: values.boxLength, name: 'Ancho x Alto x Largo' },
      { x: values.boxHeight, y: values.boxWidth, z: values.boxLength, name: 'Alto x Ancho x Largo' }
    ];

    results = [];

    orientations.forEach(function(dim, index) {
      if (dim.z > values.maxStackHeight || dim.x === 0 || dim.y === 0) return;

      const boxesX = Math.floor(values.palletLength / dim.x);
      const boxesY = Math.floor(values.palletWidth / dim.y);
      const layers = Math.floor(values.maxStackHeight / dim.z);

      if (boxesX > 0 && boxesY > 0 && layers > 0) {
        const boxesPerLayer = boxesX * boxesY;
        const totalBoxes = boxesPerLayer * layers;
        const palletArea = values.palletLength * values.palletWidth;
        if (palletArea === 0) return;
        const usedArea = (dim.x * boxesX) * (dim.y * boxesY);
        let efficiency = (usedArea / palletArea) * 100;
        efficiency = Math.round(efficiency * 10) / 10;

        results.push({
          index: index + 1,
          orientation: 'Opción ' + (index + 1) + ': ' + dim.name,
          boxesPerLayer: boxesPerLayer,
          layers: layers,
          totalBoxes: totalBoxes,
          efficiency: efficiency,
          dimensions: { x: dim.x, y: dim.y, z: dim.z },
          boxesX: boxesX,
          boxesY: boxesY
        });
      }
    });

    results.sort(function(a, b) { return b.efficiency - a.efficiency; });

    if (results.length > 0) {
      selectedResultIndex = 0;
      renderResults();
      renderVisualization();
      resultsSection.style.display = 'block';
      noResults.style.display = 'none';
    } else {
      showNoResults();
    }
  }

  // Renderizar lista de resultados
  function renderResults() {
    resultsGrid.innerHTML = '';

    results.forEach(function(result, idx) {
      const resultDiv = document.createElement('div');
      resultDiv.className = 'result-card ' + (idx === selectedResultIndex ? 'selected' : '');

      const headerHTML = '<div class="result-header"><h3>' + result.orientation + '</h3>' +
        '<div class="efficiency-badge efficiency-' + getEfficiencyClass(result.efficiency) + '">' +
        result.efficiency + '% eficiencia</div></div>';
      const detailsHTML = '<div class="result-details">' +
        '<div>Dimensiones: ' + result.dimensions.x + 'x' + result.dimensions.y + 'x' + result.dimensions.z + ' cm</div>' +
        '<div>' + result.boxesPerLayer + ' cajas/capa x ' + result.layers + ' capas</div>' +
        '<div class="total-boxes">Total: ' + result.totalBoxes + ' cajas</div></div>';

      resultDiv.innerHTML = headerHTML + detailsHTML;

      resultDiv.addEventListener('click', function() { selectResult(idx); });
      resultsGrid.appendChild(resultDiv);
    });
  }

  // Seleccionar resultado
  function selectResult(index) {
    selectedResultIndex = index;
    renderResults();
    renderVisualization();
  }

  // Renderizar visualización 2D y 3D
  function renderVisualization() {
    if (results.length === 0) return;

    const result = results[selectedResultIndex];
    const values = getInputValues();
    const palletLength = values.palletLength;
    const palletWidth = values.palletWidth;

    // Visualización 2D (vista superior)
    const maxPalletDim = Math.max(palletLength, palletWidth);
    const scale = Math.min(400 / maxPalletDim, 4);

    let boxesHtml = '';
    for (let x = 0; x < result.boxesX; x++) {
      for (let y = 0; y < result.boxesY; y++) {
        boxesHtml += '<div class="box-visual" style="' +
          'width: ' + (result.dimensions.x * scale) + 'px; ' +
          'height: ' + (result.dimensions.y * scale) + 'px; ' +
          'left: ' + (x * result.dimensions.x * scale) + 'px; ' +
          'top: ' + (y * result.dimensions.y * scale) + 'px;"></div>';
      }
    }

    const palletStyle = 'width: ' + (palletLength * scale) + 'px; height: ' + (palletWidth * scale) + 'px; max-width: 100%; position: relative;';
    const viewHTML = '<div class="pallet-view" style="' + palletStyle + '">' +
      '<div class="pallet-base"></div>' + boxesHtml + '</div>';
    const infoHTML = '<div class="visualization-info">Vista superior - ' + result.boxesX + ' x ' +
      result.boxesY + ' cajas por capa | ' + result.layers + ' capas apiladas (' +
      result.totalBoxes + ' cajas totales)</div>';

    visualization.innerHTML = '<h3>Visualización de la configuración seleccionada</h3>' + viewHTML + infoHTML;

    // Visualización 3D con Three.js
    if (window.ThreeVis && typeof window.ThreeVis.drawBoxes3D === 'function') {
      window.ThreeVis.drawBoxes3D({
        xCount: result.boxesX,
        yCount: result.boxesY,
        layers: result.layers,
        boxDims: {
          x: result.dimensions.x,
          y: result.dimensions.y,
          z: result.dimensions.z
        }
      });
    }
  }

  // Obtener clase para eficiencia (colores)
  function getEfficiencyClass(efficiency) {
    if (efficiency > 85) return 'high';
    if (efficiency > 70) return 'medium';
    return 'low';
  }

  // Mostrar mensaje de no resultados
  function showNoResults() {
    resultsSection.style.display = 'none';
    noResults.style.display = 'block';
  }

  // Añadir event listeners a inputs para recalcular en tiempo real
  const inputs = [boxLengthInput, boxWidthInput, boxHeightInput, palletLengthInput, palletWidthInput, maxStackHeightInput];
  inputs.forEach(function(input) {
    if (input) {
      input.addEventListener('input', calculatePacking);
    }
  });

  // Inicializar Three.js y calcular al cargar DOM
  document.addEventListener('DOMContentLoaded', () => {
    if (window.ThreeVis && typeof window.ThreeVis.initThree === 'function') {
      window.ThreeVis.initThree('threeContainer');
    }
    calculatePacking();
  });

})();