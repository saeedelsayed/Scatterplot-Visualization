// Define dimensions and margins for the scatterplot
const margin = { top: 40, right: 150, bottom: 60, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 750 - margin.top - margin.bottom;

// Append SVG canvas
const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


// Load the CSV file
d3.csv("cars.csv").then(data => {
    // Convert numerical values
    data.forEach(d => {
        d.Horsepower = +d.Horsepower;
        d.Retail_Price = +d.Retail_Price;
        // d.Engine_Size = +d.Engine_Size;
     }); 
 
  // Scales
const xScale = d3.scaleLinear()
    .domain([0, 500])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, 200000])
    .range([height, 0]);



const sizeScale = d3.scaleLinear()
    .domain([1, 6])
    .range([5, 15]);

  // Axes
svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

svg.append("g")
    .call(d3.axisLeft(yScale));
  
// Scatterplot points with different shapes
svg.selectAll(".shape")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "shape")
    .attr("d", d => {
        if (d.Cyl <= 4) {
            return d3.symbol().type(d3.symbolCircle).size(150)();
        } else if (d.Cyl > 4 && d.Cyl <= 6) {
            return d3.symbol().type(d3.symbolTriangle).size(150)();
        } else if (d.Cyl > 6) {
            return d3.symbol().type(d3.symbolSquare).size(150)();
        }
          else
            return d3.symbol().type(d3.symbolSquare).size(150)();
    })
    .attr("transform", d => `translate(${xScale(d.Horsepower)},${yScale(d.Retail_Price)})`)
    .style("fill", "none")
    .style("stroke", d => colorScale(d.Type))
    .style("stroke-width", 2) 
    .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
            .html(`Horsepower: ${d.Horsepower}, Retail Price: ${d.Retail_Price}, Engine Size: ${d.Engine_Size}, Name: ${d.Name}`)
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
    })
    .on("click", function (event, d) {
        // Remove existing selection
        svg.selectAll(".shape").classed("selected", false);

        // Highlight the selected data point
        d3.select(this).classed("selected", true);

    });
  
  
  // Create a container for the star plot
const starPlotContainer = d3.select("body")
    .append("div")
    .attr("id", "starplot")
    .style("width", "300px")
    .style("height", "300px")
    .style("position", "absolute")
    .style("top", "50px")
    .style("left", "1000px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "8px")
    .style("padding", "10px")
    .style("visibility", "hidden");

// Star Plot function
function drawStarPlot(dataPoint) {
    // Clear existing star plot
    d3.select("#starplot svg").remove();

    const features = [
        { name: "Horsepower", value: dataPoint.Horsepower, max: 500 },
        { name: "Retail_Price", value: dataPoint.Retail_Price, max: 200000 },
        { name: "Cyl", value: dataPoint.Cyl, max: 8 },
        { name: "Engine_Size", value: dataPoint.Engine_Size, max: 6 }
    ];

    const width = 300, height = 300;
    const radius = Math.min(width, height) / 2 - 30;

    const svg = d3.select("#starplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const angleScale = d3.scaleLinear()
        .domain([0, features.length])
        .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(features, d => d.max)])
        .range([0, radius]);

    // Draw axes
    const axis = svg.selectAll(".axis")
        .data(features)
        .enter()
        .append("g")
        .attr("class", "axis");

    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radiusScale(d.max) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("y2", (d, i) => radiusScale(d.max) * Math.sin(angleScale(i) - Math.PI / 2))
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    axis.append("text")
        .attr("x", (d, i) => (radius + 20) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("y", (d, i) => (radius + 20) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => d.name);

    // Draw the data
    const line = d3.lineRadial()
        .radius(d => radiusScale(d.value))
        .angle((d, i) => angleScale(i));

    svg.append("path")
        .datum(features)
        .attr("d", line)
        .style("fill", "rgba(100, 150, 200, 0.5)")
        .style("stroke", "blue")
        .style("stroke-width", 2);
}

// Add click event to points
svg.selectAll(".shape")
    .on("click", function (event, d) {
        // Remove existing selection
        svg.selectAll(".shape").classed("selected", false);

        // Highlight the selected data point
        d3.select(this).classed("selected", true);

        // Show star plot
        d3.select("#starplot").style("visibility", "visible");
        drawStarPlot(d);
    });

  
    });


const colorScale = d3.scaleOrdinal()
    .domain(["Sedan", "SUV", "Sports Car", "Wagon", "Minivan"])
    .range(["blue", "orange", "green", "red", "purple"]);


// Axes labels
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Horsepower");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .style("text-anchor", "middle")
    .text("Retail_Price");

// Tooltip for data points
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("visibility","hidden");



// Legend
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 20}, 0)`);

legend.selectAll(".legend-item")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .each(function (d) {
        d3.select(this)
            .append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", colorScale(d));

        d3.select(this)
            .append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d);
    });


// Shape Legend
const shapeLegend = svg.append("g")
    .attr("class", "shape-legend")
    .attr("transform", `translate(${width + 20}, ${colorScale.domain().length * 20 + 40})`); // Position below the color legend

const shapeData = [
    { shape: d3.symbolCircle, label: "Cyl ≤ 4" },
    { shape: d3.symbolTriangle, label: "4 < Cyl ≤ 6" },
    { shape: d3.symbolSquare, label: "Cyl > 6" }
];

shapeLegend.selectAll(".shape-legend-item")
    .data(shapeData)
    .enter()
    .append("g")
    .attr("class", "shape-legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .each(function (d) {
        d3.select(this)
            .append("path")
            .attr("d", d3.symbol().type(d.shape).size(150)())
            .attr("transform", "translate(10,10)")
            .style("fill", "none")
            .style("stroke", "black");

        d3.select(this)
            .append("text")
            .attr("x", 30)
            .attr("y", 15)
            .text(d.label);
    });



