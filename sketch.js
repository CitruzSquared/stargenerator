function setup() {
    createCanvas(windowWidth / 1.5, windowWidth / 3);
}

var bias = 0;
var num_stars = 9000;
var seeds = [0, 0, 0];
var precession = 0;
var show_ecliptic = true;
var show_equator = true;
var axial_tilt = 23.44 * Math.PI / 180;

let LONG_list;
let LAT_list;
let MAG_list;
let RA_list;
let DEC_list;

function draw() {
    background(0);

    strokeWeight(1);
    stroke(100);
    if (show_equator) {
        line(0, height / 2, width, height / 2);
    }
    if (show_ecliptic) {
        let ecliptic = [];
        for (let i = 0; i < 360; i++) {
            let l = i * Math.PI / 180;
            let x = Math.cos(l);
            let y = Math.cos(axial_tilt) * Math.sin(l);
            let ra = Math.atan2(y, x) / (Math.PI * 2);
            if (ra < 0) {
                ra += 1;
            }
            let d = Math.asin(Math.sin(axial_tilt) * Math.sin(l)) / (Math.PI / 2);
            ecliptic.push([-1 * ra * width + width, ((-1 * d) / 2 + 0.5) * height]);
        }
        for (let i = 1; i < ecliptic.length; i++) {
            line(ecliptic[i][0], ecliptic[i][1], ecliptic[i - 1][0], ecliptic[i - 1][1]);
        }
    }

    for (let i = 0; i < seeds.length; i++) {
        if (seeds[i] == 0) {
            seeds[i] = Math.floor(Math.random() * Math.pow(2, 31)) * 2 - 1;
        }
    }

    LONG_list = convert_random_to_long(list_prng(seeds[0], num_stars));
    LAT_list = convert_random_to_lat(list_prng(seeds[1], num_stars));
    MAG_list = convert_random_to_mag(list_prng(seeds[2], num_stars));

    RA_list = [];
    DEC_list = [];

    let brightest = brightest_star(LONG_list, LAT_list, MAG_list);


    for (let i = 0; i < num_stars; i++) {
        if (RA_list.length < num_stars) {
            let longitude = LONG_list[i] * 2 * Math.PI;
            let latitude = LAT_list[i] * Math.PI / 2;

            let x = Math.cos(latitude) * Math.cos(longitude);
            let y = Math.cos(axial_tilt) * Math.cos(latitude) * Math.sin(longitude) - Math.sin(axial_tilt) * Math.sin(latitude);
            let z = Math.sin(axial_tilt) * Math.cos(latitude) * Math.sin(longitude) + Math.cos(axial_tilt) * Math.sin(latitude);

            let ra = Math.atan2(y, x) / (Math.PI * 2);
            if (ra < 0) {
                ra += 1;
            }
            let d = Math.asin(z) / (Math.PI / 2);

            RA_list.push(ra);
            DEC_list.push(d);
        }

        let eq_x = -1 * RA_list[i] * width + width;
        let eq_y = ((-1 * DEC_list[i]) / 2 + 0.5) * height;
        let r = 10 * Math.pow(Math.pow(Math.pow(100, 0.2), -MAG_list[i]), 0.5);
        strokeWeight(r);
        stroke(255);
        if (i == brightest[3]) {
            stroke(255, 0, 0);
        }
        point(eq_x, eq_y);
    }

    let stats_array = create_stats_array(MAG_list);
    for (let i = 0; i < stats_array.length; i++) {
        console.log(stats_array[i]);
    }
    console.log(brightest_star(RA_list, DEC_list, MAG_list));



    var stats_div = document.getElementById("stats");
    stats_div.innerHTML = "";
    stats_div.innerHTML += ` 
    <table> 
    <tr> 
        <th> Number of Stars </th> 
        <td> ${num_stars} </td> 
    </tr>
    <tr> 
        <th> Longitude Seed </th> 
        <td> ${seeds[0]} </td> 
    </tr>
    <tr> 
        <th> Latitude Seed </th> 
        <td> ${seeds[1]} </td> 
    </tr>
    <tr> 
        <th> Brightness Seed </th> 
        <td> ${seeds[2]} </td> 
    </tr>
    <tr> 
        <th> Bias </th> 
        <td> ${bias * 1} </td> 
    </tr>
    <tr> 
        <th> Precession </th> 
        <td> ${precession * 360} </td> 
    </tr>
    <tr> 
        <th> Axial Tilt </th> 
        <td> ${Math.round(axial_tilt * 180 / Math.PI * 100) / 100} </td> 
    </tr>
    <tr> 
        <th> Brightest Star ID </th> 
        <td> #${brightest[3] + 1} </td> 
    </tr>
    <tr> 
        <th> Brightest Star Mag. </th> 
        <td> ${brightest[2].toFixed(3)} </td> 
    </tr>
    </table>`

    stats_div.innerHTML += ` 
    <table style="margin-left:10px;"> 
    <tr> 
        <th> Magnitude (M) </th> 
        <th> Num. Stars </th> 
    </tr>
    <tr> 
        <th> M < -5 </th> 
        <td> ${stats_array[0][1]} </td> 
    </tr>
    <tr> 
        <th> -5 < M < -4 </th> 
        <td> ${stats_array[1][1]} </td> 
    </tr>
    <tr> 
        <th> -4 < M < -3 </th> 
        <td> ${stats_array[2][1]} </td>
    </tr>
    <tr> 
        <th> -3 < M < -2 </th> 
        <td> ${stats_array[3][1]} </td>
    </tr>
    <tr> 
        <th> -2 < M < -1 </th> 
        <td> ${stats_array[4][1]} </td> 
    </tr>
    <tr> 
        <th> -1 < M < 0 </th> 
        <td> ${stats_array[5][1]} </td> 
    </tr>
    <tr> 
        <th> 0 < M < 1 </th> 
        <td> ${stats_array[6][1]} </td> 
    </tr>
    <tr> 
        <th> 1 < M < 2 </th> 
        <td> ${stats_array[7][1]} </td> 
    </tr>
    <tr> 
        <th> 2 < M < 3 </th> 
        <td> ${stats_array[8][1]} </td> 
    </tr>
    <tr> 
        <th> 3 < M < 4 </th> 
        <td> ${stats_array[9][1]} </td> 
    </tr>
    <tr> 
        <th> 4 < M < 5 </th> 
        <td> ${stats_array[10][1]} </td> 
    </tr>
    <tr> 
        <th> 5 < M < 6 </th> 
        <td> ${stats_array[11][1]} </td> 
    </tr>
    <tr> 
        <th> 6 < M </th> 
        <td> ${stats_array[12][1]} </td> 
    </tr>
    </table>`


    make_table_div();
    noLoop();
}

