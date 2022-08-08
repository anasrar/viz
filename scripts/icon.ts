import fs from "fs";
import sharp from "sharp";

// generate necessary icon

// tray icon
const svgTray = Buffer.from(
	fs.readFileSync("./electron/resources/raw/tray.svg", {
		encoding: "utf8",
		flag: "r",
	})
);

// light background
sharp(svgTray).png().toFile("./electron/resources/tray/icon-light.png");
// dark background
sharp(svgTray)
	.png()
	.negate({ alpha: false })
	.toFile("./electron/resources/tray/icon-dark.png");

// app icon
const svgApp = Buffer.from(
	fs.readFileSync("./electron/resources/raw/app.svg", {
		encoding: "utf8",
		flag: "r",
	})
);

sharp(svgApp).png().toFile("./electron/resources/icons/app.png");
