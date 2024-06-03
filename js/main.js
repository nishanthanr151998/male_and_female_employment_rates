// Hint: This is a good place to declare your global variables
var female_data;
var male_data;
var maleColor = 'blue';
var femaleColor = 'pink';
var chartWidth = 800;
var chartHeight = 500;
var selectedCountries = ['India', 'United States', 'United Kingdom', 'China', 'Russia'];
var prevCountry = "Russia"
var xScale = d3.scaleTime()
                .domain([new Date(1990, 0, 1), new Date(2023, 0, 1)])
                .range([0, chartWidth]);
var maxYValue = 1;
var yScale = d3.scaleLinear()
                .domain([0, maxYValue])
                .range([chartHeight, 0]);

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
    var svg = d3.select('#lollipopchart')
        .append('svg')
        .attr('class', 'lollipopchart')
        .attr('width', 1000)
        .attr('height', 600);

    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/females_data.csv', d3.autoType), d3.csv('data/males_data.csv', d3.autoType)])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];

            // Hint: This is a good spot for doing data wrangling
            female_data = dataWrangler(female_data);
            male_data = dataWrangler(male_data);

            drawLolliPopChart();
        });
});

// Use this function to draw the lollipop chart.
function drawLolliPopChart() {
    console.log('trace:drawLollipopChart()');

    // clearing the svg
    var svg = d3.select('#lollipopchart');
    svg.selectAll('*').remove();

    var selectedCountry = document.getElementById('dropdown').value;

    var selectedCountryDataFemale = countryDataFinder(female_data, selectedCountry);

    var selectedCountryDataMale = countryDataFinder(male_data, selectedCountry);

    var selectedCountryData = selectedCountryDataFemale.concat(selectedCountryDataMale);

    maxYValue = d3.max(selectedCountryData, function (d) {
        return Math.max(d[selectedCountry]);
    });

    yScale = d3.scaleLinear()
        .domain([0, maxYValue + maxYValue*0.1])
        .range([chartHeight, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(100,' + chartHeight + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(100,0)')
        .call(yAxis);

    drawLegend(svg);

    drawTitle(svg);

    var lollipops = svg.append('g')
        .attr('class', 'lollipops')
        .attr('transform', 'translate(100,0)');
        
    drawLine(lollipops, selectedCountryDataFemale, "femaleLine",selectedCountry,false);
    drawCircle(lollipops, selectedCountryDataFemale, "femaleCircle",selectedCountry,false);
        
    drawLine(lollipops, selectedCountryDataMale, "maleLine",selectedCountry,true);
    drawCircle(lollipops, selectedCountryDataMale, "maleCircle",selectedCountry,true);  
    prevCountry = selectedCountry;
}

function dataWrangler(data) {
    return data.map(function (d) {
        var yearData = { year: d.Year };
        selectedCountries.forEach(function (country) {
            yearData[country] = d[country];
        });
        return yearData;
    });

}
function countryDataFinder(data, country) {
    return data.filter(function (d) {
        return d[country] !== null && !isNaN(d[country]);
    });
}
function drawTitle(svg) {
    svg.append('text')
        .attr('x', chartWidth / 2 + 70)
        .attr('y', chartHeight + 35)
        .attr('text-anchor', 'middle')
        .text('Year')
        .style('font-size', '14px')
        .style('font-weight', 'bold');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2 - 50)
        .attr('y', 60)
        .text('Employment Rate')
        .style('font-size', '14px')
        .style('font-weight', 'bold');
}
function drawLegend(svg) {
    var legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (chartWidth + 20) + ', 0)');

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', femaleColor);

    legend.append('text')
        .attr('x', 30)
        .attr('y', 15)
        .text('Female Employment Rate')
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle');

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 30)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', maleColor);

    legend.append('text')
        .attr('x', 30)
        .attr('y', 45)
        .text('Male Employment Rate')
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle');

}
function drawCircle(lollipops, data, element,country,gender) {
    var color;
    var pos;
    if (gender == true) {
        color = maleColor;
        pos = -5
    }
    else {
        color = femaleColor;
        pos = 5
    }

    lollipops.selectAll(element)
        .data(data)
        .enter()
        .append("circle")
        .attr('cx', function (d) {
            return xScale(new Date(d.year, 0, 1)) + pos;
        })
        .attr('cy', function (d) {
            return yScale(d[prevCountry]);
        })
        .attr('fill', color)
        .attr('r', 5)
        .transition()
        .duration(2000)
        .attr('cy', function (d) {
            return yScale(d[country]);
        })
        .delay(100);

}
function drawLine(lollipops, data, element,country,gender) {
    var color;
    var pos;
    if (gender == true) {
        color = maleColor;
        pos = -5
    }
    else {
        color = femaleColor;
        pos = 5
    }
    lollipops.selectAll(element)
        .data(data)
        .enter()
        .append("line")
        .attr('x1', function (d) {
            return xScale(new Date(d.year, 0, 1)) + pos;
        })
        .attr('x2', function (d) {
            return xScale(new Date(d.year, 0, 1)) + pos;
        })
        .attr('y1', yScale(0))
        .attr('y2', function (d) {
            return yScale(d[prevCountry]);
        })
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .transition()
        .duration(2000)
        .attr('y2', function (d) {
            return yScale(d[country]);
        })
        .delay(100);
}


