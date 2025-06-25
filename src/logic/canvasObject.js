// CanvasObjects.js with highlights, grid, snap, and better visuals
export class Drawable {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {}
  isHit() {
    return false;
  }
}

export class Node extends Drawable {
  constructor(id, label, x, y, isAccept = false) {
    super(x, y);
    this.id = id;
    this.label = label;
    this.radius = 30;
    this.isAccept = isAccept;
    this.isHovered = false;
    this.isSelected = false;
  }

  draw(ctx, { scale = 1, offsetX = 0, offsetY = 0 } = {}) {
    const px = this.x * scale + offsetX;
    const py = this.y * scale + offsetY;
    const r = this.radius * scale;

    ctx.save();
    if (this.isHovered) {
      ctx.shadowColor = '#001e80';
      ctx.shadowBlur = 20;
    } // glow

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = '#001e80'; // either accept/non-accept state
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e6ebff'; // selected state
    ctx.stroke();

    if (this.isAccept) {
      ctx.beginPath();
      ctx.arc(px, py, r - 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#e6ebff'; // inner circle for accepting
      ctx.stroke();
    }

    ctx.fillStyle = '#e6ebff'; // text inside state
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${20 * scale}px monospace`;
    ctx.fillText(this.label, px, py);
    ctx.restore();
  }

  isHit(x, y, scale = 1, offsetX = 0, offsetY = 0) {
    const px = this.x * scale + offsetX;
    const py = this.y * scale + offsetY;
    return Math.hypot(px - x, py - y) <= this.radius * scale;
  }
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1
  const l2 = dx*dx + dy*dy
  if (l2 === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1)*dx + (py - y1)*dy) / l2
  t = Math.max(0, Math.min(1, t))
  const projX = x1 + t*dx, projY = y1 + t*dy
  return Math.hypot(px - projX, py - projY)
}

let edgeCounter = 0;
export class Edge extends Drawable {
  constructor(fromNode, toNode, label, id = `e${edgeCounter++}`) {
    super(0, 0);
    this.id = id;
    this.from = fromNode;
    this.to = toNode;
    this.label = label;
    this.control = null;
    this.loopAngle = -Math.PI / 2;
  }

  draw(ctx, { scale = 1, offsetX = 0, offsetY = 0 } = {}) {
    if (!this.from || !this.to) return
    
    const x1 = this.from.x * scale + offsetX;
    const y1 = this.from.y * scale + offsetY;
    const x2 = this.to.x * scale + offsetX;
    const y2 = this.to.y * scale + offsetY;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#e6ebff';
    ctx.fillStyle = '#e6ebff';

    if (this.from === this.to) {
      const radius = this.from.radius * scale;
      const loopRadius = radius * 0.6;
      const offset = radius + 13 * scale;
      const cx = x1 + offset * Math.cos(this.loopAngle);
      const cy = y1 + offset * Math.sin(this.loopAngle);
      const startAngle = this.loopAngle + 0.2 * -Math.PI;
      const endAngle = this.loopAngle + 1.8 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, loopRadius, startAngle, endAngle);
      ctx.stroke();

      const ahX = cx + loopRadius * Math.cos(endAngle);
      const ahY = cy + loopRadius * Math.sin(endAngle);
      const angle = endAngle + 1.8 - Math.PI / 2 ;
      const len = 10 * scale;

      ctx.beginPath();
      ctx.moveTo(ahX, ahY);
      ctx.lineTo(
        ahX - len * Math.cos(angle - Math.PI / 6), 
        ahY - len * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(
        ahX - len * Math.cos(angle + Math.PI / 6), 
        ahY - len * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      const label = this.label || 'ε';
      ctx.font = `${20 * scale}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const labelX = cx;
      const labelY = cy - loopRadius + 2;

      ctx.lineWidth = Math.min(12, Math.max(2.5, 2.5 * scale));
      ctx.strokeStyle = '#e6ebff';
      ctx.strokeText(label, labelX, labelY);
      ctx.fillStyle = '#001e80';
      ctx.fillText(label, labelX, labelY);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    if (this.control) {
      const cx = this.control.x * scale + offsetX;
      const cy = this.control.y * scale + offsetY;
      ctx.quadraticCurveTo(cx, cy, x2, y2);
    } else {
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    const endX = x2;
    const endY = y2;
    let angle;
    if (this.control) {
      const cx = this.control.x * scale + offsetX;
      const cy = this.control.y * scale + offsetY;
      angle = Math.atan2(endY - cy, endX - cx);
    } else {
      angle = Math.atan2(endY - y1, endX - x1);
    }

    const ax = endX - this.to.radius * scale * Math.cos(angle);
    const ay = endY - this.to.radius * scale * Math.sin(angle);

    const headlen = 8 * scale;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - headlen * Math.cos(angle - Math.PI / 6), ay - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(ax - headlen * Math.cos(angle + Math.PI / 6), ay - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    const label = this.label || 'ε';
    const labelX = this.control
      ? (x1 + x2 + this.control.x * scale + offsetX) / 3
      : (x1 + x2) / 2;
    const labelY = this.control
      ? (y1 + y2 + this.control.y * scale + offsetY) / 3
      : (y1 + y2) / 2;

    ctx.font = `${20 * scale}px monospace`
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.min(12, Math.max(2.5, 2.5 * scale));
    ctx.strokeStyle = '#e6ebff';
    ctx.strokeText(label, labelX, labelY);
    ctx.fillStyle = '#001e80';
    ctx.fillText(label, labelX, labelY);
  }

  isHit(x, y, scale = 1, offsetX = 0, offsetY = 0) {
    const x1 = this.from.x * scale + offsetX;
    const y1 = this.from.y * scale + offsetY;
    const x2 = this.to.x * scale + offsetX;
    const y2 = this.to.y * scale + offsetY;

    if (this.from === this.to) {
      const radius = this.from.radius * scale;
      const loopRadius = radius * 0.6;
      const offset = radius + 13 * scale;
      const cx = x1 + offset * Math.cos(this.loopAngle);
      const cy = y1 + offset * Math.sin(this.loopAngle);
      const dist = Math.abs(Math.hypot(x - cx, y - cy) - loopRadius);
      return dist < 10;
    }
    if (!this.control) {
      return distToSegment(x, y, x1, y1, x2, y2) < 8
    }
    const cx = this.control.x * scale + offsetX;
    const cy = this.control.y * scale + offsetY;
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps;
      const t2 = (i + 1) / steps;
      const p1x = (1 - t1) * (1 - t1) * x1 + 2 * (1 - t1) * t1 * cx + t1 * t1 * x2;
      const p1y = (1 - t1) * (1 - t1) * y1 + 2 * (1 - t1) * t1 * cy + t1 * t1 * y2;
      const p2x = (1 - t2) * (1 - t2) * x1 + 2 * (1 - t2) * t2 * cx + t2 * t2 * x2;
      const p2y = (1 - t2) * (1 - t2) * y1 + 2 * (1 - t2) * t2 * cy + t2 * t2 * y2;
      if (distToSegment(x, y, p1x, p1y, p2x, p2y) < 8) return true;
    }
  }
  isHitControl(x, y, scale = 1, offsetX = 0, offsetY = 0) {
    if (!this.control) return false;
    const cx = this.control.x * scale + offsetX;
    const cy = this.control.y * scale + offsetY;
    return Math.hypot(x - cx, y - cy) <= 10;
  }
}


export function drawGrid(ctx, canvas, scale, offsetX, offsetY) {
  const step = 40 * scale;

  const startX = -Math.floor(offsetX / step) * step + (offsetX % step);
  const startY = -Math.floor(offsetY / step) * step + (offsetY % step);

  ctx.strokeStyle = '#363636'; //grid
  ctx.lineWidth = 0.2;
  for (let x = startX; x < canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = startY; y < canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
