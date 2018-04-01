var width = 1024,
    height = 768,
    zoomed = false;

var svg = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height',height);

var projection = d3.geoAlbersUsa();

var path = d3.geoPath().projection(projection);

var colorScheme = d3.schemeSet3;

var label = d3.select('#map').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

var coords = d => projection(d.geometry.coordinates);

function zoom(d) {
    console.log(d);
    console.log(coords(d));
    var x, y, k;
    if (zoomed) {
        x = width / 2;
        y = height / 2;
        k = 1;
        zoomed = false;
    } else {
        x = coords(d)[0];
        y = coords(d)[1];
        k = 2;
        zoomed = true;
    }

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
}

d3.json('nps_voronoi.geojson').then(data => {
    svg.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('class', 'polygon')
        .attr('fill', d => colorScheme[d.properties.color_id])
        .attr('d', path)
        .on('mouseover', d => {
            label.transition()
                .duration(200)
                .style('opacity', .9);
            label
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY - 28) + 'px')
                .html(d.properties.UNIT_NAME);
        })
        .on('mouseout', d => {
            label.transition()
                .duration(400)
                .style('opacity', 0);
        })
        .exit();

    d3.json('cities.geojson').then(data => {
        var labelOffsetX = width - 140;
        var cities = data.features;

        var coordX = d => projection(d.geometry.coordinates)[0];
        var coordY = d => projection(d.geometry.coordinates)[1];

        var text = svg.selectAll('text')
            .data(cities)
            .enter()
            .append('text')
            .attr('class', 'label-text')
            .text(d => d.properties.name)
            .attr('x', labelOffsetX)
            .attr('y', d => coordY(d) + 5)
            .on('click', d => zoom(d));

        var line = svg.selectAll('line')
            .data(cities)
            .enter()
            .append('line')
            .attr('class', 'label')
            .attr('x1', d => coords(d)[0])
            .attr('y1', d => coords(d)[1])
            .attr('x2', labelOffsetX - 10)
            .attr('y2', d => coords(d)[1])
            .on('click', d => zoom(d));

        var circle = svg.selectAll('circle')
            .data(cities)
            .enter()
            .append('circle')
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .attr('cx', d => coords(d)[0])
            .attr('cy', d => coords(d)[1])
            .attr('r', 10)
            .on('click', d => zoom(d));
    });
});
