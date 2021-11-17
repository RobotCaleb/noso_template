requirejs.config({
    baseUrl: "./scripts/"
});
require(['dat.gui', 'glm-js.min',
    'canvas2svg', 'jszip.min',
    'FileSaver', 'svg-browser-export'],
    function (data) {
        window.dat = {
            GUI: data.GUI
        };
        main();
    });


let Options = function () {
    this.angle = 19.468;
    const a = 19.468;
    this.rot = 45;
    this.numX = 24;
    this.numY = 40;
    this.numZ = 25;
    this.intX = 40;
    this.intY = 20;
    this.intZ = 40;
    this.interval = 40;
    this.segments = 24;
    this.draw = true;
    this.resetAngle = function () {
        this.angle = a;
        this.rot = 45;
    }
    this.saveZip = function () {
        require(['jszip.min'], function (jszip) {
            let s = ctx.getSerializedSvg(true);
            const imgData = exportSvg(s, 'png').then(r => {
                var zip = new jszip();
                zip.file("noso-template.svg", s);
                zip.file("noso-template.png", r.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true });
                zip.generateAsync({ type: "blob" })
                    .then(function (content) {
                        // see FileSaver.js
                        saveAs(content, "template.zip");
                    });
            });
        });
    }
};

let options = new Options();

/** @type {HTMLCanvasElement} */
let canvas = {};
/** @type {CanvasRenderingContext2D} */
let ctx = {};
/** @type {Element} */
let svg_container = document.getElementById('svg_container');

function init() {
    canvas = document.getElementById('canvas');
    /** @type {CanvasRenderingContext2D} */
    ctx = new C2S(1404, 1872);

    let gui = new dat.GUI({ autoPlace: true });
    gui.add(options, "rot", 0, 360, 1).name("Rotation").listen().onChange(function () {
        draw();
    });
    gui.add(options, "angle", 19.4, 19.6, 0.000001).name("Angle").listen().onChange(function () {
        draw();
    });
    gui.add(options, "resetAngle").name("Reset angle").onFinishChange(function () {
        draw();
    });
    gui.add(options, "numY", 4, 100, 1).name("Vert segments").listen().onChange(function (v) {
        if (v < options.segments + 2) {
            options.segments = v - 2;
            options.numX = v - 3;
            options.numZ = v - 2;
        }
        draw();
    });
    gui.add(options, "segments", 2, 100, 1).name("Horiz segments").listen().onChange(function (v) {
        options.numX = v;
        options.numZ = v + 1;
        if (v > options.numY - 2) {
            options.numY = v + 2;
        }
        draw();
    });
    gui.add(options, "interval", 2, 100, 2).name("Interval").onChange(function (v) {
        options.intX = v;
        options.intY = v / 2;
        options.intZ = v;
        draw();
    });
    gui.add(options, "saveZip").name("Save template");
}

function round(a) {
    a.x = Math.round(a.x);
    a.y = Math.round(a.y);
    a.z = Math.round(a.z);
    return a;
}

