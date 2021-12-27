interface Vertex {
  name: string;
  x: number;
  y: number;
  adjacentVertices: Array<string>;
}

main();

async function main() {
  let vertices: Array<Vertex> = await fetch("./vertices.json").then((data) =>
    data.json()
  );

  let canvas = create("canvas", {
    width: 900,
    height: 500,
  });

  let fromSelector = create(
    "select",
    null,
    vertices.map((val) =>
      create("option", {
        value: val.name,
        innerText: val.name,
      })
    )
  );

  let toSelector = create(
    "select",
    null,
    vertices.map((val) =>
      create("option", {
        value: val.name,
        innerText: val.name,
      })
    )
  );

  let div = create("div", null, [
    canvas,
    create("br"),
    create("div", { className: "controls" }, [
      create("span", null, ["From: ", fromSelector]),
      create("span", null, ["To: ", toSelector]),
      create("button", {
        innerText: "▶ Find Shortest Path",
        onclick: () => {
          let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          displayBaseLines(canvas, vertices);

          let from = fromSelector.value;
          let to = toSelector.value;

          displayShortestPath(from, to, canvas, vertices);
          displayNodes(canvas, vertices);
        },
      }),
    ]),
  ]);

  document.body.appendChild(div);

  displayBaseLines(canvas, vertices);
  displayNodes(canvas, vertices);
}

function displayBaseLines(canvas: HTMLCanvasElement, vertices: Array<Vertex>) {
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  for (let vertex of vertices) {
    const { x, y, adjacentVertices } = vertex;

    for (let name of adjacentVertices) {
      let adjVertex = vertices.find((v) => name == v.name) as Vertex;

      ctx.moveTo(x, y);
      ctx.lineTo(adjVertex.x, adjVertex.y);
      ctx.stroke();
    }
  }
}

function displayShortestPath(
  from: string,
  to: string,
  canvas: HTMLCanvasElement,
  vertices: Array<Vertex>
) {
  if (from == to) return;

  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  let shortestPath = dijkstra(vertices, from, to);

  ctx.moveTo(shortestPath[0].x, shortestPath[0].y);
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "red";

  for (let point of shortestPath) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
}

function displayNodes(canvas: HTMLCanvasElement, vertices: Array<Vertex>) {
  let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.font = "24px 'Open sans'";

  for (let v of vertices) {
    const { x, y, name } = v;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";

    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, 7);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.fillText(name, x - 9, y + 10);
    ctx.strokeText(name, x - 9, y + 10);
  }

  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
}

function dijkstra(vertices: Array<Vertex>, from: string, to: string) {
  interface DijkstraNode extends Vertex {
    distance: number;
    previous: string | undefined;
  }

  let graphNodes = new Map<string, DijkstraNode>();
  let results = new Map<string, DijkstraNode>();

  for (let v of vertices) {
    graphNodes.set(v.name, {
      distance: Infinity,
      previous: undefined,
      ...v,
    });
  }

  (graphNodes.get(from) as DijkstraNode).distance = 0;

  while (graphNodes.size > 0) {
    let u = minimumDistanceNode(graphNodes);

    results.set(u.name, u);
    graphNodes.delete(u.name);

    for (let adjNodeId of u.adjacentVertices) {
      if (graphNodes.has(adjNodeId)) {
        let v = graphNodes.get(adjNodeId) as DijkstraNode;

        let alt = u.distance + distanceBetween(u, v);

        if (alt < v.distance) {
          v.distance = alt;
          v.previous = u.name;
        }
      }
    }
  }

  let destination = results.get(to) as DijkstraNode;

  let stack: Array<{ x: number; y: number }> = [
    {
      x: destination.x,
      y: destination.y,
    },
  ];

  for (
    let curr = destination, next: DijkstraNode;
    curr.previous !== undefined;
    curr = next
  ) {
    next = results.get(curr.previous) as DijkstraNode;
    stack.push({
      x: next.x,
      y: next.y,
    });
  }

  return stack;

  function distanceBetween(u: DijkstraNode, v: DijkstraNode) {
    return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
  }

  function minimumDistanceNode(map: Map<string, DijkstraNode>) {
    return Array.from(map.values()).reduce((prev, curr) =>
      prev.distance < curr.distance ? prev : curr
    );
  }
}

/**
 * A helper function that creates and returns an HTML Element of the type `type`
 *
 * ---
 * @param {String} type Type of `HTMLElement` to be created
 * @param {Object} props Optional properties of the `HTMLElement` to be created
 * @param {Array<Node | string>} children Optional HTML Elements to be assigned as children of this element
 *
 * ---
 * @returns {HTMLElement} An `HTMLElement`
 */
function create<K extends keyof HTMLElementTagNameMap>(
  type: K,
  props?: any,
  children?: Array<Node | string>
): HTMLElementTagNameMap[K] {
  if (!type) throw new TypeError("Empty HTMLElement type: " + type);
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  if (children) {
    for (let child of children) {
      if (typeof child != "string") dom.appendChild(child);
      else dom.appendChild(document.createTextNode(child));
    }
  }
  return dom;
}
