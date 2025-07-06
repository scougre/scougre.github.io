export class Cell {
	#directionDict = {
		N: 0,
		E: 1,
		S: 2,
		W: 3,
	}
	#totalLineDirections;

	constructor(boxBounds = [0, 0, 0, 0], lineDirections = [false, false, false, false], wallPositions = [false, false, false, false]) {
		this.boxBounds = boxBounds;
		this.lineDirections = lineDirections;
		this.wallPositions = wallPositions;
		this.#totalLineDirections = 0;
	}
	//boxBounds in a 4 part array of [x position,y position, width, height] where (x,y) is the top-left corner
	setBoxBounds(boxBounds) {
		this.boxBounds = boxBounds;
	}
	//wallPositions is a 4 part boolean array in order of [N, E, S, W]
	setWallPositions(wallPositions) {
		this.wallPositions = wallPositions;
	}
	//lineDirections is a 4 part boolean array in order of [N, E, S, W]
	//only two line directions may exist in each cell, where the first true value in [N, E, S, W] is replaced when totalLineDirections === 2
	addLineDirection(direction) {
		if (this.#totalLineDirections < 2) {
			this.lineDirections[this.#directionDict[direction]] = true;
			this.#totalLineDirections += 1;
			return true;
		}
		return false
	}
	removeLineDirection(direction) {
		let dirInd = this.#directionDict[direction];
		this.lineDirections[dirInd] = false;
		this.#totalLineDirections -= 1;
	}
}

export class CellArray {
	#directionDict = {
		N: 0,
		E: 1,
		S: 2,
		W: 3,
		0: "N",
		1: "E",
		2: "S",
		3: "W",
	}

	#findFirstTrue(list, skip) {
		for (let i = 0; i < list.length; i++) {
			if (i === skip) continue;
			else if (list[i] === true) return i;
		}
		throw new Error("Attempt to find first true in list when none exist.");
	}
	#getInvertedCell(x, y, direction) {
		switch (direction) {
			case "N":
				return { x: x, y: y - 1, direction: "S" }
			case "S":
				return { x: x, y: y + 1, direction: "N" }
			case "E":
				return { x: x + 1, y: y, direction: "W" }
			case "W":
				return { x: x - 1, y: y, direction: "E" }
		}
	}
	constructor(totalRows = 0, totalColumns = 0, cellWidth, cellHeight) {
		let xCurrentDrawLocation = 0;
		let yCurrentDrawLocation = 0;
		this.cellArray = [];
		for (let j = 0; j < totalRows; ++j) {
			const row = [];
			for (let i = 0; i < totalColumns; ++i) {
				row.push(new Cell([xCurrentDrawLocation, yCurrentDrawLocation, cellWidth, cellHeight]));
				xCurrentDrawLocation += cellWidth;
			}
			this.cellArray.push(row);
			yCurrentDrawLocation += cellHeight;
			xCurrentDrawLocation = 0;
		}
	}
	getCell(x, y) {
		return this.cellArray[y][x];
	}
	setLineDirection(x, y, direction) {
		let dirInd = this.#directionDict[direction];
		let inversionCell = this.#getInvertedCell(x, y, direction);
		//remove the line if drawn over an existing one
		if (this.cellArray[y][x].lineDirections[dirInd] === true) {
			this.cellArray[y][x].removeLineDirection(direction);
			this.cellArray[inversionCell.y][inversionCell.x].removeLineDirection(inversionCell.direction);
		}
		//add a line if a wall doesn't exist (and no line is there)
		else if (this.cellArray[y][x].wallPositions[dirInd] === false) {
			if (!this.cellArray[y][x].addLineDirection(direction)) {
				//if two lines already exist in the first box, delete the first NESW line in this cell and the attaching one
				let delDirection = this.#findFirstTrue(this.cellArray[y][x].lineDirections, this.#directionDict[direction]);
				let setFirstTrueFalseCell = this.#getInvertedCell(x, y, this.#directionDict[delDirection]);
				this.cellArray[setFirstTrueFalseCell.y][setFirstTrueFalseCell.x].removeLineDirection(setFirstTrueFalseCell.direction);
				this.cellArray[y][x].removeLineDirection(this.#directionDict[delDirection]);
				this.cellArray[y][x].addLineDirection(direction);
			}
			if (!this.cellArray[inversionCell.y][inversionCell.x].addLineDirection(inversionCell.direction)) {
				//if two lines already exist in the second box, delete the first NESW line in this cell and the attaching one
				let delDirection = this.#findFirstTrue(this.cellArray[inversionCell.y][inversionCell.x].lineDirections, this.#directionDict[inversionCell.direction]);
				let setFirstTrueFalseCell = this.#getInvertedCell(inversionCell.x, inversionCell.y, this.#directionDict[delDirection]);
				this.cellArray[setFirstTrueFalseCell.y][setFirstTrueFalseCell.x].removeLineDirection(setFirstTrueFalseCell.direction);
				this.cellArray[inversionCell.y][inversionCell.x].removeLineDirection(this.#directionDict[delDirection]);
				this.cellArray[inversionCell.y][inversionCell.x].addLineDirection(inversionCell.direction);
			}
		}

	}
}

