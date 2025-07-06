import { Cell, CellArray } from "./lib/cell.js";

let canvas;
let ctx;

let startX, startY;
let isDragging = false;
let currCellLoc = [0, 0];
let cellWidth, cellHeight;
let activePointerId;
let cellArray;
let victoryShown = false;
const color1 = "#C0C0C0" // Silver
const color2 = "#848884" // Smoke

//Hard coded for now, but will be more dynamic later
let totalColumns = 5;
let totalRows = 8;
let endpointOne = [1, 1];
let endpointTwo = [0, 0];

window.onload = function() {
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	generateGrid();
	cellWidth = canvas.width / totalColumns;
	cellHeight = canvas.height / totalRows;
	cellArray = new CellArray(totalRows, totalColumns, cellWidth, cellHeight);


	drawBackground(totalColumns, totalRows);
	canvas.addEventListener('pointerdown', pointerDownAction, false);
	canvas.addEventListener('pointermove', pointerMoveAction, false);
	canvas.addEventListener('pointerup', pointerUpAction, false);
	requestAnimationFrame(update);
}
function generateGrid() {
	let maxCols = 8;
	let maxRows = 8;
	let minCols = 3;
	let minRows = 3;

	totalColumns = Math.floor(Math.random() * (maxCols - minCols + 1)) + minCols;
	totalRows = Math.floor(Math.random() * (maxRows - minRows + 1)) + minRows;
	endpointOne[0] = Math.floor(Math.random() * (totalColumns));
	endpointOne[1] = Math.floor(Math.random() * (totalRows));
	endpointTwo[0] = Math.floor(Math.random() * (totalColumns));
	endpointTwo[1] = Math.floor(Math.random() * (totalRows));
	while (endpointOne[0] === endpointTwo[0] && endpointOne[1] === endpointTwo[1]) {
		endpointTwo[0] = Math.floor(Math.random() * (totalColumns));
		endpointTwo[1] = Math.floor(Math.random() * (totalRows));
	}
}


function update() {
	requestAnimationFrame(update);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBackground(totalColumns, totalRows);
	drawLines();

}
function pointerDownAction(e) {
	if (e.isPrimary) {
		const { x, y } = getCanvasMousePosition(e);
		startX = x;
		startY = y;
		isDragging = true;
		activePointerId = e.pointerId;
		canvas.setPointerCapture(activePointerId);

		currCellLoc[0] = Math.floor(x / cellWidth);
		currCellLoc[1] = Math.floor(y / cellHeight);
	}
}
function pointerMoveAction(e) {
	if (isDragging && e.pointerId === activePointerId) {
		const { x, y } = getCanvasMousePosition(e);
		if (isInCanvas(x, y) && !isInCell(x, y, cellArray.getCell(currCellLoc[0], currCellLoc[1]))) {
			let newCellLoc = [Math.floor(x / cellWidth), Math.floor(y / cellHeight)];
			if (Math.abs(currCellLoc[0] - newCellLoc[0]) + Math.abs(currCellLoc[1] - newCellLoc[1]) === 1) {
				if (currCellLoc[0] + 1 === newCellLoc[0]) {
					cellArray.setLineDirection(currCellLoc[0], currCellLoc[1], "E");
				} else if (currCellLoc[0] - 1 === newCellLoc[0]) {
					cellArray.setLineDirection(currCellLoc[0], currCellLoc[1], "W");
				} else if (currCellLoc[1] + 1 === newCellLoc[1]) {
					cellArray.setLineDirection(currCellLoc[0], currCellLoc[1], "S");
				} else if (currCellLoc[1] - 1 === newCellLoc[1]) {
					cellArray.setLineDirection(currCellLoc[0], currCellLoc[1], "N");
				}
			}
			currCellLoc = newCellLoc;
		}


	}
}
function pointerUpAction(e) {
	if (isDragging && e.pointerId === activePointerId) {
		isDragging = false;
		canvas.releasePointerCapture(activePointerId);
		activePointerId = null;
	}
}

