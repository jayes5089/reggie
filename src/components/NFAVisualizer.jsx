import React, { useRef, useState, useEffect, useCallback } from "react"
import { Dialog } from "@headlessui/react"
import { Node, Edge } from "../logic/canvasObject"
import {
  renameNodeAndEdges,
  deleteNodeAndEdges,
  syncCanvasSize,
  toGraphObject,
  renderCanvas,
  createEdge
} from "../logic/graphUtils"

export default function NFAVisualizer({ graph, onGraphUpdate }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const menuRef = useRef(null)

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [contextMenu, setContextMenu] = useState(null)
  const [transitionStart, setTransitionStart] = useState(null)
  const [newLabel, setNewLabel] = useState("")
  const [labelModalOpen, setLabelModalOpen] = useState(false)
  const [labelInputTarget, setLabelInputTarget] = useState(null)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [draggingNode, setDraggingNode] = useState(null)
  const [draggingEdge, setDraggingEdge] = useState(null)

  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const offsetStart = useRef({ x: 0, y: 0 })

  const updateWith = (newNodes, newEdges) => {
    const finalNodes = newNodes ?? nodes;
    const finalEdges = newEdges ?? edges;
    setNodes(finalNodes)
    setEdges(finalEdges)
    onGraphUpdate(toGraphObject(finalNodes, finalEdges))
  };

  useEffect(() => {
    const drawableNodes = (graph?.nodes || []).map(n => new Node(n.id, n.label, n.x, n.y, n.isAccept))
    const nodeMap = Object.fromEntries(drawableNodes.map(n => [n.id, n]))
    const drawableEdges = (graph?.edges || [])
      .filter(e => nodeMap[e.from] && nodeMap[e.to])
      .map(e => {
        const ed = new Edge(nodeMap[e.from], nodeMap[e.to], e.label)
        if (e.from === e.to && e.loopAngle != null) {
          ed.loopAngle = e.loopAngle
        }
        return ed
      })
    setNodes(drawableNodes)
    setEdges(drawableEdges)
  }, [graph])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    renderCanvas(ctx, canvas, nodes, edges, scale, offsetX, offsetY, transitionStart, mousePos)
  }, [nodes, edges, scale, offsetX, offsetY, transitionStart, mousePos])

  useEffect(() => {
    const resizeCanvas = () => syncCanvasSize(canvasRef.current, containerRef.current)
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = e => {
      e.preventDefault()
      const zoomStep = 1.1;
      const factor = e.deltaY < 0 ? zoomStep : 1 / zoomStep;
      setScale(prev => Math.max(0.2, Math.min(5, prev * factor)));
    }
    canvas.addEventListener("wheel", handler, { passive: false })
    return () => {
      canvas.removeEventListener("wheel", handler)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleLeave = () => {
      isPanning.current = false
    }
    canvas.addEventListener("mouseleave", handleLeave)
    return () => {
      canvas.removeEventListener("mouseleave", handleLeave)
    }
  }, [])

  useEffect(() => {
    const handler = e => {
      if (contextMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [contextMenu])

  const getMousePos = e => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const renameNode = node => {
    const newName = window.prompt("New node label:", node.label)
    if (newName && newName !== node.label) {
      const updatedNodes = nodes.map(n =>
        n.id === node.id
          ? new Node(newName, newName, node.x, node.y, node.isAccept)
          : n
      )
      const updatedEdges = renameNodeAndEdges(node, newName, updatedNodes, edges)
      updateWith(updatedNodes, updatedEdges);
    }
    setContextMenu(null)
  }

  const deleteNode = node => {
    const { updatedNodes, updatedEdges } = deleteNodeAndEdges(node.id, nodes, edges)
    updateWith(updatedNodes, updatedEdges)
    setContextMenu(null)
  }

  const toggleAccepting = node => {
    const flipped = !node.isAccept
    const updatedNodes = nodes.map(n =>
      n.id === node.id
        ? new Node(n.id, n.label, n.x, n.y, flipped)
        : n
    )
    updateWith(updatedNodes, edges)
    setContextMenu(null)
  }

  const renameEdge = edge => {
    const newLabel = window.prompt("New transition label:", edge.label)
    if (newLabel && newLabel !== edge.label) {
      const updatedEdges = edges.map(e =>
        e.id === edge.id
          ? new Edge(e.from, e.to, newLabel)
          : e
      )
      updateWith(nodes, updatedEdges)
    }
    setContextMenu(null)
  }

  const deleteEdge = edge => {
    const updatedEdges = edges.filter(e => e !== edge)
    updateWith(nodes, updatedEdges)
    setContextMenu(null)
  }

  const handleMouseDown = e => {
    const pos = getMousePos(e)
    setMousePos(pos)
    const hitNode = nodes.find(n => n.isHit(pos.x, pos.y, scale, offsetX, offsetY))
    const hitEdge = edges.find(ed => ed.isHit(pos.x, pos.y, scale, offsetX, offsetY))
    const hitControlEdge = edges.find(ed => ed.isHitControl(pos.x, pos.y, scale, offsetX, offsetY));
    const hitAnyEdge = edges.find(ed => ed.isHit(pos.x, pos.y, scale, offsetX, offsetY));

    if (e.button === 0 && hitNode && !transitionStart) {
      setDraggingNode(hitNode)
      return
    }

    if (e.button === 0 && hitAnyEdge) {
      setDraggingEdge(hitAnyEdge);
      return;
    }

    if (e.button === 0 && !hitNode) {
      isPanning.current = true
      panStart.current = pos
      offsetStart.current = { x: offsetX, y: offsetY }
      return
    }

    if (transitionStart && hitNode) {
      setLabelInputTarget({ from: transitionStart, to: hitNode, type: "transition" })
      setLabelModalOpen(true)
      setContextMenu(null)
      return
    }

  }

  const handleContextMenu = e => {
    e.preventDefault()
    const pos = getMousePos(e)
    const hitNode = nodes.find(n => n.isHit(pos.x, pos.y, scale, offsetX, offsetY))
    const hitEdge = edges.find(ed => ed.isHit(pos.x, pos.y, scale, offsetX, offsetY))

    let type = "canvas", target = null
    if (hitNode) {
      type = "node"
      target = hitNode
    } else if (hitEdge) {
      type = "edge"
      target = hitEdge
    }

    const rect = canvasRef.current.getBoundingClientRect()
    setContextMenu({
      type,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      target,
      pos: type === "canvas" ? { x: (pos.x - offsetX) / scale, y: (pos.y - offsetY) / scale } : null,
    })
  }

  const handleMouseMove = e => {
    const pos = getMousePos(e)
    setMousePos(pos)

    if (draggingNode) {
      const snappedX = Math.round((pos.x - offsetX) / (40 * scale)) * 40
      const snappedY = Math.round((pos.y - offsetY) / (40 * scale)) * 40
      draggingNode.x = snappedX
      draggingNode.y = snappedY
      setNodes([...nodes])
      return
    }
    if (draggingEdge) {
      const { x, y } = getMousePos(e)
      draggingEdge.control = {
        x: (x - offsetX) / scale,
        y: (y - offsetY) / scale
      }
      setEdges(es => [...es])
      return
    }
    if (draggingEdge && draggingEdge.from === draggingEdge.to) {
      const { x: mx, y: my } = getMousePos(e);
      const px = draggingEdge.from.x * scale + offsetX;
      const py = draggingEdge.from.y * scale + offsetY;
      draggingEdge.loopAngle = Math.atan2(my - py, mx - px);
      setEdges(es => [...es]);
      return;
    }
    if (isPanning.current) {
      const dx = pos.x - panStart.current.x
      const dy = pos.y - panStart.current.y
      setOffsetX(offsetStart.current.x + dx)
      setOffsetY(offsetStart.current.y + dy)
      return
    }
  }

  const handleMouseUp = () => {
    if (draggingNode) {
      setDraggingNode(null)
      updateWith()
      return
    }
    if (draggingEdge) {
      setDraggingEdge(null);
      updateWith(nodes, edges);
      return;
    }
    if (isPanning.current) {
      isPanning.current = false
      return
    }
    setTransitionStart(null)
    updateWith()
  }

  const addNode = ({ x, y }) => {
    const id = `q${nodes.length}`
    const n = new Node(id, id, Math.round(x / 40) * 40, Math.round(y / 40) * 40, false)
    updateWith(nodes.concat(n), edges)
    setContextMenu(null)
  }

  const startTransition = node => {
    setTransitionStart(node)
    setContextMenu(null)
  }

  const handleLabelSubmit = (label) => {
    if (labelInputTarget?.type === 'transition') {
      const { from, to } = labelInputTarget
      const newEdge = createEdge(from, to, label || 'ε');
      setEdges([...edges, newEdge])
      updateWith(nodes, [...edges, newEdge])
    } else if (labelInputTarget?.type === 'edit') {
      labelInputTarget.edge.label = label || 'ε'
      setEdges([...edges])
      updateWith(nodes, [...edges])
    }
    setTransitionStart(null)
    setLabelModalOpen(false)
    setNewLabel("")
    setLabelInputTarget(null)
  }

  return (
    <div ref={containerRef} className="relative w-full h-[600px]">
      <canvas
        ref={canvasRef}
        className="bg-[#121212] block w-full border border-[#4ade80]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />

      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded shadow z-10 pointer-events-none">
        Zoom: {Math.round(scale * 100)}%
      </div>

      {contextMenu?.type === "canvas" && (
        <div 
          ref={menuRef} 
          className="absolute bg-black border border-[#4ade80] p-2 z-50 shadow rounded" 
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => addNode(contextMenu.pos)}>Add Node</button>
        </div>
      )}

      {contextMenu?.type === "node" && (
        <div 
          ref={menuRef} 
          className="absolute border border-[#4ade80] bg-black p-2 z-50 shadow rounded flex flex-col" 
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <p className="font-bold">{contextMenu.target.label}</p>
          <button onClick={() => renameNode(contextMenu.target)}>Rename Node</button>
          <button onClick={() => toggleAccepting(contextMenu.target)}>Toggle Accept</button>
          <button onClick={() => startTransition(contextMenu.target)}>
            Add Transition
          </button>
          <button onClick={() => deleteNode(contextMenu.target)}>Delete Node</button>
        </div>
      )}

      {contextMenu?.type === "edge" && (
        <div
          ref={menuRef}
          className="absolute bg-black border border-[#4ade80] flex flex-col p-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => renameEdge(contextMenu.target)}>Rename Transition</button>
          <button onClick={() => deleteEdge(contextMenu.target)}>Delete Transition</button>
        </div>
      )}

      <Dialog 
        open={labelModalOpen} 
        onClose={() => {
          setLabelModalOpen(false) 
          setNewLabel("")
        }}
      >
        <div className="fixed inset-0 bg-black/30"/>
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-4 rounded shadow">
            <Dialog.Title className="font-bold">Transition Label</Dialog.Title>
            <input
              className="border rounded px-2 py-1 mt-2"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLabelSubmit(newLabel)}
              placeholder="Enter Label (ε default)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button 
                className="px-2 py-1 bg-blue-600 text-white rounded" 
                onClick={() => handleLabelSubmit(newLabel)}
              >
                OK
              </button>
              <button 
                className="px-2 py-1 bg-gray-300 rounded" 
                onClick={() => setLabelModalOpen(false)}
              >
                CANCEL
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
