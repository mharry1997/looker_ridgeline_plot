const visObject = {
  /**
   * The create function gets called when the visualization is initially created
   * @param element The DOM element in which to append the visualization
   * @param config The visualization config object
   */
  create: function(element, config) {
    element.innerHTML = "<pre></pre>";  // Preformatted tag to maintain whitespace
  },

  /**
   * The updateAsync function gets called when the data or settings change
   * @param data The data returned from the query
   * @param element The DOM element containing the visualization
   * @param config The visualization config object
   * @param queryResponse Details about the query response
   * @param details Other details (e.g., whether it's triggered by a refresh)
   * @param doneRendering A callback to call when rendering is complete
   */
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
    // Assuming 'element' is selected correctly, the following line will find the 'pre' tag and populate it
    const pre = element.querySelector('pre');
    pre.innerHTML = data

    doneRendering();  // Call this to inform Looker the visualization has finished rendering
  }
};

// Register the visualization in Looker
looker.plugins.visualizations.add(visObject);
