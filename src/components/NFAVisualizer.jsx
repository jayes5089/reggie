import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
cytoscape.use(edgehandles);

const NFAVisualizer = ({ graph }) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const ehRef = useRef(null);
    const idCounterRef = useRef(0);
    const lastBgClickRef = useRef(0);
    const [editMode, setEditMode] = useState(false);
    const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, type: null, element: null });

    useEffect(() => {
        if (!containerRef.current) return;

        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        const cy = cytoscape({
            container: containerRef.current,
            elements: graph ? [...graph.nodes, ...graph.edges] : [],
            style: [
                {
                    selector: "node",
                    style: {
                        label: "data(label)",
                        "text-valign": "center",
                        "text-halign": "center",
                        "background-color": "#6366f1",
                        color: "#fff",
                        "font-size": "10px",
                        width: 40,
                        height: 40,
                    },
                },
                {
                    selector: "edge",
                    style: {
                        label: "data(label)",
                        width: 2,
                        "line-color": "#94a3b8",
                        "target-arrow-color": "#94a3b8",
                        "target-arrow-shape": "triangle",
                        "curve-style": "bezier",
                        color: "#000",
                        "font-size": "9px",
                    },
                },
                {
                    selector: ".accepting",
                    style: {
                        "border-color": "#10b981",
                        "border-width": 4,
                    },
                },
                {
                    selector: ".start",
                    style: {
                        shape: 'diamond',
                        "border-width": 3,
                        "border-color": "#facc15"
                    },
                },
            ],
            layout: {
                name: "breadthfirst",
                directed: true,
                padding: 10,
            },
            minZoom: 0.5,
            maxZoom: 2,
            pan: { enabled: true, enableOnViewport: true },
            userZoomingEnabled: true,
            boxSelectionEnabled: false,
            autounselectify: true,
        });

        containerRef.current.oncontextmenu = e => e.preventDefault();

        const existingIds = cy.nodes().map(n => parseInt(n.id().replace(/^q/, ''), 10)).filter(n => !isNaN(n));
        idCounterRef.current = existingIds.length ? Math.max(...existingIds) + 1 : 0;

        const eh = cy.edgehandles({
            handleNodes: 'node',
            handlePosition: 'middle top',
            edgeType: () => 'flat',
        });
        eh.disableDrawMode();
        ehRef.current = eh;

        Object.assign(containerRef.current.style, {
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
        });

        if (graph && graph.nodes.length) {
            cy.getElementById(graph.nodes[0].data.id).addClass('start');
        }

        cy.on('tap', 'node', (evt) => {
            if (!editMode) evt.target.toggleClass('accepting');
        });

        cy.on('cxttap', 'node', evt => {
            if (editMode) setMenu({ visible: true, type: 'node', element: evt.target, x: evt.originalEvent.clientX, y: evt.originalEvent.clientY });
        });

        cy.on('cxttap', 'edge', evt => {
            if (editMode) setMenu({ visible: true, type: 'edge', element: evt.target, x: evt.originalEvent.clientX, y: evt.originalEvent.clientY });
        });

        cy.on('cxttap', evt => {
            if (editMode && evt.target === cy) {
                const now = Date.now();
                if (now - lastBgClickRef.current < 500) {
                    const pos = evt.position;
                    const newId = 'q' + idCounterRef.current++;
                    cy.add({ group: 'nodes', data: { id: newId, label: newId }, position: pos });
                }
                lastBgClickRef.current = now;
            }
        });

        const keydown = e => { if (e.code === 'Space') eh.enableDrawMode(); };
        const keyup = e => { if (e.code === 'Space') eh.disableDrawMode(); };
        window.addEventListener('keydown', keydown);
        window.addEventListener('keyup', keyup);

        cyRef.current = cy;
        return () => {
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('keyup', keyup);
        };
    }, [graph, editMode]);

    const handleMenuSelect = action => {
        const { element, type } = menu;
        if (type === 'node') {
            if (action === 'rename') {
                const name = window.prompt('New name:', element.data('label')); if (name) element.data('label', name);
            } else if (action === 'toggle') element.toggleClass('accepting');
            else if (action === 'delete') element.remove();
        } else if (type === 'edge') {
            if (action === 'rename') {
                const lbl = window.prompt('New label:', element.data('label')); if (lbl) element.data('label', lbl);
            } else if (action === 'delete') element.remove();
        }
        setMenu({ ...menu, visible: false });
    };

    return (
        <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold mb-2">Interactive NFA Graph</h3>
                <button
                    onClick={() => setEditMode((m) => !m)}
                    className={`px-2 py-1 text-sm rounded ${editMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                    {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                </button>
            </div>
            {editMode && menu.visible && (
                <div className="absolute bg-white border rounded shadow z-50" style={{ top: menu.y, left: menu.x }}>
                    {menu.type === 'node' ? (
                        ['rename', 'toggle', 'delete'].map(key => (
                            <div key={key} className="px-3 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuSelect(key)}>
                                {key === 'rename' ? 'Rename State' : key === 'toggle' ? 'Toggle Accepting' : 'Delete State'}
                            </div>
                        ))
                    ) : (
                        ['rename', 'delete'].map(key => (
                            <div key={key} className="px-3 py-1 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuSelect(key)}>
                                {key === 'rename' ? 'Rename Transition' : 'Delete Transition'}
                            </div>
                        ))
                    )}
                </div>
            )}
            <div ref={containerRef} className="border rounded h-[500px] w-full bg-white" />
        </div>
    );
};

export default NFAVisualizer;