const visObject = {
    options: {
      category: {
        type: "number",
        label: "Category",
        default: 4,
        min: 1,
        max: 4,
        section: "First Value",
        order:1
      }
    },
    create: function(element, config){
        element.innerHTML = '<svg></svg>';  // Clear html
        this.svg = d3.select(element).select("svg");
    },

    updateAsync: function (data, element, config, queryResponse, details, doneRendering) {
      // Dimension of the whole chart
      const marginWhole = {top: 10, right: 10, bottom: 10, left: 10},
            sizeWhole = 640 - marginWhole.left - marginWhole.right;

      // Clear previous contents and setup the SVG
      const svg = d3.select(element)
        .select("svg")
        .attr("width", sizeWhole + marginWhole.left + marginWhole.right)
        .attr("height", sizeWhole + marginWhole.top + marginWhole.bottom)
        .html('')
        .append("g")
        .attr("transform", `translate(${marginWhole.left},${marginWhole.top})`);

      // Extract fields and remove hidden fields for axes
      var fields = queryResponse.fields.dimensions.map(field => field.name)
        .concat(queryResponse.fields.measures.map(field => field.name))
        .filter(field => !field.is_hidden);
      
      const identifier = fields.splice(config.category - 1, 1)[0];  // Use config to dynamically choose category
      const numVar = fields.length;  // Amount of variables after removing identifier

      // Extracting unique categories from identifier
      const uniqueCats = new Set(data.map(item => item[identifier]));
      const catList = Array.from(uniqueCats);

      // Define size for individual plots
      const mar = 20;
      const size = sizeWhole / numVar;

      // Define position scale
      const position = d3.scalePoint()
        .domain(fields)
        .range([0, sizeWhole-size]);

      // Define color scale
      const color = d3.scaleOrdinal()
        .domain(catList)
        .range(["#402D54", "#D18975", "#8FD175"]);

      // Iterate over fields to create scatter plots off the diagonal
      fields.forEach((var1, i) => {
        fields.forEach((var2, j) => {
          if (var1 === var2) return;  // Skip diagonal

          const x = d3.scaleLinear()
            .domain(d3.extent(data, d => +d[var1])).nice()
            .range([0, size - 2 * mar]);

          const y = d3.scaleLinear()
            .domain(d3.extent(data, d => +d[var2])).nice()
            .range([size - 2 * mar, 0]);

          const chartArea = svg.append('g')
            .attr("transform", `translate(${position(var1) + mar}, ${position(var2) + mar})`);

          chartArea.append("g")
            .attr("transform", `translate(0, ${size - 2 * mar})`)
            .call(d3.axisBottom(x).ticks(3));

          chartArea.append("g")
            .call(d3.axisLeft(y).ticks(3));

          chartArea.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => x(+d[var1]))
            .attr("cy", d => y(+d[var2]))
            .attr("r", 3)
            .attr("fill", d => color(d[identifier]));
        });
      });

      // Add histograms on the diagonal
      fields.forEach((field, idx) => {
        const x = d3.scaleLinear()
          .domain(d3.extent(data, d => +d[field])).nice()
          .range([0, size - 2 * mar]);

        const histogram = d3.histogram()
          .value(d => +d[field])
          .domain(x.domain())
          .thresholds(x.ticks(20));

        const bins = histogram(data);

        const y = d3.scaleLinear()
          .domain([0, d3.max(bins, d => d.length)])
          .range([size - 2 * mar, 0]);

        const diagArea = svg.append('g')
          .attr("transform", `translate(${position(field) + mar}, ${position(field) + mar})`);

        diagArea.append("g")
          .attr("transform", `translate(0, ${size - 2 * mar})`)
          .call(d3.axisBottom(x).ticks(3));

        diagArea.selectAll("rect")
          .data(bins)
          .enter().append("rect")
          .attr("x", 1)
          .attr("transform", d => `translate(${x(d.x0)}, ${y(d.length)})`)
          .attr("width", d => x(d.x1) - x(d.x0))
          .attr("height", d => size - 2 * mar - y(d.length))
          .attr("fill", "#b8b8b8");

        // Add title to histograms
        diagArea.append("text")
          .attr("x", (size - 2 * mar) / 2)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .text(field)
          .style("font-size", "10px")
          .style("fill", "#555");
      });

      doneRendering();
    }
};
looker.plugins.visualizations.add(visObject);
