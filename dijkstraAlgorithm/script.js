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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
main();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var vertices, canvas, fromSelector, toSelector, div;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("./vertices.json").then(function (data) {
                        return data.json();
                    })];
                case 1:
                    vertices = _a.sent();
                    canvas = create("canvas", {
                        width: 900,
                        height: 500,
                    });
                    fromSelector = create("select", null, vertices.map(function (val) {
                        return create("option", {
                            value: val.name,
                            innerText: val.name,
                        });
                    }));
                    toSelector = create("select", null, vertices.map(function (val) {
                        return create("option", {
                            value: val.name,
                            innerText: val.name,
                        });
                    }));
                    div = create("div", null, [
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
                                    displayBaseLines(canvas, vertices);
                                    var from = fromSelector.value;
                                    var to = toSelector.value;
                                    displayShortestPath(from, to, canvas, vertices);
                                    displayNodes(canvas, vertices);
                                },
                            }),
                        ]),
                    ]);
                    document.body.appendChild(div);
                    displayBaseLines(canvas, vertices);
                    displayNodes(canvas, vertices);
                    return [2 /*return*/];
            }
        });
    });
}
function displayBaseLines(canvas, vertices) {
    var ctx = canvas.getContext("2d");
    for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
        var vertex = vertices_1[_i];
        var x = vertex.x, y = vertex.y, adjacentVertices = vertex.adjacentVertices;
        var _loop_1 = function (name_1) {
            var adjVertex = vertices.find(function (v) { return name_1 == v.name; });
            ctx.moveTo(x, y);
            ctx.lineTo(adjVertex.x, adjVertex.y);
            ctx.stroke();
        };
        for (var _a = 0, adjacentVertices_1 = adjacentVertices; _a < adjacentVertices_1.length; _a++) {
            var name_1 = adjacentVertices_1[_a];
            _loop_1(name_1);
        }
    }
}
function displayShortestPath(from, to, canvas, vertices) {
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
function displayNodes(canvas, vertices) {
    var ctx = canvas.getContext("2d");
    ctx.font = "24px 'Open sans'";
    for (var _i = 0, vertices_2 = vertices; _i < vertices_2.length; _i++) {
        var v = vertices_2[_i];
        var x = v.x, y = v.y, name_2 = v.name;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.moveTo(x, y);
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, 7);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.fillText(name_2, x - 9, y + 10);
        ctx.strokeText(name_2, x - 9, y + 10);
    }
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
}
function dijkstra(vertices, from, to) {
    var graphNodes = new Map();
    var results = new Map();
    for (var _i = 0, vertices_3 = vertices; _i < vertices_3.length; _i++) {
        var v = vertices_3[_i];
        graphNodes.set(v.name, __assign({ distance: Infinity, previous: undefined }, v));
    }
    graphNodes.get(from).distance = 0;
    while (graphNodes.size > 0) {
        var u = minimumDistanceNode(graphNodes);
        results.set(u.name, u);
        graphNodes.delete(u.name);
        for (var _a = 0, _b = u.adjacentVertices; _a < _b.length; _a++) {
            var adjNodeId = _b[_a];
            if (graphNodes.has(adjNodeId)) {
                var v = graphNodes.get(adjNodeId);
                var alt = u.distance + distanceBetween(u, v);
                if (alt < v.distance) {
                    v.distance = alt;
                    v.previous = u.name;
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