"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var vertices = [
    {
        id: 1,
        name: "A",
        x: 351,
        y: 358,
        adjacentVertices: [6, 8],
    },
    {
        id: 2,
        name: "B",
        x: 440,
        y: 170,
        adjacentVertices: [2, 3, 4, 6],
    },
    {
        id: 3,
        name: "C",
        x: 460,
        y: 27,
        adjacentVertices: [2, 5],
    },
    {
        id: 4,
        name: "D",
        x: 634,
        y: 279,
        adjacentVertices: [2, 8],
    },
    {
        id: 5,
        name: "E",
        x: 848,
        y: 195,
        adjacentVertices: [3, 8],
    },
    {
        id: 6,
        name: "F",
        x: 80,
        y: 101,
        adjacentVertices: [1, 2, 7],
    },
    {
        id: 7,
        name: "G",
        x: 60,
        y: 300,
        adjacentVertices: [6],
    },
    {
        id: 8,
        name: "H",
        x: 750,
        y: 400,
        adjacentVertices: [1, 4, 5],
    },
];
var locationNames = ["A", "B", "C", "D", "E", "F", "G", "H"];
var canvas = create("canvas", { width: 900, height: 500 });
var fromSelector = create("select", null, locationNames.map(function (s) {
    var _a;
    return create("option", {
        value: (_a = vertices.find(function (val) { return val.name == s; })) === null || _a === void 0 ? void 0 : _a.id,
        innerText: s,
    });
}));
var toSelector = create("select", null, locationNames.map(function (s) {
    var _a;
    return create("option", {
        value: (_a = vertices.find(function (val) { return val.name == s; })) === null || _a === void 0 ? void 0 : _a.id,
        innerText: s,
    });
}));
var div = create("div", null, [
    canvas,
    create("br"),
    create("div", { className: "controls" }, [
        create("span", null, ["From: ", fromSelector]),
        create("span", null, ["To: ", toSelector]),
        create("button", {
            innerText: "▶ Find Shortest Path",
            onclick: function () {
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                displayBaseLines();
                var from = Number(fromSelector.value);
                var to = Number(toSelector.value);
                displayShortestPath(from, to);
                displayNodes();
            },
        }),
    ]),
]);
document.body.appendChild(div);
displayBaseLines();
displayNodes();
function displayBaseLines() {
    var ctx = canvas.getContext("2d");
    for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
        var vertex = vertices_1[_i];
        var x = vertex.x, y = vertex.y, adjacentVertices = vertex.adjacentVertices;
        var _loop_1 = function (id) {
            var adjVertex = vertices.find(function (v) { return id == v.id; });
            ctx.moveTo(x, y);
            ctx.lineTo(adjVertex.x, adjVertex.y);
            ctx.stroke();
        };
        for (var _a = 0, adjacentVertices_1 = adjacentVertices; _a < adjacentVertices_1.length; _a++) {
            var id = adjacentVertices_1[_a];
            _loop_1(id);
        }
    }
}
function displayShortestPath(from, to) {
    if (from == to)
        return;
    var ctx = canvas.getContext("2d");
    var shortestPath = dijkstra(vertices, from, to);
    ctx.moveTo(shortestPath[0].x, shortestPath[0].y);
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "red";
    for (var _i = 0, shortestPath_1 = shortestPath; _i < shortestPath_1.length; _i++) {
        var point = shortestPath_1[_i];
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
}
function displayNodes() {
    var ctx = canvas.getContext("2d");
    ctx.font = "28px 'Open Sans'";
    for (var _i = 0, vertices_2 = vertices; _i < vertices_2.length; _i++) {
        var v = vertices_2[_i];
        var x = v.x, y = v.y, name_1 = v.name;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.moveTo(x, y);
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, 7);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.fillText(name_1, x - 9, y + 10);
        ctx.strokeText(name_1, x - 9, y + 10);
    }
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
}
function dijkstra(vertices, from, to) {
    var graphNodes = new Map();
    var results = new Map();
    for (var _i = 0, vertices_3 = vertices; _i < vertices_3.length; _i++) {
        var v = vertices_3[_i];
        graphNodes.set(v.id, __assign({ distance: Infinity, previous: undefined }, v));
    }
    graphNodes.get(from).distance = 0;
    while (graphNodes.size > 0) {
        var u = minimumDistanceNode(graphNodes);
        results.set(u.id, u);
        graphNodes.delete(u.id);
        for (var _a = 0, _b = u.adjacentVertices; _a < _b.length; _a++) {
            var adjNodeId = _b[_a];
            if (graphNodes.has(adjNodeId)) {
                var v = graphNodes.get(adjNodeId);
                var alt = u.distance + distanceBetween(u, v);
                if (alt < v.distance) {
                    v.distance = alt;
                    v.previous = u.id;
                }
            }
        }
    }
    var destination = results.get(to);
    var stack = [
        {
            x: destination.x,
            y: destination.y,
        },
    ];
    for (var curr = destination, next = void 0; curr.previous !== undefined; curr = next) {
        next = results.get(curr.previous);
        stack.push({
            x: next.x,
            y: next.y,
        });
    }
    return stack;
    function distanceBetween(u, v) {
        return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
    }
    function minimumDistanceNode(map) {
        return Array.from(map.values()).reduce(function (prev, curr) {
            return prev.distance < curr.distance ? prev : curr;
        });
    }
}
/**
 * A helper function that creates and returns an HTML Element of the type `type`
 *
 * ---
 * @param type Type of `HTMLElement` to be created
 * @param props Optional properties of the `HTMLElement` to be created
 * @param children Optional HTML Elements to be assigned as children of this element
 *
 * ---
 * @returns {HTMLElement} An `HTMLElement` object
 */
function create(type, props, children) {
    if (!type)
        throw new TypeError("Empty HTMLElement type: " + type);
    var dom = document.createElement(type);
    if (props)
        Object.assign(dom, props);
    if (children) {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            if (typeof child != "string")
                dom.appendChild(child);
            else
                dom.appendChild(document.createTextNode(child));
        }
    }
    return dom;
}
//# sourceMappingURL=script.js.map