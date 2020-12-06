var svgWidth = 960;
var svgHeight = 800;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params
var chosenXAxis="poverty";
var chosenYAxis="healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }
// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height,0]);
  
    return yLinearScale;
  
  }
  
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
 // function used for updating yAxis var upon click on axis label
 function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  // function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis,  newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  // function used for updating txt group with a transition to
// new txt
function renderText(txtGroup, newXScale, chosenXAxis,  newYScale, chosenYAxis) {

    txtGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return txtGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
  
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age:";
    }
    else{
        xlabel = "Household income:"
    }

    var ylabel;

    if (chosenYAxis === "obese") {
        ylabel = "Obesity:";
      }
      else if (chosenYAxis === "smokes") {
        ylabel = "Smokes:";
      }
      else{
          ylabel = "Lacks Healthcare:"
      }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]} <br>${ylabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data,this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data,this);
      });
  
    return circlesGroup;
  }

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(csvData, err) {
    if (err) throw err;
    //console.log(csvData);
    // parse data
    csvData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(csvData,chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis=chartGroup.append("g")
      .classed("y-axis",true)
      .call(leftAxis);
  

    //create control group
    var ctrlGroup=chartGroup.selectAll("circle")
      .data(csvData)
      .enter()
      .append("g")
    
    // append initial circles
    var circlesGroup = ctrlGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .classed("stateCircle",true);
    
    //append initial text
    var txtGroup= ctrlGroup.append("text")
        .text(d=>d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+3)
        .classed("stateText",true)
        .style("font-size", "8px")
        .style("font-weight", "800");
  
    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);
  
    var povertyXLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .classed("aText",true)
      .text("In Poverty (%)");
  
    var ageXLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText",true)
      .text("Age (Median)");
  
    var incomeXLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText",true)
      .text("Household Income (Median)");

    // Create group for two x-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0-margin.left/4}, ${height/2})`);
  
    var obesityYLabel = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0-60)
      .attr("transform", "rotate(-90)")
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText",true)
      .text("Obese (%)");
  
    var smokesYLabel = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0-40)
      .attr("transform", "rotate(-90)")
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText",true)
      .text("Smokes (%)");
  
    var healthcareYLabel = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0-20)
      .attr("transform", "rotate(-90)")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .classed("aText",true)
      .text("Lacks Healthcare (%)");
      
    // updateToolTip function above csv import
    console.log(circlesGroup);
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(csvData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          
          //update text
          txtGroup=renderText(txtGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
        //  changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyXLabel
                .classed("active", true)
                .classed("inactive", false);
            ageXLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeXLabel
                .classed("active", false)
                .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          povertyXLabel
              .classed("active", false)
              .classed("inactive", true);
          ageXLabel
              .classed("active", true)
              .classed("inactive", false);
          incomeXLabel
              .classed("active", false)
              .classed("inactive", true);
        }
        else{
          povertyXLabel
                .classed("active", false)
                .classed("inactive", true);
            ageXLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeXLabel
                .classed("active", true)
                .classed("inactive", false);  
        }
        }
      });


    // y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(csvData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        //update text
        txtGroup=renderText(txtGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //  changes classes to change bold text
        if (chosenYAxis === "healthcare") {
            healthcareYLabel
                  .classed("active", true)
                  .classed("inactive", false);
            smokesYLabel
                  .classed("active", false)
                  .classed("inactive", true);
            obesityYLabel
                  .classed("active", false)
                  .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes"){
            healthcareYLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesYLabel
                .classed("active", true)
                .classed("inactive", false);
            obesityYLabel
                .classed("active", false)
                .classed("inactive", true);
          }
          else{
            healthcareYLabel
                  .classed("active", false)
                  .classed("inactive", true);
            smokesYLabel
                  .classed("active", false)
                  .classed("inactive", true);
            obesityYLabel
                  .classed("active", true)
                  .classed("inactive", false);  
          }
        }
    });
  }).catch(function(error) {
    console.log(error);
  });
  