var width = 1024,
    height = 768,
    zoomed = false;

var svg = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height',height);

var g = svg.append('g');

var projection = d3.geoAlbersUsa();

var path = d3.geoPath().projection(projection);

var colorScheme = d3.schemeSet3;

var label = d3.select('#map').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

var coords = d => projection(d.geometry.coordinates);

function zoomIn(d) {
    console.log(d);
    console.log(coords(d));
    var x, y, k;
    if (zoomed) {
        return zoomOut();
    } else {
        x = coords(d)[0];
        y = coords(d)[1];
        k = 80;
        zoomed = true;

        return zoom(x, y, k);
    }
}

function zoomOut() {
    if (zoomed) {
        var x = width / 2,
            y = height / 2,
            k = 1;
        zoomed = false;
        return zoom(x, y, k);
    }
}

function zoom(x, y, k) {
    g.transition()
        .duration(1000)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
}


d3.json('nps_voronoi.geojson').then(data => {
    g.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('class', 'polygon')
        .attr('fill', d => colorScheme[d.properties.color_id])
        .attr('d', path)
        .on('click', () => zoomOut())
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

        var text = g.selectAll('text')
            .data(cities)
            .enter()
            .append('text')
            .attr('class', 'label-text')
            .text(d => d.properties.name)
            .attr('x', labelOffsetX)
            .attr('y', d => coordY(d) + 5)
            .on('click', d => zoomIn(d));

        var line = g.selectAll('line')
            .data(cities)
            .enter()
            .append('line')
            .attr('class', 'label')
            .attr('x1', d => coords(d)[0] * 1.01)
            .attr('y1', d => coords(d)[1])
            .attr('x2', labelOffsetX - 10)
            .attr('y2', d => coords(d)[1])
            .on('click', d => zoomIn(d));

        // var circle = g.selectAll('circle')
        //     .data(cities)
        //     .enter()
        //     .append('circle')
        //     .style('opacity', 0)
        //     .style('cursor', 'pointer')
        //     .attr('cx', d => coords(d)[0])
        //     .attr('cy', d => coords(d)[1])
        //     .attr('r', 10)
        //     .on('click', d => zoom(d));
    });
});
