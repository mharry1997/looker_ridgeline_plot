const visObject = {
    options: {
      category: {
        type: "number",
        label: "Cateogry",
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
      
      // Dimension of the whole chart. Only one size since it has to be square
      const marginWhole = {top: 10, right: 10, bottom: 10, left: 10},
          sizeWhole = 640 - marginWhole.left - marginWhole.right
      console.log(data)
      // Create the svg area
      const svg = this.svg
        .append("svg")
          .attr("width", sizeWhole  + marginWhole.left + marginWhole.right)
          .attr("height", sizeWhole  + marginWhole.top + marginWhole.bottom)
        .html('')  // Clear previous
        .append("g")
          .attr("transform", `translate(${marginWhole.left},${marginWhole.top})`);
      
      
      // What are the numeric variables in this dataset? How many do I have
      var fields = queryResponse.fields.dimensions.map(field => field.name)
        .concat(queryResponse.fields.measures.map(field => field.name))
        .filter(field => !field.is_hidden);
      console.log(fields)
      const identifier = fields.splice(4,1);
      console.log(identifier)
      console.log(fields)
      const numVar = 4
      // Extracting unique species names
      const uniqueCats = new Set(data.map(item => item[identifier]));
      const catList = Array.from(uniqueCats);
      // console.log(catList)
      
      
    
      // Now I can compute the size of a single chart
      const mar = 20
      const size = sizeWhole / 4
      
    
    
      // ----------------- //
      // Scales
      // ----------------- //
    
      // Create a scale: gives the position of each pair each variable
      const position = d3.scalePoint()
        .domain(fields)
        .range([0, sizeWhole-size])
    
      // Color scale: give me a specie name, I return a color
      const color = d3.scaleOrdinal()
        .domain(catList)
        .range([ "#402D54", "#D18975", "#8FD175"])
    
    
      // ------------------------------- //
      // Add charts
      // ------------------------------- //
      for (i in fields){
        for (j in fields){
    
          // Get current variable name
          let var1 = fields[i]
          let var2 = fields[j]
    
          // If var1 == var2 i'm on the diagonal, I skip that
          if (var1 === var2) { continue; }
    
          // Add X Scale of each graph
          xextent = d3.extent(data, function(d) { return +d[var1] })
          const x = d3.scaleLinear()
            .domain(xextent).nice()
            .range([ 0, size-2*mar ]);
    
          // Add Y Scale of each graph
          yextent = d3.extent(data, function(d) { return +d[var2] })
          const y = d3.scaleLinear()
            .domain(yextent).nice()
            .range([ size-2*mar, 0 ]);
    
          // Add a 'g' at the right position
          const tmp = svg
            .append('g')
            .attr("transform", `translate(${position(var1)+mar},${position(var2)+mar})`);
    
          // Add X and Y axis in tmp
          tmp.append("g")
            .attr("transform", `translate(0,${size-mar*2})`)
            .call(d3.axisBottom(x).ticks(3));
          tmp.append("g")
            .call(d3.axisLeft(y).ticks(3));
    
          // Add circle
          tmp
            .selectAll("myCircles")
            .data(data)
            .join("circle")
              .attr("cx", function(d){ return x(+d[var1]) })
              .attr("cy", function(d){ return y(+d[var2]) })
              .attr("r", 3)
              .attr("fill", function(d){ return color(d[identifier])})
        }
      }
    
    
      // ------------------------------- //
      // Add histograms = diagonal
      // ------------------------------- //
      for (i in fields){
        for (j in fields){
    
          // variable names
          let var1 = fields[i]
          let var2 = fields[j]
    
          // If var1 == var2 i'm on the diagonal, otherwisee I skip
          if (i != j) { continue; }
    
          // create X Scale
          xextent = d3.extent(data, function(d) { return +d[var1] })
          const x = d3.scaleLinear()
            .domain(xextent).nice()
            .range([ 0, size-2*mar ]);
    
          // Add a 'g' at the right position
          const tmp = svg
            .append('g')
            .attr("transform", `translate(${position(var1)+mar},${position(var2)+mar})`);
    
          // Add x axis
          tmp.append("g")
            .attr("transform", `translate(0,${size-mar*2})`)
            .call(d3.axisBottom(x).ticks(3));
    
          // set the parameters for the histogram
           const histogram = d3.histogram()
               .value(function(d) { return +d[var1]; })   // I need to give the vector of value
               .domain(x.domain())  // then the domain of the graphic
               .thresholds(x.ticks(15)); // then the numbers of bins
    
           // And apply this function to data to get the bins
           const bins = histogram(data);
    
           // Y axis: scale and draw:
           const y = d3.scaleLinear()
                .range([ size-2*mar, 0 ])
                .domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    
           // append the bar rectangles to the svg element
           tmp.append('g')
              .selectAll("rect")
              .data(bins)
              .join("rect")
                 .attr("x", 1)
                 .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
                 .attr("width", function(d) { return x(d.x1) - x(d.x0)  ; })
                 .attr("height", function(d) { return (size-2*mar) - y(d.length); })
                 .style("fill", "#b8b8b8")
                 .attr("stroke", "white");

          // Add title
          tmp.append("text")
              .attr("x", (size - 2 * mar) / 2)  // Center the text
              .attr("y", -10)  // Position it above the histogram
              .attr("text-anchor", "middle")  // Center the text horizontally
              .text(var1)  // The variable name
              .style("font-size", "10px")  // Adjust font size
              .style("fill", "#555");  // Text color
        }
      }

      doneRendering();
    }
};

looker.plugins.visualizations.add(visObject);


