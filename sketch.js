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
var L_NGP = 160 * Math.PI / 180;
var B_NGP = 24 * Math.PI / 180;
var galactic_bias = 0.4;

let GAL_LONG_list;
let GAL_LAT_list;
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

    MAG_list = convert_random_to_mag(list_prng(seeds[2], num_stars));

    let GALACTIC = make_random_lat_long(seeds[0], seeds[1], num_stars);
    GAL_LONG_list = GALACTIC[0];
    GAL_LAT_list = GALACTIC[1];

    let ECLIPTIC = convert_galactic_ecliptic(GAL_LONG_list, GAL_LAT_list);
    LONG_list = ECLIPTIC[0];
    LAT_list = ECLIPTIC[1];

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

    var stats_div = document.getElementById("stats");
    if (bias > 0) {
        bias /= 1.25;
    } else {
        bias /= 2;
    }

    if (galactic_bias >= 0.99999) {
        galactic_bias = 1;
    } else if (galactic_bias <= 0.000001) {
        galactic_bias = 0;
    }
    stats_div.innerHTML = "";
    stats_div.innerHTML += ` 
    <table> 
    <tr> 
        <th> Number of Stars </th> 
        <td> ${num_stars} </td> 
    </tr>
    <tr> 
        <th> Location Seed 1 </th> 
        <td> ${seeds[0]} </td> 
    </tr>
    <tr> 
        <th> Location Seed 2 </th> 
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
    <tr> 
        <th> NGP Ecl. Long. </th> 
        <td> ${Math.round(L_NGP * 180 / Math.PI * 100) / 100} </td> 
    </tr>
    <tr> 
        <th> NGP Ecl. Lat. </th> 
        <td> ${Math.round(B_NGP * 180 / Math.PI * 100) / 100} </td> 
    </tr>
    <tr> 
        <th> Galactic Bias </th> 
        <td> ${galactic_bias} </td> 
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

function make_random_lat_long(seed1, seed2, number) {
    let longs = [];
    let lats = [];
    let s1 = seed1;
    let s2 = seed2;
    for (let i = -100; i < 0; i++) {
        let random_number1 = prng(s1);
        let random_number2 = prng(s2);
        s1 = random_number1;
        s2 = random_number2;
    }
    let iter = 0;
    let count = 0;
    while (iter < number * 500) {
        iter++;
        let random_number1 = prng(s1);
        let random_number2 = prng(s2);
        let x = random_number1 / Math.pow(2, 32);
        let y = random_number2 / Math.pow(2, 32);
        let lat = Math.tan(2 * Math.atan(Math.PI / 2 / Math.log(galactic_bias)) * (x - 0.5)) * Math.log(galactic_bias);
        if (y < Math.cos(lat)) {
            lats.push(lat);
            longs.push(y / Math.cos(lat) * Math.PI * 2);
            count++;
        }
        if (count == number) {
            break;
        }
        s2 = random_number1;
        s1 = random_number2;
    }
    return [longs, lats];
}

function make_random_long(seed, number) {
    let result = [];
    let iter = 0;
    let count = 0;
    let s = seed;
    for (let i = -100; i < 0; i++) {
        let random_number = prng(s);
        s = random_number;
    }
    while (iter < number * 500) {
        iter++;
        let random_number = prng(s);
        let x = random_number / Math.pow(2, 32);
        if (x < Math.cos(GAL_LAT_list[count])) {
            result.push((x / Math.cos(GAL_LAT_list[count])) * Math.PI * 2);
            count++;
        }
        if (count == number) {
            break;
        }
        s = random_number;
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

function convert_galactic_ecliptic(longs, lats) {
    let ecliptic_longs = [];
    let ecliptic_lats = [];

    for (let i = 0; i < longs.length; i++) {
        let x = Math.cos(lats[i]) * Math.cos(longs[i]);
        let y = Math.cos(lats[i]) * Math.sin(longs[i]);
        let z = Math.sin(lats[i]);

        let x_new = Math.sin(-B_NGP) * x - Math.cos(-B_NGP) * z;
        let y_new = y;
        let z_new = Math.cos(-B_NGP) * x + Math.sin(-B_NGP) * z;

        let x_newnew = Math.cos(-L_NGP) * x_new + Math.sin(-L_NGP) * y_new;
        let y_newnew = -Math.sin(-L_NGP) * x_new + Math.cos(-L_NGP) * y_new;
        let z_newnew = z_new;

        let theta = Math.atan2(y_newnew, x_newnew);
        if (theta < 0) {
            theta += Math.PI * 2;
        }
        ecliptic_longs.push((theta / Math.PI / 2 + precession) % 1);
        ecliptic_lats.push(Math.asin(z_newnew) / Math.PI * 2);
    }
    return [ecliptic_longs, ecliptic_lats];
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
    if (bias < 0) {
        bias *= 2;
    } else {
        bias *= 1.25;
    }
    if (bias > 1.25) {
        bias = 1.25;
    } else if (bias < -2) {
        bias = -2;
    }

    galactic_bias = document.getElementById("galbias_value").value;
    if (galactic_bias <= 0.000001) {
        galactic_bias = 0.000001;
    }
    if (galactic_bias >= 0.99999) {
        galactic_bias = 0.99999;
    }

    precession = document.getElementById("precession_value").value / 360;
    axial_tilt = document.getElementById("tilt_value").value * Math.PI / 180;

    L_NGP = document.getElementById("LNGP_value").value * Math.PI / 180;
    B_NGP = document.getElementById("BNGP_value").value * Math.PI / 180;
    redraw();
}

function make_table_div() {
    var starlist = document.getElementById("starlist");
    starlist.innerHTML = '<h2> Full Star List </h2> <button type="button" style="margin: 10px; padding: 10px" , onclick="make_full_table()">Show</button>';
}

function make_full_table() {
    var starlist = document.getElementById("starlist");
    starlist.innerHTML = '<h2> Full Star List </h2> <button type="button" style="margin: 10px; padding: 10px" , onclick="make_table_div()">Hide</button>';
    var array_content = "[";
    var list_content = "";
    var table = "<table> <tr> <th> ID </th> <th> Right Ascension (deg) </th> <th> Declension (deg) </th> <th> App. Magnitude </th> </tr>";
    for (let i = 0; i < num_stars; i++) {
        table += `<tr> <th> #${i + 1} </th> <td> ${RA_list[i] * 360} </td> <td> ${DEC_list[i] * 90} </td> <td> ${MAG_list[i]} </td> </tr>`
        array_content += `[${RA_list[i] * 360}, ${DEC_list[i] * 90}, ${MAG_list[i]}], \n`;
        list_content += `${RA_list[i] * 360} ${DEC_list[i] * 90} ${MAG_list[i]} \n`;
    }
    array_content = array_content.slice(0, -3) + "]";
    var arrayblob = new Blob([array_content], { type: 'text/plain' });
    var listblob = new Blob([list_content], { type: 'text/plain' });
    table += '</table> <button type="button" style="margin: 10px; padding: 10px" , onclick="make_table_div()">Hide</button>'
    starlist.innerHTML += `<a download="${seeds[0]}_${seeds[1]}_${seeds[2]}_StarArray.txt" href="#" id="arraylink">Download Array</a>  `;
    starlist.innerHTML += `<a download="${seeds[0]}_${seeds[1]}_${seeds[2]}_StarList.txt" href="#" id="listlink">Download Plain List</a>`;
    var arraylink = document.getElementById("arraylink");
    arraylink.href = URL.createObjectURL(arrayblob);
    var listlink = document.getElementById("listlink");
    listlink.href = URL.createObjectURL(listblob);
    starlist.innerHTML += table;
}