function drawBackground(width, height) {
	if (width === undefined || height === undefined) {
		throw new Error("Grid must have a width and height!");
	}

	let xCurrentDrawLocation = 0;
	let yCurrentDrawLocation = 0;
	let colorCurrent = color1;

	for (let j = 0; j < height; ++j) {
		for (let i = 0; i < width; ++i) {
			ctx.beginPath();
			ctx.rect(xCurrentDrawLocation, yCurrentDrawLocation, cellWidth, cellHeight);
			ctx.fillStyle = colorCurrent;
			ctx.fill();
			ctx.closePath();
			xCurrentDrawLocation += cellWidth;
			colorCurrent = (colorCurrent == color1) ? color2 : color1;
		}

		if (width % 2 == 0) colorCurrent = (colorCurrent == color1) ? color2 : color1;
		yCurrentDrawLocation += cellHeight;
		xCurrentDrawLocation = 0;
	}

	let radiusEndpoints = Math.min(cellHeight / 4, cellWidth / 4);
	ctx.beginPath();
	ctx.arc(endpointOne[0] * cellWidth + cellWidth / 2, endpointOne[1] * cellHeight + cellHeight / 2, radiusEndpoints, 0, Math.PI * 2, false);
	ctx.fillStyle = "blue"; // Set the stroke color
	ctx.fill();             // Draw the outline of the circle
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(endpointTwo[0] * cellWidth + cellWidth / 2, endpointTwo[1] * cellHeight + cellHeight / 2, radiusEndpoints, 0, Math.PI * 2, false);
	ctx.fillStyle = "blue"; // Set the stroke color
	ctx.fill();             // Draw the outline of the circle
	ctx.closePath();

}
function drawLines() {
	let totLinesDrawn = 0;
	for (let j = 0; j < totalRows; j++) {
		for (let i = j % 2; i < totalColumns; i += 2) {
			const currCell = cellArray.getCell(i, j);
			if (j > 0 && currCell.lineDirections[0]) {
				drawOneLine(currCell, cellArray.getCell(i, j - 1));
				totLinesDrawn++;
			}
			if (i < totalColumns - 1 && currCell.lineDirections[1]) {
				drawOneLine(currCell, cellArray.getCell(i + 1, j));
				totLinesDrawn++;
			}
			if (j < totalRows - 1 && currCell.lineDirections[2]) {
				drawOneLine(currCell, cellArray.getCell(i, j + 1));
				totLinesDrawn++;
			}
			if (i > 0 && currCell.lineDirections[3]) {
				drawOneLine(currCell, cellArray.getCell(i - 1, j));
				totLinesDrawn++;
			}
		}
	}

	if (!victoryShown && totLinesDrawn == totalColumns * totalRows - 1 && checkVictory()) {
		victoryShown = true;
		alert("Path successfully found! Reload the page for a new map.");
	}
}
function drawOneLine(cellOne, cellTwo) {
	ctx.beginPath();
	ctx.moveTo(cellOne.boxBounds[0] + cellOne.boxBounds[2] / 2, cellOne.boxBounds[1] + cellOne.boxBounds[3] / 2);
	ctx.lineWidth = 10;
	ctx.strokeStyle = "black";
	ctx.lineTo(cellTwo.boxBounds[0] + cellTwo.boxBounds[2] / 2, cellTwo.boxBounds[1] + cellTwo.boxBounds[3] / 2);
	ctx.stroke();
}
function checkVictory() {
	let x = endpointOne[0];
	let y = endpointOne[1];
	let visitedCells = Array.from({ length: totalRows }, () =>
		Array.from({ length: totalColumns }, () => false)
	);
	let totalMoves = 0;

	while (totalMoves < totalColumns * totalRows - 1) {
		if (cellArray.getCell(x, y).lineDirections[0] === true && visitedCells[y - 1][x] === false) {
			visitedCells[y][x] = true;
			y--;
			totalMoves++;
		} else if (cellArray.getCell(x, y).lineDirections[1] === true && visitedCells[y][x + 1] === false) {
			visitedCells[y][x] = true;
			x++;
			totalMoves++;
		} else if (cellArray.getCell(x, y).lineDirections[2] === true && visitedCells[y + 1][x] === false) {
			visitedCells[y][x] = true;
			y++;
			totalMoves++;
		} else if (cellArray.getCell(x, y).lineDirections[3] === true && visitedCells[y][x - 1] === false) {
			visitedCells[y][x] = true;
			x--;
			totalMoves++;
		} else {
			return false;
		}
	}

	return x == endpointTwo[0] && y == endpointTwo[1];
}
function getCanvasMousePosition(event) {
	const rect = canvas.getBoundingClientRect(); // Get canvas's position and size

	// Calculate X and Y relative to the canvas's top-left corner
	// rect.left and rect.top are the canvas's position in the viewport
	const scaleX = canvas.width / rect.width;    // Relationship between actual pixels and CSS pixels
	const scaleY = canvas.height / rect.height;

	const x = (event.clientX - rect.left) * scaleX;
	const y = (event.clientY - rect.top) * scaleY;

	return { x: x, y: y };
}
function isInCell(x, y, cell) {
	if (x > cell.boxBounds[0] + cell.boxBounds[2] || x < cell.boxBounds[0] || y > cell.boxBounds[1] + cell.boxBounds[3] || y < cell.boxBounds[1]) {
		return false
	}
	return true;
}
function isInCanvas(x, y) {
	if (x < 0 || y < 0 || x > canvas.width || y > canvas.width) {
		return false;
	}
	return true;
}

