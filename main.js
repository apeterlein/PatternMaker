window.addEventListener("DOMContentLoaded", () => {
	"use strict";

	function invertColor(color) {
		let output = 0;
		[...color.matchAll(/\d+/g)].forEach((match) => {
			output += match[0] / 3;
		});
		if (output > 255 / 2) {
			return "black"
		}
		return "white"
	}

	function keyInput(e) {
		if (e.key.length === 1) {
			document.getElementById("letter-input").innerHTML = e.key;
		}
		if (e.key === "Enter") {
			document.getElementById("letter-done").dispatchEvent(new Event("click"));
		}
		if (e.key === "Backspace" || e.key === "Delete") {
			document.getElementById("letter-input").innerHTML = "&nbsp;"
		}
	}

	function refreshGrid() {
		const rows = document.getElementById("rows").innerHTML;
		const cols = document.getElementById("cols").innerHTML;
		const grid = document.createElement("div");

		const row = document.createElement("div");
		row.classList.add("row-reverse");
		const cell = document.createElement("div");
		cell.classList.add("label");
		row.append(cell);
		for (let j = 0; j < cols; j++) {
			const cell = document.createElement("div");
			cell.classList.add("label");
			cell.innerHTML = j + 1;
			row.append(cell);
		}
		grid.append(row);

		for (let i = 0; i < rows; i++) {
			const row = document.createElement("div");
			row.classList.add("row-reverse");
			const label = document.createElement("div");
			label.classList.add("label")
			label.innerHTML = i + 1;
			row.append(label);
			for (let j = 0; j < cols; j++) {
				let cell;
				const prv = document.querySelector("#grid > :nth-child(" + (i+2) + "n) > .square:nth-child(" + (j+2) + "n)");
				if (prv) {
					cell = prv.cloneNode(true);
				}
				else {
					cell = document.createElement("div");
					cell.classList.add("square");
				}
				row.append(cell);
			}
			grid.append(row);
		}

		document.getElementById("grid").innerHTML = grid.innerHTML;

		Array.prototype.forEach.call(document.querySelectorAll(".square"), (elm) => {
			elm.addEventListener("click", () => {
				const tool = document.querySelector(".selected");
				if (tool.id === "erase") {
					elm.innerHTML = "";
					elm.style.backgroundColor = "";
					elm.style.color = "";
				}
				else if (tool.id === "color") {
					const color = document.getElementById("color-picked").style.backgroundColor;
					elm.style.backgroundColor = color;
					elm.style.color = invertColor(color);
				}
				else if (tool.id === "letter") {
					elm.innerHTML = document.getElementById("letter-input").innerHTML;
				}
				else {
					elm.innerHTML = tool.innerHTML;
				}
			});
		});
	}

	document.getElementById("add-col").addEventListener("click", () => {
		document.getElementById("cols").innerHTML++;
		refreshGrid();
	});
	document.getElementById("sub-col").addEventListener("click", () => {
		if (document.getElementById("cols").innerHTML > 1) {
			document.getElementById("cols").innerHTML--;
			refreshGrid();
		}
	});
	document.getElementById("add-row").addEventListener("click", () => {
		document.getElementById("rows").innerHTML++;
		refreshGrid();
	});
	document.getElementById("sub-row").addEventListener("click", () => {
		if (document.getElementById("rows").innerHTML > 1) {
			document.getElementById("rows").innerHTML--;
			refreshGrid();
		}
	});

	Array.prototype.forEach.call(document.querySelectorAll(".selectable"), (elm) => {
		elm.addEventListener("click", (e) => {
			Array.prototype.forEach.call(document.querySelectorAll(".selected"), (e) => { 
				e.classList.remove("selected");
			});
			elm.classList.add("selected");
			if (elm.id === "letter") {
				document.getElementById("letter-select").classList.remove("hidden");
				document.getElementById("letter-input").innerHTML = "&nbsp;"
				document.addEventListener("keydown", keyInput);
			}
			if (elm.id === "color") {
				document.getElementById("color-select").classList.remove("hidden");
			}
		});
	});

	Array.prototype.forEach.call(document.querySelectorAll(".square-small"), (elm) => {
		elm.addEventListener("click", () => {
			document.getElementById("color-select").classList.add("hidden");
			document.getElementById("color-picked").style.backgroundColor = window.getComputedStyle(elm)['background-color'];
		});
	});

	document.getElementById("letter-done").addEventListener("click", () => {
		if (document.getElementById("letter-input").innerHTML === "&nbsp;") return;
		document.removeEventListener("keydown", keyInput);
		document.getElementById("letter-select").classList.add("hidden");
		document.getElementById("letter-picked").innerHTML = "&nbsp;" + document.getElementById("letter-input").innerHTML;
	});

	const Buffer = require('buffer').Buffer;
	const LZ4 = require('lz4');

	document.getElementById("save").addEventListener("click", () => {
		const text = document.getElementById("grid").innerHTML;
		const input = Buffer.from(text);
		const output = Buffer.alloc(LZ4.encodeBound(input.length))
		saveAs(new Blob([output.subarray(0, LZ4.encodeBlock(input, output))], { type: "text/plain" } ), "PatternMaker.knit");
	});
	document.getElementById("load").addEventListener("click", () => {
		const file = document.createElement("input");
		file.type = "file";
		file.accept = ".knit";
		file.dispatchEvent(new MouseEvent("click"));
		file.addEventListener("change", async () => {
			const input = Buffer.from(await file.files[0].arrayBuffer());
			const output = Buffer.alloc(1e6);
			document.getElementById("grid").innerHTML = new TextDecoder().decode(output.subarray(0, LZ4.decodeBlock(input, output)));
			const rows = document.getElementById("grid").childNodes;
			document.getElementById("rows").innerHTML = rows.length - 1;
			document.getElementById("cols").innerHTML = rows[0].childElementCount - 1;
			refreshGrid();
		});
	});
	document.getElementById("export").addEventListener("click", () => {
		const scale = window.devicePixelRatio * 2;
		const grid = document.getElementById("grid");
		const row = grid.childNodes[0];
		const square = row.childNodes[0];
		const height = window.getComputedStyle(grid).height.slice(0, -2);
		const width = window.getComputedStyle(row).width.slice(0, -2);
		const pad = Math.ceil(window.getComputedStyle(square).width.slice(0, -2) * scale);
		let rawWidth = window.getComputedStyle(grid).width.slice(0, -2);

		console.debug(pad);

		if (width > rawWidth) {
			rawWidth = width;
		}

		const options = {
			logging: false,
			scale: scale,
			width: width,
			height: height,
			x: .5 * (rawWidth - width),
			windowWidth: rawWidth
		};

		html2canvas(grid, options).then((canvas) => {
			const final = document.createElement("canvas");
			const ctx = final.getContext("2d");
			final.width = canvas.width + pad;
			final.height = canvas.height + pad;
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, final.width, final.height);
			ctx.drawImage(canvas, pad, pad);

			final.toBlob((blob) => {
				saveAs(blob, "PatternMaker.png");
			});
		});
	});

	refreshGrid();
});