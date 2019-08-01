async function init() {
    // Set the initial parameters.
    window.edition = 0;
    window.mode = "country";

    // Load the JSON data.
    window.olympics = await d3.json("olympics.json");

    // Create a tooltip.
    window.tooltip = d3.select("body")
        .append("div")
        .classed("tooltip", true)
        .style("opacity", 0);

    // Populate the navigation scene.
    d3.select("#editions")
        .selectAll("div")
        .data(olympics.editions)
        .enter()
        .append("div")
        .classed("navitem", true)
        .classed("selected", function (d, i) { return (i == 0); })
        .text(function (d, i) { return (i == 0) ? "All Summer Olympic Games" : d.edition + ": " + d.host; })
        .on("click", function (d, i) {
            if (window.edition != i) {
                window.edition = i;
                d3.select("#editions")
                    .selectAll("div")
                    .classed("selected", function (d, i) { return (window.edition == i); });
                render_chart();
            }
        });

    // Populate the overview chart.
    render_chart();
}

function render_chart() {
    if (window.mode == "country") {
        render_country_chart();
    } else if (window.mode == "sport") {
        render_sport_chart();
    }
}

function render_country_chart() {
    var svg = d3.select("#chart");
    var diameter = +svg.attr("width");

    var pack = d3.pack()
        .size([diameter, diameter])
        .padding(2);

    var root = d3.hierarchy(window.olympics.editions[window.edition].countries)
        .sum(function (d) { return d.medals; })
        .sort(function (a, b) { return b.value - a.value; });
    pack(root);

    svg.selectAll("g").remove();

    var title = svg.append("g")
    title.append("text")
        .attr("x", "50%")
        .attr("y", 640)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .text(function () {
            if (window.edition == 0) {
                return "All Summer Olympic Games"
            } else {
                var edition = window.olympics.editions[window.edition];
                return edition.edition + " Summer Olympics: " + edition.host;
            }
        });
    title.append("text")
        .attr("x", "50%")
        .attr("y", 665)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .text("Medals By Country");

    var button = svg.append("g")
    button.append("rect")
        .attr("x", 460)
        .attr("y", 0)
        .attr("width", 120)
        .attr("height", 30)
        .attr("fill", "red")
        .classed("button", true)
        .on("click", function () {
            window.mode = "sport";
            render_sport_chart();
        });
    button.append("text")
        .attr("x", 520)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "14px")
        .attr("fill", "white")
        .attr("pointer-events", "none")
        .text("Switch to Sport")

    var circle = svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .enter().append("circle")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", function (d) { return d.r; })
        .attr("fill", function (d) { return d.children ? "blue" : "white"; })
        .classed("circle", function (d) { return !d.children; })
        .on("mouseover", function (d) {
            if (!d.children) {
                window.tooltip.transition().delay(500).duration(200).style("opacity", 0.9);
                window.tooltip
                    .html(window.olympics.countries[d.data.country] + "<br>Medals: " + d.data.medals)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            }
        })
        .on("mouseout", function (d) {
            window.tooltip.transition().duration(100).style("opacity", 0);
        });

    var label = svg.append("g")
        .selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "9px")
        .attr("pointer-events", "none")
        .text(function (d) { return (d.r > 12) ? d.data.country : ""; });
}

function render_sport_chart() {
    var svg = d3.select("#chart");
    var diameter = +svg.attr("width");

    var pack = d3.pack()
        .size([diameter, diameter])
        .padding(2);

    var root = d3.hierarchy(window.olympics.editions[window.edition].sports)
        .sum(function (d) { return d.medals; })
        .sort(function (a, b) { return b.value - a.value; });
    pack(root);

    svg.selectAll("g").remove();

    var title = svg.append("g")
    title.append("text")
        .attr("x", "50%")
        .attr("y", 640)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .text(function () {
            if (window.edition == 0) {
                return "All Summer Olympic Games"
            } else {
                var edition = window.olympics.editions[window.edition];
                return edition.edition + " Summer Olympics: " + edition.host;
            }
        });
    title.append("text")
        .attr("x", "50%")
        .attr("y", 665)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "20px")
        .text("Medals By Sport");

    var button = svg.append("g")
    button.append("rect")
        .attr("x", 460)
        .attr("y", 0)
        .attr("width", 120)
        .attr("height", 30)
        .attr("fill", "blue")
        .classed("button", true)
        .on("click", function () {
            window.mode = "country";
            render_country_chart();
        });
    button.append("text")
        .attr("x", 520)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "14px")
        .attr("fill", "white")
        .attr("pointer-events", "none")
        .text("Switch to Country");

    var circle = svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .enter().append("circle")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", function (d) { return d.r; })
        .attr("fill", function (d) { return d.children ? "red" : "white"; })
        .classed("circle", function (d) { return !d.children; })
        .on("mouseover", function (d) {
            if (!d.children) {
                window.tooltip.transition().delay(500).duration(200).style("opacity", 0.9);
                window.tooltip
                    .html(d.data.sport + "<br>Medals: " + d.data.medals)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            }
        })
        .on("mouseout", function (d) {
            window.tooltip.transition().duration(100).style("opacity", 0);
        });


    var label = svg.append("g")
        .selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .attr("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "9px")
        .attr("pointer-events", "none")
        .text(function (d) { return (d.r > 12) ? d.data.sport : ""; });
}