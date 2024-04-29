window.addEventListener("DOMContentLoaded", () => {
	"use strict";

	function startLoading() {
		document.getElementById("loading").classList.remove("hidden");
		document.getElementById("grid").classList.add("hidden");
	}
	function endLoading() {
		requestAnimationFrame(() => setTimeout(() => {
			document.getElementById("loading").classList.add("hidden");
			document.getElementById("grid").classList.remove("hidden");
		}, 0));
	}

	const colors = (() => {
		let result = [[255, 255, 255]];
		for (let i = 0; ; i++) {
			const elm = document.getElementById("color-" + i);
			if (!elm) break;
			const color = window.getComputedStyle(elm).backgroundColor;
			result.push([...color.matchAll(/\d+/g)].map((x) => parseInt(x[0]) ));
		}
		return result;
	})();

	function closestColor(c1) {
		let distance;
		let final;
		for (const i in colors) {
			const r = c1[0] - colors[i][0];
			const g = c1[1] - colors[i][1];
			const b = c1[2] - colors[i][2];
			const dist = r*r + g*g + b*b;
			if (!distance || dist < distance) {
				distance = dist;
				final = colors[i];
			}
		}
		return "rgb(" + final[0] + "," + final[1] + "," + final[2] + ")";
	}

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

	function getSquare(i, j) {
		return document.querySelector("#grid > :nth-child(" + (i+2) + "n) > .square:nth-child(" + (j+2) + "n)");
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

	let shift = false;
	document.addEventListener("keydown", (e) => {
		if (e.key === "Shift") shift = true;
	});
	document.addEventListener("keyup", (e) => {
		if (e.key === "Shift") shift = false;
	});

	function refreshGrid() {
		const rowCnt = document.getElementById("rows").innerHTML;
		const colCnt = document.getElementById("cols").innerHTML;
		const grid = document.createElement("div");

		const row = document.createElement("div");
		row.classList.add("row-reverse");
		const cell = document.createElement("div");
		cell.classList.add("label");
		row.append(cell);
		for (let j = 0; j < colCnt; j++) {
			const cell = document.createElement("div");
			cell.classList.add("label");
			cell.innerHTML = j + 1;
			row.append(cell);
		}
		grid.append(row);

		for (let i = 0; i < rowCnt; i++) {
			const row = document.createElement("div");
			row.classList.add("row-reverse");
			const label = document.createElement("div");
			label.classList.add("label")
			label.innerHTML = i + 1;
			row.append(label);
			for (let j = 0; j < colCnt; j++) {
				let cell;
				const prv = getSquare(i, j);
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

	document.getElementById("add-zoom").addEventListener("click", () => {
		const zoom = document.getElementById("zoom");
		let ratio = parseFloat(zoom.innerHTML) + 10;
		zoom.innerHTML = ratio + "%";
		document.documentElement.style.setProperty("--square-size", ratio / 100 * 3.5 + "em");
	});
	document.getElementById("sub-zoom").addEventListener("click", () => {
		const zoom = document.getElementById("zoom");
		let ratio = parseFloat(zoom.innerHTML) - 10;
		ratio = ratio < 10 ? 10 : ratio;
		zoom.innerHTML = ratio + "%";
		document.documentElement.style.setProperty("--square-size", ratio / 100 * 3.5 + "em");
	});

	document.getElementById("add-col").addEventListener("click", () => {
		const cols = document.getElementById("cols");
		cols.innerHTML = parseInt(cols.innerHTML) + (shift ? 10 : 1);
		if (cols.innerHTML > 1000) {
			cols.innerHTML = 1000;
		}
		refreshGrid();
	});
	document.getElementById("sub-col").addEventListener("click", () => {
		const cols = document.getElementById("cols");
		cols.innerHTML = parseInt(cols.innerHTML) - (shift ? 10 : 1);
		if (cols.innerHTML < 1) {
			cols.innerHTML = 1;
		}
		refreshGrid();
	});
	document.getElementById("add-row").addEventListener("click", () => {
		const rows = document.getElementById("rows");
		rows.innerHTML = parseInt(rows.innerHTML) + (shift ? 10 : 1);
		if (rows.innerHTML > 1000) {
			rows.innerHTML = 1000;
		}
		refreshGrid();
	});
	document.getElementById("sub-row").addEventListener("click", () => {
		const rows = document.getElementById("rows");
		rows.innerHTML = parseInt(rows.innerHTML) - (shift ? 10 : 1);
		if (rows.innerHTML < 1) {
			rows.innerHTML = 1;
		}
		refreshGrid();
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
		setTimeout(() => file.dispatchEvent(new MouseEvent("click")), 0);
		file.addEventListener("change", () => {
			file.files[0].arrayBuffer().then((buffer) => {
				const input = Buffer.from(buffer);
				const output = Buffer.alloc(1e9);
				document.getElementById("grid").innerHTML = new TextDecoder().decode(output.subarray(0, LZ4.decodeBlock(input, output)));
				const rows = document.getElementById("grid").childNodes;
				document.getElementById("rows").innerHTML = rows.length - 1;
				document.getElementById("cols").innerHTML = rows[0].childElementCount - 1;
				refreshGrid();
			});
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
	document.getElementById("import").addEventListener("click", () => {
		const file = document.createElement("input");
		file.type = "file";
		file.accept = "image/*";
		setTimeout(() => file.dispatchEvent(new MouseEvent("click")), 0);
		file.addEventListener("change", () => {
			createImageBitmap(file.files[0]).then((img) => {
				const width = parseInt(document.getElementById("cols").innerHTML);
				const height = Math.round(img.height / img.width * width);
				document.getElementById("rows").innerHTML = height;
				refreshGrid();

				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, width, height);
				const data = ctx.getImageData(0, 0, width, height, { colorSpace: "srgb" }).data;
				
				for (let i = 0; i < height; i++) {
					for (let j = 0; j < width; j++) {
						const square = getSquare(i, j);
						const pixel = ((height - i) * width + (width - j)) * 4;
						square.style.backgroundColor = closestColor(data.slice(pixel, pixel + 3));
					}
				}
			});
		});
	});

	refreshGrid();
	endLoading();
});