function draw() {
    let white = '#ffffff';
    let lightGrey = '#ababab';
    let darkGrey = '#555555';
    let black = '#000000';

    let num = glm.vec3(options.numX, options.numY, options.numZ);
    let int = glm.vec3(options.intX, options.intY, options.intZ);
    let min = glm.vec3(-num.x / 2 * int.x, -num.y / 2 * int.y, -num.z / 2 * int.z);
    let max = glm.vec3(num.x / 2 * int.x, num.y / 2 * int.y, num.z / 2 * int.z);

    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.fillStyle = white;
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    let proj = glm.ortho(-ctx.width / 2, ctx.width / 2, -ctx.height / 2, ctx.height / 2, -1000, 1000);

    let viewport = glm.vec4(0, 0, ctx.width, ctx.height);

    let model = glm.mat4(1);
    model = glm.rotate(model, glm.radians(options.angle), glm.vec3(1, 0, 0));
    model = glm.rotate(model, glm.radians(options.rot), glm.vec3(0, 1, 0));



    // get top vertices
    let tl = new Array();
    for (let z = -num.z / 2; z <= num.z / 2; ++z) {
        let p = glm.vec3(min.x, min.y, z * int.z);
        p = round(glm.project(p, model, proj, viewport));
        tl.push(p);
    }

    let tr = new Array();
    for (let x = -num.x / 2; x <= num.x / 2; ++x) {
        let p = glm.vec3(x * int.x, min.y, max.z);
        p = round(glm.project(p, model, proj, viewport));
        tr.push(p);
    }


    // get bottom vertices
    let bl = new Array();
    for (let x = -num.x / 2; x <= num.x / 2; ++x) {
        let p = glm.vec3(x * int.x, max.y - int.y, min.z);
        p = round(glm.project(p, model, proj, viewport));
        bl.push(p);
    }
    let br = new Array();
    for (let z = -num.z / 2; z <= num.z / 2; ++z) {
        let p = glm.vec3(max.x, max.y - int.y, z * int.z);
        p = round(glm.project(p, model, proj, viewport));
        br.push(p);
    }


    // get right vertices
    let rs = new Array();
    for (let y = -num.y / 2; y < num.y / 2; ++y) {
        let p = glm.vec3(max.x, y * int.y, max.z);
        p = round(glm.project(p, model, proj, viewport));
        rs.push(p);
    }


    // get left vertices
    let ls = new Array();
    for (let y = -num.y / 2; y < num.y / 2; ++y) {
        let p = glm.vec3(min.x, y * int.y, min.z);
        p = round(glm.project(p, model, proj, viewport));
        ls.push(p);
    }


    ctx.strokeStyle = lightGrey;
    ctx.beginPath();
    for (let i = 0; i < Math.min(bl.length, tl.length); ++i) {
        ctx.moveTo(bl[i].x, bl[i].y);
        ctx.lineTo(tl[i].x, tl[i].y);
    }
    for (let i = 0; i < tr.length; ++i) {
        ctx.moveTo(br[i + 1].x, br[i + 1].y);
        ctx.lineTo(tr[i].x, tr[i].y);
    }
    for (let i = 0; i < tr.length; ++i) {
        ctx.moveTo(ls[i].x, ls[i].y);
        ctx.lineTo(tr[i].x, tr[i].y);
    }
    let rr = 1;
    for (let l = ls.length - tr.length - 1; l >= 0; --l) {
        ctx.moveTo(ls[ls.length - l - 1].x, ls[ls.length - l - 1].y);
        ctx.lineTo(rs[rr].x, rs[rr].y);
        ++rr;
    }
    for (let i = 1; i < bl.length; ++i) {
        ctx.moveTo(rs[rr].x, rs[rr].y);
        ctx.lineTo(bl[i].x, bl[i].y);
        ++rr;
    }
    let ll = ls.length - 1;
    for (let i = 0; i < br.length; ++i) {
        ctx.moveTo(ls[ll].x, ls[ll].y);
        ctx.lineTo(br[i].x, br[i].y);
        --ll;
    }
    rr = rs.length - 2;
    for (; ll >= 0; --ll) {
        ctx.moveTo(ls[ll].x, ls[ll].y);
        ctx.lineTo(rs[rr].x, rs[rr].y);
        --rr;
    }
    let tt = 1;
    for (; rr >= 0; --rr) {
        ctx.moveTo(rs[rr].x, rs[rr].y);
        ctx.lineTo(tl[tt].x, tl[tt].y);
        ++tt;
    }
    ctx.stroke();

    ctx.strokeStyle = darkGrey;
    ctx.beginPath();
    ctx.moveTo(bl[0].x, bl[0].y);
    ctx.lineTo(bl[bl.length - 1].x, bl[bl.length - 1].y);
    ctx.moveTo(br[0].x, br[0].y);
    ctx.lineTo(br[br.length - 1].x, br[br.length - 1].y);
    ctx.moveTo(rs[0].x, rs[0].y);
    ctx.lineTo(rs[rs.length - 1].x, rs[rs.length - 1].y);
    ctx.moveTo(tr[0].x, tr[0].y);
    ctx.lineTo(tr[tr.length - 1].x, tr[tr.length - 1].y);
    ctx.moveTo(tl[0].x, tl[0].y);
    ctx.lineTo(tl[tl.length - 1].x, tl[tl.length - 1].y);
    ctx.moveTo(ls[0].x, ls[0].y);
    ctx.lineTo(ls[ls.length - 1].x, ls[ls.length - 1].y);

    let fc = glm.vec3(max.x, min.y, min.z);
    fc = round(glm.project(fc, model, proj, viewport));

    ctx.moveTo(fc.x, fc.y);
    ctx.lineTo(rs[0].x, rs[0].y);
    ctx.moveTo(fc.x, fc.y);
    ctx.lineTo(ls[0].x, ls[0].y);
    ctx.moveTo(fc.x, fc.y);
    ctx.lineTo(br[0].x, br[0].y);
    ctx.stroke();

    let g = ctx.getSvg();
    if (svg_container.childNodes.length > 0) {
        svg_container.removeChild(svg_container.firstChild);
    }
    svg_container.appendChild(g);
}

function main() {
    init();
    draw();
}