function prng(seed) {
    return (seed * 1664525 + 1013904223) % 4294967296;
}

function list_prng(seed, count) {
    let s = seed;
    let array = [];
    for (let i = -100; i < count; i++) {
        let number = prng(s);
        if (i >= 0) {
            array.push(number / Math.pow(2, 32));
        }
        s = number;
    }
    return array;
}

function convert_random_to_long(array) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        result.push((array[i] + precession) % 1);
    }
    return result;
}

function convert_random_to_lat(array) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(Math.asin(array[i] * 2 - 1) / (Math.PI / 2));
    }
    return result;
}

function convert_random_to_mag(array) {
    let result = [];
    let a = 9574.12322978;
    let base = 3.27471 - bias;
    // CDF = base ^ (x - 6.5)
    let log_base = Math.log(base);
    for (let i = 0; i < array.length; i++) {
        let magnitude = Math.log(array[i]) / log_base + 6.5;
        result.push(magnitude);
    }
    return result;
}

function create_stats_array(array) {
    let stats = [[-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]];
    for (let i = 0; i < array.length; i++) {
        if (Math.floor(array[i]) + 6 < 0) {
            stats[0][1]++;
        } else {
            stats[Math.floor(array[i]) + 6][1]++;
        }
    }
    return stats;
}

function brightest_star(x, y, MAG) {
    let brightest_mag = 10;
    let brightest_index = 0;
    for (let i = 0; i < MAG.length; i++) {
        if (MAG[i] < brightest_mag) {
            brightest_index = i;
            brightest_mag = MAG[i];
        }
    }
    return [x[brightest_index] * 360, y[brightest_index] * 90, MAG[brightest_index], brightest_index];
}

function initialize() {
    num_stars = Math.floor(document.getElementById("num_stars").value);
    if (num_stars < 1) {
        num_stars = 9000;
    }
    var long_seed = Math.floor(document.getElementById("long_seed").value);
    var lat_seed = Math.floor(document.getElementById("lat_seed").value);
    var mag_seed = Math.floor(document.getElementById("mag_seed").value);
    seeds = [long_seed, lat_seed, mag_seed];

    bias = document.getElementById("bias_value").value;
    if (bias < -1) {
        bias = -1;
    }
    if (bias > 1) {
        bias = 1;
    }

    precession = document.getElementById("precession_value").value / 360;
    axial_tilt = document.getElementById("tilt_value").value * Math.PI / 180;
    redraw();
}

function make_table_div() {
    var starlist = document.getElementById("starlist");
    starlist.innerHTML = '<h2> Full Star List </h2> <button type="button" style="margin: 10px; padding: 10px" , onclick="make_full_table()">Show</button>';
}

function make_full_table() {
    var starlist = document.getElementById("starlist");
    starlist.innerHTML = '<h2> Full Star List </h2> <button type="button" style="margin: 10px; padding: 10px" , onclick="make_table_div()">Hide</button>';
    var file_content = "["
    var table = "<table> <tr> <th> ID </th> <th> Right Ascension (deg) </th> <th> Declension (deg) </th> <th> App. Magnitude </th> </tr>";
    for (let i = 0; i < num_stars; i++) {
        table += `<tr> <th> #${i + 1} </th> <td> ${RA_list[i] * 360} </td> <td> ${DEC_list[i] * 90} </td> <td> ${MAG_list[i]} </td> </tr>`
        file_content += `[${RA_list[i] * 360}, ${DEC_list[i] * 90}, ${MAG_list[i]}], \n`;
    }
    file_content = file_content.slice(0, -3) + "]";
    var blob = new Blob([file_content], { type: 'text/plain' });
    table += '</table> <button type="button" style="margin: 10px; padding: 10px" , onclick="make_table_div()">Hide</button>'
    starlist.innerHTML += '<a download="starlist.txt" href="#" id="link">Download</a>';
    var link = document.getElementById("link");
    link.href = URL.createObjectURL(blob);
    starlist.innerHTML += table;
}
