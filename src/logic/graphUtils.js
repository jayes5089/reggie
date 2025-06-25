import { drawGrid, Edge } from "./canvasObject";

export function renameItem(list, item, newLabel, onlyLabel = false) {
    const i = list.indexOf(item);
    if (i !== -1) {
        list[i] = onlyLabel
            ? { ...list[i], label: newLabel }
            : { ...list[i], id: newLabel, label: newLabel };
    }
}

export function renameNodeAndEdges(node, newId, nodeList, edges) {
    const oldId = node.id;
    const nodeMap = Object.fromEntries(nodeList.map(n => [n.id, n]));
    return edges.map(e => {
        const newEdge = new Edge(
            e.from.id === oldId ? nodeMap[newId] : (nodeMap[e.from.id] || e.from),
            e.to.id === oldId ? nodeMap[newId] : (nodeMap[e.to.id] || e.to),
            e.label
        );
        if (e.control) {
            newEdge.control = { x: e.control.x, y: e.control.y };
        }
        if (e.loopAngle != null) {
            newEdge.loopAngle = e.loopAngle;
        }
        return newEdge;
    });
}

export function deleteById(list, id) {
    return list.filter(item => item.id !== id);
}

export function deleteNodeAndEdges(nodeId, nodes, edges) {
    const updatedNodes = deleteById(nodes, nodeId);
    const updatedEdges = edges.filter(e => e.from.id !== nodeId && e.to.id !== nodeId);
    return { updatedNodes, updatedEdges };
}

export function toggleNodeAccepting(node) {
    node.isAccept = !node.isAccept;
}

export function rebuildEdgeNodes(nodeList, edges) {
    const nodeMap = Object.fromEntries(nodeList.map(n => [n.id, n]));
    return edges.map(e => {
        const edge = new Edge(
            nodeMap[e.from.id] || e.from,
            nodeMap[e.to.id] || e.to,
            e.label
        );
        if (e.control) {
            edge.control = { ...e.control };
        }
        if (e.loopAngle != null) {
            edge.loopAngle = e.loopAngle;
        }
        return edge;
    });
}

export function updateEdgeLabel(edge, newLabel) {
    edge.label = newLabel;
}

export function createEdge(fromNode, toNode, label = 'ε') {
    const edge = new Edge(fromNode, toNode, label);
    return edge;
}

export function syncCanvasSize(canvas, container) {
    if (!canvas || !container) return;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}

export function toGraphObject(nodes, edges) {
    return {
        nodes: nodes.map(n => ({
            id: n.id,
            label: n.label,
            x: n.x,
            y: n.y,
            isAccept: n.isAccept
        })),
        edges: edges.map(e => ({
            from: e.from.id,
            to: e.to.id,
            label: e.label,
            control: e.control
                ? { x: e.control.x, y: e.control.y}
                : null,
            loopAngle: e.from === e.to ? e.loopAngle : undefined
        }))
    };
}

export function renderCanvas(ctx, canvas, nodes, edges, scale, offsetX, offsetY, transitionStart, mousePos, startNodeId) {
    const safeEdges = Array.isArray(edges) ? edges : [edges];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas, scale, offsetX, offsetY);
    safeEdges.forEach(edge => edge.draw(ctx, { scale, offsetX, offsetY }));
    nodes.forEach(node => node.draw(ctx, { scale, offsetX, offsetY }));

    if (startNodeId) {
        const startNode = nodes.find(n => n.id === startNodeId);
        if (startNode) {
            const sx = startNode.x * scale + offsetX;
            const sy = startNode.y * scale + offsetY;
            const startX = sx - startNode.radius - 30 * scale;
            const headX = sx - startNode.radius * scale;

            ctx.strokeStyle = '#e6ebff';
            ctx.fillStyle = '#e6ebff';
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            ctx.moveTo(startX, sy);
            ctx.lineTo(headX, sy);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(headX, sy);
            ctx.lineTo(headX - 8 * scale, sy - 5 * scale);
            ctx.lineTo(headX - 8 * scale, sy + 5 * scale);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    if (transitionStart) {
        const x1 = transitionStart.x * scale + offsetX;
        const y1 = transitionStart.y * scale + offsetY;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}